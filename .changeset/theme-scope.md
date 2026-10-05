---
"@amezquita/design-system": minor
---

Three additions, all non-breaking:

- **`ThemeScope`.** A new composition component that gives one part of a page its own brand, mode, or both: `<ThemeScope brand="portfolio" mode="dark">…</ThemeScope>`. Dialogs, drawers, alert dialogs, menus, selects and tooltips opened inside it now take the same brand and mode, although they render at the end of the page. Before, a menu opened in a portfolio panel came out in `base`, and one opened in a dark panel on a light page came out light. `brand` needs `portfolio-scoped.css` loaded; `mode` works on its own. A scope inside another takes what it doesn't set from the outer one. Toasts stay page-level. If you wrote `data-brand` or `data-mode` on an element yourself, that part still styles as before, but switch to `ThemeScope` for its overlays to follow. Nothing is added to the DOM, so overlay stacking and close animations are unchanged.
- **Breadcrumb takes an `aria-label`**, default `"Breadcrumb"`, so two breadcrumbs on one page can have different landmark names. It also passes native `<nav>` attributes through and forwards a ref, like the other components.
- **The agent files point at the docs site.** `llms.txt`, `llms-full.txt`, the skill and the registry now use `https://design.amezquita.dk`, with component docs at `/components/<slug>.md`. Every registry item's dependencies name the docs site, so `npx shadcn add` no longer goes through `amezquita.dk`. The old URLs still work: they redirect.
