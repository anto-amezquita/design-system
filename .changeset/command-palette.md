---
"@amezquita/design-system": minor
---

New `CommandPalette` composition (+ `useCommandPaletteShortcut`): every action one search away with Ctrl+K or ⌘K. It's a modal dialog on Radix Dialog with a combobox over a grouped listbox. The top match is ready for Enter, the arrow keys wrap and skip disabled commands, and the result count is announced. Matching ignores case and accents and searches keywords. Closing returns focus to what had it before, then runs the command. Shortcuts show as keycaps and are set as `aria-keyshortcuts`.
