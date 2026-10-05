# 0021 — ThemeScope: a part of a page gets its own brand and mode, and its overlays follow

## Status

Accepted

## Context

Since `1.2.0`, `portfolio-scoped.css` lets one part of a page take the portfolio brand: put `data-brand="portfolio"` on an element and its tokens resolve for the portfolio ([`0001`](0001-white-label-base-portfolio-brand-split.md), 2026-10-01 amendment). `data-mode` already did the same for light and dark.

The docs site (`design-system-site`) was the first page to use this, and found where it stops working. Its Themes page shows the same sample screen twice, the second panel marked `data-brand="portfolio"`. Opening that panel's "More" menu showed a base-styled menu. AlertDialog, BaseSheet (so Dialog and Drawer), Menu, Select and Tooltip render their content through Radix's portal at the end of `<body>`, outside the element that carries the attribute. Mode has the same problem with no brand involved: a menu opened inside a dark panel on a light page comes out light. The library's own Storybook already worked around it, with `bodyDarkModeDecorator` setting `data-mode` on `<body>` so Menu's and SideNav's dark stories render their portalled content dark.

Two things limit the fix. [`0007`](0007-universal-prop-passthrough-and-nesting-safe-z-index.md) relies on every overlay mounting at the end of `<body>`: mount order decides which one is on top, with no fixed z-index ranks. And Radix's portals decide when closed content can unmount by watching their direct child for an exit animation; Dialog, Drawer and Tooltip have one.

## Decision

**A public composition component, `ThemeScope`.** It renders a `<div>` with `data-brand` and `data-mode` when given (`brand?: 'portfolio'`, `mode?: 'light' | 'dark'`), passes native attributes through ([`0007`](0007-universal-prop-passthrough-and-nesting-safe-z-index.md)), and puts `{ brand, mode }` in a React context. A scope inside another takes what it doesn't set from the outer one.

**Overlays carry the scope's attributes on the elements they already portal.** `lib/theme-scope.tsx` has `useThemeScopeAttributes()`, which returns `data-brand` and `data-mode` from the nearest scope, or nothing outside one. The five portalling components spread it onto their portalled elements: the content, and the overlay where there is one. The brand CSS matches an element that carries the attributes itself (`[data-brand="portfolio"][data-mode="dark"]`), so the content takes the scope's tokens where it renders. The hook lives in `lib/`, not in `ThemeScope`'s folder, so the overlays importing it don't gain a registry dependency on `theme-scope.json`.

**Toast doesn't follow a scope.** Its viewport renders where `ToastProvider` sits. A toast reports on the app, not on one panel of it.

**Named `ThemeScope`, not `BrandScope`.** It scopes mode as well as brand, and a mode-only scope is a real case: the docs site's base panel in its Dark tab.

## Alternatives considered

- **Portal into the scope.** Point every overlay's Radix `Portal` at the scope element. Rejected: the content would sit inside the scope's stacking context and `overflow`, so a dialog could be clipped by its panel or drawn under the panel's neighbours. That is the layering bug [`0007`](0007-universal-prop-passthrough-and-nesting-safe-z-index.md) fixed.
- **A `container` prop on each overlay.** Same layering problem, and the fix moves to every call site: the first overlay someone opens without the prop is the bug again.
- **Wrap portalled content in `<div data-brand data-mode style="display: contents">`.** This was the spec's first plan. A `display: contents` wrapper adds no box and no stacking context, so 0007 would hold. Rejected while building: the wrapper becomes the portal's direct child, it has no animation, so Radix unmounts closed content at once and the exit animations of Dialog, Drawer and Tooltip are cut short. Dialog's portal also mounts its overlay and content as separate children, which one wrapper doesn't fit.
- **A helper in `lib/` with no component entry.** Fewer moving parts: no doc twin, no registry item, no story, counts stay at 34. Rejected: agents find components through the skill, `llms.txt` and the twins, and a helper they don't find is one they replace with a hand-written `data-brand`, which has the bug.

## Consequences

### Positive

- Overlays opened in a scoped part of a page match it, for brand and mode, with no change at the call site.
- Nothing is added to the DOM. 0007's mount-order layering and Radix's exit animations are unchanged; the existing nesting tests pass as they were.
- One way to scope, in the docs and the skill: `ThemeScope`. The attributes stay what it renders.

### Negative

- A part marked with a hand-written `data-brand` or `data-mode` still has the bug, because there is no context for its overlays to read. The README and the skill point to `ThemeScope`.
- `brand` is typed `'portfolio'`, the one scoped brand there is. A new brand with a scoped file needs the type widened by hand; it isn't generated from `tokens/brands/`.
- Every new portalling component has to spread `useThemeScopeAttributes()`. Nothing checks for it yet; a missing one shows up as an overlay in the wrong brand.
- `bodyDarkModeDecorator` in `lib/storybook.tsx` can now be replaced by wrapping those stories in `<ThemeScope mode="dark">`. Left as is in this change.

## Related files

- `components/composition/ThemeScope/` — the component, its stories and `ThemeScope.test.tsx`, which checks each overlay against the real brand CSS in Chromium
- `lib/theme-scope.tsx` — the context and `useThemeScopeAttributes()`
- `components/composition/{AlertDialog,BaseSheet,Menu,Tooltip}/`, `components/primitives/Select/` — the five that spread it
- `styles/brands/portfolio-scoped.css` — the selectors it relies on, unchanged
- `specs/2026-10-05-theme-scope.md` — item 3
- [`0001`](0001-white-label-base-portfolio-brand-split.md) (the scoped brand file), [`0007`](0007-universal-prop-passthrough-and-nesting-safe-z-index.md) (passthrough, and the layering this keeps)
