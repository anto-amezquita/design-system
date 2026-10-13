# 0023 — Demo brands in the library, and a build for any number of brands

## Status

Accepted

## Context

The docs site's landing hero shows one real Card under a brand switch: flip it and the same components change type, colour, corners and edges (`design-system-site`, `specs/2026-10-07-site-redesign.md`, Day 3). The switch needs brands that differ enough to make the point. The two this package had don't: `portfolio` overrides only the neutral ramp, its font and one glow colour, so next to `base` it barely changes, and giving it more character would change the live portfolio site that installs it.

So the switch shows three demo brands instead, `demo-cool`, `demo-warm` and `demo-soft`, designed as far apart as the system allows: calm and precise, bold and hard-edged, gentle and rounded. Two things stood in the way. `sd.config.mjs` named `portfolio` in 56 places, and the contrast check, the architecture linter, the token reference and the font list each listed its two axes by hand, so a third brand meant copying all of it. And three of the designs needed things the tokens couldn't say: a heading font's width or softness axis, a Button shape different from Badge's pill, and a pastel accent that works as a fill but not as text.

## Decision

**The demo brands live in the library**, in `tokens/brands/demo-*/`, as thin skins on `base` like `portfolio` ([`0001`](0001-white-label-base-portfolio-brand-split.md)). The docs site applies them with `ThemeScope`, so the claim on its hero is made by the same tokens and components a consumer installs.

**Every folder in `tokens/brands/` other than `base` is a brand.** `scripts/brands.mjs` lists them, sorted, and everything that resolved `portfolio` by name now loops: `sd.config.mjs` builds `<brand>-light.css`, `<brand>-dark.css` and `<brand>-scoped.css` for each, and the contrast check, the architecture linter, the token reference and `fonts.json` cover `<brand>-light` and `<brand>-dark` for each. `ThemeScope`'s `brand` type already came from the `*-scoped.css` files ([`0021`](0021-theme-scope.md)). Adding a brand is now adding a folder. Before any brand was added, the refactor produced byte-identical CSS, types, token reference and font list.

**Three new tokens, each with a base value that changes nothing:**

- `font-variation-heading` (semantic, `normal`): applied as `font-variation-settings` by Heading, Hero's title and Dialog's title. `demo-cool` sets `'wdth' 112.5` for Archivo; `demo-soft` sets `'SOFT' 100, 'WONK' 0` for Fraunces. `scripts/build-fonts.mjs` now knows each Google font's weight range and extra axes, requests a family with axes as ranges (`Archivo:wdth,wght@62..125,400..800`), and drops weights a family isn't served in rather than breaking the link. Base's and portfolio's links didn't change.
- `button-border-radius` (component, `{border-radius-pill}`): a brand can square its Buttons without squaring Badge, Tag and Avatar, which share `border-radius-pill`.
- `color-accent-text` and `color-accent-text-hover` (semantic, `{color-accent-default}` and `{color-accent-hover}`): the accent as text and as a thin outline. Link uses them, and the `link-text`, `link-text-hover` and `accent-on-surface` contrast pairs now test them, so they check what Link renders. `demo-soft`'s pale lavender reads 8.2:1 under ink text as a fill but 1.83:1 as text on its page, so it sets a deeper lavender here.

Brand colours are written as hex: `scripts/check-contrast.mjs` skips any pair whose side isn't hex, so an `oklch()` value would never be checked.

## Alternatives considered

- **Keep the demo brands in the docs site.** The library stays lean. Rejected: the docs site's redesign spec (`design-system-site`, `specs/2026-10-07-site-redesign.md`) keeps the site free of colours, type and spacing of its own, taking them from this package's tokens like any consumer ([`0017`](0017-standalone-docs-site-base-theme.md)); and the hero's "any brand" would be proven by site CSS, not by the system it describes.
- **Give `portfolio` more character and show base, portfolio and a third brand.** Rejected: it changes the live portfolio site, and portfolio's old teal sits too close to `demo-cool`'s viridian to make the switch convincing.
- **Add each demo brand by copying portfolio's blocks in `sd.config.mjs` and the scripts.** Rejected: three more copies of the portfolio blocks, and the fifth brand would mean doing it again.
- **A darker accent for `demo-soft`.** Passes contrast without a new token, but loses the pastel button the brand is built on. `color-accent-text` is the role split many systems already make.
- **Override `border-radius-pill` for a squarer Button.** Rejected: it also reshapes Badge, Tag, Avatar, Input and Switch.

## Consequences

### Positive

- A new brand is a folder with two files; the build, the contrast check (130 pairs across 10 modes now), the linters, the token reference and the font links pick it up.
- The docs site's hero switch runs on released tokens, so it shows what a consumer gets.
- `font-variation-heading`, `button-border-radius` and `color-accent-text` are useful to any brand, not only the demos.

### Negative

- The package ships three brands no product uses: 9 CSS files a consumer only pays for if they import one, and more entries in `tokens.json`, `token-reference.json` and `fonts.json`.
- `demo-soft`'s pastel accent still fills a few things where contrast isn't checked: the selected Radio ring, the active Tabs indicator, Card's selected border. A brand built on a pastel fill would want those on `color-accent-text` too; the demo doesn't show them.
- Card has no border token of its own, so `demo-soft` can't drop the border it would rather not have; it uses a border close to its surface instead. Inputs and tables keep theirs.
- `GOOGLE_FONTS` in `scripts/build-fonts.mjs` records each font's ranges by hand. A wrong range breaks that brand's link; it was checked by opening each generated link when the brands were added.

## Related files

- `scripts/brands.mjs`, `sd.config.mjs`, `scripts/build-fonts.mjs`, `scripts/check-contrast.mjs`, `scripts/build-token-reference.mjs`, `scripts/lint-token-architecture.mjs`
- `tokens/brands/demo-cool/`, `tokens/brands/demo-warm/`, `tokens/brands/demo-soft/`
- `design-system-site`: `specs/2026-10-07-site-redesign.md` (Day 3), `specs/2026-10-12-brand-demo-warm.md`, `specs/2026-10-12-brand-demo-soft.md`
