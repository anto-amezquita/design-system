# components.md

## Purpose

This file is the per-component registry for this design system. Every component (primitives, composition, patterns) must have an entry here before it ships.

---

## Component template

Copy this for each new component. Fill in every field before the component ships.

```markdown
### [ComponentName]

| Field | Value |
|---|---|
| **Purpose** | What problem this component solves — one sentence |
| **Figma name** | Exact name in the Figma component library |
| **Code name** | `ComponentName` |
| **Storybook path** | `Components/ComponentName` |

**Props / variants**
- List each prop-driven variant or notable prop

**Required states**
- [ ] default
- [ ] hover
- [ ] focus (visible ring)
- [ ] active / pressed
- [ ] disabled
- [ ] loading (if applicable)
- [ ] error (if applicable)

**Tokens consumed**
- `--component-property-variant-state`

**Accessibility**
- Semantic element: `<button>`, `<a>`, `<input>`, etc.
- ARIA requirements: list any required attributes
- Keyboard: describe expected keyboard interactions
- Focus: focus ring must use `--color-border-focus`

**Chromatic stories**
- List which Storybook story exports must have Chromatic snapshots
```

---

## Components

### Button

| Field | Value |
|---|---|
| **Purpose** | Trigger for user actions; renders as `<button>` or `<a>` depending on context |
| **Figma name** | `Button` |
| **Code name** | `Button` |
| **Storybook path** | `Components/Button` |

**Props / variants**
- `variant`: `primary` (teal fill, high emphasis), `secondary` (teal border + teal text, fills on hover), `ghost` (text-only, no border)
- `href`: when present, renders as `<a>` instead of `<button>`
- `onNavigate`: optional `(href, curtainColor?) => void` — called instead of a plain navigation on internal-link clicks when set; lets a host app inject its own route-transition behavior. Omit for a plain navigation.
- `icon` + `iconPosition` (`start` | `end`): optional leading or trailing icon slot
- `noArrow`: suppresses the default trailing arrow SVG on non-icon buttons
- `disabled`, `type`, `aria-label`

**Required states**
- [x] default
- [x] hover (background shifts; arrow translates 2px right)
- [x] focus-visible (2px ring)
- [x] disabled (opacity, not-allowed cursor)

**Tokens consumed**
- `--button-padding-x`, `--button-padding-y`
- `--button-font-size`, `--button-font-weight`
- `--button-border-radius`, `--button-border-width`, `--button-duration`
- `--button-primary-background`, `--button-primary-foreground`, `--button-primary-border`, `--button-primary-background-hover`
- `--button-secondary-background`, `--button-secondary-foreground`, `--button-secondary-border`, `--button-secondary-background-hover`, `--button-secondary-foreground-hover`
- `--button-ghost-background`, `--button-ghost-foreground`, `--button-ghost-border`, `--button-ghost-background-hover`
- `--color-border-focus`, `--font-family-base`, `--easing-default`, `--space-inline-gap`, `--opacity-disabled`

**Accessibility**
- Semantic element: `<button>` by default; `<a>` when `href` is passed
- When rendered as `<a>`: no `disabled` attribute — use visual suppression only if truly needed
- ARIA: use `aria-label` for icon-only buttons; `disabled` on `<button>` removes it from tab order
- Keyboard: `Enter` + `Space` activate `<button>`; `Enter` follows `<a>`

**Chromatic stories**
- `Primary`, `Secondary`, `Ghost`, `Disabled`, `AllVariants`

---

### Card

| Field | Value |
|---|---|
| **Purpose** | Compound container for grouped content — composed from named sub-components |
| **Figma name** | `Card` |
| **Code name** | `Card` (+ `CardMedia`, `CardHeader`, `CardBody`, `CardFooter`, `CardTitle`, `CardDescription`) |
| **Storybook path** | `Components/Card` |

**Compound structure**
```tsx
<Card variant="default | ghost">
  <CardMedia>          {/* full-bleed image or media, no padding */}
  <CardHeader>         {/* padding top + sides; stacks title + description with gap */}
    <CardTitle as="h3">{/* heading element, polymorphic via `as` prop */}
    <CardDescription>  {/* supporting paragraph */}
  <CardBody>           {/* padding top + sides; flex: 1 — fills remaining height */}
  <CardFooter>         {/* padding bottom + sides; flex row, left-aligned actions */}
</Card>
```
Sub-components render `<div>` except `CardTitle` (polymorphic heading) and `CardDescription` (`<p>`).

