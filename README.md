# HKU Recycling Helper

A local browser app for AILT9019 Group 73, built from `HKU_Recycling_Helper_Proposal_rev2.pdf`. It helps demonstrate evidence-based recycling decisions for newly arrived HKU students, with the pilot limited to **re Kiosk, Main Campus**. This is a student project, not an official HKU service.

The proposal PDF is retained as the historical course submission. Current implementation details, provider information, language support and known limitations are documented in this README and `docs/`; those current files take precedence if they differ from the proposal.

**Current state:** the app, sample mode, local Python backend, retrieval, actual `SKILL.md` prompt integration, output validation and evaluation tools are implemented. The supplied Alibaba Cloud connection and three baseline cited decisions were successfully tested on 25 October 2026 using `qwen3.8-flash`. On 15 November 2026, the secure Windows checkout passed 86 automated tests and selected live Chinese, typo and French smoke checks. The full 20-case evaluation and two novice walkthroughs remain pending. The project team explicitly chose to proceed without the proposal's documented-permission gate, so 14 project-written factual summaries with official source links are included in the live corpus. This inclusion does not claim source-owner endorsement. Sample examples remain fictional demonstrations and do not establish overall model accuracy.

**Language and spelling support:** Live input accepts common spelling errors and other languages. When local matching cannot understand the wording, a model normalization step translates or corrects it into English before the same deterministic safety, retrieval and evidence checks run. The normalizer is instructed not to add missing material or condition facts; if a fact is still absent, the app returns `cannot determine`. Answers remain in canonical English so that the displayed reason and preparation fields can be checked against the cited source records. This multilingual path is smoke-tested only; the frozen 20-case accuracy evaluation remains English-language.

## Start on Windows

