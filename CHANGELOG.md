# @amezquita/design-system

## 1.3.0

### Minor Changes

- 8832d22: Three additions, all non-breaking:

  - **`ThemeScope`.** A new composition component that gives one part of a page its own brand, mode, or both: `<ThemeScope brand="portfolio" mode="dark">…</ThemeScope>`. Dialogs, drawers, alert dialogs, menus, selects and tooltips opened inside it now take the same brand and mode, although they render at the end of the page. Before, a menu opened in a portfolio panel came out in `base`, and one opened in a dark panel on a light page came out light. `brand` needs `portfolio-scoped.css` loaded; `mode` works on its own. A scope inside another takes what it doesn't set from the outer one. Toasts stay page-level. If you wrote `data-brand` or `data-mode` on an element yourself, that part still styles as before, but switch to `ThemeScope` for its overlays to follow. Nothing is added to the DOM, so overlay stacking and close animations are unchanged.
  - **Breadcrumb takes an `aria-label`**, default `"Breadcrumb"`, so two breadcrumbs on one page can have different landmark names. It also passes native `<nav>` attributes through and forwards a ref, like the other components.
  - **The agent files point at the docs site.** `llms.txt`, `llms-full.txt`, the skill and the registry now use `https://design.amezquita.dk`, with component docs at `/components/<slug>.md`. Every registry item's dependencies name the docs site, so `npx shadcn add` no longer goes through `amezquita.dk`. The old URLs still work: they redirect.

## 1.2.1

### Patch Changes

- 1bc9dbe: `npx shadcn add` works again. Since 1.1.1 the registry's theme item (`registry/theme.json`, which every component depends on) carried `null` for four tokens that only the portfolio brand defines: `color-accent-glow`, `color-surface-spotlight`, `color-text-frozen-primary` and `color-text-frozen-secondary`. shadcn rejects a `null` css variable, so installing any component from the registry failed with "Expected string, received null". Those four are now left out of the theme, the same way `base-light.css` and `base-dark.css` leave them out, and the theme's description counts the 137 tokens it carries. Only the registry changes; no component, token or CSS file does.

## 1.2.0

### Minor Changes

- 50e5dd3: Five additions found while building the docs site, all non-breaking:

  - **Both brands on one page.** New `styles/brands/portfolio-scoped.css` holds the portfolio overrides under `[data-brand="portfolio"]` instead of `:root`. Load `base-light.css` and `base-dark.css` as usual plus this file, put `data-brand="portfolio"` on a panel, and only that panel takes the portfolio brand. It follows the page's `data-mode`, or its own. Use it _instead of_ `portfolio-light.css` and `portfolio-dark.css`, not alongside them. Those two files are unchanged, so nothing changes if you already use them.
  - **Font links you can read from the package.** New `tokens/fonts.json` gives the Google Fonts stylesheet link each brand needs: JetBrains Mono for `base`, Schibsted Grotesk plus JetBrains Mono for `portfolio`, with the weights the tokens use. The package still ships no font files. `llms.txt` and the README have the same links. It's generated from the font tokens, so it changes when a font does.
  - **Token descriptions.** Every semantic and component token has a one-line `$description`, and `tokens/token-reference.json` (and `tokens.json`) now carries it as `description` on each entry, `null` where there isn't one. Before, the field never reached the reference at all.
  - **MCP tools in `llms.txt`.** `llms.txt` and `llms-full.txt` list the MCP server's tools, generated from the server itself, so the list matches what it serves.
  - **Doc twins show base values.** The Tokens tables in `docs/components/*.md` now show the `base` theme's values. They showed the portfolio brand's, so Button's secondary colours read `#292524` instead of base's `#262626`.

## 1.1.2

### Patch Changes

