# Project status checklist

Last updated: 19 November 2026.

## Verification summary (Windows, Python 3.12+)

- **Automated test suite**: 108 tests passing (`pytest -q`), covering pipeline retrieval, condition checks, safety screening, multilingual/typo normalization, general-guidance fallback, NVIDIA credential selection, endpoint restrictions and provider concurrency guards.
- **Safety and ambiguity checks**: All 6 ambiguous/unsafe benchmark cases (`A01`–`A03`, `U01`–`U03`) pass through the HTTP handlers without triggering external model requests.
- **Live model verification**: NVIDIA NIM `nvidia/nemotron-3.5-lightning-30b-a3b` passes the JSON connectivity check and HTTP smoke checks for an English clean empty plastic bottle, a Cantonese clean empty plastic bottle, banana-peel general guidance, and local hazardous-item refusal. Local evidence: `artifacts/provider-check.json` and `artifacts/nvidia-smoke-check.json`. These smoke checks do not replace the full frozen benchmark; previous Bailian results do not establish NVIDIA model accuracy.
- **Secret hygiene**: `.env` is excluded via `.gitignore`; zero keys or credentials appear in tracked files.

## Deliverable status

| Deliverable | Implementation status | Remaining team step |
| --- | --- | --- |
| Versioned rule corpus | 14 curated re Kiosk records in `data/rules.json` + 18 source entries in `data/sources.json` | Final two-person source check before freezing evaluation. |
| Local web application | Responsive HTML/CSS/JS frontend + FastAPI backend with offline sample mode and live AI mode | Complete two novice walkthroughs (`docs/walkthrough.md`). |
| Retrieval + `SKILL.md` prompt | Lexical retrieval, system prompt loading `SKILL.md`, strict Pydantic validation | Run full 20-case frozen benchmark. |
| Facility decisions with citations | `accepted`, `not_accepted`, `cannot_determine`, `refused`, and `general_guidance` with source links | Complete human evidence review on the 20-case run. |
| General guidance fallback | Classifies non-facility items (`food_waste`, `general_waste`, etc.) without claiming re Kiosk acceptance | Included in live smoke checks. |
| API error handling | Explicit non-2xx error responses; no silent fallback or guessed answers | Verified by automated tests. |
| NVIDIA provider setup | Configured for NVIDIA NIM (`nvidia/nemotron-3.5-lightning-30b-a3b`), JSON mode and thinking disabled, with single-request concurrency lock | Monitor NVIDIA quota; hosted deployments need updated server environment variables and redeployment. |
| First-use handoff | `start.bat`, `start.sh`, `launch.py`, `.env.example`, `README.md` | Record walkthrough timing with two classmates. |
