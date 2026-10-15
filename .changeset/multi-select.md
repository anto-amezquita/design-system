---
"@amezquita/design-system": minor
---

New `MultiSelect` primitive: several values from a long list, found by typing. It's a combobox over a multi-selectable listbox, sharing Combobox's matching and list styles. The list stays open while picking, and options show a checkbox mark. Chosen items appear below the field as removable Tags, with "Remove all" from two. Backspace in the empty field removes the last item. The field is described by what's chosen, and each change is announced. `max` limits how many can be chosen. `Input` now adds a passed `aria-describedby` to its own instead of replacing it.
