# 0018 — Breakpoint tokens: two px values, literal in `@media`, checked by lint

## Status

Accepted

## Context

[0014](./0014-container-width-scale.md) added container widths and stopped short of breakpoints. Its site tier switches at 1024px, and that number lived only in the token's description, because a CSS custom property can't be read inside an `@media` condition. `Dialog.css` already hardcodes `@media (min-width: 768px)` and `(min-width: 1024px)`, and its padding tokens already use mobile/tablet/desktop naming (`space-dialog-padding-mobile/tablet/desktop`). `Card.css` had a third value, `@media (max-width: 1199px)`, which nothing else used.

[0015](./0015-navigation-components-core-set.md) makes this urgent. `NavigationMenu` and `SideNav` are a responsive pair: the header nav hides and the side nav moves into a `Drawer` at one switch point. That switch has to be the same number in CSS (visibility) and in JS (closing an open drawer when the viewport grows), and nothing today stops the two from drifting.

### What other systems do

Researched 2026-09-28, from each system's own docs, source or issue tracker:

- **Material 3** switches on window-width size classes (compact under 600dp, medium 600–839, expanded 840–1199, large 1200–1599, extra-large 1600+). Compact uses a modal drawer, medium a rail, expanded and up a standard drawer.
- **Carbon** collapses header links into the left panel as the header narrows, and at about 175% zoom. The hamburger only exists when a collapsible left nav exists. Its tracker has an open accessibility issue about focus when the panel opens from the hamburger.
- **shadcn/ui Sidebar** re-renders the same markup inside its Sheet below 768px. The switch is a JS hook with 768 hardcoded; users have asked for a custom breakpoint, and there was an off-by-one bug at 767/768.
- **Polaris** emits breakpoint tokens as CSS custom properties and as Sass variables for `@media`, and a stylelint rule only allows its breakpoints in media queries. Its own navigation frame still hardcodes a 1200px sidebar breakpoint behind a lint-disable, and a tracker issue records JS and CSS values copied by hand and drifting.
- **Primer** separates breakpoints from viewport ranges (narrow, regular, wide); layout and navigation switch on ranges.
- **`@custom-media`** is unsupported by default in every current browser (caniuse, 2026-09-28: Chrome 154, Edge 152, Safari 27, Firefox 156; 0% global usage). Firefox 148+ has it behind a flag. It needs PostCSS or Lightning CSS.

The pattern I took from this: a token alone doesn't stop drift (Polaris), and a hardcoded JS number doesn't either (shadcn). What stops it is one source, a lint rule that reads it, and a test that ties the JS copy to it.

## Decision

**Two tokens, in a new `breakpoint` group in `tokens/global.json`:** `breakpoint.tablet` = `768px` and `breakpoint.desktop` = `1024px`. Below 768px is "mobile", with no token. The names match Dialog's existing mobile/tablet/desktop naming.

**px, not em.** Dialog's two queries already use these values in px, so nothing moves. An em-based query would scale with the user's font-size setting, which is arguably better, but it changes when every existing query fires; that's a separate decision if it's ever wanted.

**Style Dictionary emits them like any other token:** `--breakpoint-tablet` and `--breakpoint-desktop` in the CSS output, plus `tokens.json` and the token reference. No `@custom-media`, no Sass, no build step for consumers. The CSS custom properties can't be used in `@media`, but they're still useful at runtime (`getComputedStyle`) and they make the value discoverable in the same places as every other token.

**Component CSS writes the literal value, mobile-first:** `@media (min-width: 1024px)`. `min-width` only; no `max-width` queries, so there's no 1023/1024 off-by-one to get wrong.

**A 10th `tokens:lint` rule, `no-unknown-breakpoint`,** checks every width in an `@media` condition in component CSS against the `breakpoint.*` values, read from `tokens/global.json` at lint time. A value that isn't a token fails, and so does any `max-width` query. Non-width features (`prefers-reduced-motion`, `hover`) are ignored.

**JS gets a hand-written mirror,** `lib/breakpoints.ts`: `BREAKPOINTS = { tablet: 768, desktop: 1024 } as const` and `mediaQuery(name)` returning `(min-width: <n>px)`. A `unit` test reads `tokens/global.json` and fails if the two ever disagree. Hand-written rather than generated because it's two numbers, and a generated `.ts` file would be one more artifact for `check-generated-sync.mjs` to track.

**Migration:** `Dialog.css` keeps its literals, which already match, with a comment pointing at the tokens. `Card.css`'s `max-width: 1199px` moves to the nearest token, mobile-first: the description is hidden by default and shown from `min-width: 1024px`.

**0014's site tier** switches at `breakpoint.desktop`.

## Alternatives considered

- **`@custom-media` emitted by Style Dictionary.** Rejected: no browser supports it without a flag, so every consumer would need PostCSS or Lightning CSS, and this package ships raw CSS with no build step.
- **Sass or JS constants as the only source.** Rejected: neither is readable from plain CSS, and this system's components are plain CSS. A Sass layer would be a build step for one feature.
- **Documented values only, no enforcement.** Rejected: that's the state that let Card's 1199px in, and it's what Polaris's drifting frame shows happens anyway.
- **Container queries** for the header/side-nav switch. Not used: whether the page shows a header nav or a drawer is a page-level decision about the viewport, not about the width of whatever box the nav happens to sit in. Container queries stay available for components that genuinely respond to their container.
- **em units.** Deferred, not rejected; see above.
- **A breakpoint scale with more steps** (Material's five, Primer's ranges). Rejected for now: two values cover every query in this repo today. A third goes in when a component needs one, with the lint rule picking it up automatically.

## Consequences

### Positive
- One source for the two switch points, readable by CSS authors, the linter, and the JS mirror.
- A new query with a one-off value fails `npm run validate` instead of shipping.
- The header ↔ side-nav switch in 0015's components is the same number in CSS and JS, with a test holding them together.

### Negative
- `@media` still has literal numbers in it. The lint rule makes them safe, but a reader has to know the tokens exist to see why `1024px` is fine and `1025px` isn't.
- `lib/breakpoints.ts` is a second copy of the values. The test catches drift, but only when the tests run.
- Card's description now shows between 1024px and 1199px, where it used to be hidden. Small, visible and deliberate.

## Related files

- `tokens/global.json` — the `breakpoint` group
- `lib/breakpoints.ts`, `lib/breakpoints.test.ts` — the JS mirror and its drift test
- `scripts/lint-tokens.mjs`, `scripts/lint-tokens.test.mjs` — `no-unknown-breakpoint`
- `components/composition/Dialog/Dialog.css`, `components/composition/Card/Card.css` — the existing queries
- `docs/quality.md` §2 — the lint rule table
- `specs/navigation-components-spec.md` — the components that switch on `breakpoint.desktop`
- `decisions/0014-container-width-scale.md` — the site tier this resolves
