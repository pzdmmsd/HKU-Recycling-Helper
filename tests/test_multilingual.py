import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.safety import needs_language_normalization


def model_response(answer, status_code=200):
    return httpx.Response(status_code, json={"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(answer)}}]})


def valid_answer(fixture_data):
    rule = fixture_data["rule"]
    return {
        "status": rule["decision"],
        "item": "Plastic bottle",
        "facility": "Synthetic test facility",
        "preparation": rule["preparation"],
        "reason": rule["reason"],
        "clarification": None,
        "rule_ids": [rule["id"]],
        "source_ids": rule["source_ids"],
    }


def client_for(fixture_data, handler):
    return TestClient(create_app(fixture_data["settings"], transport=httpx.MockTransport(handler)))


def test_normalizer_heuristic_covers_typos_chinese_and_french():
    vocabulary = {"clean", "plastic", "bottle", "pizza", "box"}
    assert needs_language_normalization("one cleen plastik botle", vocabulary)
    assert needs_language_normalization("一个干净的塑料瓶", vocabulary)
    assert needs_language_normalization("une boite a pizza propre", vocabulary)
    assert not needs_language_normalization("one clean plastic bottle", vocabulary)


@pytest.mark.parametrize(("description", "normalized", "language"), [
    ("one cleen empty plastik botle", "One clean empty plastic bottle", "English"),
    ("一个干净的空的塑料瓶", "One clean empty plastic bottle", "Chinese"),
])
def test_typo_and_multilingual_input_reach_evidence_pipeline(fixture_data, description, normalized, language):
    requests = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        if "NORMALIZATION CONTRACT" in payload["messages"][0]["content"]:
            return model_response({"normalized_english": normalized, "detected_language": language})
        return model_response(valid_answer(fixture_data))

    result = client_for(fixture_data, handler).post("/api/check", json={"description": description, "mode": "live"})
    assert result.status_code == 200
    body = result.json()
    assert body["status"] == "accepted"
    assert body["mode"] == "live"
    assert len(requests) == 2
    assert normalized in requests[1]["messages"][1]["content"]


def test_normalization_does_not_add_missing_condition(fixture_data):
    requests = []

    def handler(request):
        payload = json.loads(request.content)
        requests.append(payload)
        return model_response({"normalized_english": "One plastic bottle", "detected_language": "Chinese"})

    result = client_for(fixture_data, handler).post("/api/check", json={"description": "一个塑料瓶", "mode": "live"})
    assert result.status_code == 200
    body = result.json()
    assert body["status"] == "cannot_determine"
    assert body["mode"] == "live"
    assert len(requests) == 1


def test_chinese_hazard_is_refused_without_provider_call(fixture_data):
    def no_call(request):
        pytest.fail("A multilingual hazard must be screened before transmission")

    result = client_for(fixture_data, no_call).post("/api/check", json={"description": "一颗锂电池", "mode": "live"})
    assert result.status_code == 200
    assert result.json()["status"] == "refused"
    assert result.json()["mode"] == "screening"
def test_chinese_personal_data_is_screened_before_provider(fixture_data):
    def no_call(request):
        pytest.fail("Personal data must be screened before transmission")

    result = client_for(fixture_data, no_call).post("/api/check", json={"description": "我叫陈大文，学号123456", "mode": "live"})
    assert result.status_code == 200
    assert result.json()["status"] == "cannot_determine"
    assert result.json()["mode"] == "screening"

