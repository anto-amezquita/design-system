---
name: amezquita-design-system
description: Build UI with @amezquita/design-system — React 19 components, DTCG design tokens, and a shadcn-spec component registry. Use when writing or reviewing code that imports from `@amezquita/design-system`, references its CSS custom properties, or when a page needs a Button, Dialog, DataTable, or any of its 32 other public components.
metadata:
  author: Antonio Amezquita
  homepage: https://design.amezquita.dk
---

@amezquita/design-system is a token-first, multi-brand React component library — 35 public components across primitives, composition, and pattern tiers, DTCG design tokens resolved across base/portfolio × light/dark, and a real npm package. Not copy-paste source: components are imported, not vendored.

## Install

```bash
npm install @amezquita/design-system
```

Or install a single component via the registry:

```bash
npx shadcn add https://design.amezquita.dk/r/<component-slug>.json
```

```tsx
import { Button } from '@amezquita/design-system/components/primitives/Button'
import '@amezquita/design-system/styles/brands/base-light.css'
import '@amezquita/design-system/styles/brands/base-dark.css'
```

Import the brand CSS once, in your root layout. `base` is the neutral default; for the portfolio brand, also import `portfolio-light.css` and `portfolio-dark.css` after these. Dark mode applies inside any element with `data-mode="dark"`. To show the portfolio brand in one part of a page only, import `portfolio-scoped.css` instead of those two and wrap that part in `<ThemeScope brand="portfolio">` (composition tier). `mode="dark"` or `mode="light"` on a ThemeScope sets that part's mode, and overlays opened inside it follow both.

Next.js apps also need `transpilePackages: ['@amezquita/design-system']` in `next.config.js` — this package ships source `.tsx`/`.css`, not a pre-built bundle.

## Components

Full prop tables, real tokens, and a usage example for every component: `https://design.amezquita.dk/components/<slug>.md`. Don't guess a prop name or a token — read the twin.

### Primitives (16)

