import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import create_app


def model_response(answer, status_code=200):
    return httpx.Response(status_code, json={"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(answer)}}]})


def client_for(fixture_data, handler):
    return TestClient(create_app(fixture_data["settings"], transport=httpx.MockTransport(handler)))


def add_general_sources(fixture_data):
    permission = {
        "status": "approved",
        "basis": "Synthetic general-guidance fixture",
        "allow_api_processing": True,
        "allow_distribution": True,
    }
    source = {
        "id": "general-test-source",
        "title": "Synthetic general waste source",
        "url": "https://www.wastereduction.gov.hk/en-hk/waste-reduction-and-recycling-tips",
        "locator": "Synthetic test locator",
        "verified_on": "2026-11-15",
        "permission": permission,
    }
    (fixture_data["settings"].data_dir / "general-guidance.json").write_text(
        json.dumps({"version": "test-general-1", "sources": [source]}), encoding="utf-8"
    )


def test_fruit_peel_gets_labelled_food_waste_guidance(fixture_data):
    add_general_sources(fixture_data)
    requests = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        system = payload["messages"][0]["content"]
        if "NORMALIZATION CONTRACT" in system:
            return model_response({"normalized_english": "banana peel", "detected_language": "Chinese"})
        if "GENERAL GUIDANCE CONTRACT" in system:
            return model_response({
                "stream": "food_waste",
                "item": "banana peel",
                "summary": "Food scraps and fruit peel are food waste, not dry recycling.",
                "preparation": ["Keep it out of paper, plastic and metal recycling."],
                "clarification": "Use a food-waste collection point if one is available; otherwise follow campus general-waste signage or ask staff.",
                "source_ids": ["general-test-source"],
                "confidence": "high",
            })
        pytest.fail("Unexpected provider request")

    result = client_for(fixture_data, handler).post("/api/check", json={"description": "香蕉皮", "mode": "live"})
    assert result.status_code == 200
    body = result.json()
    assert body["status"] == "general_guidance"
    assert body["mode"] == "live"
    assert body["facility"] is None
    assert body["reason"].startswith("Food scraps and fruit peel")
    assert body["preparation"] == ["Keep it out of paper, plastic and metal recycling."]
    assert body["evidence"][0]["source_id"] == "general-test-source"
    assert len(requests) == 2
    assert "official_general_context" in json.loads(requests[1]["messages"][1]["content"])


def test_hazardous_item_still_refuses_before_general_guidance(fixture_data):
    add_general_sources(fixture_data)

    def no_call(request):
        pytest.fail("Hazardous input must be refused before provider transmission")

    result = client_for(fixture_data, no_call).post("/api/check", json={"description": "一颗锂电池", "mode": "live"})
    assert result.status_code == 200
    assert result.json()["status"] == "refused"
