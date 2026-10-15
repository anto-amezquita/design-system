---
"@amezquita/design-system": minor
---

New `Combobox` primitive: one value from a long list, found by typing. It follows the WAI-ARIA combobox with list autocomplete. Typing filters the list and puts the match in bold; Arrow keys move through it, skipping unavailable options; Enter picks; Escape closes, then clears. The result count is announced as it changes. Matching ignores case and accents, and starts of words rank first. Options can carry a description, and `allowCustom` keeps typed text. `onInputChange`, `loading` and `filter={false}` support options fetched from a server. Adds `lib/match` helpers. TimePicker's active option now uses the same straight bar, which stays straight in round brands like demo-soft.