| Component | Reference |
|---|---|
| Avatar | [avatar](https://design.amezquita.dk/components/avatar.md) — User profile picture with fallback to initials when no image is provided |
| Badge | [badge](https://design.amezquita.dk/components/badge.md) — Small status indicator or numeric count overlay attached to another element |
| Button | [button](https://design.amezquita.dk/components/button.md) — Trigger for user actions; renders as `<button>` or `<a>` depending on context |
| Checkbox | [checkbox](https://design.amezquita.dk/components/checkbox.md) — Single boolean selection with an associated label; supports indeterminate state |
| Heading | [heading](https://design.amezquita.dk/components/heading.md) — Semantic heading element (H1–H5 visual sizes, any `<h1>`–`<h6>` tag) with a visual size decoupled from its document-outline level |
| Input | [input](https://design.amezquita.dk/components/input.md) — Labelled single-line text entry with hint and error states |
| Label | [label](https://design.amezquita.dk/components/label.md) — Standalone form label element — used when a label must be decoupled from its input |
| Link | [link](https://design.amezquita.dk/components/link.md) — Navigation to another page or resource; use Link for navigation and Button for actions |
| Radio | [radio](https://design.amezquita.dk/components/radio.md) — Single-selection control within a mutually exclusive group |
| Select | [select](https://design.amezquita.dk/components/select.md) — Dropdown for choosing a single value from a list; supports grouped options |
| Skeleton | [skeleton](https://design.amezquita.dk/components/skeleton.md) — Placeholder loading state that mirrors the geometry of the content it replaces |
| SkipLink | [skip-link](https://design.amezquita.dk/components/skip-link.md) — First Tab stop on the page that lets keyboard users jump past the header to the main content |
| Spinner | [spinner](https://design.amezquita.dk/components/spinner.md) — Indeterminate loading indicator for in-progress operations |
| Switch | [switch](https://design.amezquita.dk/components/switch.md) — Binary toggle for on/off settings; renders as a styled checkbox under the hood |
| Tag | [tag](https://design.amezquita.dk/components/tag.md) — Inline label for categorising or annotating content — non-interactive |
| Textarea | [textarea](https://design.amezquita.dk/components/textarea.md) — Multi-line text entry with label, hint, and error states — mirrors Input API |

### Composition (10)

| Component | Reference |
|---|---|
| Alert | [alert](https://design.amezquita.dk/components/alert.md) — Contextual inline feedback message with semantic severity levels (info, success, warning, error) |
| AlertDialog | [alert-dialog](https://design.amezquita.dk/components/alert-dialog.md) — Confirmation gate for an action the user must explicitly accept or decline — real `alertdialog` role, no outside-click/close-button dismiss, unlike Dialog |
| Card | [card](https://design.amezquita.dk/components/card.md) — Compound container for grouped content — composed from named sub-components |
| Dialog | [dialog](https://design.amezquita.dk/components/dialog.md) — Overlay for tasks or information requiring focused attention |
| Drawer | [drawer](https://design.amezquita.dk/components/drawer.md) — Side-anchored slide-in panel for supplemental content or secondary navigation |
| Menu | [menu](https://design.amezquita.dk/components/menu.md) — Dropdown list of actions opened from a trigger: account menus, overflow ("more") menus, row actions |
| NavigationMenu | [navigation-menu](https://design.amezquita.dk/components/navigation-menu.md) — The site's header navigation: top-level links, plus groups that open a dropdown of links. Hidden below 1024px, where SideNav's drawer carries the same links (its `headerItems`) |
| ThemeScope | [theme-scope](https://design.amezquita.dk/components/theme-scope.md) — Gives one part of a page its own brand, mode, or both; overlays opened inside it (Dialog, Drawer, AlertDialog, Menu, Select, Tooltip) take the same, although they render at the end of the page |
| Toast | [toast](https://design.amezquita.dk/components/toast.md) — Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout |
| Tooltip | [tooltip](https://design.amezquita.dk/components/tooltip.md) — Contextual label revealed on hover or focus — supplements an icon or truncated text |

### Patterns (9)

| Component | Reference |
|---|---|
| Accordion | [accordion](https://design.amezquita.dk/components/accordion.md) — Collapsible content sections with animated expand/collapse; supports single or multi-open modes |
| Breadcrumb | [breadcrumb](https://design.amezquita.dk/components/breadcrumb.md) — Hierarchical page location trail; the last item is the current page (non-linked) |
| DataTable | [data-table](https://design.amezquita.dk/components/data-table.md) — Sortable, filterable, paginated table for structured datasets |
| EmptyState | [empty-state](https://design.amezquita.dk/components/empty-state.md) — Placeholder for zero-content states — icon, heading, supporting text, and an optional action |
| Hero | [hero](https://design.amezquita.dk/components/hero.md) — Page-level section header with eyebrow, title, lead text, and an action slot |
| Pagination | [pagination](https://design.amezquita.dk/components/pagination.md) — Page navigation controls for multi-page data sets; exposes current page and total page count |
| SideNav | [side-nav](https://design.amezquita.dk/components/side-nav.md) — Section navigation: inline beside the content (240px wide) from 1024px up; below that, in a left Drawer opened by `SideNavTrigger`, which hides itself from 1024px up. Wrap both in `SideNavProvider` |
| Table | [table](https://design.amezquita.dk/components/table.md) — Static data table with semantic header, body, and row structure |
| Tabs | [tabs](https://design.amezquita.dk/components/tabs.md) — Segmented view switcher with full keyboard navigation; built on Radix Tabs |

## Tokens

Every token this system defines, resolved across all four theme axes: https://design.amezquita.dk/tokens.json. If a token isn't in that file, it doesn't exist — don't invent one, even a plausible-sounding one.

Real semantic token families:

- **color** (43): `--color-accent-*`, `--color-border-*`, `--color-curtain-*`, `--color-feedback-*`, `--color-neutral-*`, `--color-skeleton-*`, `--color-surface-*`, `--color-text-*`
- **typography** (39): `--font-family-*`, `--font-size-*`, `--font-weight-*`, `--letter-spacing-*`, `--line-height-*`
- **spacing** (19): `--space-compact-*`, `--space-component-*`, `--space-container-*`, `--space-control-*`, `--space-dialog-*`, `--space-element-*`, `--space-inline-*`, `--space-label-*`, `--space-layout-*`, `--space-prominent-*`, `--space-section-*`, `--space-tight-*`
- **size** (13): `--focus-ring-*`, `--size-container-*`, `--size-dialog-*`, `--size-icon-*`
- **motion** (7): `--duration-entrance-*`, `--duration-interaction-*`, `--duration-reveal-*`, `--duration-skeleton-*`, `--duration-spin-*`, `--duration-transition-*`
- **elevation** (7): `--z-dropdown-*`, `--z-modal-*`, `--z-overlay-*`, `--z-skip-*`, `--z-sticky-*`, `--z-toast-*`, `--z-tooltip-*`
- **shadow** (5): `--shadow-card-*`, `--shadow-dialog-*`, `--shadow-dropdown-*`, `--shadow-toast-*`
- **radius** (4): `--border-radius-*`
- **opacity** (2): `--opacity-disabled-*`, `--opacity-overlay-*`
- **border** (2): `--border-width-*`

Component-scoped tokens follow `--<component-slug>-*` (e.g. `--button-padding-x`) — each component's own reference page (above) lists its real ones.

Composing a page, not just a component — a wrapper's own padding/max-width/section gaps — has real tokens too, easy to miss because no single component page owns them: `--space-layout-margin`, `--space-section-gap`, `--space-component-gap`, and the max-width scale `--size-container-text` / `-media` / `-wide` / `-page` / `-site` (wrap each in `min(…, 100%)`; `--space-layout-max-width` is deprecated). Use these instead of a guessed pixel value or an invented T-shirt-sized token.

## What doesn't exist

Anything not in the Components table above or https://design.amezquita.dk/tokens.json is invented. Specifically, common near-misses that do NOT exist in this system:

- `--color-primary`, `--color-secondary`, `--color-brand` — the real accent token is `--color-accent-default`; text uses `--color-text-*`, surfaces use `--color-surface-*`
- `--color-error`, `--color-success`, `--color-warning` on their own — feedback colors are namespaced `--color-feedback-error-*` / `-success-*` / `-warning-*` / `-info-*`
- T-shirt-sized spacing tokens (`--space-sm`, `--space-md`, `--space-lg`) — this system's numeric primitives (`--space-1` … `--space-10`) sit behind named semantic tokens like `--space-tight-gap` and `--space-component-gap`, never referenced directly by component CSS
- Any component not in the tables above — a "Card Header" or "Toast Container" is only real if it matches what that component's own reference page documents (e.g. `CardHeader`, `ToastProvider`)
- `BaseSheet` as something you import — it ships in the package (Drawer's internal overlay primitive) but was never meant to be used directly

Still unsure? https://design.amezquita.dk/llms-full.txt is a single-fetch index across every public component (purpose, import path, token count, Storybook stories) — useful for a fast overview, but it does not carry prop tables or token names; for those, the component's own reference page above is the real source. If a prop's type references another local type that isn't spelled out on that page (rare, but it happens), the installed package's own `.tsx` source in `node_modules/@amezquita/design-system` is ground truth — better than guessing.
