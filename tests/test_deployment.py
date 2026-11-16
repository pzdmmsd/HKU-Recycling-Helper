"""Hosted routing must keep the same host, origin and credential boundaries."""

from dataclasses import replace

from fastapi.testclient import TestClient
import pytest

from app.config import ROOT, Settings
from app.main import create_app


@pytest.fixture
def hosted_environment(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.setenv("VERCEL_URL", "helper-deploy.vercel.app")
    monkeypatch.setenv("VERCEL_PROJECT_PRODUCTION_URL", "helper.vercel.app")
    monkeypatch.setenv("VERCEL_BRANCH_URL", "helper-git-main.vercel.app")
    monkeypatch.setenv("ALLOWED_HOSTS", "recycle.example.edu, RECYCLE.example.edu ")
    monkeypatch.setenv("BAILIAN_API_KEY", "")
    return Settings.from_env()


def test_hosted_environment_does_not_load_local_secrets(hosted_environment, monkeypatch):
    def forbidden(*args, **kwargs):
        pytest.fail("Vercel must not read a local .env file")

    monkeypatch.setattr("app.config.load_dotenv", forbidden)
    assert Settings.from_env().api_key == ""
    assert hosted_environment.allowed_hosts.count("recycle.example.edu") == 1


@pytest.mark.parametrize("host", [
    "helper-deploy.vercel.app", "helper.vercel.app", "helper-git-main.vercel.app", "recycle.example.edu",
])
def test_hosted_frontend_and_sample_api(hosted_environment, host):
    client = TestClient(create_app(hosted_environment), base_url=f"https://{host}")
    assert client.get("/").status_code == 200
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/static/styles.css").status_code == 200
    config = client.get("/api/config")
    assert config.status_code == 200
    assert config.json()["live_available"] is False
    assert config.json()["live_rule_count"] > 0
    assert config.headers["cache-control"] == "no-store"
    sample = client.get("/api/samples").json()[0]
    response = client.post("/api/check", headers={"Origin": f"https://{host}"}, json={
        "mode": "sample", "sample_id": sample["id"], "description": sample["description"],
    })
    assert response.status_code == 200
    assert response.json()["mode"] == "sample"


def test_hosted_boundaries(hosted_environment):
    client = TestClient(create_app(hosted_environment), base_url="https://helper.vercel.app")
    assert client.get("/api/config", headers={"Host": "other-project.vercel.app"}).status_code == 400
    assert client.post("/api/check", headers={"Origin": "https://evil.example"}, json={}).status_code == 403
    assert client.post("/api/check", headers={"Origin": "https://helper-deploy.vercel.app"}, json={}).status_code == 403
    for path in ("/.env", "/.git/config", "/app/config.py", "/static/../.env"):
        assert client.get(path).status_code == 404


def test_hosted_live_check_keeps_key_server_side(hosted_environment, fixture_data):
    from test_pipeline import DESCRIPTION, model_response, valid_answer
    import httpx

    settings = replace(fixture_data["settings"], allowed_hosts=hosted_environment.allowed_hosts)
    client = TestClient(create_app(settings, httpx.MockTransport(lambda _: model_response(valid_answer(fixture_data)))),
                        base_url="https://helper.vercel.app")
    response = client.post("/api/check", headers={"Origin": "https://helper.vercel.app"}, json={"description": DESCRIPTION})
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert settings.api_key not in response.text
    assert settings.api_key not in client.get("/api/config").text
    assert (ROOT / "SKILL.md").is_file()
