# HKU Recycling Helper

A local browser application for AILT9019 Group 73, built from `HKU_Recycling_Helper_Proposal_rev2.pdf`. It provides evidence-based recycling guidance for HKU students, covering **re Kiosk, Main Campus**.

The proposal PDF is retained as the historical course submission. Current implementation details, provider configuration, language support and scope boundaries are documented in this README and `docs/`.

**Current state:** The browser UI, offline sample mode, local FastAPI backend, rule retrieval, `SKILL.md` prompt integration, structured output validation and evaluation scripts are implemented. The corpus includes 14 curated facility-specific rule summaries linked to official HKU references, plus 2 official EPD references for general-guidance fallback. Automated tests (94 cases), safety/ambiguity checks and live `qwen3.8-flash` smoke checks pass.

**Language and spelling support:** Live mode accepts common spelling errors and multiple languages. When local lexical matching does not recognize the wording, a constrained model normalization step translates or corrects the text into English before running the same deterministic safety, retrieval and condition checks. The normalizer never invents missing material or condition facts; if required details are absent, the app returns `cannot_determine`. Answers are displayed in canonical English so that reasons and preparation steps can be verified directly against the cited source records.

**General fallback:** Everyday items outside the 14 facility-specific records receive a clearly labelled general-guidance result (`recycling`, `food_waste`, `general_waste`, `special_collection`, `reuse` or `unknown`). General guidance never claims that the re Kiosk accepts the item. For example, fruit peel is classified as food waste and kept out of dry recycling.

## Start on Windows

1. Install [Python 3.12 or newer](https://www.python.org/downloads/). Select **Add Python to PATH** in the installer.
2. Extract the repository folder, keeping `app`, `data`, `static`, `SKILL.md` and the launchers together.
3. Double-click **`start.bat`**. First launch installs dependencies into `.venv` and creates `.env` from `.env.example`.
4. The launcher opens the first available local port automatically, typically **http://127.0.0.1:8000** or **http://127.0.0.1:8001**. Keep the launcher window open while using the app.
5. Choose a sample item and press **Check item** to view a built-in example result and its evidence structure. No API key is needed for sample mode.

Press **Ctrl+C** in the launcher window to stop.

## Start on macOS or Linux

Install Python 3.12 or newer, then open Terminal in this folder:

```sh
sh start.sh
```

The launcher opens the first available local port automatically (`http://127.0.0.1:8000` or `http://127.0.0.1:8001`). To force a specific port: `sh start.sh --port 8001`.

Manual setup:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock.txt
.venv/bin/python launch.py
```

On Windows, the virtual-environment Python is `.venv\Scripts\python.exe`.

## Course API configuration

The course uses **Alibaba Cloud Bailian Token Plan Team Edition** (`qwen3.8-flash`, 25,000 shared group credits, first-batch expiry **19 November 2026**). The backend enforces one request at a time per running app instance, an 800-token output limit, temperature 0.1 and no automatic retries.

1. Obtain the group API key from the course announcement / group channel.
2. Save it locally with hidden terminal input:

   ```sh
   .venv/bin/python scripts/configure_key.py
   ```

   Windows: `.venv\Scripts\python.exe scripts\configure_key.py`.

3. Default `.env` configuration:

   ```dotenv
   AI_BASE_URL=https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
   AI_MODEL=qwen3.8-flash
   AI_TIMEOUT_SECONDS=45
   AI_MAX_TOKENS=800
   AI_TEMPERATURE=0.1
   ```

4. Restart the app after updating `.env`. The key stays on the local Python server; `.env` is excluded from Git and is never served to the browser.
5. Optionally run `.venv/bin/python scripts/check_provider.py` to verify API connectivity and JSON response formatting.

**Do not commit, publish or share the group key outside the group.**

## Corpus and scope boundaries

- `data/rules.json`: versioned live collection of 14 curated re Kiosk records.
- `data/sources.json`: official reference links, section locators and verification dates.
- `data/general-guidance.json`: official EPD references used only by the non-facility general fallback.
- `data/samples.json`: built-in examples for the four output states.

See [docs/source-review.md](docs/source-review.md) for source notes. Every live record retains required conditions, facility evidence, source locators and verification dates.

The app never searches the web at query time. It cannot identify the nearest bin or real-time facility availability. EPD general references cannot substitute for HKU facility evidence. Missing information or unmatched facility rules return **Cannot determine**, never an inferred rejection. Campus staff instructions and bin signage always take precedence.

## Validation and evaluation

```sh
.venv/bin/python -m pytest -q
.venv/bin/python scripts/evaluate.py validate
.venv/bin/python scripts/evaluate.py run --safety-only
```

Optional browser QA (requires Node 22+ and Chrome): start the app, then run `node scripts/browser_check.mjs` (set `HKU_TEST_URL` if using a port other than `8001`, and `CHROME_PATH` if needed).

The evaluation benchmark in `evaluation/cases.draft.json` has 14 routine + 3 ambiguous + 3 unsafe cases. Before running the final benchmark, one team member labels each case and a second member independently reviews it against the sources:

```sh
.venv/bin/python scripts/evaluate.py freeze --labelled-by member-a --reviewed-by member-b
.venv/bin/python scripts/evaluate.py run --cases evaluation/cases.frozen.json
```

After inspecting the cited sources and completing `evaluation/runs/RUN_ID.review.json`, summarize the run:

```sh
.venv/bin/python scripts/evaluate.py summarize evaluation/runs/RUN_ID.json --review evaluation/runs/RUN_ID.review.json
```

Pass criteria: at least **13/14** routine decisions and evidence results; at least **90%** facility and preparation correctness on applicable cases (`ceil(0.9 * n)`); **3/3** ambiguous and **3/3** unsafe cases. See [docs/evaluation.md](docs/evaluation.md) and [docs/walkthrough.md](docs/walkthrough.md).

## Privacy and architecture

Live mode sends only the item description, retrieved rule summaries and `SKILL.md` instructions to Alibaba Cloud Bailian. Do not enter names, UIDs, contact details or personal records. No image input, analytics, database or local query logging is used.

Architecture and endpoint contracts are documented in [docs/architecture.md](docs/architecture.md), and the output JSON Schema is in [schemas/answer.schema.json](schemas/answer.schema.json). See [docs/project-status.md](docs/project-status.md) for the current project checklist.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Python not found | Install Python 3.12+ and add it to PATH; reopen the terminal. |
| Dependency installation fails | Check internet/proxy access, then rerun the launcher. |
| Port 8000 unavailable | The launcher selects the next free port automatically, or pass `--port`. |
| Live mode unavailable | Check `.env` for `BAILIAN_API_KEY`, `AI_MODEL`, `SKILL.md` and `data/rules.json`. |
| Provider rejects the key | Verify the key in `.env`, the course endpoint URL and the batch expiry date. |
| API timeout or rate limit | Wait a moment and retry manually; the app never guesses or caches live answers. |
| Unmatched item | Live mode returns clearly labelled general guidance without claiming re Kiosk acceptance. |
