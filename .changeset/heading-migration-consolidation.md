---
"@amezquita/design-system": patch
---

`CardTitle`, `Dialog`'s and `Drawer`'s title, and `EmptyState`'s title now render via the `Heading` primitive internally instead of each maintaining its own parallel heading CSS/markup — closing the gap `decisions/0008` deliberately left open as a follow-up. No public API change and no visual change: every affected title was verified byte-identical before/after (computed styles and rendered pixels), and `CardTitle`/`EmptyState`'s existing `as`/`level` props behave exactly as before.

Fixes a real bug found while migrating: `Dialog` and `Drawer`'s registry manifests (`registry/dialog.json`, `registry/drawer.json`) were missing `heading.json` as a `registryDependency`, because the manifest generator only traced a component's own direct imports and both compose `Heading` one hop away, through the internal `BaseSheet` component. A consumer installing `Dialog` or `Drawer` via the shadcn-style registry CLI would get source that imports `Heading` without ever fetching it. The generator now follows imports through internal siblings.