**Props / variants**
- `variant`: `default` (bordered, primary background), `ghost` (no border, secondary background)
- `CardTitle` — `as` prop: `h1`–`h6`, defaults to `h3`

**Required states**
- [x] default
- [x] ghost variant

**Tokens consumed**
- `--card-background`, `--card-background-ghost`
- `--card-border`, `--card-border-width`, `--card-border-radius`
- `--card-padding`, `--card-gap`
- `--card-title-size`, `--card-title-weight`
- `--card-description-size`, `--card-description-color`
- `--font-family-heading`, `--line-height-heading`, `--line-height-body`
- `--letter-spacing-heading`, `--color-text-primary`, `--space-inline-gap`

**Accessibility**
- Card root is a `<div>` — apply `<article>` at the page level when card content is standalone
- No interactive wrapper on the card itself; interactive elements live in `CardFooter`
- `CardTitle` heading level must be correct for document outline — use the `as` prop

**Chromatic stories**
- `Default`, `Ghost`, `WithBody`, `WithMedia`, `AllVariants`

---

### Input

| Field | Value |
|---|---|
| **Purpose** | Labelled single-line text entry with hint and error states |
| **Figma name** | `Input` |
| **Code name** | `Input` |
| **Storybook path** | `Components/Input` |

**BEM block:** `input-field` (not `input`)

**Props / variants**
- `type`: `text` (default), `email`, `password`, `url`, `search`, `tel`
- `label`: renders `<label>` linked by auto-generated id; omit only when `aria-label` is provided instead
- `hint`: helper text below the input — neutral colour
- `error`: error message below the input — overrides `hint` text and turns hint red; sets `aria-invalid`
- `disabled`

**Required states**
- [x] default (empty, with label)
- [x] with hint text
- [x] error (border + hint colour change)
- [x] disabled
- [x] no label / `aria-label` only

**Tokens consumed**
- `--input-background`, `--input-background-disabled`, `--input-foreground`
- `--input-border`, `--input-border-width`, `--input-border-hover`, `--input-border-focus`, `--input-border-error`
- `--input-border-radius`, `--input-padding-x`, `--input-padding-y`, `--input-font-size`
- `--input-placeholder-color`
- `--input-label-size`, `--input-label-weight`, `--input-label-color`
- `--input-hint-size`, `--input-hint-color`, `--input-error-color`
- `--font-family-base`, `--duration-interaction`, `--easing-default`
- `--space-inline-gap`, `--opacity-disabled`

**Accessibility**
- `<label>` is auto-linked via `useId()` — never use placeholder as the only label
- When no `label` prop: `aria-label` must be passed instead
- `aria-invalid="true"` set automatically when `error` prop is present
- `aria-describedby` links the input to the hint/error element by id
- Focus: outline uses `--input-border-focus` (maps to `--color-border-focus`); error state uses `--input-border-error` instead
- `'use client'` — uses `useId()`, cannot render as a server component

**Chromatic stories**
- `Default`, `WithHint`, `WithError`, `Disabled`, `NoLabel`, `AllStates`

---

### Dialog

| Field | Value |
|---|---|
| **Purpose** | Overlay for tasks or information requiring focused attention |
| **Figma name** | `Dialog` |
| **Code name** | `Dialog` |
| **Storybook path** | `Components/Dialog` |

**Props / variants**
- No size variants — one max-width controlled by `--dialog-max-width` (resolves to `--size-dialog-default`, 560px)
- `trigger`: any React node — wrapped in `RadixDialog.Trigger asChild`
- `title` (required), `description` (optional), `footer` (optional slot for action buttons)
- `open` + `onOpenChange` for controlled mode

**Required states**
- [x] open (enter animation)
- [x] close dismiss button focused
- [x] with form content
- [x] without description

**Tokens consumed**
- `--dialog-background`, `--dialog-border`, `--dialog-border-width`, `--dialog-border-radius`
- `--dialog-padding`, `--dialog-gap`, `--dialog-max-width`
- `--dialog-overlay-color`
- `--dialog-title-size`, `--dialog-title-weight`
- `--dialog-close-size`, `--dialog-close-color`, `--dialog-close-hover`
- `--font-family-base`, `--font-family-heading`, `--color-text-primary`, `--color-text-secondary`
- `--line-height-heading`, `--line-height-body`, `--letter-spacing-heading`
- `--border-radius-interactive`, `--space-component-gap`, `--space-element-gap`, `--space-inline-gap`
- `--duration-interaction`, `--duration-transition`, `--easing-default`, `--easing-out`
- `--color-border-focus`

