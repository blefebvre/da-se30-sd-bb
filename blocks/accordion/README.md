# accordion

Custom **accordion** block. Purpose: benefit-details / FAQ.

## Authoring (Document Authoring)

Model: `standalone`

One row per item, two cells: `[question / label | answer rich text]`.

Decorated as `<details class="accordion-item">` / `<summary class="accordion-item-label">`;
only one item is open at a time and the first item opens by default.

## Supported variations

| Variation | Option class | Effect |
| --- | --- | --- |
| More | `more` | Only the first N items show (default 3) with a red "Show more" pill that reveals the rest |
| Visible count | `visible-N` | With `more`, show N items before the toggle (e.g. `visible-5`) |
| FAQ | `faq` | All items start closed and open independently; white shadowed bars with a thin line chevron. Built by `tabs (faq)` from h3 questions (FAQ hubs) |
| Premium | `premium` | All items start closed, deeper shadow, light-grey open item, thin line chevron, wide dark-red "See more" pill (Visa Infinite) |

Examples: `accordion` (Signature Gold), `accordion (more, visible-5)` (Zelle FAQ),
`accordion (more, premium)` (Visa Infinite benefits).

## Universal Editor fields

N/A (Document Authoring project)
