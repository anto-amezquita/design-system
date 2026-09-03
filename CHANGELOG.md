# @amezquita/design-system

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