**Accessibility**
- Built on `@radix-ui/react-dialog` — do not replace the Radix primitive
- Focus trap: Radix handles this; do not disable it
- `Escape` closes the dialog; do not override
- `RadixDialog.Title` provides the accessible name automatically — always pass `title` prop
- Return focus to the trigger element on close (Radix default behaviour)

**Chromatic stories**
- `Default`, `WithForm`, `NoDescription`

---

### Select

| Field | Value |
|---|---|
| **Purpose** | Dropdown for choosing a single value from a list; supports grouped options |
| **Figma name** | `Select` |
| **Code name** | `Select` |
| **Storybook path** | `Components/Select` |

Built on `@radix-ui/react-select`. Do not replace the Radix primitive.

**Props**
- `groups` (required): `SelectGroup[]` — each group has an optional `label` and a required `options` array; groups are separated by a divider
- `value` + `defaultValue` + `onValueChange`: controlled and uncontrolled modes
- `placeholder`: string shown when no value is selected; defaults to `'Select…'`
- `disabled`: disables the trigger
- `aria-label`: required when no visible label is present in the surrounding context

**Required states**
- [x] default (placeholder visible)
- [x] with a pre-selected value (`WithDefaultValue`)
- [x] grouped options with section labels (`Grouped`)
- [x] disabled

**Tokens consumed**
- `--select-background`, `--select-foreground`, `--select-border`, `--select-border-width`, `--select-border-hover`, `--select-border-focus`
- `--select-border-radius`, `--select-content-border-radius`, `--select-content-shadow`
- `--select-padding-x`, `--select-padding-y`, `--select-font-size`
- `--select-placeholder-color`
- `--select-background-item-hover`
- `--select-item-padding-x`, `--select-item-padding-y`
- `--select-label-size`, `--select-label-weight`
- `--select-separator-color`, `--select-separator-height`

**Accessibility**
- Trigger is a `<button>` via Radix — do not wrap it in another button
- `aria-label` is a required prop — the trigger is a `combobox`, which gets no accessible name from its content, so an unnamed control is unshippable by type
- Keyboard: `Space` / `Enter` / `ArrowDown` opens; arrow keys navigate; `Enter` selects; `Escape` closes
- Focus returns to trigger on close (Radix default)

**Chromatic stories**
- `Default`, `WithDefaultValue`, `Grouped`, `Disabled`

---

### Tag

| Field | Value |
|---|---|
| **Purpose** | Inline label for categorising or annotating content — non-interactive |
| **Figma name** | `Tag` |
| **Code name** | `Tag` |
| **Storybook path** | `Components/Tag` |

**Props / variants**
- `variant`: `default` (secondary background, bordered), `accent` (teal fill), `muted` (transparent, muted text)

**Required states**
- [x] default
- [x] accent
- [x] muted

**Tokens consumed**
- `--tag-background`, `--tag-foreground`, `--tag-border`, `--tag-border-width`
- `--tag-border-radius`, `--tag-padding-x`, `--tag-padding-y`
- `--tag-font-size`, `--tag-font-weight`
- `--tag-accent-background`, `--tag-accent-foreground`, `--tag-accent-border`
- `--tag-muted-background`, `--tag-muted-foreground`, `--tag-muted-border`

**Accessibility**
- Renders `<span>` — purely presentational; no ARIA requirements
- Never use Tag as an interactive element; wrap in `<button>` or `<a>` if the tag must be clickable

**Chromatic stories**
- `Default`, `Accent`, `Muted`, `AllVariants`, `InContext`

---

### Hero

| Field | Value |
|---|---|
| **Purpose** | Page-level section header with eyebrow, title, lead text, and an action slot |
| **Figma name** | `Hero` |
| **Code name** | `Hero` |
| **Storybook path** | `Components/Hero` |

**Props / variants**
- `title` (required): the primary heading
- `titleAs`: `h1` (default) or `h2` — must match the document outline; use `h1` on standalone pages, `h2` within a page that already has an `h1`
- `eyebrow`: small uppercase label above the title
- `lead`: supporting paragraph below the title
- `actions`: slot for one or more `<Button>` elements
- `align`: `left` (default) or `centered`

