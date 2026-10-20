---
"@amezquita/design-system": minor
---

New `Collapsible` primitive: one section that shows and hides behind a button, following the WAI-ARIA disclosure pattern (`aria-expanded`, `aria-controls`). Controlled or uncontrolled; `variant="block"` is a full-width row, `inline` is a "Show more" text button; `headingLevel` puts a block section in the page outline. Closed content is out of the tab order and the accessibility tree; the height animates without measuring and is instant for reduced motion. No new dependency.
