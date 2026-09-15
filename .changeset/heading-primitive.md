---
"@amezquita/design-system": minor
---

Added `Heading`, a new primitive rendering `H1`–`H6` via a `level` prop (visual size) decoupled from an `as` prop (real semantic tag, defaults to matching `level`) — so a heading's visual size and its place in the document outline can diverge deliberately (e.g. a visually small `H1` that stays a real `<h1>` for SEO/screen-reader navigation).

`H1`–`H3` use fluid, `clamp()`-based sizing (`font-size-h1-fluid`, and the previously-defined-but-unused `font-size-h2-fluid`/`font-size-h3-fluid`, now wired in for the first time). `H4`–`H6` are deliberately static: `H4` reuses the existing `font-size-h4`; `H5` and `H6` get two new static semantic tokens, `font-size-h5` (20px) and `font-size-h6` (18px). The fluid/static split follows the pattern every major production design system (IBM Carbon, Material 3, GitHub Primer, Adobe Spectrum, Shopify Polaris) already uses — fluid scaling reserved for large/prominent display text, dense UI chrome stays static — recorded in `decisions/0008-productive-expressive-typography-split.md`, along with confirmation that all four fluid tokens already meet the WCAG 1.4.4 200%-zoom-safe bar (max/min ratio ≤ 2.5×, mixed rem+vw preferred values).

`Card`, `Dialog`, `Drawer`, and `EmptyState` component titles are unchanged — their existing static sizing was already correct under this split, not something this release "fixes."

No breaking changes. No existing component's rendered output changes.
