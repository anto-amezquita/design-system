---
"@amezquita/design-system": minor
---

`tokens/token-reference.json` now resolves every global primitive, not
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
