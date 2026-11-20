---
'@amezquita/design-system': minor
---

A project can now keep its brand in its own repo, check it against the same rules as the brands in this package, and build its CSS. `npx amezquita-brand check <dir>` reads the brand's `tokens.json` and `dark.json` and fails on a token a brand may not set, a misspelt name (with the nearest real one), a wrong `$type`, a reference that resolves to nothing or loops back on itself, a colour that isn't hex, a light value that would leak into dark mode, and any contrast pair below its ratio, in light and dark. `--pairs <file>` adds pairs for the brand's own tokens, which are named after the brand (`ajar-signal-*`). The function underneath is `checkBrand()` from `@amezquita/design-system/brand/check.mjs`.

`npx amezquita-brand build <dir> --out <dir>` checks, then writes `<brand>-light.css`, `<brand>-dark.css`, `<brand>-scoped.css` and `<brand>-fonts.json`, built by the same code that builds this package's brands. It needs `style-dictionary` ^5 in the project, now an optional peer dependency; nothing else needs it. `ThemeScope`'s `brand` takes a project's own brand name as well as the package's.

The tokens a brand may set carry `"amezquita.brand": "settable"` in their definition. `docs/brand-contract.md`, generated from those markers, lists them with their base values, and each entry in `tokens/token-reference.json` has a new `brandSettable` field. `tokens/contrast-pairs.json` now ships with the package. Nothing changes in the package's CSS. See decisions/0028.
