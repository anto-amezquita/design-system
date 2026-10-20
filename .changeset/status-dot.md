---
"@amezquita/design-system": minor
---

New `StatusDot` primitive: a small dot in a feedback role's colour (`neutral`, `info`, `success`, `warning`, `error`) that always comes with words, either shown (`children`) or read to screen readers (`label`); the types require one. `pulse` adds a slow ring for something live, off under reduced motion. Adds the `status-dot-size` and `status-dot-pulse-duration` component tokens. Known limit: in light mode, `success` and `warning` dots measure about 2.9:1 on the secondary surface.
