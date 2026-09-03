---
name: amezquita-design-system
description: Build UI with @amezquita/design-system — React 19 components, DTCG design tokens, and a shadcn-spec component registry. Use when writing or reviewing code that imports from `@amezquita/design-system`, references its CSS custom properties, or when a page needs a Button, Dialog, DataTable, or any of its 28 other public components.
metadata:
  author: Antonio Amezquita
  homepage: https://amezquita.dk
---

@amezquita/design-system is a token-first, multi-brand React component library — 28 public components across primitives, composition, and pattern tiers, DTCG design tokens resolved across base/portfolio × light/dark, and a real npm package. Not copy-paste source: components are imported, not vendored.

## Install

```bash
npm install @amezquita/design-system
```

Or install a single component via the registry:

```bash
npx shadcn add https://amezquita.dk/r/<component-slug>.json
```

```tsx
import { Button } from '@amezquita/design-system/components/primitives/Button'
import '@amezquita/design-system/styles/brands/portfolio.css'
```

Next.js apps also need `transpilePackages: ['@amezquita/design-system']` in `next.config.js` — this package ships source `.tsx`/`.css`, not a pre-built bundle.

## Components

Full prop tables, real tokens, and a usage example for every component: `https://amezquita.dk/design-system/<slug>.md`. Don't guess a prop name or a token — read the twin.

### Primitives (13)

