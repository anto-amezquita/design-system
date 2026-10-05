---
"@amezquita/design-system": patch
---

`npx shadcn add` works again. Since 1.1.1 the registry's theme item (`registry/theme.json`, which every component depends on) carried `null` for four tokens that only the portfolio brand defines: `color-accent-glow`, `color-surface-spotlight`, `color-text-frozen-primary` and `color-text-frozen-secondary`. shadcn rejects a `null` css variable, so installing any component from the registry failed with "Expected string, received null". Those four are now left out of the theme, the same way `base-light.css` and `base-dark.css` leave them out, and the theme's description counts the 137 tokens it carries. Only the registry changes; no component, token or CSS file does.
