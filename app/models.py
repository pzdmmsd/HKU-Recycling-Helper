"""Public API and model decision contracts."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Status = Literal["accepted", "not_accepted", "cannot_determine", "refused", "general_guidance"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class CheckRequest(StrictModel):
    description: str = Field(default="", max_length=1000)
    mode: Literal["live", "sample"] = "live"
    sample_id: str | None = Field(default=None, max_length=80)


class Evidence(StrictModel):
    rule_id: str
    source_id: str
    title: str
    url: str
    locator: str
    verified_on: str


class CheckResponse(StrictModel):
    request_id: str
    mode: Literal["live", "sample", "screening"]
    status: Status
    item: str
    facility: str | None
    preparation: list[str]
    reason: str
    clarification: str | None
    evidence: list[Evidence]
    provider: str
    model: str
    corpus_version: str
    corpus_verified_on: str | None
    prompt_version: str


class ModelDecision(StrictModel):
    """Provider output; accepted assertions must equal trusted canonical fields."""

    status: Literal["accepted", "not_accepted", "cannot_determine"]
    item: str = Field(min_length=1, max_length=150)
    facility: str | None
    preparation: list[str] = Field(max_length=12)
    reason: str = Field(min_length=1, max_length=1500)
    clarification: str | None
    rule_ids: list[str] = Field(max_length=1)
    source_ids: list[str] = Field(max_length=12)

class InputNormalization(StrictModel):
    """Model output that translates or corrects input without adding facts."""

    normalized_english: str = Field(min_length=1, max_length=1000)
    detected_language: str = Field(min_length=2, max_length=40)

class GeneralGuidance(StrictModel):
    """General category guidance when no facility-specific rule applies."""

    stream: Literal["recycling", "food_waste", "general_waste", "special_collection", "reuse", "hazardous", "unknown"]
    item: str = Field(min_length=1, max_length=150)
    summary: str = Field(min_length=1, max_length=1200)
    preparation: list[str] = Field(max_length=10)
    clarification: str | None
    source_ids: list[str] = Field(max_length=8)
    confidence: Literal["high", "medium", "low"]
