# 0001 — Split token architecture into a brand-agnostic base theme and a thin portfolio skin

## Status

Accepted

## Context

`tokens/brands/portfolio/tokens.json` (~150 tokens) was wired as the site's `:root` base in `sd.config.mjs`. It wasn't a thin brand skin the way the (now-removed) `bold` brand had been — it was the entire semantic tier: color, typography, spacing, shadow, z-index, and duration. `tokens/brands/dark/tokens.json` was fully coupled to portfolio's warm/teal palette (stone-gray hex + teal accents), not brand-agnostic. This made the design system portfolio-specific in practice, not white-label, despite being positioned as a reusable system.

## Decision

Built a genuinely brand-agnostic `base` theme (own accessible neutral gray palette, light + dark, usable standalone) with `portfolio` demoted to a thin override skin (light + dark) layered on top — mirroring how `bold` used to work before it was deleted as unused. `sd.config.mjs` now outputs four CSS files: `base-light.css`, `base-dark.css`, `portfolio-light.css`, `portfolio-dark.css`, replacing the old three (`portfolio.css` / `dark.css` / `bold.css`).

## Alternatives considered

- Keep portfolio as the base and add a second full brand alongside it — rejected, doubles maintenance and still leaves no neutral/default theme for new consumers.
- Patch `dark.json` to be brand-agnostic without touching the light base — rejected, light and dark would diverge in what counts as "structural" vs "brand" tokens.

## Consequences

### Positive
- New consumers of the design system get a real neutral default instead of inheriting portfolio's brand choices.
- Brand-specific work is now isolated to override files, easier to reason about and audit.
- Verified with zero visual regressions (Chromatic Build 40, 0 changes) and a full clean `npm run validate`.

### Negative
- Four CSS output files instead of three — consumers need to know which pair (base/portfolio) to import.
- `bold` brand deleted entirely (folder, build step, references) — no longer available as a reference implementation if a third brand is needed later.

## Related files

- `sd.config.mjs`
- `tokens/brands/base/light.json`, `tokens/brands/base/dark.json`
- `tokens/brands/portfolio/tokens.json` (trimmed), `tokens/brands/portfolio/dark.json` (new)
- `tokens/token-reference.json` (638 tokens post-refactor)
