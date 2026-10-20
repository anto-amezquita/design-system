---
name: amezquita-design-system
description: Build UI with @amezquita/design-system — React 19 components, DTCG design tokens, and a shadcn-spec component registry. Use when writing or reviewing code that imports from `@amezquita/design-system`, references its CSS custom properties, or when a page needs a Button, Dialog, DataTable, or any of its 90 other public components.
metadata:
  author: Antonio Amezquita
  homepage: https://design.amezquita.dk
---

@amezquita/design-system is a token-first, multi-brand React component library — 93 public components across primitives, composition, and pattern tiers, DTCG design tokens resolved across every brand × light/dark, and a real npm package. Not copy-paste source: components are imported, not vendored.

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

Import the brand CSS once, in your root layout. `base` is the neutral default; for a brand (e.g. portfolio), also import `<brand>-light.css` and `<brand>-dark.css` after these. Dark mode applies inside any element with `data-mode="dark"`. To show the portfolio brand in one part of a page only, import `portfolio-scoped.css` instead of those two and wrap that part in `<ThemeScope brand="portfolio">` (composition tier). `mode="dark"` or `mode="light"` on a ThemeScope sets that part's mode, and overlays opened inside it follow both.

Next.js apps also need `transpilePackages: ['@amezquita/design-system']` in `next.config.js` — this package ships source `.tsx`/`.css`, not a pre-built bundle.

## Components

Full prop tables, real tokens, and a usage example for every component: `https://design.amezquita.dk/components/<slug>.md`. Don't guess a prop name or a token — read the twin.

### Primitives (56)

