# tabs

Custom **tabs** block. Purpose: benefit-switcher.

## Authoring (Document Authoring)

Model: `standalone`

One row per tab, two cells: `[tab label | panel content]`.

## Supported variations

| Variation | Option class | Panel content |
| --- | --- | --- |
| Fragments | `fragments` | a single link to a fragment page (e.g. `/en/careers/fragments/jobs`). The fragment's sections are inserted after the block's section (so page section styles apply) and shown/hidden with their tab. |
| Tiles | `tiles` | repeated image + h3 + paragraph groups, rendered as a photo tile grid (4 columns, or 2 wide tiles when a panel has at most two). |
| Vertical | `vertical` | an image + paragraph(s); the image fills the panel, tab list stacked on the left from 900px. |
| FAQ | `faq` | label cell = category icon + label; panel = questions as h3 each followed by its answer. Rendered as icon cards on a grey band (1 / 2 / 4 per view, arrows below 768px) above a gradient bar; each panel's questions become an `accordion (faq)` (FAQ hubs, e.g. /en/personal-bank/faq). |

All options render edge to edge (the wrapper drops the boxed column).

## Universal Editor fields

N/A (Document Authoring project)