- 727ee4e: `Link`, `SkipLink` and `Tag` now start with `'use client'`. They use client-only React (Radix `Slot` in Link, click handlers in SkipLink and a removable Tag) without saying so, so a Next.js App Router consumer couldn't render them from a Server Component: the build failed with `createContext is not a function` or "Event handlers cannot be passed to Client Component props". The docs site hit it first and worked around it with a client re-export, which it can now delete. Nothing changes in the browser or for consumers outside the App Router.

  `npm run validate` gains `check-client-directives.mjs`, which fails any component that uses state or effect hooks, context, Radix or an inline event handler without the directive. The tests and Storybook render in a browser, where the directive does nothing, which is how these three shipped without it.

## 1.1.1

### Patch Changes

- 6b8a811: Ship the agent-facing files in the package: `tokens.json`, `skills/` (the agent skill and its `index.json`), `registry/` (the shadcn-spec registry manifests) and `docs/components/` (the per-component Markdown docs). The docs site (`design-system-site`) generates its `/.well-known/skills/`, registry and doc pages from the installed package at build time, instead of from hand-copied files. The URLs inside these files still point at amezquita.dk and move when the docs site's subdomain is live.

  Fix: the shadcn registry's `cssVars` now carry the `base` theme. They were resolved from the portfolio brand, so `npx shadcn add` installed the portfolio's colours instead of the brand-neutral default every consumer is meant to start from. Anyone who installed components through the registry and relied on those colours should import the portfolio brand CSS or set their own values. Consumers who install the npm package and import the brand CSS are unaffected.

## 1.1.0

### Minor Changes