| Component | Reference |
|---|---|
| Avatar | [avatar](https://amezquita.dk/design-system/avatar.md) — User profile picture with fallback to initials when no image is provided |
| Badge | [badge](https://amezquita.dk/design-system/badge.md) — Small status indicator or numeric count overlay attached to another element |
| Button | [button](https://amezquita.dk/design-system/button.md) — Trigger for user actions; renders as `<button>` or `<a>` depending on context |
| Checkbox | [checkbox](https://amezquita.dk/design-system/checkbox.md) — Single boolean selection with an associated label; supports indeterminate state |
| Input | [input](https://amezquita.dk/design-system/input.md) — Labelled single-line text entry with hint and error states |
| Label | [label](https://amezquita.dk/design-system/label.md) — Standalone form label element — used when a label must be decoupled from its input |
| Radio | [radio](https://amezquita.dk/design-system/radio.md) — Single-selection control within a mutually exclusive group |
| Select | [select](https://amezquita.dk/design-system/select.md) — Dropdown for choosing a single value from a list; supports grouped options |
| Skeleton | [skeleton](https://amezquita.dk/design-system/skeleton.md) — Placeholder loading state that mirrors the geometry of the content it replaces |
| Spinner | [spinner](https://amezquita.dk/design-system/spinner.md) — Indeterminate loading indicator for in-progress operations |
| Switch | [switch](https://amezquita.dk/design-system/switch.md) — Binary toggle for on/off settings; renders as a styled checkbox under the hood |
| Tag | [tag](https://amezquita.dk/design-system/tag.md) — Inline label for categorising or annotating content — non-interactive |
| Textarea | [textarea](https://amezquita.dk/design-system/textarea.md) — Multi-line text entry with label, hint, and error states — mirrors Input API |

### Composition (7)

| Component | Reference |
|---|---|
| Alert | [alert](https://amezquita.dk/design-system/alert.md) — Contextual inline feedback message with semantic severity levels (info, success, warning, error) |
| AlertDialog | [alert-dialog](https://amezquita.dk/design-system/alert-dialog.md) — Confirmation gate for an action the user must explicitly accept or decline — real `alertdialog` role, no outside-click/close-button dismiss, unlike Dialog |
| Card | [card](https://amezquita.dk/design-system/card.md) — Compound container for grouped content — composed from named sub-components |
| Dialog | [dialog](https://amezquita.dk/design-system/dialog.md) — Overlay for tasks or information requiring focused attention |
| Drawer | [drawer](https://amezquita.dk/design-system/drawer.md) — Side-anchored slide-in panel for supplemental content or secondary navigation |
| Toast | [toast](https://amezquita.dk/design-system/toast.md) — Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout |
| Tooltip | [tooltip](https://amezquita.dk/design-system/tooltip.md) — Contextual label revealed on hover or focus — supplements an icon or truncated text |

### Patterns (8)

| Component | Reference |
|---|---|
| Accordion | [accordion](https://amezquita.dk/design-system/accordion.md) — Collapsible content sections with animated expand/collapse; supports single or multi-open modes |
| Breadcrumb | [breadcrumb](https://amezquita.dk/design-system/breadcrumb.md) — Hierarchical page location trail; the last item is the current page (non-linked) |
| DataTable | [data-table](https://amezquita.dk/design-system/data-table.md) — Sortable, filterable, paginated table for structured datasets |
| EmptyState | [empty-state](https://amezquita.dk/design-system/empty-state.md) — Placeholder for zero-content states — icon, heading, supporting text, and an optional action |
| Hero | [hero](https://amezquita.dk/design-system/hero.md) — Page-level section header with eyebrow, title, lead text, and an action slot |
| Pagination | [pagination](https://amezquita.dk/design-system/pagination.md) — Page navigation controls for multi-page data sets; exposes current page and total page count |
| Table | [table](https://amezquita.dk/design-system/table.md) — Static data table with semantic header, body, and row structure |
| Tabs | [tabs](https://amezquita.dk/design-system/tabs.md) — Segmented view switcher with full keyboard navigation; built on Radix Tabs |

## Tokens

Every token this system defines, resolved across all four theme axes: https://amezquita.dk/tokens.json. If a token isn't in that file, it doesn't exist — don't invent one, even a plausible-sounding one.

Real semantic token families:

- **color** (43): `--color-accent-*`, `--color-border-*`, `--color-curtain-*`, `--color-feedback-*`, `--color-neutral-*`, `--color-skeleton-*`, `--color-surface-*`, `--color-text-*`
- **typography** (32): `--font-family-*`, `--font-size-*`, `--font-weight-*`, `--letter-spacing-*`, `--line-height-*`
- **spacing** (16): `--space-compact-*`, `--space-component-*`, `--space-container-*`, `--space-control-*`, `--space-element-*`, `--space-inline-*`, `--space-label-*`, `--space-layout-*`, `--space-prominent-*`, `--space-section-*`, `--space-tight-*`
- **size** (8): `--focus-ring-*`, `--size-dialog-*`, `--size-icon-*`
- **motion** (7): `--duration-entrance-*`, `--duration-interaction-*`, `--duration-reveal-*`, `--duration-skeleton-*`, `--duration-spin-*`, `--duration-transition-*`
- **elevation** (6): `--z-dropdown-*`, `--z-modal-*`, `--z-overlay-*`, `--z-sticky-*`, `--z-toast-*`, `--z-tooltip-*`
- **shadow** (5): `--shadow-card-*`, `--shadow-dialog-*`, `--shadow-dropdown-*`, `--shadow-toast-*`
- **radius** (4): `--border-radius-*`
- **opacity** (2): `--opacity-disabled-*`, `--opacity-overlay-*`
- **border** (2): `--border-width-*`

Component-scoped tokens follow `--<component-slug>-*` (e.g. `--button-padding-x`) — each component's own reference page (above) lists its real ones.

Composing a page, not just a component — a wrapper's own padding/max-width/section gaps — has real tokens too, easy to miss because no single component page owns them: `--space-layout-margin`, `--space-layout-max-width`, `--space-section-gap`, `--space-component-gap`. Use these instead of a guessed pixel value or an invented T-shirt-sized token.

## What doesn't exist

Anything not in the Components table above or https://amezquita.dk/tokens.json is invented. Specifically, common near-misses that do NOT exist in this system:

- `--color-primary`, `--color-secondary`, `--color-brand` — the real accent token is `--color-accent-default`; text uses `--color-text-*`, surfaces use `--color-surface-*`
- `--color-error`, `--color-success`, `--color-warning` on their own — feedback colors are namespaced `--color-feedback-error-*` / `-success-*` / `-warning-*` / `-info-*`
- T-shirt-sized spacing tokens (`--space-sm`, `--space-md`, `--space-lg`) — this system's numeric primitives (`--space-1` … `--space-10`) sit behind named semantic tokens like `--space-tight-gap` and `--space-component-gap`, never referenced directly by component CSS
- Any component not in the tables above — a "Card Header" or "Toast Container" is only real if it matches what that component's own reference page documents (e.g. `CardHeader`, `ToastProvider`)
- `BaseSheet` as something you import — it ships in the package (Drawer's internal overlay primitive) but was never meant to be used directly

Still unsure? https://amezquita.dk/llms-full.txt is a single-fetch index across every public component (purpose, import path, token count, Storybook stories) — useful for a fast overview, but it does not carry prop tables or token names; for those, the component's own reference page above is the real source. If a prop's type references another local type that isn't spelled out on that page (rare, but it happens), the installed package's own `.tsx` source in `node_modules/@amezquita/design-system` is ground truth — better than guessing.
