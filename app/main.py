"""Local browser application. Run with: python -m uvicorn app.main:app."""

from pathlib import Path
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
from app.safety import screen


def create_app(settings: Settings | None = None, transport: httpx.AsyncBaseTransport | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    corpus = Corpus(settings.data_dir)
    provider = ModelProvider(settings, transport)
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

    def uncertain(description: str, reason: str, clarification: str | None = None, status: str = "cannot_determine") -> CheckResponse:
        return CheckResponse(**metadata("screening"), status=status, item=description[:150] or "Unspecified item", facility=None, preparation=[], reason=reason, clarification=clarification, evidence=[])

    @application.middleware("http")
    async def local_request_protection(request: Request, call_next):
        if request.url.hostname not in {"localhost", "127.0.0.1", "::1", "testserver"}:
            return JSONResponse({"error": {"code": "host_not_allowed", "message": "Open the app at its local localhost address."}}, status_code=400)
        origin = request.headers.get("origin")
        if request.method not in {"GET", "HEAD", "OPTIONS"} and origin:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or parsed.netloc != request.headers.get("host"):
                return JSONResponse({"error": {"code": "origin_not_allowed", "message": "Open the app at its local address before checking an item."}}, status_code=403)
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
        # First screen prohibited requests before inspecting local rule matches.
        screening = screen(description, known_item=True, require_condition=False)
        if screening:
            return uncertain(description, screening.reason, screening.clarification, screening.status)
        rules = corpus.retrieve(description)
        screening = screen(description, known_item=bool(rules), require_condition=not any(not rule["conditions"] and not rule.get("condition_codes") for rule in rules))
        if screening:
            return uncertain(description, screening.reason, screening.clarification, screening.status)
        if not rules:
            return uncertain(description, "No cited, facility-specific live rule supports a decision for this item. Missing evidence does not mean the item is not accepted. Check the official facility guidance or ask campus staff.")
        applicable = [rule for rule in rules if corpus.conditions_met(rule, description)]
        if not applicable:
            return uncertain(description, "The description does not confirm the conditions required by the matching rule.", "Please confirm the item's exact type and all relevant conditions: " + "; ".join(dict.fromkeys(condition for rule in rules for condition in rule["conditions"])) + ".")
        if len({rule["decision"] for rule in applicable}) > 1:
            return uncertain(description, "The matching live rules conflict for the stated conditions. Ask campus staff before deciding.")
        retrieved = applicable[:6]
        decision = await provider.decide(description, corpus, retrieved)
        if decision.status == "cannot_determine":
            return CheckResponse(**metadata("live"), status="cannot_determine", item=description[:150], facility=None, preparation=[], reason="The model could not establish a supported decision from the retrieved rules. Check the official facility guidance or ask campus staff.", clarification="Please confirm the exact item type, material and condition.", evidence=[])
        rule = next(rule for rule in retrieved if rule["id"] == decision.rule_ids[0])
        return CheckResponse(**metadata("live"), status=decision.status, item=description[:150], facility=corpus.facility, preparation=rule["preparation"], reason=rule["reason"], clarification=None, evidence=corpus.evidence(rule))

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