- 55b3606: Five navigation components (`decisions/0015`) and breakpoint tokens (`decisions/0018`).

  **`Link`** (primitive): use it for navigation, and Button for actions. `variant="inline"` (underlined, for running text) or `"standalone"` (underline on hover and focus). `external` opens a new tab and says so to screen readers. `asChild` renders your router's link: `<Link asChild><NextLink href="/about">About</NextLink></Link>`.

  **`SkipLink`** (primitive): put it first in `<body>` and `id="main-content"` on your `<main>`. It shows on the first Tab and moves focus into the main content. Stacks with the new `--z-skip-link` token.

  **`Menu`** (composition): a dropdown of actions from a `trigger`, in groups, with disabled and destructive items. Opens correctly inside a Dialog or Drawer.

  **`NavigationMenu`** (composition): the header navigation, from 1024px up. Links and groups that open a dropdown of links. Takes `currentHref` for `aria-current="page"` and `LinkComponent` for your router.

  **`SideNav`** (pattern), with **`SideNavProvider`** and **`SideNavTrigger`**: section navigation inline beside the content from 1024px up, and in a left Drawer opened from `SideNavTrigger` below it. `headerItems` puts NavigationMenu's links in that drawer too, so a site with a header nav gets a mobile menu with `layout="drawer-only"`. `collapsed` turns the inline nav into an icon rail. The `NavItem` type both components take is exported from each of their folders.

  **Breakpoint tokens:** `breakpoint.tablet` (768px) and `breakpoint.desktop` (1024px), emitted as `--breakpoint-tablet` and `--breakpoint-desktop`. Custom properties can't be read in `@media`, so write the literal value, mobile-first: `@media (min-width: 1024px)`. For JS, `lib/breakpoints.ts` exports `BREAKPOINTS` and `mediaQuery('desktop')`.

  **One visible change to an existing component:** Card's description used to hide below 1200px and now hides below 1024px, the nearest breakpoint token. Between 1024px and 1199px it now shows.

  New dependencies: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-navigation-menu`, and `@radix-ui/react-slot` (already installed with the other Radix packages, now declared directly).

## 1.0.0

### Major Changes

- d30931a: Button is functional by default, and the expressive hover is opt-in (`decisions/0016`). Every Button changes on upgrade.

  **Hover:** a plain background change over a short CSS transition — the rules that previously only reached people with `prefers-reduced-motion: reduce`. The GSAP wipe and cursor-following glow are now behind `motion="expressive"`.

  **The arrow is opt-in.** `noArrow` is gone; use `arrow`:

  - `<Button noArrow>` → `<Button>`
  - `<Button>` (was getting an arrow) → `<Button arrow>`

  **To keep the previous look**, set both: `<Button motion="expressive" arrow>`. A wrapper in your own app is the tidier place for that than repeating it at every call site.

  **GSAP** now loads through a dynamic `import()` on the expressive path, so it never executes in an app that doesn't use it. It remains a regular dependency rather than an optional peer — this package ships raw source with no build step, so the import has to stay resolvable.

  **Tokens:** `--button-glow-color` is now a real component token instead of a hardcoded value in `Button.css`, so a brand can override it.

  Unchanged: `motion="expressive"` still does nothing under `prefers-reduced-motion: reduce` or on a device without hover, where it falls back to the functional hover.

  **Removed: `hooks/useButtonWipe.ts`.** Nothing in this package used it. It imported GSAP statically, so importing it pulled GSAP into your bundle whatever Button's `motion` prop said, and its default fill pointed at `--button-primary-background-hover`, a token removed in an earlier release. If you imported it directly, copy it into your own app; the expressive wipe on Button itself is unaffected.

### Patch Changes

- fb7a7eb: The package now ships its agent and reference docs alongside the code: `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CHANGELOG.md`, and the ADRs in `decisions/*.md` (`decisions/0017`). An agent working in a consumer project can read them from `node_modules/@amezquita/design-system/`, and the docs site builds its Changelog, Working with AI and Decisions pages from the published package instead of from this repo. No code or token changes.

## 0.6.0

### Minor Changes

This release reworks the type scale and adds container widths. It removes tokens, so read **Removed** before upgrading.

- 5c061df, cff0463, 797c753: **Line-heights on the 4px grid, and a simpler type scale** (`decisions/0012`, `decisions/0013`). Every static font size now has a fixed pixel line-height on the same 4px grid as the spacing scale. The static scale goes from 13 sizes to 9:

  | Role            | Size / line-height                                            |
  | --------------- | ------------------------------------------------------------- |
  | `h1`            | 64 / 80px                                                     |
  | `h2`            | 48 / 60px                                                     |
  | `h3`            | 32 / 40px                                                     |
  | `h4`            | 24 / 32px                                                     |
  | `h5`            | 20 / 24px                                                     |
  | `body`          | 18 / 28px                                                     |
  | `control`       | 16 / 24px                                                     |
  | `small`         | 14 / 20px (form labels: 14 / 16px with `--line-height-label`) |
  | `caption` (new) | 12 / 16px                                                     |

  Fluid `display` and `h1`–`h3` keep their unitless ratios (`--line-height-display`, `--line-height-heading`).

  **`--line-height-body` is now a fixed `28px`, not `1.5`.** It no longer scales with the element's font size: text inheriting it from `<body>` gets 28px whatever its size. Pair each font size with its own line-height role instead (`--font-size-small` with `--line-height-small`, and so on).

  **Removed, with replacements:**

  - `--font-size-micro` → `--font-size-caption` (10px text becomes 12px)
  - `--font-size-h6` → `--font-size-h5` / `--line-height-h5`, or `--font-size-body` if you need 18px
  - `--font-size-label` → `--font-size-small` (same 14px; keep `--line-height-label` for one-line labels)
  - `--font-size-lead` → `--font-size-h4` / `--line-height-h4` (same 24 / 32px)
  - `--tooltip-font-size`, `--input-hint-size`, `--textarea-hint-size`, `--table-header-font-size`, `--badge-font-size`, `--tag-font-size` → `--font-size-caption`
  - `--line-height-normal` (1.5) and `--line-height-loose` (1.75) primitives, and the `font-size.2xs` (10px) primitive: set the value in your own CSS if you used them

  **`Heading`:** `level` is now `1`–`5`. `level={6}` no longer type-checks; use `level={5}`, adding `as="h6"` if you need a real `<h6>`.

  **Visible changes:**

  - Tooltip, Input and Textarea hints, and Table header/foot/caption text: line-height 20px → 16px.
  - `--font-size-h2-fluid` is now `clamp(1.625rem, 1rem + 2.5vw, 3rem)` (26px → 48px, was 22px → 48px). Fluid H2 is up to 4px larger below about 1280px wide, and never smaller than H3 (before, it was smaller at every width under 800px).
  - EmptyState's compact title: 18 / 24px → 20 / 24px.
  - Dialog's title resolves to `--font-size-h4` / `--line-height-h4` directly; the `.heading.dialog__title` override is gone. Same size as before.
  - Most other static text moves by 1–2px of line-height.

- 476911f: **Container width scale** (`decisions/0014`): `--size-container-text` (45rem), `--size-container-media` (60rem), `--size-container-wide` (80rem), `--size-container-page` (90rem) and `--size-container-site` (90vw, applied from 1024px up; below that the site is 100% wide with `--space-layout-margin` gutters). Use them directly as `max-width`; as a `width` or grid track, wrap them in `min(var(--size-container-*), 100%)` so they fill narrow screens.

  `--space-layout-max-width` is deprecated in favour of this scale. It keeps its 1200px value in this release.

## 0.5.0

### Minor Changes

- 868e727: Added `Heading`, a new primitive rendering `H1`–`H6` via a `level` prop (visual size) decoupled from an `as` prop (real semantic tag, defaults to matching `level`) — so a heading's visual size and its place in the document outline can diverge deliberately (e.g. a visually small `H1` that stays a real `<h1>` for SEO/screen-reader navigation).

  `H1`–`H3` use fluid, `clamp()`-based sizing (`font-size-h1-fluid`, and the previously-defined-but-unused `font-size-h2-fluid`/`font-size-h3-fluid`, now wired in for the first time). `H4`–`H6` are deliberately static: `H4` reuses the existing `font-size-h4`; `H5` and `H6` get two new static semantic tokens, `font-size-h5` (20px) and `font-size-h6` (18px). The fluid/static split follows the pattern every major production design system (IBM Carbon, Material 3, GitHub Primer, Adobe Spectrum, Shopify Polaris) already uses — fluid scaling reserved for large/prominent display text, dense UI chrome stays static — recorded in `decisions/0008-productive-expressive-typography-split.md`, along with confirmation that all four fluid tokens already meet the WCAG 1.4.4 200%-zoom-safe bar (max/min ratio ≤ 2.5×, mixed rem+vw preferred values).

  `Card`, `Dialog`, `Drawer`, and `EmptyState` component titles keep their existing static sizing under this split — that was already correct, not something this release "fixes." (Their internal implementation was later migrated onto this primitive; see the separate changeset for that.)

  No breaking changes. No existing component's rendered output changes.

### Patch Changes

- 582aded: `CardTitle`, `Dialog`'s and `Drawer`'s title, and `EmptyState`'s title now render via the `Heading` primitive internally instead of each maintaining its own parallel heading CSS/markup — closing the gap `decisions/0008` deliberately left open as a follow-up. No public API change and no visual change: every affected title was verified byte-identical before/after (computed styles and rendered pixels), and `CardTitle`/`EmptyState`'s existing `as`/`level` props behave exactly as before.

  Fixes a real bug found while migrating: `Dialog` and `Drawer`'s registry manifests (`registry/dialog.json`, `registry/drawer.json`) were missing `heading.json` as a `registryDependency`, because the manifest generator only traced a component's own direct imports and both compose `Heading` one hop away, through the internal `BaseSheet` component. A consumer installing `Dialog` or `Drawer` via the shadcn-style registry CLI would get source that imports `Heading` without ever fetching it. The generator now follows imports through internal siblings.

## 0.4.0

### Minor Changes

- 8d733cd: Expanded the primitive `space` scale from 10 to 13 steps (4/8/12/16/20/24/28/32/40/48/64/96/128, `space.1`–`space.13`), filling gaps the old scale had past 16px (no 20px, no 28px step). Every existing token reference was repointed to the new step holding the same pixel value — this is non-breaking, no resolved value changes for existing usages.

  Added three new semantic tokens — `space-dialog-padding-mobile`, `space-dialog-padding-tablet`, `space-dialog-padding-desktop` (16px/24px/32px) — and made `Dialog`'s content padding responsive via a real `@media` query (768px/1024px breakpoints) switching between them, replacing the previous single static padding value.

## 0.3.2

### Patch Changes

- 8d3b110: Every primitive now forwards a ref, spreads unrecognised props onto its rendered element, and merges a consumer's `className` instead of discarding it. Fixes `Select`'s dropdown rendering behind its own containing `Dialog`.

  - **Button**, **Textarea**, **Badge**, **Checkbox**, **Input** all extend the real native element's (or, for `Checkbox`, the real Radix primitive's) own props type and spread `...rest` onto the rendered element — `onKeyDown`, `onBlur`, arbitrary `data-*`/`aria-*` attributes, and third-party libraries that spread their own props onto a rendered node (e.g. `@dnd-kit/sortable`'s `attributes`/`listeners`) now all reach the real DOM node. Previously only `Button` had this (`decisions/0006`); this extends the same pattern to every other primitive with a single rendered element.
  - **`className` is now merged, not silently overwritten**, on all five of the above — including `Button`, which `decisions/0006`'s fix didn't close: it spread `...rest` (which carries `className`) but then wrote its own computed `className` after it, unconditionally overwriting whatever a consumer passed.
  - **`Button` now forwards Radix's `asChild`-injected ARIA contract _and_ an external `className`** — both needed for `Button`/`Badge` to work correctly as a `Dialog`/`AlertDialog` trigger with consumer-supplied styling.
  - **`Select`'s dropdown no longer renders behind a `Dialog` it's nested inside**, and **`Drawer`'s content/overlay no longer outrank `Dialog`/`AlertDialog`.** `Select.css`, `Dialog.css`, and `Drawer.css` no longer set an explicit `z-index` on their overlay/content — all now layer by DOM mount order instead of a fixed `dropdown < overlay < modal` rank, the same fix Radix's own maintainers shipped for the identical bug. `--z-dropdown`, `--z-overlay`, and `--z-modal` are now unreferenced (not removed from the token files in this release).
  - **`AlertDialog`'s `cancel`/`action` slots can now safely use `Button`** instead of a plain `<button>` — the guidance recommending a raw element there is retired; `Button`'s own `asChild`-composition contract test (`Button.slot.test.tsx`) now covers this.
  - **`Badge`, `Checkbox`, `Textarea`, and `Input` each explicitly reject one or two props they can't actually support**, caught by review rather than shipped silently broken: `Badge` no longer accepts `role` (it always computes its own — a deliberate a11y decision, not a passthrough gap); `Checkbox` no longer accepts `children`/`asChild` (its check/indeterminate icon is fixed markup); `Textarea`/`Input` no longer accept `children` (both are controlled via `value`, and `<input>` is a void element besides — passing `children` to either was always going to misbehave, this just makes the type say so instead of admitting it silently).

  No breaking changes for any real existing usage — the three components above were never designed to accept `role`/`children`/`asChild` in the first place; nothing that worked before stops working. No component removed or renamed.

## 0.3.1

### Patch Changes

- 5db3e32: Fix Button not forwarding a ref, fix a dark-mode-only textarea border mismatch, and correct 17 component tokens with an inaccurate `$type`.

  - **Button** now forwards a ref via `React.forwardRef` to its underlying `<button>` or `<a>` element — needed for anything Radix clones a ref onto via `asChild` (e.g. AlertDialog's `triggerRef` restoring focus to a Button trigger).
  - **Textarea** border color in dark mode (`base` brand) was overridden to a different neutral-scale step than `color-border-default`, causing it to render a visibly different border from every other control in dark mode only. Removed the stray override so it inherits like `input-border` already does.
  - Collapsed 90 component-token chain-skips into 9 new semantic roles (`space-control-padding-*`, `space-prominent-padding-*`, `space-compact-padding-*`, `space-container-padding*`, `font-weight-control`) and adopted 2 existing-but-unused roles (`border-radius-pill`, `border-radius-interactive`) more broadly — reduces the token architecture's chain-skip count from 164 to 74 with zero visual regressions.
  - Fixed `font-weight-label` role, which was set to `font-weight.semibold` but every label component actually used `font-weight.medium` — the role existed but was unused and wrong.
  - Fixed `tabs-indicator-height`, which was typed `"color"` but held a dimension value.
  - Corrected 17 tokens across `avatar`, `spinner`, `skeleton`, `dialog`, `drawer`, `toast`, `tooltip`, and `accordion` from `$type: "other"` to their accurate DTCG type (`dimension`, `color`, `number`, or `duration`) — matters beyond metadata correctness since `sd.config.mjs`'s `size/rem` transform filters on `$type`.

  No breaking changes. No component API changes besides the additive Button ref. `npm run validate` and `tokens:audit` green throughout — chain-skip 164 → 74, zero regressions.

## 0.3.0

### Minor Changes

- Add `AlertDialog` — a confirmation gate for actions the user must explicitly accept or decline, distinct from `Dialog`: real `alertdialog` role, no outside-click dismiss, no free-floating close button, forces a Cancel/Action choice. Built on `@radix-ui/react-alert-dialog` (new dependency); reuses `Dialog`'s own CSS classes and tokens rather than duplicating them, since visually it's the same box with a different behavioral contract underneath.

  Also extends `Dialog` with an optional `triggerRef` prop, merged with its existing internal one — lets a consumer keep a handle on the trigger element to restore focus there manually after a separate follow-up `AlertDialog` closes (a cross-dialog focus-restore case `Dialog`'s own internal focus-restore hook doesn't cover, since it only knows about itself). Non-breaking addition.

## 0.2.0

### Minor Changes

- 3216252: `tokens/token-reference.json` now resolves every global primitive, not
  just the `color.*` group — 83 previously-invisible primitives
  (spacing, type scale, radii, motion, shadows, sizes, `feedback.*`
  colours) are now included. Total goes from 537 to 620 tokens (101
  primitive, 114 semantic, 405 component).

  **Breaking, within this field:** `meta.tokenCount` is renamed to
  `meta.total`, and now sits alongside `meta.primitiveCount`,
  `meta.semanticCount`, and `meta.componentCount`. Any consumer reading
  `tokenReference.meta.tokenCount` directly needs to switch to
  `meta.total`.

  `tokens/component-registry.json` gains an `internal` flag per
  component (set on components that ship in the package because
  something else imports them, but aren't meant to be used directly —
  currently just `BaseSheet`) and a `meta.publicComponentCount` field
  alongside the existing `meta.componentCount`.

  No changes to component source, styles, or hooks — this release only
  touches the two generated token/registry JSON files.

## 0.1.4

### Patch Changes

- 531f6bd: Ship the token artifacts with the package.

  `tokens/` is now included in `files`, so consumers and coding agents get the DTCG token source (`$value` / `$type`), the resolved token reference, and the component registry on install — previously these existed only in the repo and reached nobody who installed the package.

  First step of the AI-readiness roadmap (`docs/ai-readiness-plan.md`, Task 1.0).

## 0.1.3

### Patch Changes

- 82a353c: fix: convert remaining internal @/ imports to relative paths

## 0.1.2

### Patch Changes

- 475e59a: fix: resolve internal @/ imports to relative paths in Button, EmptyState

## 0.1.1

### Patch Changes

- 1e89f3e: Verify npm trusted publishing pipeline end-to-end
