import copy
import json

import pytest

from app.config import Settings


@pytest.fixture
def fixture_data(tmp_path):
    permission = {"status": "approved", "basis": "Original synthetic test fixture, not an HKU policy record", "allow_api_processing": True, "allow_distribution": True}
    source = {"id": "test-source", "title": "Synthetic test source", "url": "https://www.wastereduction.hku.hk/re-facilities", "locator": "Invented test fixture", "verified_on": "2026-10-25", "permission": permission}
    rule = {
        "id": "test-plastic", "material": "plastic", "item_types": ["bottle"], "keywords": ["plastic bottle"],
        "conditions": ["clean", "empty"], "decision": "accepted", "preparation": ["Synthetic test preparation"],
        "reason": "Invented test fixture accepts the specified test bottle.", "source_ids": [source["id"]],
        "facility_specific": True, "permission": copy.deepcopy(permission), "verified_on": "2026-10-25",
    }
    skill_path = tmp_path / "SKILL.md"
    skill_path.write_text("UNIQUE_TEST_SKILL: use only approved records.", encoding="utf-8")
    sample = {"id": "sample", "label": "Synthetic test example", "description": "Pre-authored sample", "result": {"status": "cannot_determine", "item": "Sample", "facility": None, "preparation": [], "reason": "A synthetic fixture only.", "clarification": None, "evidence": []}}

    def write(rules=None, sources=None):
        (tmp_path / "rules.json").write_text(json.dumps({"version": "test-1", "facility": "Synthetic test facility", "records": [rule] if rules is None else rules}), encoding="utf-8")
        (tmp_path / "sources.json").write_text(json.dumps({"sources": [source] if sources is None else sources}), encoding="utf-8")
        (tmp_path / "samples.json").write_text(json.dumps({"samples": [sample]}), encoding="utf-8")

    write()
    settings = Settings(api_key="synthetic-key-never-live", data_dir=tmp_path, skill_path=skill_path, static_dir=tmp_path / "static")
    return {"settings": settings, "source": source, "rule": rule, "write": write, "sample": sample}
