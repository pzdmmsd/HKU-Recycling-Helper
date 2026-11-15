"""Load records explicitly included by the project team for the live RAG corpus."""

import json
from pathlib import Path
from urllib.parse import urlparse

from app.safety import conditions_in, has_phrase, materials_in, normalize


def permitted(permission: object) -> bool:
    return (
        isinstance(permission, dict)
        and permission.get("status") in {"approved", "team_override"}
        and permission.get("allow_api_processing") is True
        and permission.get("allow_distribution") is True
        and isinstance(permission.get("basis"), str)
        and bool(permission["basis"].strip())
    )


def official_url(value: str) -> bool:
    parsed = urlparse(value)
    host = parsed.hostname or ""
    return parsed.scheme == "https" and (host == "hku.hk" or host.endswith(".hku.hk") or host == "wastereduction.gov.hk" or host.endswith(".wastereduction.gov.hk"))


def load_json(path: Path, default: object) -> object:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


class Corpus:
    def __init__(self, data_dir: Path):
        rules_data = load_json(data_dir / "rules.json", {})
        sources_data = load_json(data_dir / "sources.json", {})
        if not isinstance(rules_data, dict):
            raise ValueError("Rule corpus must have a versioned envelope")
        self.version = str(rules_data.get("version", "unconfigured"))
        self.facility = str(rules_data.get("facility", "re Kiosk, Main Campus"))
        raw_sources = sources_data if isinstance(sources_data, list) else sources_data.get("sources", [])
        self.references = [
            {
                **{key: source.get(key, "") for key in ("id", "title", "url", "locator", "verified_on")},
                "permission_status": (source.get("permission") or {}).get("status", "pending"),
                "permission_basis": (source.get("permission") or {}).get("basis", "Permission review pending"),
            }
            for source in raw_sources
            if isinstance(source, dict) and official_url(str(source.get("url", "")))
        ]
        self.sources = {}
        for source in raw_sources:
            if not isinstance(source, dict) or not permitted(source.get("permission")):
                continue
            required = ("id", "title", "url", "locator", "verified_on")
            if not all(isinstance(source.get(key), str) and source[key].strip() for key in required):
                continue
            if not official_url(source["url"]):
                continue
            if source["id"] in self.sources:
                raise ValueError("Duplicate approved source identifier")
            self.sources[source["id"]] = source

        general_data = load_json(data_dir / "general-guidance.json", {})
        self.general_version = str(general_data.get("version", "unconfigured")) if isinstance(general_data, dict) else "unconfigured"
        raw_general_sources = general_data.get("sources", []) if isinstance(general_data, dict) else []
        self.general_sources = {}
        for source in raw_general_sources:
            if not isinstance(source, dict) or not permitted(source.get("permission")):
                continue
            required = ("id", "title", "url", "locator", "verified_on")
            if not all(isinstance(source.get(key), str) and source[key].strip() for key in required):
                continue
            if not official_url(source["url"]) or source["id"] in self.general_sources:
                continue
            self.general_sources[source["id"]] = source

        self.rules = []
        identifiers = set()
        for rule in rules_data.get("records", []):
            if not isinstance(rule, dict) or not permitted(rule.get("permission")):
                continue
            required = ("id", "material", "reason", "verified_on")
            if not all(isinstance(rule.get(key), str) and rule[key].strip() for key in required):
                continue
            if rule.get("decision") not in {"accepted", "not_accepted"}:
                continue
            if rule.get("facility_specific") is not True:
                continue
            if "facility" in rule and rule["facility"] != self.facility:
                continue
            if not all(isinstance(rule.get(key), list) and all(isinstance(value, str) for value in rule[key]) for key in ("keywords", "conditions", "preparation", "source_ids")):
                continue
            if not rule["keywords"] or not rule["source_ids"] or not all(source_id in self.sources for source_id in rule["source_ids"]):
                continue
            # Even an approved EPD reference cannot establish an HKU facility rule.
            if not any((urlparse(self.sources[source_id]["url"]).hostname or "").endswith(".hku.hk") for source_id in rule["source_ids"]):
                continue
            if rule["id"] in identifiers:
                raise ValueError("Duplicate approved rule identifier")
            identifiers.add(rule["id"])
            self.rules.append(rule)
        dates = [rule["verified_on"] for rule in self.rules]
        dates.extend(self.sources[source_id]["verified_on"] for rule in self.rules for source_id in rule["source_ids"])
        self.verified_on = min(dates) if dates else None
        samples_data = load_json(data_dir / "samples.json", {})
        self.samples = samples_data if isinstance(samples_data, list) else samples_data.get("samples", [])

    @staticmethod
    def _material(rule: dict) -> str:
        value = normalize(rule["material"]).replace("_", " ")
        if "carton" in value:
            return "carton"
        if "glass" in value:
            return "glass"
        if "paper" in value or "cardboard" in value:
            return "paper"
        if value in {"aluminium", "aluminum", "steel", "tin"}:
            return "metal"
        return value

    def retrieve(self, description: str) -> list[dict]:
        text = normalize(description)
        materials = materials_in(text)
        matches = []
        for rule in self.rules:
            # A precise, approved item alias can identify an item when no material
            # was supplied. Never override an explicitly conflicting material.
            exact_alias = any(len(alias.split()) >= 2 and has_phrase(text, alias) for alias in rule.get("item_types", []) + rule["keywords"])
            if materials and self._material(rule) not in materials:
                continue
            if not materials and not exact_alias:
                continue
            score = sum(len(keyword) for keyword in rule["keywords"] if has_phrase(text, keyword))
            if score:
                matches.append((score, rule))
        # Check conflicts across all matches before the caller caps API context.
        return [rule for _, rule in sorted(matches, key=lambda pair: (-pair[0], pair[1]["id"]))]

    @staticmethod
    def conditions_met(rule: dict, description: str) -> bool:
        text = normalize(description)
        stated = conditions_in(text)
        codes = rule.get("condition_codes", [])
        if not isinstance(codes, list) or not all(isinstance(value, str) for value in codes):
            return False
        # Machine-readable hints may add constraints, never erase stated ones.
        required = list(dict.fromkeys(rule["conditions"] + codes))
        if not isinstance(required, list) or not all(isinstance(value, str) for value in required):
            return False
        if rule["conditions"] and not required:
            return False
        condition_codes = {"clean", "empty", "dry", "rinsed", "flattened", "cap_removed", "lid_removed", "dirty", "food_contaminated", "drink_carton", "glass_bottle"}
        for requirement in required:
            requirement = normalize(requirement)
            if requirement in condition_codes:
                if requirement not in stated:
                    return False
            elif not has_phrase(text, requirement) or has_phrase(text, "not " + requirement):
                return False
        return True

    def evidence(self, rule: dict) -> list[dict]:
        return [
            {
                "rule_id": rule["id"],
                "source_id": source_id,
                "title": self.sources[source_id]["title"],
                "url": self.sources[source_id]["url"],
                "locator": self.sources[source_id]["locator"],
                "verified_on": self.sources[source_id]["verified_on"],
            }
            for source_id in rule["source_ids"]
        ]

    def general_reference_map(self) -> dict[str, dict]:
        return {**self.sources, **self.general_sources}

    def general_context(self) -> dict:
        references = self.general_reference_map()
        return {
            "version": self.general_version,
            "sources": [
                {key: source[key] for key in ("id", "title", "url", "locator", "verified_on")}
                for source in references.values()
            ],
        }

    def general_evidence(self, source_ids: list[str]) -> list[dict]:
        references = self.general_reference_map()
        return [
            {
                "rule_id": "general-guidance",
                "source_id": source_id,
                "title": references[source_id]["title"],
                "url": references[source_id]["url"],
                "locator": references[source_id]["locator"],
                "verified_on": references[source_id]["verified_on"],
            }
            for source_id in source_ids
            if source_id in references
        ]

    def context(self, rules: list[dict]) -> dict:
        """Only invoked for records admitted to the live corpus."""
        keys = ("id", "material", "item_types", "keywords", "conditions", "condition_codes", "decision", "preparation", "reason", "source_ids", "facility_specific", "verified_on")
        source_ids = {source_id for rule in rules for source_id in rule["source_ids"]}
        return {
            "corpus_version": self.version,
            "facility": self.facility,
            "records": [{key: rule[key] for key in keys if key in rule} for rule in rules],
            "sources": [{key: self.sources[source_id][key] for key in ("id", "title", "url", "locator", "verified_on")} for source_id in sorted(source_ids)],
        }
