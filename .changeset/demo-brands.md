---
"@amezquita/design-system": minor
---

Three demo brands, a build for any number of brands, and Button in depth:

- **Three new brands: `demo-cool`, `demo-warm` and `demo-soft`.** Thin skins on `base`, made for the docs site's hero, where one Card switches between them. Import `<brand>-light.css` and `<brand>-dark.css` for a whole page, or `<brand>-scoped.css` with `<ThemeScope brand="demo-cool">` for part of one. Their Google Fonts links are in `tokens/fonts.json`. Why they ship in the package: ADR 0023.
- **Any folder in `tokens/brands/` is now a brand.** The build, the contrast check, the linters, the token reference and the font list find brands instead of naming `portfolio`. `base` and `portfolio` are unchanged.
- **New tokens, each with a base value that changes nothing:** `font-variation-heading` (a heading font's variable axes, applied by Heading, Hero and Dialog), `button-border-radius` (Button's shape, apart from Badge's and Tag's pill), and `color-accent-text` / `color-accent-text-hover` (the accent as text; Link now uses them).
- **Button has a pressed state**, from a new `color-accent-pressed` token, for mouse and touch. Before, `:active` only existed on touch and reused the hover colour.
- **Ghost Buttons keep a transparent border on hover.** They picked up the near-black one from the base hover rule.
- **Every Button prop is described** in its docs, and Button's docs gain a Best practices section with Do / Don't. Any component's docs can now have one, from `**Do**` / `**Don't**` blocks in `docs/components.md`.
