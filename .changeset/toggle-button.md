---
"@amezquita/design-system": minor
---

New `ToggleButton` primitive: a button that stays on or off, with `aria-pressed`. It's built on Button, so each brand's shape carries over: off looks like `secondary` (outline), on like `primary` (filled), and an off toggle hovers with the neutral surface so the fill only ever means "on". Controlled (`pressed`, `onPressedChange`) or uncontrolled (`defaultPressed`). `hideLabel` makes it an icon-only square via IconButton.
