---
"@amezquita/design-system": minor
---

New `TreeView` pattern: nested items that open and close, on the WAI-ARIA tree pattern. One Tab stop; Down and Up move through visible rows, Right opens a branch then moves in, Left closes then moves to the parent, Home and End, `*` to open siblings, and typing to jump. Each item is named by its own label, not its children's. `selectionMode` is `none` (rows are activated with `onAction`), `single` or `multiple` (a tick per row); selected rows get a bar and a heavier label as well as a fill. Rows are dense with a mouse and 44px on touch. No new tokens.
