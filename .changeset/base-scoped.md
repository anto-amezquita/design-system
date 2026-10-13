---
"@amezquita/design-system": minor
---

Add `styles/brands/base-scoped.css`: the base theme under `[data-brand="base"]`, so a part of a page that wears another brand can go back to base with `<ThemeScope brand="base">`. `ThemeScope`'s `brand` type now includes `'base'`. Tokens a brand adds that base lacks are reset inside a base part, as on a base page (ADR 0023, 2026-10-13 amendment).
