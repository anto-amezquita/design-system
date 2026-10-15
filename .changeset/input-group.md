---
"@amezquita/design-system": minor
---

New `InputGroup` primitive (with `InputAddon`): an Input joined to the text and buttons that belong to it, in one shape with one label. Addon text is part of the Input's description, so screen readers hear "kr." too; an error outlines the whole group. `Input` now reads a surrounding Field or InputGroup when it has no label of its own, taking its id, description, `aria-invalid`, `required` and `disabled`. Field's visible "Required" is no longer read twice. No new tokens.
