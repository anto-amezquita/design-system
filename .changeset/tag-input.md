---
"@amezquita/design-system": minor
---

New `TagInput` primitive: free-text values as tags. Enter, comma or semicolon add what's typed. A pasted list is split, and leaving the field adds what's typed. Duplicates (ignoring case and accents), `validate` failures and going over `max` each get their own reason, and the refused text stays in the field. With `suggestions`, it's a combobox like Combobox. Tags show below the field, Backspace removes the last, and each change is announced. `Tag`'s Remove button is now an icon at full text colour (4.5:1) with a 24px target and a hover state, replacing the "×" glyph at 60% opacity. The Tag docs now cover its icon, removable and clickable forms.
