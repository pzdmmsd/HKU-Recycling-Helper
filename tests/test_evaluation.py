"""Evaluation must not pass through abstention, missing fields or unreviewed citations."""
from copy import deepcopy

from scripts.evaluate import metric, score_case, summarize, validate_cases


def example():
    case = {"id": "R01", "group": "routine", "description": "Synthetic test", "facility_applicable": True, "preparation_applicable": True, "expected": {"status": "accepted", "facility": "Synthetic facility", "preparation": ["Synthetic step"], "source_ids": ["s1"], "rule_ids": ["r1"]}}
    answer = {"mode": "live", "status": "accepted", "facility": "Synthetic facility", "preparation": ["Synthetic step"], "evidence": [{"source_id": "s1", "rule_id": "r1", "url": "https://example.com/source", "locator": "Test", "verified_on": "2026-10-25"}]}
    return case, answer


def test_accuracy_denominators_round_up():
    assert metric(12, 14)["required"] == 13
    assert not metric(12, 14)["meets_target"]
    assert metric(4, 4)["required"] == 4
    assert metric(13, 14)["meets_target"]


def test_abstention_and_missing_preparation_fail():
    case, answer = example()
    answer["status"] = "cannot_determine"
    assert not score_case(case, answer)["decision"]
    answer["status"] = "accepted"
    answer["preparation"] = []
    assert not score_case(case, answer)["preparation"]


def test_sample_mode_never_counts_toward_model_accuracy():
    case, answer = example()
    answer["mode"] = "sample"
    assert not score_case(case, answer)["decision"]


def test_citation_structure_is_not_evidence_accuracy():
    case, answer = example()
    result = {"id": "R01", "group": "routine", "checks": score_case(case, answer)}
    summary = summarize([result])
    assert summary["evidence_structure"]["passed"] == 1
    assert summary["evidence"]["passed"] == 0
    assert not summary["evidence"]["review_complete"]
    assert not summary["overall_pass"]


def test_safety_results_reject_disposal_advice():
    case = {"group": "unsafe", "expected": {"status": "refused"}}
    answer = {"mode": "screening", "status": "refused", "preparation": ["Invented disposal advice"], "facility": None, "evidence": []}
    assert not score_case(case, answer)["safe_response"]


def test_unreviewed_draft_cannot_freeze():
    import json
    from pathlib import Path
    import pytest
    data = json.loads((Path(__file__).resolve().parents[1] / "evaluation/cases.draft.json").read_text())
    validate_cases(data)
    modified = deepcopy(data)
    modified.update(state="frozen", frozen_at="2026-10-25", labelled_by="A", reviewed_by="B")
    with pytest.raises(ValueError, match="review"):
        validate_cases(modified, final=True)
