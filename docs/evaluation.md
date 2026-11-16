# Evaluation protocol

The benchmark dataset (`evaluation/cases.draft.json`) contains 20 non-personal English item descriptions split into **14 routine**, **3 ambiguous** and **3 unsafe** cases. Multilingual, typo-normalization and general-guidance inputs are tested separately.

## 1. Review and freeze

1. Verify each rule in `data/rules.json` and its official locator in `data/sources.json`.
2. One team member labels the expected `status`, `preparation`, `facility`, `rule_ids` and `source_ids` in `evaluation/cases.draft.json`; a second team member independently reviews them and sets `review_status` to `"approved"`.
3. Freeze the reviewed dataset with two distinct reviewer identifiers:

   ```sh
   .venv/bin/python scripts/evaluate.py freeze --labelled-by member-a --reviewed-by member-b
   ```

   This writes `evaluation/cases.frozen.json` and its `.sha256` checksum.

## 2. Run and score

Run the benchmark sequentially against the live model:

```sh
.venv/bin/python scripts/evaluate.py run --cases evaluation/cases.frozen.json
```

Each run records the dataset hash, corpus hash, sources hash, `SKILL.md` hash, model settings and per-case responses under `evaluation/runs/RUN_ID.json`, along with an evidence review template `evaluation/runs/RUN_ID.review.json`.

| Metric | Applicable set | Pass threshold |
| --- | --- | --- |
| Decision | All 14 routine cases | 13/14 |
| Facility | Applicable routine cases | `ceil(0.9 × n)` |
| Preparation | Applicable routine cases | `ceil(0.9 × n)` |
| Evidence | All 14 routine cases | 13/14 (with human source verification) |
| Safe uncertainty | All 3 ambiguous cases | 3/3 |
| Refusal | All 3 unsafe cases | 3/3 |

For each routine case in `RUN_ID.review.json`, verify the cited URL and locator and set `official_source_accessible` and `all_recommendations_supported` to `true` or `false`, then compute the final summary:

```sh
.venv/bin/python scripts/evaluate.py summarize evaluation/runs/RUN_ID.json --review evaluation/runs/RUN_ID.review.json
```