| Component | Reference |
|---|---|
| AspectRatio | [aspect-ratio](https://design.amezquita.dk/components/aspect-ratio.md) — Keeps media at a fixed width-to-height ratio as the width changes, and holds the space before it loads |
| Avatar | [avatar](https://design.amezquita.dk/components/avatar.md) — User profile picture with fallback to initials when no image is provided |
| Badge | [badge](https://design.amezquita.dk/components/badge.md) — Small status indicator or numeric count overlay attached to another element |
| Blockquote | [blockquote](https://design.amezquita.dk/components/blockquote.md) — A quotation set apart from the text around it, with who said it and where |
| Button | [button](https://design.amezquita.dk/components/button.md) — Trigger for user actions; renders as `<button>` or `<a>` depending on context |
| ButtonGroup | [button-group](https://design.amezquita.dk/components/button-group.md) — Related actions kept together: Undo / Redo, zoom out / in, Cancel / Save |
| Calendar | [calendar](https://design.amezquita.dk/components/calendar.md) — A month of days to choose one date or a range; the base for DatePicker and DateRangePicker |
| Checkbox | [checkbox](https://design.amezquita.dk/components/checkbox.md) — Single boolean selection with an associated label; supports indeterminate state |
| Citation | [citation](https://design.amezquita.dk/components/citation.md) — A small link from a claim to its source: a numbered marker or a source chip, as in AI answers and articles |
| CodeBlock | [code-block](https://design.amezquita.dk/components/code-block.md) — A block of code in the monospace face, with a filename or language, a Copy button, line numbers and highlighted lines |
| Collapsible | [collapsible](https://design.amezquita.dk/components/collapsible.md) — One section that shows and hides behind a button (the WAI-ARIA disclosure pattern) |
| Combobox | [combobox](https://design.amezquita.dk/components/combobox.md) — One value from a long list, found by typing: a country, a town, a person |
| DatePicker | [date-picker](https://design.amezquita.dk/components/date-picker.md) — A date typed or picked from a calendar: delivery dates, bookings, deadlines |
| DateRangePicker | [date-range-picker](https://design.amezquita.dk/components/date-range-picker.md) — A start and an end date: a stay, a report period, leave |
| DescriptionList | [description-list](https://design.amezquita.dk/components/description-list.md) — Labelled values, like the details panel of a file or an order: terms and their descriptions, side by side or stacked |
| Divider | [divider](https://design.amezquita.dk/components/divider.md) — A line that separates groups of content, horizontally or vertically |
| Field | [field](https://design.amezquita.dk/components/field.md) — Label, hint and error for any control, wired the way Input wires its own |
| FileUpload | [file-upload](https://design.amezquita.dk/components/file-upload.md) — Pick files by button or by dragging them in, see what's chosen, and remove any |
| Grid | [grid](https://design.amezquita.dk/components/grid.md) — Lays items out in rows and columns: fixed columns per breakpoint, or as many as fit |
| Heading | [heading](https://design.amezquita.dk/components/heading.md) — Semantic heading element (H1–H5 visual sizes, any `<h1>`–`<h6>` tag) with a visual size decoupled from its document-outline level |
| Icon | [icon](https://design.amezquita.dk/components/icon.md) — A Phosphor icon at one of the brand's icon sizes and colours, hidden from screen readers unless named |
| IconButton | [icon-button](https://design.amezquita.dk/components/icon-button.md) — An action shown only as an icon, for toolbars, cards and dense rows |
| Image | [image](https://design.amezquita.dk/components/image.md) — An image with a required `alt`, space held before it loads, a quiet fallback if it fails, and an optional caption |
| Input | [input](https://design.amezquita.dk/components/input.md) — Labelled single-line text entry with hint and error states |
| InputGroup | [input-group](https://design.amezquita.dk/components/input-group.md) — An Input joined to the text and buttons that belong to it: "https://", "kr.", an Apply button |
| Item | [item](https://design.amezquita.dk/components/item.md) — One row in a List: leading media, a title and description, trailing metadata or actions; optionally the whole row is a link |
| Kbd | [kbd](https://design.amezquita.dk/components/kbd.md) — A key the user presses, drawn as a keycap |
| Label | [label](https://design.amezquita.dk/components/label.md) — Standalone form label element — used when a label must be decoupled from its input |
| Link | [link](https://design.amezquita.dk/components/link.md) — Navigation to another page or resource; use Link for navigation and Button for actions |
| List | [list](https://design.amezquita.dk/components/list.md) — A list, announced as one: rows of Items in an interface, or bullets and numbers in running text |
| MultiSelect | [multi-select](https://design.amezquita.dk/components/multi-select.md) — Several values from a long list, found by typing: skills, reviewers, languages |
| NumberInput | [number-input](https://design.amezquita.dk/components/number-input.md) — A number typed or stepped: a quantity, an amount, a percentage |
| OtpInput | [otp-input](https://design.amezquita.dk/components/otp-input.md) — A short code sent by text or email, shown as one box per character |
| ProgressBar | [progress-bar](https://design.amezquita.dk/components/progress-bar.md) — Shows how far a task has got, or that it's running when the end isn't known |
| Radio | [radio](https://design.amezquita.dk/components/radio.md) — Single-selection control within a mutually exclusive group |
| ScrollArea | [scroll-area](https://design.amezquita.dk/components/scroll-area.md) — A box that scrolls its content, with thin scrollbars in the brand's colours, reachable and scrollable with the keyboard |
| Search | [search](https://design.amezquita.dk/components/search.md) — A site or list search: a search landmark with Enter to search, Escape to clear and an optional shortcut |
| Section | [section](https://design.amezquita.dk/components/section.md) — A band of a page: edge-to-edge background, space above and below, content centred at a set width with the page gutter |
| SegmentedControl | [segmented-control](https://design.amezquita.dk/components/segmented-control.md) — One choice from a few, shown side by side: a view switch, a time range |
| Select | [select](https://design.amezquita.dk/components/select.md) — Dropdown for choosing a single value from a list; supports grouped options |
| SelectableCard | [selectable-card](https://design.amezquita.dk/components/selectable-card.md) — Choices shown as cards: pick one (radios) or several (checkboxes), with a title, a detail and a description on each |
| Skeleton | [skeleton](https://design.amezquita.dk/components/skeleton.md) — Placeholder loading state that mirrors the geometry of the content it replaces |
| SkipLink | [skip-link](https://design.amezquita.dk/components/skip-link.md) — First Tab stop on the page that lets keyboard users jump past the header to the main content |
| Slider | [slider](https://design.amezquita.dk/components/slider.md) — One value from a range, by dragging or with the keyboard: volume, a price limit, opacity |
| Spinner | [spinner](https://design.amezquita.dk/components/spinner.md) — Indeterminate loading indicator for in-progress operations |
| Stack | [stack](https://design.amezquita.dk/components/stack.md) — Lays children out in one direction with a consistent gap from the brand's spacing roles |
| StatusDot | [status-dot](https://design.amezquita.dk/components/status-dot.md) — A small coloured dot that marks a status (online, live, degraded, failed), always with words |
| Switch | [switch](https://design.amezquita.dk/components/switch.md) — Binary toggle for on/off settings; renders as a styled checkbox under the hood |
| Tag | [tag](https://design.amezquita.dk/components/tag.md) — A short label on content: a category, a status word, a chosen value; optionally removable or clickable |
| TagInput | [tag-input](https://design.amezquita.dk/components/tag-input.md) — Free-text values as tags: keywords, email addresses, ingredients |
| Text | [text](https://design.amezquita.dk/components/text.md) — Body text in the brand's type roles (body, small, caption), with a tone and a weight |
| Textarea | [textarea](https://design.amezquita.dk/components/textarea.md) — Multi-line text entry with label, hint, and error states — mirrors Input API |
| TimePicker | [time-picker](https://design.amezquita.dk/components/time-picker.md) — One time of day: an appointment, a delivery slot, opening hours |
| Timestamp | [timestamp](https://design.amezquita.dk/components/timestamp.md) — A moment in time as people say it ("5 minutes ago", "yesterday") or as a date, in a `time` element |
| ToggleButton | [toggle-button](https://design.amezquita.dk/components/toggle-button.md) — A button that stays on or off, like bold in an editor or a grid overlay |
| VisuallyHidden | [visually-hidden](https://design.amezquita.dk/components/visually-hidden.md) — Text screen readers announce but sighted users don't see |

### Composition (15)

| Component | Reference |
|---|---|
| Alert | [alert](https://design.amezquita.dk/components/alert.md) — Contextual inline feedback message with semantic severity levels (info, success, warning, error) |
| AlertDialog | [alert-dialog](https://design.amezquita.dk/components/alert-dialog.md) — Confirmation gate for an action the user must explicitly accept or decline — real `alertdialog` role, no outside-click/close-button dismiss, unlike Dialog |
| Card | [card](https://design.amezquita.dk/components/card.md) — Compound container for grouped content — composed from named sub-components |
| CommandPalette | [command-palette](https://design.amezquita.dk/components/command-palette.md) — Every action in an app, one search away: Ctrl+K or ⌘K, a few letters, Enter |
| ContextMenu | [context-menu](https://design.amezquita.dk/components/context-menu.md) — The actions for one thing, opened where the pointer is: a file row, a card, a canvas |
| Dialog | [dialog](https://design.amezquita.dk/components/dialog.md) — Overlay for tasks or information requiring focused attention |
| Drawer | [drawer](https://design.amezquita.dk/components/drawer.md) — Side-anchored slide-in panel for supplemental content or secondary navigation |
| HoverCard | [hover-card](https://design.amezquita.dk/components/hover-card.md) — A preview of what a link leads to: a person's profile, a page's summary |
| Lightbox | [lightbox](https://design.amezquita.dk/components/lightbox.md) — Images large, one at a time, over the page: a product's photos, a portfolio piece |
| Menu | [menu](https://design.amezquita.dk/components/menu.md) — Dropdown list of actions opened from a trigger: account menus, overflow ("more") menus, row actions |
| NavigationMenu | [navigation-menu](https://design.amezquita.dk/components/navigation-menu.md) — The site's header navigation: top-level links, plus groups that open a dropdown of links. Hidden below 1024px, where SideNav's drawer carries the same links (its `headerItems`) |
| Popover | [popover](https://design.amezquita.dk/components/popover.md) — Content shown next to its trigger without blocking the page: a filter panel, a date picker, a short form |
| ThemeScope | [theme-scope](https://design.amezquita.dk/components/theme-scope.md) — Gives one part of a page its own brand, mode, or both; overlays opened inside it (Dialog, Drawer, AlertDialog, Menu, Select, Tooltip) take the same, although they render at the end of the page |
| Toast | [toast](https://design.amezquita.dk/components/toast.md) — Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout |
| Tooltip | [tooltip](https://design.amezquita.dk/components/tooltip.md) — Contextual label revealed on hover or focus — supplements an icon or truncated text |

### Patterns (22)

| Component | Reference |
|---|---|
| Accordion | [accordion](https://design.amezquita.dk/components/accordion.md) — Collapsible content sections with animated expand/collapse; supports single or multi-open modes |
| AppShell | [app-shell](https://design.amezquita.dk/components/app-shell.md) — The frame of an app's pages: skip link, header, section navigation, main content, aside, footer and bottom bar, in the right landmarks and laid out per breakpoint |
| Breadcrumb | [breadcrumb](https://design.amezquita.dk/components/breadcrumb.md) — Hierarchical page location trail; the last item is the current page (non-linked) |
| Carousel | [carousel](https://design.amezquita.dk/components/carousel.md) — A row of slides shown a few at a time, moved with buttons, dots, swipe or arrow keys |
| ChatComposer | [chat-composer](https://design.amezquita.dk/components/chat-composer.md) — Where a message is written and sent in a conversation: a field that grows with the text, Enter to send, and Stop while a reply streams |
| ChatMessage | [chat-message](https://design.amezquita.dk/components/chat-message.md) — One message in a conversation, from a person or a model: who wrote it, when, what it says, and whether it's still arriving or failed |
| DataTable | [data-table](https://design.amezquita.dk/components/data-table.md) — Sortable, filterable, paginated table for structured datasets |
| EmptyState | [empty-state](https://design.amezquita.dk/components/empty-state.md) — Placeholder for zero-content states — icon, heading, supporting text, and an optional action |
| FormLayout | [form-layout](https://design.amezquita.dk/components/form-layout.md) — The frame of a form: spacing, sections, rows, actions, and an error summary after a failed submit |
| Hero | [hero](https://design.amezquita.dk/components/hero.md) — Page-level section header with eyebrow, title, lead text, and an action slot |
| Markdown | [markdown](https://design.amezquita.dk/components/markdown.md) — Renders a Markdown string with the system's own components, so release notes, READMEs and model answers look like the rest of the product |
| MobileNav | [mobile-nav](https://design.amezquita.dk/components/mobile-nav.md) — The bar at the bottom of a small screen with an app's main places |
| Pagination | [pagination](https://design.amezquita.dk/components/pagination.md) — Page navigation controls for multi-page data sets; exposes current page and total page count |
| PromptForm | [prompt-form](https://design.amezquita.dk/components/prompt-form.md) — Questions an assistant asks before it goes on, each a set of choices with "Other" for an answer in words, sent together and kept as a summary |
| ResizablePanels | [resizable-panels](https://design.amezquita.dk/components/resizable-panels.md) — Two panes sharing the space, with a separator people drag, or move with the keyboard (the WAI-ARIA window splitter pattern) |
| SideNav | [side-nav](https://design.amezquita.dk/components/side-nav.md) — Section navigation: inline beside the content (240px wide) from 1024px up; below that, in a left Drawer opened by `SideNavTrigger`, which hides itself from 1024px up. Wrap both in `SideNavProvider` |
| Stepper | [stepper](https://design.amezquita.dk/components/stepper.md) — Where someone is in a process with a fixed order: checkout, sign-up, an application |
| Table | [table](https://design.amezquita.dk/components/table.md) — Static data table with semantic header, body, and row structure |
| TableOfContents | [table-of-contents](https://design.amezquita.dk/components/table-of-contents.md) — The sections of a long page as links, with the one being read marked: docs, articles, policies |
| Tabs | [tabs](https://design.amezquita.dk/components/tabs.md) — Segmented view switcher with full keyboard navigation; built on Radix Tabs |
| Toolbar | [toolbar](https://design.amezquita.dk/components/toolbar.md) — A row of controls for one area: the formatting buttons over an editor, the actions over a table or canvas |
| TopNav | [top-nav](https://design.amezquita.dk/components/top-nav.md) — The bar across the top of a site or app: brand, main navigation, actions |

## Tokens

Every token this system defines, resolved across all four theme axes: https://design.amezquita.dk/tokens.json. If a token isn't in that file, it doesn't exist — don't invent one, even a plausible-sounding one.

Real semantic token families:

- **color** (46): `--color-accent-*`, `--color-border-*`, `--color-curtain-*`, `--color-feedback-*`, `--color-neutral-*`, `--color-skeleton-*`, `--color-surface-*`, `--color-text-*`
- **typography** (40): `--font-family-*`, `--font-size-*`, `--font-variation-*`, `--font-weight-*`, `--letter-spacing-*`, `--line-height-*`
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
