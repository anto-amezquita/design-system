---
"@amezquita/design-system": patch
---

Token clean-up, no visual change:

- **28 unused variables are gone from the dark CSS.** `base-dark.css`, `portfolio-dark.css` and `portfolio-scoped.css` declared `--checkbox-*`, `--radio-*` and `--textarea-*` colour variables that nothing reads. They were left over from an earlier clean-up that moved Checkbox, Radio and Textarea onto the shared colour tokens. They had no light value and never appeared in `tokens.json` or the token reference.
- **Four tokens now say what they're for:** `shadow-card`, `z-sticky`, `font-size-display` and `letter-spacing-body`.
- **Four tokens are deprecated** and will be removed in 2.0: `z-overlay`, `z-modal`, `opacity-overlay` and `size-dialog-default`. Nothing in the package uses them. If you do, their descriptions in `tokens.json` say what to use instead.
