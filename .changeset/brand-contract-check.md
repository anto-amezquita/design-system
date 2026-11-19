---
'@amezquita/design-system': minor
---

A project can now keep its brand in its own repo and check it against the same rules as the brands in this package. `npx amezquita-brand check <dir>` reads the brand's `tokens.json` and `dark.json` and fails on a token a brand may not set, a misspelt name (with the nearest real one), a wrong `$type`, a reference that resolves to nothing, a light value that would leak into dark mode, and any contrast pair below its ratio, in light and dark. `--pairs <file>` adds pairs for the brand's own tokens, which are named after the brand (`ajar-signal-*`). The function underneath is `checkBrand()` from `@amezquita/design-system/brand/check.mjs`.

The tokens a brand may set carry `"amezquita.brand": "settable"` in their definition. `docs/brand-contract.md`, generated from those markers, lists them with their base values, and each entry in `tokens/token-reference.json` has a new `brandSettable` field. `tokens/contrast-pairs.json` now ships with the package. Nothing changes in the CSS. See decisions/0028.
