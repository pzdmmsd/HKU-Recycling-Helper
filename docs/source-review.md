# Source and permission review

The proposal was read in full. The team initially confirmed on 25 October 2026 that no permission had been recorded. Later that day, the team explicitly instructed the implementation to ignore the proposal's documented-permission prerequisite and make live AI work. `data/rules.json` now contains 14 project-written factual summaries. Their `team_override` status records this project decision and does **not** claim permission or endorsement from the source owners.

The links below were inspected on 25 October 2026. This date records an online source check, not university approval, a field inspection, a guarantee of currency, or the team's two-person label review. The proposal's earlier 30 September check is not reused as a new verification date.

## Files and separation

- `data/rules.json`: the live corpus of project-written summaries included by explicit team instruction.
- `data/sources.json`: attribution, locators, verification dates and team-override status.
- `data/research-candidates.json`: preserved pre-override research snapshot; the application does not load it. No website paragraphs, photographs, posters, or extracted images are bundled.
- `data/samples.json`: independently written, pre-authored interface examples about an **imaginary sample facility**. They demonstrate output states, are not official recycling guidance, and must never count toward live model accuracy.

## Official references inspected

| Reference | Specific place to inspect | Finding and limit |
| --- | --- | --- |
| [HKU Recycling 101](https://www.wastereduction.hku.hk/recycling-101) | “The Correct Choice”; material sections; “Photo Guide” link | Introduces guidance for re Kiosk and links the item guide. Its linked poster/PDF could not be retrieved through the research tool, so no unseen poster detail was inferred. |
| [HKU re Facilities](https://www.wastereduction.hku.hk/re-facilities) | “re Kiosk”; “Run Run Shaw Podium, Main Campus”; “re Kiosk accepts these recyclables” | Establishes this facility and the paper, beverage-carton, metal, glass-bottle, and plastic categories. Category acceptance alone does not establish every subtype or preparation step. Published access information is not live availability. |
| [HKU Photo Guide](https://www.wastereduction.hku.hk/photo-guide) | Introductory re Kiosk heading; Paper, Plastics, Metals | Supplies item-specific positive and explicit negative examples. Source-register entries identify each item caption. The 14 candidate notes preserve component distinctions; a cup lid's rule is not a rule for an entire assembled cup. |
| [EPD Clean Recycling](https://www.wastereduction.gov.hk/en-hk/waste-reduction-programme/clean-recycling) | Paper; Plastic Bottles; Metal; Beverage Cartons | Supplementary preparation guidance only. It does not establish acceptance at an HKU facility. No EPD-derived rule is admitted to the corpus. |
| [EPD Important Notices](https://www.wastereduction.gov.hk/en-hk/important-notices) | Copyright Notices, two paragraphs | Government-owned material may be stored locally for personal or non-commercial internal use if its copyright notice accompanies it. This is not an established licence for external API processing or public redistribution. Other owners' material is excluded from that grant. |

## Permission findings

No reuse licence covering the intended corpus, external model processing, and distribution was established from the inspected HKU recycling pages. The [HKU Libraries copyright notice](https://lib.hku.hk/general/copyright.html) permits certain educational reuse of **its own site**; this does not establish permission for the Estates Office recycling site. The [HKU copyright guide](https://libguides.lib.hku.hk/copyright_hku) discusses context-dependent exceptions, but a general guide is not recorded approval for this project's intended use. No exception or blanket permission is claimed here.

For EPD, the stated local-use permission has conditions and a narrower scope than this project's proposed external processing. The project retains the reference links and its own review notes, not downloaded Government source material. The EPD pages remain background references and are not used to establish HKU facility acceptance.

These are project permission-record findings, not a legal determination about whether individual facts can be protected. The live implementation now follows the team's later instruction to bypass the proposal gate. It sends only the relevant project-written summary, source metadata and task instructions—not copied pages or images.

## Remaining approval work

1. Recheck every live rule against the exact item caption and facility evidence. Record reviewer identifiers, check date, supported conditions/preparation and any disagreement.
2. For glass bottles and more detailed carton preparation, inspect the official detailed guide directly before drafting additional rules. Do not fill gaps from model memory or use EPD as HKU acceptance evidence.
3. Freeze the separately reviewed 20-case evaluation, run it with the live model, and report the actual results.
4. If distribution changes from the private course repository to public hosting, review that expanded scope separately.

No email was sent to HKU or EPD. The project does not claim that source owners or the teaching team approved its records.
