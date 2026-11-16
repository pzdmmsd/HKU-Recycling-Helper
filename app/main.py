"""Browser application for local use and Vercel. Run: python -m uvicorn app.main:app."""

from pathlib import Path
import re
from urllib.parse import urlparse
from uuid import uuid4

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import PROMPT_VERSION, PROVIDER, Settings
from app.corpus import Corpus
from app.models import CheckRequest, CheckResponse
from app.provider import ModelProvider, ServiceError
from app.safety import needs_language_normalization, screen


def create_app(settings: Settings | None = None, transport: httpx.AsyncBaseTransport | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    corpus = Corpus(settings.data_dir)
    provider = ModelProvider(settings, transport)
    normalization_vocabulary = set()
    for rule in corpus.rules:
        values = [rule.get("material", "")]
        for key in ("keywords", "item_types", "conditions", "condition_codes", "preparation"):
            values.extend(rule.get(key, []))
        for value in values:
            normalization_vocabulary.update(re.findall(r"[a-z]+", str(value).casefold()))
    application = FastAPI(title="HKU Recycling Helper", version="1.0.0", docs_url=None, redoc_url=None)
    application.state.corpus = corpus
    application.state.provider = provider

    def metadata(mode: str) -> dict:
        return {
            "request_id": str(uuid4()),
            "mode": mode,
            "provider": PROVIDER if mode == "live" else "No external service",
            "model": settings.model if mode == "live" else "pre-authored" if mode == "sample" else "deterministic screening",
            "corpus_version": corpus.version,
            "corpus_verified_on": corpus.verified_on,
            "prompt_version": PROMPT_VERSION,
        }

    def uncertain(description: str, reason: str, clarification: str | None = None, status: str = "cannot_determine", mode: str = "screening") -> CheckResponse:
        return CheckResponse(**metadata(mode), status=status, item=description[:150] or "Unspecified item", facility=None, preparation=[], reason=reason, clarification=clarification, evidence=[])

    @application.middleware("http")
    async def request_protection(request: Request, call_next):
        if request.url.hostname not in settings.allowed_hosts:
            return JSONResponse({"error": {"code": "host_not_allowed", "message": "Open the app at its configured website address."}}, status_code=400)
        origin = request.headers.get("origin")
        if request.method not in {"GET", "HEAD", "OPTIONS"} and origin:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or parsed.netloc != request.headers.get("host"):
                return JSONResponse({"error": {"code": "origin_not_allowed", "message": "Open the app at its configured website address before checking an item."}}, status_code=403)
        content_length = request.headers.get("content-length", "0")
        if not content_length.isdigit() or int(content_length) > 16_384:
            return JSONResponse({"error": {"code": "request_too_large", "message": "Use a short text description of one item."}}, status_code=413)
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "DENY"
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @application.exception_handler(ServiceError)
    async def service_error_handler(request: Request, exc: ServiceError):
        return JSONResponse({"error": {"code": exc.code, "message": exc.message}}, status_code=exc.status_code)

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        # Pydantic's default response includes the rejected input; never echo it.
        return JSONResponse({"error": {"code": "invalid_request", "message": "Enter one description up to 1,000 characters and select live or sample mode."}}, status_code=422)

    @application.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse({"error": {"code": "not_found" if exc.status_code == 404 else "http_error", "message": "The requested resource is unavailable."}}, status_code=exc.status_code)

    @application.get("/api/config")
    async def config():
        reasons = []
        if not corpus.rules:
            reasons.append("No cited rules are included in the live corpus.")
        if not settings.api_key:
            reasons.append("The server-side course API key is not configured.")
        if not settings.model:
            reasons.append("The course model is not configured.")
        if not settings.skill_path.is_file():
            reasons.append("SKILL.md is missing.")
        return {
            "provider": PROVIDER,
            "model": settings.model,
            "live_available": not reasons,
            "live_unavailable_reason": " ".join(reasons) or None,
            "corpus_version": corpus.version,
            "corpus_verified_on": corpus.verified_on,
            "approved_rule_count": len(corpus.rules),
            "live_rule_count": len(corpus.rules),
            "general_source_count": len(corpus.general_sources),
            "prompt_version": PROMPT_VERSION,
            "facility": corpus.facility,
            "settings": {"temperature": settings.temperature, "max_tokens": settings.max_tokens, "timeout_seconds": settings.timeout_seconds, "concurrency": 1, "retries": 0},
            "privacy_notice": "Live mode sends your item description, relevant cited rules and task instructions to Alibaba Cloud Bailian. Do not enter names, student IDs, contact details or personal records. This app does not save descriptions or answers. Provider processing and retention are governed by the course arrangement and provider terms; local logging settings do not control them. Sample mode makes no external API call.",
        }

    @application.get("/api/samples")
    async def samples():
        return corpus.samples

    @application.get("/api/corpus")
    async def approved_corpus():
        return {**corpus.context(corpus.rules), "corpus_verified_on": corpus.verified_on, "approved_rule_count": len(corpus.rules), "live_rule_count": len(corpus.rules), "references": corpus.references}

    @application.post("/api/check", response_model=CheckResponse)
    async def check(payload: CheckRequest):
        description = payload.description.strip()
        if payload.mode == "sample":
            sample = next((sample for sample in corpus.samples if sample.get("id") == payload.sample_id), None)
            if not sample:
                raise ServiceError("sample_not_found", "Select one of the supplied sample items.", 422)
            if description and description != sample["description"]:
                raise ServiceError("sample_description_mismatch", "Sample mode only displays the selected pre-authored example. Use its supplied description.", 422)
            result = {key: sample["result"].get(key) for key in ("status", "item", "facility", "preparation", "reason", "clarification", "evidence")}
            return CheckResponse(**metadata("sample"), **result)
        if payload.sample_id is not None:
            raise ServiceError("invalid_request", "Live requests cannot include a sample identifier.", 422)
        # Cheap deterministic screening runs before any provider request.
        screening = screen(description, known_item=True, require_condition=False)
        if screening:
            return uncertain(description, screening.reason, screening.clarification, screening.status)

        decision_description = description
        used_normalizer = False
        rules = corpus.retrieve(description)
        screening = screen(description, known_item=bool(rules), require_condition=not any(not rule["conditions"] and not rule.get("condition_codes") for rule in rules))

        # If local retrieval cannot handle the wording, ask the model to translate
        # or correct spelling only. The normalized text then goes through the same
        # deterministic safety and retrieval checks.
        if (screening or not rules) and settings.api_key and corpus.rules and needs_language_normalization(description, normalization_vocabulary):
            normalized = await provider.normalize_input(description)
            decision_description = normalized.normalized_english
            used_normalizer = True
            screening = screen(decision_description, known_item=True, require_condition=False)
            if screening:
                return uncertain(decision_description, screening.reason, screening.clarification, screening.status, mode="live")
            rules = corpus.retrieve(decision_description)
            screening = screen(decision_description, known_item=bool(rules), require_condition=not any(not rule["conditions"] and not rule.get("condition_codes") for rule in rules))

        # Out-of-scope items can be handled by the general classifier, which must
        # not claim facility-specific acceptance or bypass missing conditions on a matched rule.
        general_fallback_allowed = not rules and (
            screening is None
            or (
                screening.status == "cannot_determine"
                and (
                    screening.reason.startswith("The description does not identify a supported material")
                    or screening.reason.startswith("The item's condition is missing")
                )
            )
        )
        if screening and not general_fallback_allowed:
            return uncertain(decision_description, screening.reason, screening.clarification, screening.status, mode="live" if used_normalizer else "screening")

        applicable = [rule for rule in rules if corpus.conditions_met(rule, decision_description)]
        if rules and not applicable:
            return uncertain(
                decision_description,
                "The description does not confirm the conditions required by the matching rule.",
                "Please confirm the item's exact type and all relevant conditions: " + "; ".join(dict.fromkeys(condition for rule in rules for condition in rule["conditions"])) + ".",
                mode="live" if used_normalizer else "screening",
            )
        if applicable:
            if len({rule["decision"] for rule in applicable}) > 1:
                return uncertain(decision_description, "The matching live rules conflict for the stated conditions. Ask campus staff before deciding.", mode="live" if used_normalizer else "screening")
            retrieved = applicable[:6]
            decision = await provider.decide(decision_description, corpus, retrieved)
            if decision.status == "cannot_determine":
                return CheckResponse(**metadata("live"), status="cannot_determine", item=decision_description[:150], facility=None, preparation=[], reason="The model could not establish a supported decision from the retrieved rules. Check the official facility guidance or ask campus staff.", clarification="Please confirm the exact item type, material and condition.", evidence=[])
            rule = next(rule for rule in retrieved if rule["id"] == decision.rule_ids[0])
            return CheckResponse(**metadata("live"), status=decision.status, item=decision_description[:150], facility=corpus.facility, preparation=rule["preparation"], reason=rule["reason"], clarification=None, evidence=corpus.evidence(rule))

        if not settings.api_key or not corpus.general_sources:
            reason = "No cited, facility-specific live rule supports a decision for this item. Missing evidence does not mean the item is not accepted. Check the official facility guidance or ask campus staff."
            if screening and screening.clarification:
                reason = screening.reason
            return uncertain(decision_description, reason, screening.clarification if screening else None, mode="live" if used_normalizer else "screening")

        guidance = await provider.general_guidance(decision_description, corpus, lang=payload.lang)
        if guidance.stream == "hazardous":
            return uncertain(
                decision_description,
                "Hazardous, laboratory and commercial waste are outside the scope of this helper. Do not use this helper to decide disposal; ask campus staff for the appropriate procedure.",
                None,
                status="refused",
                mode="live",
            )
        evidence = corpus.general_evidence(guidance.source_ids)
        if len(evidence) != len(guidance.source_ids):
            raise ServiceError("unsupported_model_output", "The general-guidance response cited an unknown source. No category was produced.")
        return CheckResponse(
            **metadata("live"),
            status="general_guidance",
            item=decision_description[:150],
            facility=None,
            preparation=guidance.preparation,
            reason=guidance.summary,
            clarification=guidance.clarification,
            evidence=evidence,
        )

    @application.get("/")
    async def index():
        index_path = settings.static_dir / "index.html"
        if not index_path.is_file():
            return JSONResponse({"error": {"code": "frontend_unavailable", "message": "The browser interface has not been installed."}}, status_code=503)
        return FileResponse(index_path)

    if settings.static_dir.is_dir():
        application.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
    return application


app = create_app()
