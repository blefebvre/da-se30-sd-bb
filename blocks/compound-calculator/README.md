# Compound Calculator

Interactive compound-interest calculator (source: https://bradescobank.com/en/the-power-of-compounding/).
Authors set the starting values and labels; the block builds the form, results summary and
year-by-year table, and recalculates on every input change.

## Content model

| Compound Calculator | | |
|---|---|---|
| title | Simple Annual Compound Calculator | |
| start | 1000 | Starting Amount (US$) |
| contribution | 0 | Contribution (US$) |
| frequency | annual *or* monthly | Contribution Frequency |
| rate | 10 | Annual Return (%) |
| years | 4 | Years |
| max-years | 30 | |
| disclaimer | Disclaimer text (rich text allowed) | |

All rows are optional; missing rows fall back to the defaults above.

## Calculation

Annual compounding: each year earns `balance × rate`, then that year's contributions
(`contribution × 12` for monthly, `× 1` for annual) are added at year end.
Final value, total invested and total interest are shown above the table.
