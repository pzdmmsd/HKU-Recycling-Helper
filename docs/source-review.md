# Source and corpus reference notes

The live corpus in `data/rules.json` contains 14 concise, project-written factual summaries referencing public HKU recycling guidance, verified online on 25 October 2026.

## Data files and roles

- `data/rules.json`: live corpus of 14 curated re Kiosk rule summaries.
- `data/sources.json`: source titles, URLs, section locators and verification dates.
- `data/general-guidance.json`: official EPD references used exclusively for non-facility general guidance.
- `data/samples.json`: built-in examples illustrating the four output states.

## Official references used

| Reference | Specific section / locator | Scope and usage |
| --- | --- | --- |
| [HKU Recycling 101](https://www.wastereduction.hku.hk/recycling-101) | “The Correct Choice”; material sections; “Photo Guide” link | Introduces campus recycling guidance for re Kiosk and links to the item photo guide. |
| [HKU re Facilities](https://www.wastereduction.hku.hk/re-facilities) | “re Kiosk”; “Run Run Shaw Podium, Main Campus”; “re Kiosk accepts these recyclables” | Establishes the covered facility and its main recyclable streams (paper, beverage cartons, metals, glass bottles, plastics). |
| [HKU Photo Guide](https://www.wastereduction.hku.hk/photo-guide) | Introductory re Kiosk heading; Paper, Plastics, Metals | Provides item-specific accepted and rejected examples and component-level rules (e.g. cup vs. lid vs. sleeve). |
| [EPD Clean Recycling](https://www.wastereduction.gov.hk/en-hk/waste-reduction-programme/clean-recycling) | Paper; Plastic Bottles; Metal; Beverage Cartons | Background preparation context only; never used to establish acceptance at an HKU facility. |
| [EPD Food Waste & Tips](https://www.wastereduction.gov.hk/en-hk/waste-reduction-and-recycling-tips) | Food Waste Recycling Schemes; Waste Reduction and Recycling Tips | Used only by the clearly labelled `general_guidance` fallback for items outside the 14 re Kiosk rules. |

## Corpus design principles

1. **Concise factual summaries**: The corpus stores short, structured rule metadata and official URLs/locators rather than copied webpage paragraphs or images.
2. **Facility specificity**: A rule must cite an official `.hku.hk` source to establish acceptance or rejection at re Kiosk; EPD sources alone cannot establish campus facility rules.
3. **Component precision**: Composite items (such as takeaway coffee cups, instant noodle containers and contact lens packaging) keep separate rules for each component (cup, lid, sleeve, tray, foil lid).
