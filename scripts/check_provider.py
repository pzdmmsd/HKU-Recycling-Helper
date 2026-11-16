"""One tiny transport check using original synthetic text; no recycling source data."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main() -> int:
    import httpx
    from app.config import DEFAULT_BASE_URL, Settings
    settings = Settings.from_env()
    if not settings.api_key:
        print("No server-side key configured. Run python scripts/configure_key.py.")
        return 1
    if settings.base_url != DEFAULT_BASE_URL:
        print("Check stopped: use the sponsored course endpoint from .env.example.")
        return 1
    print("Sending one synthetic JSON-format test to the configured course model. No corpus records are sent.")
    try:
        with httpx.Client(timeout=settings.timeout_seconds, follow_redirects=False) as client:
            response = client.post(settings.base_url + "/chat/completions", headers={"Authorization": "Bearer " + settings.api_key}, json={"model": settings.model, "messages": [{"role": "system", "content": "This is an original synthetic connectivity test for a university course app. Return exactly the JSON object {\"ready\":true}."}, {"role": "user", "content": "Return the requested JSON."}], "temperature": settings.temperature, "max_tokens": 64, "response_format": {"type": "json_object"}, "stream": False})
        if response.status_code != 200:
            print(f"Provider check failed: HTTP {response.status_code}. No decision was produced; provider error text is not logged.")
            return 1
        body = response.json()
        choice = body["choices"][0]
        if choice.get("finish_reason") != "stop" or json.loads(choice["message"]["content"]) != {"ready": True}:
            print("Provider connected, but the synthetic JSON contract was not satisfied.")
            return 1
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        print("Provider check failed: connection, timeout or response-format error. No sensitive error body is logged.")
        return 1
    result = {"checked_at": datetime.now(timezone.utc).isoformat(), "provider": "Alibaba Cloud Bailian", "configured_model": settings.model, "reported_model": body.get("model"), "kind": "connectivity_check", "json_format_passed": True, "usage": body.get("usage", {})}
    artifact = ROOT / "artifacts/provider-check.json"
    artifact.parent.mkdir(exist_ok=True)
    artifact.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Connected successfully: {settings.model}. JSON format passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

