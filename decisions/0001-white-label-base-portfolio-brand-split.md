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

## Amendment (2026-10-01): a scoped portfolio file, so both brands fit on one page

The four files above all target `:root` or a bare `[data-mode]`, never `[data-brand]`, so a page shows one brand. `design-system-site`'s Themes page needs `base` and `portfolio` side by side, and it renders portfolio in separate iframe documents to get there (its `specs/2026-09-30-first-build.md` §9).

The decision going in was to add `[data-brand="portfolio"]` and `[data-brand="portfolio"] [data-mode="…"]` to the existing portfolio files, next to `:root`. Building it showed that changes nothing: while `:root` is in the same file, loading it restyles the whole page, so every element already inherits portfolio and the new selectors never decide anything. A page still couldn't keep base outside the panel.

**What shipped instead:** a fifth generated file, `styles/brands/portfolio-scoped.css`. It has the same overrides as `portfolio-light.css` and `portfolio-dark.css`, scoped to `[data-brand="portfolio"]` and never to `:root`. A page loads `base-light.css` and `base-dark.css` as usual, plus `portfolio-scoped.css`, and marks a panel with `data-brand="portfolio"`. The four existing files are byte-for-byte unchanged, so nothing changes for the portfolio site or anyone else. Minor release.

The panel has to follow the page's mode, its own `data-mode` and a mode switch nested inside it. Getting that right took three things:

- **A dark block, then a light block.** The light block's `[data-brand="portfolio"][data-mode="light"]` and the dark block's `[data-mode="dark"] [data-brand="portfolio"]` tie on specificity when a light panel sits in a dark page, and the panel's own mode has to win. Order settles the tie.
- **Both blocks declare every token either portfolio file does.** A light panel in a dark page still matches the dark block through its ancestor, so any token the light block left out kept its dark value. The first version had 44 such tokens; a browser test comparing every custom property caught it.
- **Dark-only tokens reset to `initial` in the light block.** `checkbox-*`, `radio-*` and `textarea-*` exist only in the dark files, so they have no light value to declare. `initial` makes them undefined, as they are on a light page.

`lib/brand-scope.test.ts` checks this in Chromium: for every custom property the brand files declare, a scoped panel computes exactly what a whole page does with the unscoped files, in each arrangement, and the page outside stays base. `scripts/portfolio-scoped.test.mjs` checks the generated selectors and that the existing files keep `:root`.

**Alternatives considered:**

- **The selectors next to `:root`, as first decided.** Rejected once built, for the reason above.
- **Scope only: drop `:root` from the portfolio files.** Cleaner, one file per mode, but every portfolio consumer would have to add `data-brand="portfolio"` to `<html>`. Breaking, so a major. Still the better long-term shape; the scoped file is what a later major could fold into the existing ones.
- **A `[data-brand="base"]` scope in the base files, so a page could switch back to base inside a portfolio page.** Rejected: it needs the same mode handling in reverse, and nobody needs base inside portfolio.

**Consequences:** five CSS files instead of four, and a rule consumers have to know: `portfolio-scoped.css` *or* `portfolio-light.css` + `portfolio-dark.css`, never both. The README says so. The scoped file covers one level of brand: a base region nested inside a portfolio panel isn't supported.
