---
"@amezquita/design-system": minor
---

Card: new `card-border-color` token (the default border in base) and Card now rests on `shadow-card`, which every brand defined but nothing used. demo-soft sets `card-border-color` to transparent, so its cards get their edge from the soft shadow in light and their lighter fill in dark. In base, demo-cool and portfolio, cards gain the faint 1px shadow their `shadow-card` already described; demo-warm's is `none`. Ghost cards stay flat.
