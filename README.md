# HKU Recycling Helper

A source-backed campus recycling assistant for HKU students and staff. It checks everyday items against official HKU recycling rules, recommends suitable campus facilities (**re Kiosk**, **Smart Recycling Bins**, and **re Bins**) with direct links to the [HKU re Facilities Campus Map](https://www.wastereduction.hku.hk/re-facilities#comp-m7bndgl81), and provides preparation steps and official source citations.

## Key Features

- **Bilingual Web Interface (`EN` / `繁體中文`)**: One-click toggle between English and Hong Kong Traditional Chinese across the entire UI, sample examples, rule explanations, preparation steps, and source library.
- **Evidence-Backed Facility Matching**: Matches everyday items against 14 curated campus rule records from the [HKU Photo Guide](https://www.wastereduction.hku.hk/photo-guide) and [HKU re Facilities](https://www.wastereduction.hku.hk/re-facilities), recommending the appropriate facility stream:
  - **re Kiosk (Run Run Shaw Podium, Main Campus)**: 24-hour collection for Paper, Tetra Pak (Beverage Cartons), Metals, Glass Bottles, Plastics (including clean foam nets, styrofoam, coffee cup lids, contact lens trays), and Rechargeable Batteries.
  - **Smart Recycling Bins**: 24-hour self-service bins with HKU App **GreenU** points integration across Main Campus (K.K. Leung LG2/F, Meng Wah 1/F, Hui Oi Chow G/F, Central Podium G/F), Sassoon Road Campus, and Pine Court.
  - **re Bins**: Campus-wide three-colour recycling bins.
- **Multilingual & Typo-Tolerant Input**: Accepts queries in any language or with common spelling errors. A constrained normalization step translates or corrects the input into English before running deterministic safety, retrieval, and condition checks—without inventing missing material or cleanliness facts.
- **General Guidance Fallback**: Everyday items outside the specific facility rules (such as fruit peel or food scraps) receive a clearly labelled general-guidance classification (`food_waste`, `general_waste`, `recycling`, `special_collection`, `reuse`, or `unknown`) backed by official Hong Kong EPD references.
- **Safety & Privacy Guards**: Automatically screens out hazardous, laboratory, medical, or commercial waste and personal identifiers (names, UIDs, emails, phone numbers) locally before any external model call.

---

## Quick Start

### Windows

1. Install [Python 3.12 or newer](https://www.python.org/downloads/) (check **Add Python to PATH** during installation).
2. Double-click **`start.bat`**. On first launch, it automatically creates `.venv`, installs dependencies, and initializes `.env` from `.env.example`.
3. Your browser will open automatically at **http://127.0.0.1:8000** (or the next free port such as `8001`).
4. Try **Sample mode** right away without an API key, or configure `.env` to enable **Live AI**.

### macOS / Linux

```sh
sh start.sh
```

To specify a custom port: `sh start.sh --port 8001`.

Manual setup:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.lock.txt
.venv/bin/python launch.py
```

---

## API Configuration (Live AI Mode)

Live mode uses the OpenAI-compatible **Alibaba Cloud Bailian** endpoint (`qwen3.8-flash`).

1. Run the key configuration helper to save your API key into the git-ignored `.env` file:

   ```sh
   # macOS / Linux
   .venv/bin/python scripts/configure_key.py

   # Windows
   .venv\Scripts\python.exe scripts\configure_key.py
   ```

2. Default `.env` settings:

   ```dotenv
   BAILIAN_API_KEY=your_api_key_here
   AI_BASE_URL=https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
   AI_MODEL=qwen3.8-flash
   AI_TIMEOUT_SECONDS=45
   AI_MAX_TOKENS=800
   AI_TEMPERATURE=0.1
   ```

3. Restart the app after updating `.env`. To verify connectivity and JSON formatting:

   ```sh
   .venv/bin/python scripts/check_provider.py
   ```

---

## Project Structure

| Path | Description |
| --- | --- |
| `app/main.py` | FastAPI application, security headers, routing, and decision orchestration. |
| `app/corpus.py` | Lexical rule retrieval, condition verification, and source citation assembly. |
| `app/safety.py` | Deterministic pre-screening for scope, hazards, personal data, and missing conditions. |
| `app/provider.py` | Serialized, non-retrying HTTP client and strict Pydantic output validation. |
| `SKILL.md` | System prompt instructions governing evidence-bound model decisions. |
| `data/rules.json` | 14 curated campus recycling rules with required conditions and preparation steps. |
| `data/sources.json` | Official HKU and EPD reference URLs, section locators, and verification dates. |
| `data/general-guidance.json` | Official EPD references for non-facility general waste/recycling fallback. |
| `data/samples.json` | Built-in examples covering accepted, rejected, uncertain, and out-of-scope states. |
| `static/` | Responsive bilingual (`EN` / `繁體中文`) frontend (`index.html`, `styles.css`, `app.js`). |

See [docs/architecture.md](docs/architecture.md) for the request pipeline diagram and [schemas/answer.schema.json](schemas/answer.schema.json) for the response contract.

---

## Testing & Evaluation

Run the automated test suite and safety checks:

```sh
.venv/bin/python -m pytest -q
.venv/bin/python scripts/evaluate.py validate
.venv/bin/python scripts/evaluate.py run --safety-only
```

Run headless Chrome UI verification (checks desktop & mobile layouts, sample states, source library dialog, and `EN` / `繁體中文` language switching):

```sh
node scripts/browser_check.mjs
```

For the 20-case benchmark workflow (`freeze`, `run`, and `summarize`), see [docs/evaluation.md](docs/evaluation.md).

---

## Troubleshooting

| Symptom | Solution |
| --- | --- |
| Python not found | Install Python 3.12+ and add it to `PATH`, then reopen your terminal. |
| Port 8000 in use | `launch.py` automatically picks the next available port (`8001`–`8010`), or pass `--port`. |
| Live AI unavailable | Ensure `BAILIAN_API_KEY` is set in `.env` and restart the launcher. |
| API timeout or rate limit | Wait a moment and try again; the backend serializes requests and never guesses answers on error. |
