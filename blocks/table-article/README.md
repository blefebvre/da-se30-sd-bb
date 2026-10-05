# table-article

Custom **table** block. Purpose: article-data-table.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Compare | `compare` |
| Features | `features` |

### Option notes

- `compare`: header row `['' | product A | product B]`, then `[label | value | value]` rows. Header cells render as dark-red tabs above a white card; value columns are centred with a vertical divider.
- `features`: no header row; `[label | value]` rows in a rounded, bordered box (for dark sections).
- Value cells containing only `✓` (or `:check:` / a check icon) render as a check-circle; a lone `-` renders as a larger dash; values longer than 38 characters render in the source's small print size.

## Universal Editor fields

N/A (Document Authoring project)
