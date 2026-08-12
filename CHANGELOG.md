# @amezquita/design-system

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
