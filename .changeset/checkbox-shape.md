---
"@amezquita/design-system": patch
---

Checkboxes stay square in round brands. Checkbox, SelectableCard's `multiple` indicator and MultiSelect's option mark took the brand's interactive radius whole, so demo-soft's pill and demo-cool's 12px made them circles, indistinguishable from radios. Their corner is now capped at a quarter of the box; square brands (base, portfolio, demo-warm) look the same as before. No new tokens.