**Required states**
- [x] default (left-aligned, title only)
- [x] with eyebrow and lead text
- [x] centered alignment
- [x] title only (no eyebrow, lead, or actions)
- [x] with actions (`PageHeader`)

**Tokens consumed**
- `--hero-background`, `--hero-padding-y`, `--hero-padding-x`, `--hero-gap`
- `--hero-eyebrow-size`, `--hero-eyebrow-weight`, `--hero-eyebrow-color`, `--hero-eyebrow-spacing`
- `--hero-title-weight`, `--hero-title-color`
- `--hero-lead-size`, `--hero-lead-color`
- `--hero-max-width`, `--hero-lead-max-width`

**Accessibility**
- `<section>` wrapper — apply a meaningful `aria-label` at the page level when needed
- `titleAs` controls heading level; always set it correctly for document outline
- Actions slot: interactive elements inside must carry their own accessible labels

**Chromatic stories**
- `Default`, `WithEyebrowAndLead`, `Centered`, `TitleOnly`, `PageHeader`

---

### Avatar

| Field | Value |
|---|---|
| **Purpose** | User profile picture with fallback to initials when no image is provided |
| **Figma name** | `Avatar` |
| **Code name** | `Avatar` |
| **Storybook path** | `Components/Avatar` |

---

### Badge

| Field | Value |
|---|---|
| **Purpose** | Small status indicator or numeric count overlay attached to another element |
| **Figma name** | `Badge` |
| **Code name** | `Badge` |
| **Storybook path** | `Components/Badge` |

---

### Checkbox

| Field | Value |
|---|---|
| **Purpose** | Single boolean selection with an associated label; supports indeterminate state |
| **Figma name** | `Checkbox` |
| **Code name** | `Checkbox` |
| **Storybook path** | `Components/Checkbox` |

---

### Label

| Field | Value |
|---|---|
| **Purpose** | Standalone form label element — used when a label must be decoupled from its input |
| **Figma name** | `Label` |
| **Code name** | `Label` |
| **Storybook path** | `Components/Label` |

---

### Radio

| Field | Value |
|---|---|
| **Purpose** | Single-selection control within a mutually exclusive group |
| **Figma name** | `Radio` |
| **Code name** | `Radio` |
| **Storybook path** | `Components/Radio` |

---

### Skeleton

| Field | Value |
|---|---|
| **Purpose** | Placeholder loading state that mirrors the geometry of the content it replaces |
| **Figma name** | `Skeleton` |
| **Code name** | `Skeleton` |
| **Storybook path** | `Components/Skeleton` |

---

### Spinner

| Field | Value |
|---|---|
| **Purpose** | Indeterminate loading indicator for in-progress operations |
| **Figma name** | `Spinner` |
| **Code name** | `Spinner` |
| **Storybook path** | `Components/Spinner` |

---

### Switch

| Field | Value |
|---|---|
| **Purpose** | Binary toggle for on/off settings; renders as a styled checkbox under the hood |
| **Figma name** | `Switch` |
| **Code name** | `Switch` |
| **Storybook path** | `Components/Switch` |

---

### Textarea

| Field | Value |
|---|---|
| **Purpose** | Multi-line text entry with label, hint, and error states — mirrors Input API |
| **Figma name** | `Textarea` |
| **Code name** | `Textarea` |
| **Storybook path** | `Components/Textarea` |

---

### Alert

| Field | Value |
|---|---|
| **Purpose** | Contextual inline feedback message with semantic severity levels (info, success, warning, error) |
| **Figma name** | `Alert` |
| **Code name** | `Alert` |
| **Storybook path** | `Components/Alert` |

---

### BaseSheet

| Field | Value |
|---|---|
| **Purpose** | Unstyled overlay sheet primitive used internally by Drawer — not consumed directly |
| **Figma name** | `BaseSheet` |
| **Code name** | `BaseSheet` |
| **Storybook path** | `Components/BaseSheet` |

---

### Drawer

| Field | Value |
|---|---|
| **Purpose** | Side-anchored slide-in panel for supplemental content or secondary navigation |
| **Figma name** | `Drawer` |
| **Code name** | `Drawer` |
| **Storybook path** | `Components/Drawer` |

---

### Toast

| Field | Value |
|---|---|
| **Purpose** | Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout |
| **Figma name** | `Toast` |
| **Code name** | `Toast` |
| **Storybook path** | `Components/Toast` |

---

### Tooltip

