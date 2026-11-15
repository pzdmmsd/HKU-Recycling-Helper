# Proposal acceptance status

Implementation checkpoint: 15 November 2026. The proposal was read in full. The team subsequently instructed the implementation to bypass its documented-permission prerequisite and enable the live corpus. The status `team_override` records that choice without claiming source-owner endorsement.

Current verification on Windows with Python 3.12:

- 86 automated tests passed, including multilingual and typo-normalization cases.
- All six ambiguous/unsafe draft cases passed through the real HTTP handlers; no provider calls were made for the safety-only paths.
- Browser checks passed for all four samples, the 18-entry source library, native dialogs/Escape, simulated request failure, private-file 404s, and desktop/mobile layouts without horizontal overflow.
- Live `qwen3.8-flash` checks passed for an accepted pizza box, explicitly rejected baking paper and an accepted coffee cup with preparation. Each returned the expected canonical rule and two HKU citations.
- Selected live smoke checks accepted Chinese, English-typo and French pizza-box inputs; a Chinese lithium-battery request was refused before provider transmission.
- A full-key scan found zero matches in tracked or unignored files; `.env` is ignored and absent from Git. A macOS verification checkpoint previously passed 80 tests with owner-only `.env` permissions; the current Windows checkout uses the normal local file permissions.

Screenshots and the transport-check metadata are under ignored `artifacts/`. The current Starlette test client emits an httpx deprecation warning; all tests pass with the pinned dependency snapshot. The multilingual checks validate routing and safety on selected examples, not language-wide accuracy.

| Proposal item | Implementation / evidence | Remaining work |
| --- | --- | --- |
| Versioned live source corpus | 14 project-written records, source register, explicit team override and source filtering | Independent factual/source review before final reporting. |
| Text browser app with local Python backend | Responsive local interface, sample/live controls, FastAPI handlers, multilingual normalization | Two novice walkthroughs and final usability measurement. |
| Retrieval + actual SKILL integration | Team-included record retrieval, system prompt reads SKILL.md, strict structured validation; three baseline live cases and multilingual smoke checks passed | Full 20-case live evaluation. |
| Three decisions with evidence | Accepted, not accepted, cannot determine; separate safety refusal; canonical citations | Full 20-case evaluation and manual evidence review. |
| API failure behaviour | Non-2xx errors, no guessed/cached fallback, mocked failure tests | Provider outage can be simulated, not claimed to have occurred during live use. |
| Sponsored provider | qwen3.8-flash / course endpoint; connectivity, baseline, typed and multilingual smoke checks succeeded | Course quota/expiry monitoring by team. |
| Evaluation | 20-case English draft, freeze/checksum tool, sequential runner, separate semantic evidence review | Two-person labels, final freeze, all 20 live cases, manual evidence review. Multilingual accuracy is not claimed. |
| First-use handoff | requirements, example config, Windows/macOS/Linux launchers, README, walkthrough sheet | Two actual novice walkthroughs; target not yet measured. |
| Private distribution | Private GitHub course repository updated; secret excluded; no public hosting | Confirm teaching-team access and complete source distribution review. |

Automated tests and safety checks are engineering validation. They are not evidence that the routine model-accuracy thresholds or novice usability target have been met. The project must not be described as fully accepted against the proposal until the remaining human/source checkpoints are completed.

No image recognition, additional facilities, real-time availability, geolocation or live web search was added. Text input accepts common spelling errors and multiple languages through a constrained normalization step before deterministic screening and retrieval. The language-model provider differs from the proposal's original OpenAI plan because the supplied course sponsorship uses Alibaba Cloud; the interface uses its OpenAI-compatible protocol.

AI assistance: Codex substantially generated and reviewed implementation code, original fictional fixtures, tests, documentation and research drafts. Team members must independently review factual labels and the final report. No human sign-off, consultation or participant result has been fabricated.