1. Install [Python 3.12 or newer](https://www.python.org/downloads/). Select **Add Python to PATH** in the installer.
2. Download the project from your private course repository and extract the whole folder. Keep `app`, `data`, `static`, `SKILL.md` and the launchers together.
3. Double-click **`start.bat`**. First launch installs dependencies into the project's `.venv` folder and creates `.env` from the example. Internet access is needed for dependency installation.
4. The launcher opens the first available local port automatically, usually **http://127.0.0.1:8001** if port 8000 is reserved. Keep the launcher window open while using the app.
5. Choose a sample item, press **Check item**, and read its result and evidence explanation. No API account or key is needed for sample mode.

Press **Ctrl+C** in the launcher window to stop. No source-code editing is needed to install, configure a key or start the app.

## Start on macOS or Linux

Install Python 3.12 or newer, then open Terminal in this folder:

```sh
sh start.sh
```

The launcher prints and opens the first available local port automatically, usually `http://127.0.0.1:8000` or `http://127.0.0.1:8001`. To force a port: `sh start.sh --port 8001`.

Manual setup, including an exactly pinned dependency snapshot:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock.txt
.venv/bin/python launch.py
```

On Windows, the virtual-environment Python is `.venv\Scripts\python.exe`.

## Course API configuration

The course's Ed announcement specifies **Alibaba Cloud Bailian Token Plan Team Edition**, 25,000 shared credits, course work only, and a first-batch expiry of **19 November 2026**. It names `qwen3.8-flash` as a Flash option. This project uses that model, one concurrent request per running app, an 800-token output limit, temperature 0.1 and no automatic retries. Coordinate across the group: separate app instances do not share the same concurrency lock.

1. Read the course announcement and obtain the group key privately from your teaching team/group.
2. Save it with hidden input:

   ```sh
   .venv/bin/python scripts/configure_key.py
   ```

   Windows: `.venv\Scripts\python.exe scripts\configure_key.py`.

3. The supplied configuration is:

   ```dotenv
   AI_BASE_URL=https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
   AI_MODEL=qwen3.8-flash
   AI_TIMEOUT_SECONDS=45
   AI_MAX_TOKENS=800
   AI_TEMPERATURE=0.1
   ```

4. Restart the app after changing `.env` or the corpus. The key stays on the Python server. `.env` is excluded from Git and is not served to the browser.
5. Optionally run `.venv/bin/python scripts/check_provider.py`. It makes **one small billable synthetic request** with no recycling corpus or personal information. Success confirms connectivity and JSON formatting only.

An OpenAI-compatible interface does not mean OpenAI processes these requests. The provider is Alibaba Cloud, and the app uses the sponsored endpoint rather than a standard OpenAI endpoint. Changing the model requires a new full evaluation. The announcement estimates 150–250 million tokens for `qwen3.8-flash` per 25,000-credit allocation; this is a course estimate, not a guaranteed balance or cash price. Ask the teaching team about top-ups or expired credentials; the app never switches to another paid endpoint.

**Do not commit, publish or send the group key outside the group.** The provided key has been saved only in this checkout's ignored `.env`, not in the example, browser assets, documentation or tests. A fresh checkout requires its own local configuration.

## Sources and live use

On 25 October 2026, the project team explicitly instructed the implementation to ignore the proposal's documented-permission prerequisite and enable the live application. The corpus therefore uses short project-written factual summaries and sends relevant summaries, locators and URLs to Alibaba Cloud for a query. It does not transmit copied webpages or images.

- `data/rules.json`: the versioned live collection of 14 cited records.
- `data/sources.json`: official reference links, precise locators, check dates and the explicit team-override status.
- `data/research-candidates.json`: the preserved pre-override research snapshot; the application never loads it.
- `data/samples.json`: original fictional examples for all three decision states and a refusal.

[Source review](docs/source-review.md) records the original findings and the later team override. Every live record retains conditions, facility evidence, source locators and verification dates. `status: "team_override"` means the team chose to use the record in this private course prototype; it is deliberately distinct from `approved`, which would imply a documented permission basis.

The app never searches the web at query time. It cannot identify the nearest bin or current facility availability. EPD background cannot substitute for HKU facility evidence. Missing information or unmatched evidence gives **Cannot determine**, never an inferred rejection. Staff instructions and signage take precedence.

## Validation and evaluation

```sh
.venv/bin/python -m pytest -q
.venv/bin/python scripts/evaluate.py validate
.venv/bin/python scripts/evaluate.py run --safety-only
```

The automated tests use synthetic records and a mocked provider. The safety-only command executes the three ambiguous and three unsafe draft cases through the real request handlers without sending a model request. These are engineering checks, **not the proposal's 20-case live model evaluation**.

Optional browser QA uses Node 22+ and installed Chrome: start the app, then run `node scripts/browser_check.mjs`. The script defaults to `http://127.0.0.1:8001`; set `HKU_TEST_URL` if the launcher chose another port, and set `CHROME_PATH` if Chrome is installed somewhere other than the default macOS path. It checks samples, dialogs, error handling and mobile overflow, saves screenshots under ignored `artifacts/`, and never submits a live model query. Node is not needed to use the app.

The draft has 14 routine + 3 ambiguous + 3 unsafe cases. Before final evaluation, one team member must label each case and another independently review it against the sources. Record approved review status for each case and freeze it using two different reviewer identifiers:

```sh
.venv/bin/python scripts/evaluate.py freeze --labelled-by member-a --reviewed-by member-b
.venv/bin/python scripts/evaluate.py run --cases evaluation/cases.frozen.json
```

The freeze command rejects pending reviews, and final runs reject unfrozen/modified data and unavailable live configuration. Each run records corpus and dataset hashes, prompt version/hash, model, settings and per-case results. It creates a separate evidence-review form. A human must check that official sources are accessible and that the locators support every recommendation. Then:

```sh
.venv/bin/python scripts/evaluate.py summarize evaluation/runs/RUN_ID.json --review evaluation/runs/RUN_ID.review.json
```

Pass criteria: at least **13/14** routine decisions and evidence results; at least **90%** facility and preparation correctness on applicable cases, rounding the required count up; **3/3** ambiguous and **3/3** unsafe cases separately. Unnecessary abstention, omitted preparation and missing facility details are errors. Sample responses never count. No routine accuracy result or completed two-person walkthrough is claimed yet. See [evaluation guide](docs/evaluation.md) and [walkthrough sheet](docs/walkthrough.md).

## Privacy and implementation

Live mode sends the item description, permitted retrieved records and `SKILL.md` instructions to Alibaba Cloud. Do not enter names, UIDs, contact details or personal records. No image input, analytics, database, saved conversations or application-level query logging is used. HTTP access logging is disabled by the provided launcher. Only explicitly run synthetic evaluations write reports.

Alibaba's [Model Studio overview](https://help.aliyun.com/zh/model-studio/what-is-model-studio) distinguishes the Team Edition's no-training commitment from personal/Coding Plan terms. Its [privacy notice](https://help.aliyun.com/zh/model-studio/privacy-notice) says model/application call data is stored under applicable terms. We have not established an account-specific retention period or zero-retention arrangement for this sponsored Beijing endpoint. The international [ZDR policy](https://www.alibabacloud.com/help/en/model-studio/data-retention-policy) describes a different region/product scope and is not claimed to apply. Disabling local logs does not disable provider retention. Use synthetic, nonpersonal descriptions for course testing.

Architecture and endpoint contracts are in [docs/architecture.md](docs/architecture.md); the machine-readable output contract is [schemas/answer.schema.json](schemas/answer.schema.json). The browser uses local HTML/CSS/JavaScript with no frontend build step, CDN fonts or external image assets. The backend uses FastAPI, Pydantic and httpx on Python 3.12+. No vector database is needed for this small curated corpus.

This implementation, synthetic examples, test scaffolding and research drafts were substantially AI-assisted using Codex. Independent factual label review, novice walkthroughs and the final live evaluation are still required. See [project status](docs/project-status.md) for the acceptance checklist.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Python not found | Install Python 3.12+ and add it to PATH; reopen the terminal. |
| Dependency installation fails | Check internet/proxy access, then rerun the launcher; it does not record success until installation finishes. |
| Port 8000 unavailable | The launcher normally selects 8001 automatically. If a forced port is unavailable, choose another with `--port`. |
| Live mode unavailable | Read the on-screen reason; check the local key, model, `SKILL.md` and live corpus. |
| Provider rejects the key | Check the key locally, the supplied endpoint and the course expiry date; contact the TA team if needed. |
| API timeout or rate limit | Wait and retry manually. There is no cached or guessed live answer. Sample mode remains a separate explicit choice. |
| Unsupported or missing evidence | Provide a single item and relevant details; otherwise ask campus staff. The app will not invent a bin. |

The authorised distribution is the private GitHub course repository, not public hosting. Keep `.env`, API keys and personal data out of Git.
