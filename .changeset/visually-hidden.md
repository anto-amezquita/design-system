---
"@amezquita/design-system": minor
---

New `VisuallyHidden` primitive: text screen readers announce but sighted users don't see, such as the name of an icon-only button or "(opens in a new tab)". It's clipped to a 1px box rather than removed, so it stays in the accessibility tree. Renders a `span` by default, or a `div` with `as="div"`.
