---
"@amezquita/design-system": minor
---

New `Search` primitive: a `role="search"` landmark around Input's search mode. Enter searches through `onSearch` without reloading, Escape clears (a second Escape leaves the field), and an optional `shortcut` key such as "/" jumps to it from anywhere, shown as a Kbd hint and announced with `aria-keyshortcuts`. `loading` swaps the hint for a spinner and sets `aria-busy`; `showSubmit` adds a Search button. No new tokens.
