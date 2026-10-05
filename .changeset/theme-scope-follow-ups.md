---
"@amezquita/design-system": patch
---

`ThemeScope`'s `brand` type (`'portfolio'`) is now generated from the scoped brand files in `styles/brands/`, as `lib/theme-brands.ts`, so a new scoped brand appears in it on its own. Storybook's dark stories render their overlays dark too: dialogs, drawers, menus, selects and tooltips opened in a dark story used to come out light, except Menu's and SideNav's. No component, token or CSS changes.
