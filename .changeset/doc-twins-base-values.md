---
"@amezquita/design-system": patch
---

The component docs (`docs/components/*.md`) now show token values from the `base` theme. Their Tokens tables were resolved from the portfolio brand, so Button's secondary colours read as the portfolio's warm gray (`#292524`) instead of base's (`#262626`). It's the same mistake 1.1.1 fixed in the registry's `cssVars`, in a second generator. Values that differ across themes keep their † and the pointer to `tokens.json` for all four. Only the docs change; no component, token or CSS does.
