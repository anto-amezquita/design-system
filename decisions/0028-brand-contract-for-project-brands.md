# 0028 — A brand contract, so a project can own its brand

## Status

Accepted (2026-11-19). The scope, where brands live and what the brand check does were decided on AME-6 and AME-5. The `build` command, the prefix rule for a project's own tokens and the contract as markers were approved on AME-6 the same day, with one change: `style-dictionary` is an optional peer dependency, not a runtime one (§4). Amends [`0001`](./0001-white-label-base-portfolio-brand-split.md) and [`0023`](./0023-demo-brands-and-n-brand-build.md).

## Context

Until now a brand has been a folder in `tokens/brands/` in this repo ([`0023`](./0023-demo-brands-and-n-brand-build.md)). That works for the docs site's demo brands. It doesn't work for products. Ajar needs its own brand, and its ADR 0031 records the gap: "The system has no way to build a brand that lives in a consumer repo." So Ajar has done what a project does without a contract. Its `src/styles/tokens.css` redefines `--color-neutral-*`, `--space-1…8` and `--duration-*`, names this system also sets on `:root`, with different values (its `--space-7` is 48px, ours is 32px). It renders correctly only because no component here happens to read those primitives. Its new `tokens/brands/ajar/tokens.json` invents its own `primitive`/`semantic`/`component` tree, which this system can't read at all.

On 2026-11-19 I decided brands live in the project that uses them, the way Tailwind works: the system owns the defaults and the conventions, the project owns its values (AME-5). `ajar` lives in the Ajar repo. `portfolio` is a project brand too and moves to the portfolio repo after this release, in its own ticket. `base` and the three demo brands stay here.

That only works if "a brand" means the same thing in every repo. Today it's whatever `sd.config.mjs` happens to accept. The one written rule is its `TOKEN_CONTRACTS.mode` prefix list, which stops a dark file from setting type or spacing. Nothing says which tokens a brand may set, so nothing stops a brand from setting `--space-7`.

