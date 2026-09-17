# @amezquita/design-system

## 0.6.0

### Minor Changes

- 5c061df: Line-heights for static text now sit on the same 4px grid as the spacing scale (`decisions/0012`). `--line-height-body` changes from `1.5` to `28px`, and ten new semantic roles pair with the other static font sizes: `--line-height-control` (24px), `--line-height-small` (20px), `--line-height-micro` (16px), `--line-height-lead` (32px) and `--line-height-h1` through `--line-height-h6` (80/60/40/32/24/24px). `--line-height-display`, `--line-height-heading` and `--line-height-label` are unchanged, and fluid H1–H3 headings keep their unitless ratios.

  Most components move by 1–2px at most: Heading H4–H6, Dialog's title, Toast, Tooltip, form hints, table headers, Breadcrumb and DataTable text now resolve to exact grid values. 16px control text stays at 24px.

  If your own CSS relies on `--line-height-body`: it is now a fixed pixel value, so it no longer scales with the element's font size. Text inheriting it from `<body>` gets 28px whatever its size. Use the role that matches your font size instead: `--line-height-small` with `--font-size-small`, `--line-height-micro` with `--font-size-micro`, and so on. The same goes for static headings: `--font-size-h1` through `--font-size-h6` now have their own `--line-height-h1` through `--line-height-h6`. Keep `--line-height-heading` and `--line-height-display` for the fluid sizes only.

  **Removed:** the unitless `--line-height-normal` (1.5) and `--line-height-loose` (1.75) primitives. Nothing referenced them. If your own CSS does, set the value in your own CSS instead.

- cff0463: Added a `caption` role for 12px text: `--font-size-caption` (12px) and `--line-height-caption` (16px), amending `decisions/0012`. Tooltip, Input and Textarea hints, Table header/foot/caption text, Badge and Tag now use it.

  Visible change: Tooltip, form hints and Table header/foot/caption text move from a 20px to a 16px line-height (the 12/16 caption pairing), so those boxes get 4px shorter per line. Badge and Tag render the same.

  **Removed:** six component tokens that only pointed at 12px, now covered by `--font-size-caption`: `--tooltip-font-size`, `--input-hint-size`, `--textarea-hint-size`, `--table-header-font-size`, `--badge-font-size`, `--tag-font-size`. If your own CSS references one, use `--font-size-caption` instead.

- 476911f: Added a container width scale (`decisions/0014`): `--size-container-text` (45rem), `--size-container-media` (60rem), `--size-container-wide` (80rem), `--size-container-page` (90rem) and `--size-container-site` (90vw, for 1024px and up). Use each as `min(var(--size-container-*), 100%)` so it fills narrow screens.

  `--space-layout-max-width` is deprecated in favour of this scale. It keeps its 1200px value in this release.

- 797c753: Simplified the type scale (`decisions/0013`): 9 static sizes instead of 13, and H2 no longer renders smaller than H3 on small screens.

  **Removed, with replacements:**

  - `--font-size-micro`, `--line-height-micro` → `--font-size-caption`, `--line-height-caption` (10px text becomes 12px)
  - `--font-size-h6`, `--line-height-h6` → `--font-size-h5`, `--line-height-h5`, or `--font-size-body` if you need 18px
  - `--font-size-label` → `--font-size-small` (same 14px; keep `--line-height-label` for one-line labels)
  - `--font-size-lead`, `--line-height-lead` → `--font-size-h4`, `--line-height-h4` (same 24/32)

  **`Heading`:** `level` is now `1`–`5`. `level={6}` no longer type-checks; use `level={5}`, adding `as="h6"` if you need a real `<h6>`.

  **Visible changes:** `--font-size-h2-fluid` is now `clamp(1.625rem, 1rem + 2.5vw, 3rem)` (26px → 48px, was 22px → 48px), so fluid H2 is up to 4px larger below about 1280px wide and always at least as large as H3. EmptyState's compact title moves from 18/24 to 20/24.

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