| Field | Value |
|---|---|
| **Purpose** | Contextual label revealed on hover or focus — supplements an icon or truncated text |
| **Figma name** | `Tooltip` |
| **Code name** | `Tooltip` |
| **Storybook path** | `Components/Tooltip` |

---

### Accordion

| Field | Value |
|---|---|
| **Purpose** | Collapsible content sections with animated expand/collapse; supports single or multi-open modes |
| **Figma name** | `Accordion` |
| **Code name** | `Accordion` |
| **Storybook path** | `Components/Accordion` |

---

### Breadcrumb

| Field | Value |
|---|---|
| **Purpose** | Hierarchical page location trail; the last item is the current page (non-linked) |
| **Figma name** | `Breadcrumb` |
| **Code name** | `Breadcrumb` |
| **Storybook path** | `Components/Breadcrumb` |

**Props / variants**
- `LinkComponent`: optional component to render internal links with (e.g. `next/link` or a React Router `Link`). Defaults to a plain `<a>`.

---

### DataTable

| Field | Value |
|---|---|
| **Purpose** | Sortable, filterable, paginated table for structured datasets |
| **Figma name** | `DataTable` |
| **Code name** | `DataTable` |
| **Storybook path** | `Components/DataTable` |

---

### EmptyState

| Field | Value |
|---|---|
| **Purpose** | Placeholder for zero-content states — icon, heading, supporting text, and an optional action |
| **Figma name** | `EmptyState` |
| **Code name** | `EmptyState` |
| **Storybook path** | `Components/EmptyState` |

---

### Pagination

| Field | Value |
|---|---|
| **Purpose** | Page navigation controls for multi-page data sets; exposes current page and total page count |
| **Figma name** | `Pagination` |
| **Code name** | `Pagination` |
| **Storybook path** | `Components/Pagination` |

---

### Table

| Field | Value |
|---|---|
| **Purpose** | Static data table with semantic header, body, and row structure |
| **Figma name** | `Table` |
| **Code name** | `Table` |
| **Storybook path** | `Components/Table` |

---

### Tabs

| Field | Value |
|---|---|
| **Purpose** | Segmented view switcher with full keyboard navigation; built on Radix Tabs |
| **Figma name** | `Tabs` |
| **Code name** | `Tabs` |
| **Storybook path** | `Components/Tabs` |

---

## Storybook requirements

Every component must have stories covering the following categories:

| Category | What to cover | Notes |
|---|---|---|
| **Default** | The component at rest with typical content | This is the canonical reference story |
| **Variants** | One story per visual variant | Name stories to match the variant (e.g. `Secondary`, `Ghost`) |
| **States** | Disabled, error, loading — whatever applies | Chromatic snapshots required for each |
| **Edge cases** | Long text, empty, overflow, missing optional props | Prevents regressions on real-world data |
| **All variants** | Single story showing all variants together | Use `render:` override, not `args` |

Stories must **not**:
- Use inline styles to compensate for missing tokens
- Import components from outside the `components/` directory
- Depend on router context unless the component genuinely requires it
- Use arbitrary placeholder content — use realistic copy that reflects real usage

Story titles follow the path: `Components/ComponentName` for UI components, `Layout/ComponentName` for layout primitives, `Utilities/ComponentName` for non-visual utilities.

`'use client'` components (currently `Input`) require the `@storybook/react-vite` renderer — already configured.

---

## Chromatic requirements

Chromatic is the visual regression gate. A Chromatic diff must be reviewed before a PR can merge — this is not optional.

### What must have Chromatic snapshots

- Every story in the `States` and `Variants` categories
- The `Default` story for every component
- The `All variants` story where it exists
- Any story that covers a known edge case

### What counts as a required review

| Change type | Required action |
|---|---|
| Token value change | Review all affected component snapshots |
| Component CSS change | Review all stories for that component |
| New variant or state | Approve the new snapshot as baseline |
| Structural/layout change | Review all stories — layout shifts are regressions |
| Dark mode or theme change | Review affected theme-specific stories |

### What does not need Chromatic review

- Changes to story metadata (`title`, `argTypes`, `parameters`) with no visual output change
- Documentation-only changes (`*.md`, `*.mdx`)
- Token renames where the resolved value is identical

### Snapshot naming

Chromatic identifies stories by `title/StoryName` using the **export name**, not the `name:` override. Do not rename exports without resetting the Chromatic baseline and updating this document — renames orphan the prior snapshot.