What the four brands on top of base set today shows the real shape of a brand. All of it is colour, type, shape and elevation: the neutral ramp, surfaces, text, accent, borders, feedback, font families, weights and variation, heading letter-spacing, one heading size (demo-warm's `font-size-h4` with its `line-height-h4`), radius roles, `border-width-default`, card shadows. Two kinds of exception:

- **Component tokens.** `button-border-radius`, `button-outline-border-width`, `button-secondary-*` and `card-border-color`. They let a brand change one component without changing a shared role; [`0023`](./0023-demo-brands-and-n-brand-build.md) explains why `button-border-radius` exists instead of an override of `border-radius-pill`.
- **App tokens with system-style names.** `portfolio` sets `color-accent-glow`, `color-surface-spotlight`, `color-text-frozen-primary` and `color-text-frozen-secondary`. No component in this package reads them; only the portfolio site's own CSS does (`app/(cases)/scout/page.css`, `styles/case.css`). They're the portfolio's own tokens, named as if they were ours. That's the same shape as Ajar's problem, only milder.

No brand sets spacing, sizes, z-index, motion, breakpoints or body text rhythm. Those are how the system behaves, not how a brand looks.

## Decision

### 1. The contract is a marker on each token a brand may set

Every token a brand may set carries `"$extensions": { "amezquita.brand": "settable" }` where it's defined: `tokens/brands/base/light.json` for semantic tokens, `tokens/components/*.json` for component ones. `base/dark.json` only overrides those names, so it carries no markers. The key sits in the same `amezquita.*` namespace as the existing `amezquita.lint-ignore`. Anything without the marker is the system's own, and no brand sets it. `npm run tokens` generates `docs/brand-contract.md` from the markers: every settable token, its base value in light and dark, and its description. It also records the marker in `tokens/token-reference.json`, so the MCP server and the skill can answer "can my brand set this?".

The settable set, by family:

- **Colour:** every semantic `color-*` token. That covers neutral, surface, text, accent, border, curtain, feedback, chart (which [`0026`](./0026-chart-colours-and-d3-maths.md) already says a brand may override) and skeleton.
- **Type:** `font-family-*`, the `font-weight-*` roles, `font-variation-heading`, `letter-spacing-heading`, `letter-spacing-subheading`, and the static heading sizes `font-size-h1`…`h5` with their `line-height-h1`…`h5`.
- **Shape:** `border-radius-component`, `border-radius-interactive`, `border-radius-image`, `border-width-default`, `border-width-interactive`.
- **Elevation:** the `shadow-*` roles.
- **Component:** `button-border-radius`, `button-outline-border-width`, `button-secondary-*`, `card-border-color`.

Not settable: `space-*`, `size-*`, `z-*`, `duration-*`, `opacity-*`, `focus-ring-*`, breakpoints, body and control text sizes and line-heights, `border-radius-pill`, and every primitive in `tokens/global.json`. Making a token settable later is a minor release: add the marker. Taking one away breaks brands that set it, so it's a major.

### 2. A project brand is two files in the shape this repo already uses

`tokens.json` (light) and `dark.json`, with flat token names as keys and DTCG `$value`/`$type`, exactly like `tokens/brands/demo-cool/`. Values are hex, another value of the right type (`12px`, a font stack, a shadow), a reference to a semantic token (`{color-accent-default}`), or a reference to one of this package's primitives (`{color.warm-500}`). Colours stay hex for the reason [`0023`](./0023-demo-brands-and-n-brand-build.md) gives: the contrast check skips anything else.

**A project's own tokens are allowed, under its own prefix.** Ajar's door signals become `ajar-signal-*`; portfolio's four app tokens become `portfolio-*` when it moves. A prefixed token can't collide with a token this system adds later. It doesn't go through the settable check, but it can join the contrast check (§3). Anything without the prefix has to be in the contract.

### 3. What the check enforces

One command, shipped in the package and run the same way locally and in CI: `npx amezquita-brand check <dir>`. Underneath it is a function, `checkBrand(dir, options)`, for a project that wants the results as data. The command exits non-zero on any failure and the function returns the list of failures. Each error names the fix, the way `tokens:lint`'s errors do.

**Contract:**

- **Only settable tokens.** Every key is either marked settable or carries the brand's prefix. `space-7` fails. So does a typo like `color-accent-defualt`, which today silently creates a token nothing reads.
- **The right shape.** The value's `$type` matches the base token's, and a reference resolves.
- **Nothing left out:** a value set in light can't leak into dark mode. Brand files cascade after base (`base-light`, `base-dark`, `<brand>-light`, `<brand>-dark`). If a brand sets a token in light to a literal or a primitive, and base gives that token different values in light and dark, the brand has to set it in `dark.json` too. Otherwise its light value wins in dark mode. A reference like `{color-text-primary}` follows the mode by itself, so it's exempt. This is what "required" means. There's no fixed list of tokens every brand must set; what you set in light decides what you owe in dark. All four non-base brands pass it today; I checked on 2026-11-19.
- **Heading pairs stay together and on the grid.** A brand that sets `font-size-hN` also sets `line-height-hN`, and the line-height is a multiple of 4px ([`0012`](./0012-baseline-grid-vertical-rhythm.md)).
- **Dark files only set lighting.** This is `TOKEN_CONTRACTS.mode`, moved out of `sd.config.mjs` into the check, so a project brand gets it too. It gets narrower on the way: its `checkbox-`, `radio-`, `switch-` and `textarea-` prefixes go. No brand sets those tokens, and they aren't settable.

**Contrast:** the pairs in `tokens/contrast-pairs.json`, at the ratios they already carry (4.5:1 text, 3:1 non-text), resolved through base and the project brand, in light and in dark. A project adds pairs for its own tokens with `--pairs <file>`, in the same format. That's how Ajar's amber signal gets checked, as Ajar's ADR 0031 wants.

### 4. A `build` command, so a project gets the same CSS a package brand gets

`npx amezquita-brand build <dir> --out <dir>` runs `check` first, then writes `<brand>-light.css`, `<brand>-dark.css` and `<brand>-scoped.css`. "The same setup" is literal: the brand build moved out of `sd.config.mjs` into `brand/build.mjs` (`buildBrandCss()`), and `sd.config.mjs` now calls it for the brands here. A test rebuilds every brand here through it and compares the bytes with `styles/brands/`. The project loads `base-light.css` and `base-dark.css` from the package, then its own files, exactly as it would load a package brand.

If its tokens name fonts, `build` also writes `<brand>-fonts.json`, the Google Fonts link that `tokens/fonts.json` gives package brands ([`0020`](./0020-fonts-from-google-fonts-no-font-files.md)). The table of fonts and their ranges moved to `brand/fonts.mjs` for that. A font the table doesn't know fails this repo's build, as before, but only warns in a project's: a project can't add to this package's table, and it can load its own font.

`ThemeScope`'s `brand` prop took only the names of the brands in this package, so `<ThemeScope brand="ajar">` was a type error. It now takes `ThemeBrand | (string & {})`: any name, with the package's still suggested.

`style-dictionary` becomes an optional peer dependency (`peerDependenciesMeta`), and stays a dev dependency for this repo's own build. Only `build` needs it, and only a project that builds a brand installs it. `check` doesn't need it at all. `build` loads it with a dynamic `import()`, and if it isn't installed, it stops with the install command and the major it needs. GSAP is a regular dependency for the opposite reason ([`architecture.md`](../docs/architecture.md) §1): components import it, so it's always in the consumer's module graph. No component imports the brand tools; only the command runs them.

### 5. The brands here run the same check

The `tokens:contrast` step in `npm run validate` is replaced by the same check, run over every folder in `tokens/brands/`, renamed `tokens:brands` (`scripts/check-brands.mjs`; `scripts/check-contrast.mjs` is gone). That way this repo's CI is the contract's first test, against real brands. `portfolio`'s four app tokens fail the prefix rule. Until portfolio moves, they're listed as named exceptions in the check, with the ticket that removes them (AME-72). Renaming them now would break the live portfolio site in a release that's meant to be minor.

## Alternatives considered

- **A hand-written list of allowed tokens in its own file.** Easy to review in one place, but it drifts: rename a token and the list still has the old name until someone notices. A marker moves with its token, and the generated doc gives the one place to read it.
- **A fixed list of tokens every brand must set** (say, the neutral ramp and the accent). Rejected. `portfolio` doesn't set the accent in light; it gets the accent through its neutrals, because base's accent points at `color-neutral-800`. A fixed list would fail a working brand and still miss the real bug, a light value leaking into dark. The leak rule catches exactly that.
- **Project brands as plain CSS** that the check parses. Rejected: references (`{color.warm-500}`, `{color-text-primary}`) can't be resolved from CSS, and the project would have to hand-write the scoped file's selector order and `initial` resets, the part that took three separate fixes and a browser test to get right in [`0001`](./0001-white-label-base-portfolio-brand-split.md)'s amendment.
- **`check` only, no `build`.** Smaller, and it's all the ticket asked for. Rejected because Ajar would then turn its JSON into CSS with its own Style Dictionary setup. Two builds of the same tokens drift apart, and stopping that drift is the reason for the contract.
- **`style-dictionary` as a regular dependency.** `build` would work with no extra step. Rejected: every consumer would install it, and most never build a brand. The optional peer costs the projects that do one install, at a matching major, and `build` says which one.
- **Project tokens free-named, with a warning instead of an error.** Rejected: a warning is how Ajar ended up redefining `--space-7`.

## Consequences

### Positive

- Ajar, portfolio and any later project build their brand the same way, against one documented list. The check is the same one CI runs here.
- A brand can no longer shadow a system token. Ajar's spacing and duration redefinitions fail the check instead of waiting for a component to read them.
- A typo in a token name fails instead of doing nothing.
- The brands that stay here (`base` and the demos) test the contract on every push.

### Negative

- Every settable token in the source files gains an `$extensions` block. It's noise in files people read, and the generated doc is the better place to read the contract.
- A project that builds a brand installs `style-dictionary` itself, at the major `build` asks for. When this repo moves to a new major, those projects have to move too.
- `portfolio` carries named exceptions until its move ticket (AME-72) renames its four app tokens. That's a coordinated change in two repos.
- The contract is a promise now: removing a settable token, or a rule that makes a passing brand fail, is a major release.
- Moving brands out of the package means their contrast is no longer checked here. Each project has to run the check in its own CI, and nothing in this repo can make it.

## Related files

- `brand/contract.mjs` (the markers, `MODE_PREFIXES`), `brand/check.mjs` (`checkBrand()`), `brand/build.mjs` (`buildBrandCss()`, `buildBrand()`), `brand/fonts.mjs`, `brand/cli.mjs` (`amezquita-brand`), `scripts/check-brands.mjs` (replaces `scripts/check-contrast.mjs`), `scripts/build-brand-contract.mjs`, `scripts/brand-check.test.mjs`, `scripts/brand-build.test.mjs`, `components/composition/ThemeScope/ThemeScope.tsx`
- `sd.config.mjs` (its `TOKEN_CONTRACTS` list moved to `brand/contract.mjs`), `scripts/brands.mjs`, `tokens/contrast-pairs.json` (now shipped)
- `tokens/brands/base/light.json`, `tokens/components/button.json`, `tokens/components/card.json` (where the markers are)
- `docs/architecture.md` §2, §4, §6 and §9, `docs/quality.md` §2 and §3
- Ajar: `decisions/0031-design-system-1x-and-ajar-brand.md`, `src/styles/tokens.css`, `tokens/brands/ajar/tokens.json`
- Linear: AME-6 (this release), AME-5 (where brands live), AME-72 (portfolio moves out)
