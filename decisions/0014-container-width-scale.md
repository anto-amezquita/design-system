# 0014 — A container width scale for text, media, page and site

## Status

Accepted

## Context

This system had no shared answer to "how wide should this be". The primitives had `size.layout-md/lg/xl` (1024/1200/1440px) and one semantic token, `space-layout-max-width` (1200px), filed under spacing. Nothing covered reading width or media width.

The portfolio site, the main consumer, shows what happens without one: about 40 different `max-width` values (`720px` nine times, `60ch` nine times, `52ch`, `56ch`, `64ch`, `68ch`, `72ch` and so on) and 11 different breakpoints. Two tokens it uses for case-study reading and breakout widths, `--space-reading-width` and `--space-breakout-width`, were never defined anywhere, so those rules have silently computed to `max-width: none`.

The trigger was the 0.6.0 upgrade itself: `<body>` moving to 18px widened two portfolio reading columns by about 88px, because they were sized in `ch`, which follows the element's own font size.

### What other systems do

Researched before deciding (2026-09-17):

- **Content-first systems use nested breakout tiers.** WordPress block themes have `contentSize` / `wideSize` / full (Twenty Twenty-Five: 645px / 1340px). Ghost has normal / wide / full. Ryan Mulligan's layout breakouts nest content (50ch) → popout → feature → full on one CSS grid; Josh Comeau and Kevin Powell use the same named-line approach.
- **Reading width is usually in character units.** Every Layout sets `--measure: 60ch` globally, Open Props has `--size-content-1/2/3` (20/45/60ch), USWDS has measure tokens from 44 to 88ex. Apple's readable content guide is the useful exception: 672pt by default, moving between 560 and 896pt with the user's chosen text size, not with the size of any one label.
- **Product-UI systems standardise page containers and breakpoints instead:** Bootstrap (100% below 576px, then 540–1320px), Primer (544/768/1012/1280px, matching its breakpoints), Radix Themes (448/688/880/1136px), Tailwind v4 (`--container-3xs` to `7xl`, 256–1280px). Page caps cluster between 1136 and 1584px (Carbon's grid max).
- **Everyone fills the screen on mobile**, 100% minus a gutter below the first breakpoint.
- **Reading research agrees on roughly 45–80 characters**: WCAG 1.4.8 caps it at 80, Baymard recommends 50–75, Every Layout 45–75.

## Decision

Five semantic tokens, smallest to largest, each a max width meant to be used as `min(var(--token), 100%)` so it fills narrow screens:

| Token | Value | Relationship | For |
|---|---|---|---|
| `size-container-text` | 45rem (720px) | about 65 characters of `font-size-body` in Schibsted Grotesk | running text |
| `size-container-media` | 60rem (960px) | 4/3 × text | text with images, embeds, diagrams |
| `size-container-wide` | 80rem (1280px) | 4/3 × media | wide media breaking out further |
| `size-container-page` | 90rem (1440px) | page cap | a page's centred content area |
| `size-container-site` | 90vw | from 1024px up | the outer site frame |

Backed by new primitives `size.container-45/60/80/90` and `size.container-viewport-90`.

**`rem`, not `ch`.** `ch` is measured from the element's own font, so a container's width changes whenever its font size does. That is exactly what widened the portfolio's columns. `rem` still follows the user's browser font-size setting, which is the part of Apple's approach worth keeping, without moving when one element's text size changes.

**The site tier's breakpoint lives in the description, not the token.** Below 1024px the site is 100% wide with `space-layout-margin` gutters; from 1024px it's `90vw`. CSS custom properties can't be used inside `@media` conditions, so a token can't carry that switch. Breakpoint tokens are a separate follow-up (docs/backlog.md).

**`space-layout-max-width` is deprecated, not removed.** It stays at 1200px so nothing that uses it moves in this release; its description points at this scale.

**Tokens only.** No layout component yet. A grid with named lines for text/media/wide/full, as in the breakout pattern, is the natural next step once the tokens have been used for real.

## Alternatives considered

- **`ch` widths, as Every Layout and Open Props do.** Rejected for the reason above: tying width to the element's font size is what produced the 88px shift.
- **Pixel widths.** Rejected: they ignore the user's browser font-size setting, which `rem` respects.
- **Two tiers plus full width, as WordPress and Ghost do.** Rejected: the portfolio already needs a text width, a slightly wider width for media next to text, and a genuinely wide breakout, and fewer tiers would push those back into one-off values.
- **Many T-shirt sizes, as Tailwind does.** Rejected: 13 steps is a utility palette, not a layout model, and wouldn't stop the value sprawl this is meant to end.
- **Shipping a layout component in the same release.** Deferred on purpose. Tokens first, a component once real usage shows what it needs to do.

## Consequences

### Positive
- One named width for each job, with fixed 4/3 steps between the three content tiers.
- Widths stay put when an element's font size changes, and still scale with the user's font-size setting.
- The portfolio's two undefined tokens have somewhere real to point.

### Negative
- The site tier needs a media query at the call site, because of the `@media` limitation. Easy to apply inconsistently until breakpoint tokens exist.
- `space-layout-max-width` (1200px) and `size-container-page` (1440px) coexist for now, with different values.
- `min(…, 100%)` is a convention, not something the token enforces. Consumers who forget it get horizontal overflow on small screens.

## Related files

- `tokens/global.json` — `size.container-*` primitives
- `tokens/brands/base/light.json` — `size-container-*` semantic tokens, `space-layout-max-width` deprecation note
- `scripts/build-skill.mjs` — consumer skill hint pointing agents at the scale
- `docs/backlog.md` — follow-ups: breakpoint tokens, a layout component, retiring `space-layout-max-width`
