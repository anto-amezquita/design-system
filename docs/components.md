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
| **Internal** | `yes` only if this component is not for direct consumption — omit the row otherwise |

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
- `arrow`: opt-in trailing arrow SVG, default `false`. Ignored on `link` and while loading (decisions/0016)
- `motion`: `functional` (default — hover changes the background over a CSS transition, no animation code loaded) or `expressive` (hover wipe and glow, loads GSAP with a dynamic `import()`). Expressive falls back to the functional hover under `prefers-reduced-motion: reduce` or `hover: none` (decisions/0016)
- `disabled`, `type`, `aria-label`

**Required states**
- [x] default
- [x] hover (background shifts; arrow translates 2px right when `arrow` is on)
- [x] focus-visible (2px ring)
- [x] pressed (`:active`, mouse and touch: one step past hover via `--color-accent-pressed`; ghost uses `--color-surface-tertiary`)
- [x] disabled: not faded; a quiet surface and border with secondary text (4.5:1), ghost and link without the surface; not-allowed cursor. Loading keeps the variant's colours

**Tokens consumed**
- `--button-padding-x`, `--button-padding-y`
- `--button-font-size`, `--button-font-weight`
- `--button-border-radius`, `--button-border-width`, `--button-duration`
- `--button-primary-background`, `--button-primary-foreground`, `--button-primary-border`, `--button-primary-background-hover`
- `--button-secondary-background`, `--button-secondary-foreground`, `--button-secondary-border`, `--button-secondary-background-hover`, `--button-secondary-foreground-hover`
- `--button-ghost-background`, `--button-ghost-foreground`, `--button-ghost-border`, `--button-ghost-background-hover`
- `--color-border-focus`, `--font-family-base`, `--easing-default`, `--space-inline-gap`

**Accessibility**
- Semantic element: `<button>` by default; `<a>` when `href` is passed
- When rendered as `<a>`: there's no native `disabled`, so `disabled` sets `aria-disabled`, drops the `href` and removes it from the tab order
- ARIA: use `aria-label` for icon-only buttons; `disabled` on `<button>` removes it from tab order
- Keyboard: `Enter` + `Space` activate `<button>`; `Enter` follows `<a>`

**Do**
- Use one `primary` Button per view, for the action most people came to do.
- Name the action with a verb: "Save changes", "Send invite".
- Use `href` for anything that goes somewhere, and a plain Button for anything that acts on the page.
- Use `loading` while an action runs, instead of disabling the Button and changing its label.
- Give an icon-only Button an `aria-label`.

**Don't**
- Don't put two `primary` Buttons side by side; make one of them `secondary`.
- Don't use a Button for a link inside running text; that's what `Link` is for.
- Don't disable a Button without saying nearby why. A disabled Button can't explain itself.
- Don't turn on `arrow` for an action that stays on the page; the arrow promises a destination.
- Don't make `motion="expressive"` the default in a shared wrapper unless the brand calls for it (ADR 0016).

**Chromatic stories**
- `Primary`, `Secondary`, `Ghost`, `Disabled`, `AllVariants`

---

### ButtonGroup

| Field | Value |
|---|---|
| **Purpose** | Related actions kept together: Undo / Redo, zoom out / in, Cancel / Save |
| **Figma name** | `ButtonGroup` |
| **Code name** | `ButtonGroup` |
| **Storybook path** | `Components/ButtonGroup` |

**Props / variants**
- `children` (required): Buttons, IconButtons or ToggleButtons
- `label`: names the group for screen readers; recommended when the buttons don't say what they act on
- `attached`: joins the buttons into one shape (shared edges, round corners only at the ends); default is separate buttons with a gap
- `orientation`: `horizontal` (default) or `vertical`
- Native `div` attributes, `className` and `ref` pass through

**Required states**
- [x] spaced and attached, horizontal and vertical
- [x] hover and focus on an attached button sit on top, so the whole outline and ring show
- [x] each child keeps its own states (Button's)

**Tokens consumed**
- `--space-inline-gap`, `--button-outline-border-width`

**Accessibility**
- `role="group"`, named by `label`
- Every button stays its own Tab stop: each is a separate action. (A single choice with arrow keys is SegmentedControl.)
- No `aria-orientation`: `role="group"` doesn't take it; the layout is visual

**Do**
- Group actions that act on the same thing, in a fixed order people learn: Undo before Redo.
- Use `attached` with `secondary` buttons for tool-like sets.
- Put the main action last in a spaced group, as in dialogs.

**Don't**
- Don't use ButtonGroup to pick one option; that's SegmentedControl.
- Don't attach buttons of different variants; a filled button in an outlined row looks chosen.
- Don't group more than five or so actions; move the rest into a Menu.

**Chromatic stories**
- `Default`, `Attached`, `Vertical`, `DarkMode`

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
- `--font-family-heading`, `--line-height-control`
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
- `--font-size-caption`, `--input-hint-color`, `--input-error-color`
- `--font-family-base`, `--duration-interaction`, `--easing-default`
- `--space-inline-gap`

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
- `triggerRef`: optional external ref onto the trigger's DOM node, merged with Dialog's own internal one. For when a consumer needs the trigger element after this Dialog's own lifecycle ends — e.g. restoring focus there once a follow-up `AlertDialog` (opened after this Dialog already closed) finishes.
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
- `--line-height-h4`, `--line-height-body`, `--letter-spacing-heading`
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

### AlertDialog

| Field | Value |
|---|---|
| **Purpose** | Confirmation gate for an action the user must explicitly accept or decline — real `alertdialog` role, no outside-click/close-button dismiss, unlike Dialog |
| **Figma name** | `AlertDialog` |
| **Code name** | `AlertDialog` |
| **Storybook path** | `Components/AlertDialog` |

Built on `@radix-ui/react-alert-dialog` — do not replace the Radix primitive. Deliberately reuses Dialog's own CSS classes and tokens rather than duplicating them; visually the same box as Dialog, different behavioral contract underneath. See Dialog's entry above for the token list — nothing new is consumed here.

**Props / variants**
- No size variants beyond `sm | md | lg`, same scale as Dialog (minus `xl` — alert dialogs are confirmation-sized, not layout-sized)
- `title` (required), `description` (optional string), `children` (optional — richer body content beyond a plain description, e.g. a list of items to review)
- `cancel` and `action` (both required `React.ReactElement`) — rendered inside `AlertDialog.Cancel`/`AlertDialog.Action` (`asChild`) respectively. Must be real DOM elements forwarding a ref (Radix auto-focuses `cancel` on open) — do not pass this design system's own `Button` component here, it does not forward a ref; use a plain `<button>` (see Storybook source)
- `open` + `onOpenChange` — controlled only, no uncontrolled/`defaultOpen` mode and no `trigger` prop; real usage opens this from application logic (a risky state transition, a locked-setting change), not a direct click
- `onCloseAutoFocus` — forwarded to Radix; needed when this AlertDialog is a follow-up confirmation opened after a separate Dialog already closed, since Radix's own default focus restore has nothing useful to return to in that case (pair with Dialog's `triggerRef` prop)

**Required states**
- [x] open (enter animation, shared with Dialog)
- [x] with body content (`WithBody`)
- [x] without description (`NoDescription`)

**Tokens consumed**
- None new — reuses Dialog's full token set (see Dialog's entry above)

**Accessibility**
- Built on `@radix-ui/react-alert-dialog` — do not replace the Radix primitive, and do not substitute Dialog for it even though they look identical; the `alertdialog` role and the lack of outside-click dismiss are the entire reason this component exists
- Focus trap: Radix handles this; do not disable it
- Radix auto-focuses `cancel` on open — the least-destructive choice gets focus by default
- `Escape` closes via Cancel's path; do not override
- No close button in the header — the user must choose Cancel or Action, never dismiss silently

**Chromatic stories**
- `Default`, `WithBody`, `NoDescription`

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
- `aria-label`: required on its own; inside a `Field`, the Field's label names the trigger and its hint or error describes it, so it can be left out

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
- The trigger is a `combobox`, which gets no accessible name from its content: give it an `aria-label`, or put it in a `Field` (a dev warning fires when it has neither). In a Field with an `error`, the trigger gets `aria-invalid` and the red edge Input uses
- Keyboard: `Space` / `Enter` / `ArrowDown` opens; arrow keys navigate; `Enter` selects; `Escape` closes
- Focus returns to trigger on close (Radix default)

**Chromatic stories**
- `Default`, `WithDefaultValue`, `Grouped`, `Disabled`

---

### Tag

| Field | Value |
|---|---|
| **Purpose** | A short label on content: a category, a status word, a chosen value; optionally removable or clickable |
| **Figma name** | `Tag` |
| **Code name** | `Tag` |
| **Storybook path** | `Components/Tag` |

**Props / variants**
- `variant`: `default` (secondary background, bordered), `accent` (accent fill), `muted` (transparent, muted text)
- `icon`: a small icon before the text, hidden from screen readers
- `removable` + `onRemove`: adds a Remove button ("Remove React")
- `onClick` (+ `label` when the children aren't plain text): makes the whole tag a button

**Required states**
- [x] default, accent, muted
- [x] with icon, removable (Remove button hover and focus), clickable

**Tokens consumed**
- `--tag-padding-x`, `--tag-padding-y`, `--tag-font-weight`, `--tag-muted-background`
- `--color-surface-secondary`, `--color-text-secondary`, `--color-border-default`, `--border-width-default`, `--color-accent-default`, `--color-accent-foreground`
- `--border-radius-pill`, `--font-size-caption`, `--space-inline-gap`; `--size-icon-sm`, `--size-icon-xs`, `--space-tight-gap` (Remove button)

**Accessibility**
- A plain tag is a `<span>` with no role
- The Remove button is named after the tag, draws in the tag's own text colour at full strength (4.5:1, so over the 3:1 an icon needs) and has a 24px target (WCAG 2.5.8)
- A clickable and removable tag is a `span role="button"` so the Remove `<button>` inside stays valid HTML; Enter and Space activate it

**Do**
- Keep tag text to a word or two.
- Use removable tags for values people chose (MultiSelect, TagInput), so each can be taken back.

**Don't**
- Don't use a tag as the only way to reach something; tags are small targets in a row.
- Don't use colour alone to tell tags apart; say it in the text.

**Chromatic stories**
- `Default`, `Accent`, `Muted`, `WithIcon`, `Removable`, `AllVariants`, `InContext`, `DarkMode`

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

### AspectRatio

| Field | Value |
|---|---|
| **Purpose** | Keeps media at a fixed width-to-height ratio as the width changes, and holds the space before it loads |
| **Figma name** | `AspectRatio` |
| **Code name** | `AspectRatio` |
| **Storybook path** | `Components/AspectRatio` |

**Props / variants**
- `ratio`: `1/1`, `4/3`, `3/2`, `16/9` (default), `21/9`, `3/4`, `9/16`, or any positive number (width ÷ height). Anything else falls back to 1/1
- `fit`: `cover` (default, crops to fill) or `contain` (shows all of it) for an `img`, `video` or `picture` child
- `rounded`: corners in the brand's image radius
- Native `div` attributes, `className`, `style` and `ref` pass through

**Required states**
- [x] default (with media)
- [x] empty: the held space shows the secondary surface until the media loads

**Tokens consumed**
- `--color-surface-secondary`, `--border-radius-image` (no component tokens; the ratio is content, set per use)

**Accessibility**
- No role of its own; the media inside carries the meaning, so give an `img` its `alt` (empty for decoration) and an `iframe` its `title`
- Holding the space stops the layout jumping as images load, which also keeps a keyboard or screen-magnifier user's place on the page
- `cover` crops: don't use it when the edges hold information (text, a chart's axis); use `contain`

**Do**
- Wrap images, video and embeds whose size comes from the layout, like card media and galleries.
- Pick one ratio per collection, so a grid of cards lines up.
- Use `contain` for logos, diagrams and screenshots.

**Don't**
- Don't put text content in an AspectRatio; text that grows (zoom, translation) gets cut off.
- Don't use it for an image that already has its own `width` and `height` and isn't resized; the browser already holds that space.
- Don't use `cover` on images where the crop would remove what matters.

**Chromatic stories**
- `Default`, `Ratios`, `Contain`, `Placeholder`, `DarkMode`

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

### Calendar

| Field | Value |
|---|---|
| **Purpose** | A month of days to choose one date or a range; the base for DatePicker and DateRangePicker |
| **Figma name** | `Calendar` |
| **Code name** | `Calendar` (+ `DateRange` type; date helpers in `lib/date`) |
| **Storybook path** | `Components/Calendar` |

**Props / variants**
- `mode`: `single` (default) or `range`
- `value` + `onValueChange` (controlled) or `defaultValue`; a range is `{ start, end }`, and `end` is `null` after the first press
- `min`, `max`, `isDateDisabled(date)`: limits; unavailable days stay reachable by keyboard and are announced as unavailable
- `locale`: month and day names, and the first day of the week (Monday in `da-DK`, Sunday in `en-US`); `weekStartsOn` overrides
- `showWeekNumbers`: ISO week numbers, as Danish calendars show them
- `label`: added to the month in the grid's name ("Delivery date, October 2026")
- `defaultMonth`, `autoFocus`; native `div` attributes and `ref` pass through

**Required states**
- [x] chosen day (filled), today (ring, bold), unavailable (struck through, still 4.5:1)
- [x] range: filled ends, band between; dashed preview while choosing the second end
- [x] hover, focus-visible (ring on the day)
- [x] first and last month (Previous / Next disable at `min` / `max`)

**Tokens consumed**
- `--size-touch-target` (each day is 44px), `--space-tight-gap`, `--space-inline-gap`, `--button-border-radius` (day shape follows the brand's buttons)
- `--font-family-base`, `--font-size-control`, `--font-size-caption`, `--font-size-h5`, `--line-height-h5`, `--font-weight-heading`, `--font-weight-control`
- `--color-text-primary`, `--color-text-secondary`, `--color-surface-secondary`, `--color-accent-default`, `--color-accent-foreground`, `--color-accent-text`
- `--border-width-medium`, `--color-border-focus`, `--focus-ring-width`, `--duration-interaction`, `--easing-default`

**Accessibility**
- WAI-ARIA date grid: a `grid` named by the month (and `label`), `gridcell`s named with the full localised date, `aria-selected`, `aria-current="date"` on today, `aria-disabled` on unavailable days, `aria-multiselectable` for ranges
- One Tab stop. Arrows move by day and week, Home / End to the ends of the week, Page Up / Down by month, Shift + Page Up / Down by year, Enter or Space chooses; left and right swap in right-to-left layouts
- The month heading is a polite live region, so moving into a new month is announced
- Chosen days are 4.5:1, and plain days and weekday names 4.5:1 on the page, in every brand and mode (tested). Chosen, today and range are shown by shape (fill, ring, band), not colour alone

**Do**
- Set `locale` to the reader's, so the week starts on the right day.
- Use `min`, `max` and `isDateDisabled` for days that can't be booked, so they're explained by the calendar, not by an error afterwards.
- Show the chosen date or range in words next to the calendar.

**Don't**
- Don't use a Calendar for a date far from today, like a birthday; typing it is quicker (DatePicker allows both).
- Don't hide unavailable days; strike them through so the pattern is visible.
- Don't make a range from two separate Calendars; use `mode="range"`.

**Chromatic stories**
- `Default`, `Danish`, `Limits`, `Range`, `DarkMode`

---

### Checkbox

| Field | Value |
|---|---|
| **Purpose** | Single boolean selection with an associated label; supports indeterminate state |
| **Figma name** | `Checkbox` |
| **Code name** | `Checkbox` |
| **Storybook path** | `Components/Checkbox` |

---

### Combobox

| Field | Value |
|---|---|
| **Purpose** | One value from a long list, found by typing: a country, a town, a person |
| **Figma name** | `Combobox` |
| **Code name** | `Combobox` (+ `ComboboxOption` type) |
| **Storybook path** | `Components/Combobox` |

**Props / variants**
- `label` (required), `hint`, `error`, `required`, `disabled`, `placeholder`, `id`
- `options`: strings, or `{ value, label?, description?, disabled? }`; the description is a second line and is searched too
- `value` + `onValueChange` (controlled, the option's `value` or `null`) or `defaultValue`; `name` submits the value
- `allowCustom`: keep typed text that isn't in the list
- `onInputChange`, `loading`, `filter={false}`: for options fetched as people type
- `emptyMessage(text)`: the "no matches" text, for other languages

**Required states**
- [x] empty, chosen, typing (filtered, match in bold)
- [x] list open: active option (band and bar), chosen option (filled), unavailable option (struck through)
- [x] loading, no matches
- [x] typed text not in the list (error with a reason), error, disabled

**Tokens consumed**
- `--color-surface-secondary`, `--color-accent-text` (active), `--color-accent-default`, `--color-accent-foreground` (chosen), `--color-text-secondary` (descriptions, messages), `--font-weight-heading` (match), `--border-radius-pill`, `--size-touch-target`; Field, InputGroup, Input, IconButton and Popover style the rest

**Accessibility**
- The WAI-ARIA combobox with list autocomplete: `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, so focus never leaves the field
- Arrow Down / Up open the list and move, skipping unavailable options; Alt + Arrow Down opens without moving; Enter picks; Escape closes, and a second Escape clears
- The number of results ("4 results", "No matches for “oslo”", "Loading…") is announced in a polite live region
- Matching ignores case and accents ("peru" finds "Perú"); starts of words rank first
- "Clear" is a labelled button that returns focus to the field; the list button is out of the tab order, as in the WAI-ARIA example
- Each option is at least 44px tall

**Do**
- Use it when the list is too long to scan: about 15 options or more.
- Add a description when labels repeat or need context: an email under a name.
- Translate `emptyMessage` with the rest of the form.

**Don't**
- Don't use it for a handful of options; use Select or Radio, where everything is visible.
- Don't pick the first match on Tab or blur; people only get what they chose or typed exactly.
- Don't turn on `allowCustom` when the value must be one of the options.

**Chromatic stories**
- `Default`, `Chosen`, `WithDescriptions`, `Danish`, `AllowCustom`, `Unavailable`, `Async`, `Error`, `Disabled`, `Open`, `DarkMode`

---

### MultiSelect

| Field | Value |
|---|---|
| **Purpose** | Several values from a long list, found by typing: skills, reviewers, languages |
| **Figma name** | `MultiSelect` |
| **Code name** | `MultiSelect` (+ `MultiSelectOption` type) |
| **Storybook path** | `Components/MultiSelect` |

**Props / variants**
- `label` (required), `hint`, `error`, `required`, `disabled`, `placeholder`, `id`
- `options`: strings, or `{ value, label?, description?, disabled? }`, as in Combobox
- `value` + `onValueChange` (controlled, values in the order chosen) or `defaultValue`
- `max`: the most that can be chosen; the hint says so and the other options become unavailable
- `emptyMessage(text)`; `name` submits every value under that name, like `<select multiple>`

**Required states**
- [x] none chosen, some chosen (tags below the field, "Remove all" from two)
- [x] list open: checkbox marks, active option (band and bar), unavailable option (struck through)
- [x] limit reached (`max`), no matches
- [x] error, disabled (tags without Remove buttons)

**Tokens consumed**
- `--color-border-strong` (empty checkbox, 3:1), `--color-accent-default`, `--color-accent-foreground` (ticked), `--border-width-interactive`, `--border-radius-interactive` (as Checkbox), `--size-touch-target` (Remove all target); the list uses Combobox's styles and the chosen items are Tags

**Accessibility**
- A combobox over a listbox with `aria-multiselectable="true"`; each option's `aria-selected` says whether it's chosen, and a checkbox mark shows it without colour
- The list stays open while picking: Enter or a click adds or removes; Escape closes, then clears the search
- The field is described by what's chosen ("2 chosen: Danish, Spanish."), and every change is announced ("Spanish added, 3 chosen")
- Backspace in the empty field removes the last item; a tag's Remove button moves focus to the next tag, and "Remove all" returns it to the field
- Picking from a search clears it and keeps the place in the full list

**Do**
- Use it when the list is long and people pick a few; for up to about seven options, use Checkboxes.
- Set `max` when there's a real limit, so people learn it before they hit it.
- Keep the chosen items visible; don't collapse them into "3 selected" only.

**Don't**
- Don't use it for free text; Tag Input is for values people type.
- Don't reorder the chosen items; they stay in the order people picked them.

**Chromatic stories**
- `Default`, `Chosen`, `WithDescriptions`, `Max`, `Danish`, `Error`, `Disabled`, `Open`, `DarkMode`

---

### TagInput

| Field | Value |
|---|---|
| **Purpose** | Free-text values as tags: keywords, email addresses, ingredients |
| **Figma name** | `TagInput` |
| **Code name** | `TagInput` (+ `splitTags`) |
| **Storybook path** | `Components/TagInput` |

**Props / variants**
- `label` (required), `hint` (followed by "Separate with commas or press Enter."), `error`, `required`, `disabled`, `placeholder`, `id`
- `value` + `onValueChange` (controlled, tags in the order added) or `defaultValue`; `name` submits each tag
- `validate(tag)`: return a reason to refuse a tag
- `max`: the most tags allowed; said in the hint
- `suggestions`: offered as people type, filtered; anything else can still be added

**Required states**
- [x] empty, with tags (below the field, "Remove all" from two)
- [x] duplicate, invalid (`validate`), over `max`: each with its own reason, the refused text kept in the field
- [x] suggestions open (active option band and bar)
- [x] error, disabled (tags without Remove buttons)

**Tokens consumed**
- `--space-tight-gap`; the field is an InputGroup, suggestions use Combobox's list styles, and the tags and Remove all use Tag and MultiSelect's styles

**Accessibility**
- A labelled textbox, or a combobox with list autocomplete when there are suggestions
- The hint says how to add ("Separate with commas or press Enter."); Enter, comma or semicolon add; Backspace in the empty field removes the last tag
- A pasted list is split on commas, semicolons and new lines; what can't be added stays in the field with the first reason as the error
- Leaving the field adds what's typed, so nothing is lost on submit
- The field is described by its tags ("2 tags: CSS, React."), and each change is announced ("React added, 3 tags")
- Duplicates are matched without case or accents

**Do**
- Pass `validate` when tags have a format, like email addresses, and say the format in the reason.
- Offer `suggestions` when people should reuse existing tags.

**Don't**
- Don't use it when the values come from a fixed list; use MultiSelect.
- Don't drop refused text; TagInput keeps it in the field so people can fix it.

**Chromatic stories**
- `Default`, `WithTags`, `Suggestions`, `Emails`, `Danish`, `Error`, `Disabled`, `DarkMode`

---

### DatePicker

| Field | Value |
|---|---|
| **Purpose** | A date typed or picked from a calendar: delivery dates, bookings, deadlines |
| **Figma name** | `DatePicker` |
| **Code name** | `DatePicker` (+ `datePattern`; typed-date helpers in `lib/date`) |
| **Storybook path** | `Components/DatePicker` |

**Props / variants**
- `label` (required), `hint` (defaults to the format to type, e.g. "dd.mm.åååå"), `error`, `required`, `disabled`, `id`
- `value` + `onValueChange` (controlled; `null` when cleared) or `defaultValue`
- `min`, `max`, `isDateDisabled`: shared with the calendar, and checked on typed dates too
- `locale`: format, order and calendar names (15.10.2026 in `da-DK`, 10/15/2026 in `en-US`); `showWeekNumbers`
- `name`: submits the date as `yyyy-mm-dd` in a hidden input

**Required states**
- [x] empty (format as placeholder and hint), with a date
- [x] typing (nothing is checked until blur or Enter)
- [x] unreadable date ("Enter a date like 15.10.2026."), outside the limits ("Choose 10 October 2026 or later."), unavailable day
- [x] calendar open (on the chosen date), error, disabled

**Tokens consumed**
- `--space-inline-gap`; the rest is InputGroup, Input, IconButton, Popover and Calendar

**Accessibility**
- A text field named by the label, described by the format or the error; typing in the reader's own format works ("15/10/26", "15 10 2026", "2026-10-15")
- The calendar button says what's chosen ("Choose Delivery date, 22 October 2026 chosen"); Alt + Arrow Down in the field opens it, as on a native date field
- The calendar opens on the chosen date with focus on it, and picking closes it and returns focus (Popover); all of Calendar's keyboard support applies
- Reasons are in words, never just "invalid"

**Do**
- Leave typing on: it's the quickest way to enter a birthday or a date years away.
- Set `min`, `max` and `isDateDisabled`, so the calendar and the typed check agree.
- Set `locale` to the reader's, so the format they type is the format they see.

**Don't**
- Don't use three Selects for day, month and year; type it.
- Don't validate while someone is still typing; DatePicker waits for blur or Enter.
- Don't use a DatePicker for a range of dates; that's DateRangePicker.

**Chromatic stories**
- `Default`, `Limits`, `English`, `Error`, `Disabled`, `Open`, `DarkMode`

---

### DateRangePicker

| Field | Value |
|---|---|
| **Purpose** | A start and an end date: a stay, a report period, leave |
| **Figma name** | `DateRangePicker` |
| **Code name** | `DateRangePicker` (+ `CompleteRange` type) |
| **Storybook path** | `Components/DateRangePicker` |

**Props / variants**
- `label` (required): the question, shown as the group's legend; `startLabel` / `endLabel` name the two fields ("Start date", "End date" by default)
- `hint` (defaults to the format to type), `error`, `required`, `disabled`, `id`
- `value` + `onValueChange` (controlled; only complete, valid ranges, or `null` when both fields are cleared) or `defaultValue`
- `min`, `max`, `isDateDisabled`: a range that crosses an unavailable day is refused and the day is named
- `locale`, `showWeekNumbers`; `name` submits `<name>-start` and `<name>-end` as `yyyy-mm-dd`

**Required states**
- [x] empty, one end typed (waits), complete
- [x] end before start, outside the limits, crossing an unavailable day, unreadable date (each with its own reason)
- [x] calendar open (range mode, first end alone, then both; closes when the range is valid)
- [x] error (whole group red), disabled

**Tokens consumed**
- `--space-inline-gap`; the row uses InputGroup's join, and Field, Input, IconButton, Popover and Calendar style themselves

**Accessibility**
- A `<fieldset>` with the label as `<legend>`; each field has its own name ("Check-in", "Check-out"), its own id, and the hint or error as its description, so the reason is heard on the field itself
- Typing in the reader's format, as in DatePicker; Alt + Arrow Down opens the calendar from either field
- The calendar button says what's chosen ("Choose Stay, 12 October 2026 to 16 October 2026 chosen")
- A picked range that can't be used keeps the calendar open with the reason, so it can be changed straight away

**Do**
- Name the ends in the reader's terms: "Check-in" and "Check-out", "From" and "To".
- Pass `isDateDisabled` for booked days, so a range across one is caught before submit.
- Show the number of nights or days next to the picker once both ends are in.

**Don't**
- Don't use two separate DatePickers for one range; they can't check the range as a whole.
- Don't report half a range as a value; DateRangePicker waits for both ends.
- Don't clear the fields on an error; let people change one end.

**Chromatic stories**
- `Default`, `Booked`, `Danish`, `Error`, `Disabled`, `Open`, `DarkMode`

---

### Divider

| Field | Value |
|---|---|
| **Purpose** | A line that separates groups of content, horizontally or vertically |
| **Figma name** | `Divider` |
| **Code name** | `Divider` |
| **Storybook path** | `Components/Divider` |

**Props / variants**
- `orientation`: `horizontal` (default, fills the width) or `vertical` (stretches to the row's height)
- `decorative`: `false` (default) renders `role="separator"`; `true` renders `role="none"` so screen readers skip it
- Native `div` attributes, `className` and `ref` pass through

**Required states**
- [x] default (static: no hover, focus or disabled state)

**Tokens consumed**
- `--color-border-default`, `--border-width-default` (no component tokens; they would only pass through)

**Accessibility**
- Semantic element: `<div role="separator">`, with `aria-orientation="vertical"` when vertical; `<div role="none">` when decorative
- Not focusable; no keyboard interaction
- Drawn as a border, so it stays visible in forced-colors mode
- The line uses the default border colour, below 3:1 on purpose: it groups content but carries no meaning on its own (WCAG 1.4.11 doesn't apply). Don't let it be the only thing that tells two things apart

**Do**
- Use a Divider between groups a reader should hear as separate: settings sections, menu groups.
- Set `decorative` when the line is only visual, like between links in a footer row.
- Let the parent's `gap` set the space around it.

**Don't**
- Don't add a Divider where spacing or a heading already separates the groups; extra lines add noise.
- Don't put margins on a Divider to space content; use the layout's `gap`.
- Don't use a Divider as the border of a container; that's what Card is for.

**Chromatic stories**
- `Default`, `Vertical`, `DarkMode`

---

### Field

| Field | Value |
|---|---|
| **Purpose** | Label, hint and error for any control, wired the way Input wires its own |
| **Figma name** | `Field` |
| **Code name** | `Field` (+ `useField` for custom controls) |
| **Storybook path** | `Components/Field` |

**Props / variants**
- `label` (required): names the control (`<label htmlFor>`)
- `hint`: help text, linked with `aria-describedby`
- `error`: replaces the hint, sets `aria-invalid`, shown with an icon in the error colour
- `required`: sets `required` on the control and shows "Required" beside the label (visual only: the control's `required` is what screen readers announce; in a `group` the word is read with the legend)
- `disabled`, `id` (generated if left out; a control's own `id` wins)
- `group`: a `<fieldset>` with the label as `<legend>`, for radios, checkboxes or a SegmentedControl
- Children: one control. A native element or a component that passes props through gets `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`, never overriding what it already sets. Select reads them from `useField()`

**Required states**
- [x] default, with hint
- [x] error (message with icon; Select's trigger turns red)
- [x] required
- [x] disabled
- [x] group (fieldset)

**Tokens consumed**
- `--space-inline-gap`, `--space-tight-gap`, `--font-family-base`, `--font-size-small`, `--font-weight-label`, `--line-height-label`
- `--font-size-caption`, `--line-height-caption`, `--color-text-primary`, `--color-text-secondary`, `--color-feedback-error`, `--size-icon-sm`

**Accessibility**
- The label names the control; the hint or error is its description; an error sets `aria-invalid`
- Errors carry an icon as well as colour; label, hint and error are 4.5:1 in every brand and mode (tested)
- `group` uses a real `<fieldset>` / `<legend>`, so a set of radios is announced with its question
- Inputs with a built-in label (Input, Textarea, Slider) don't need a Field; wrapping them would label them twice

**Do**
- Use Field for every control that has no label of its own, so forms read the same throughout.
- Write errors that say how to fix it: "Choose the country the invoice goes to", not "Invalid".
- Show errors after the person has tried, not while they are still typing.

**Don't**
- Don't use a placeholder instead of a label; it disappears as soon as someone types.
- Don't wrap Input, Textarea or Slider in a Field; they label themselves.
- Don't put more than one control in a Field without `group`; only the first could be labelled.

**Chromatic stories**
- `WithSelect`, `Error`, `NativeControl`, `Group`, `Validating`, `DarkMode`

---

### IconButton

| Field | Value |
|---|---|
| **Purpose** | An action shown only as an icon, for toolbars, cards and dense rows |
| **Figma name** | `IconButton` |
| **Code name** | `IconButton` |
| **Storybook path** | `Components/IconButton` |

**Props / variants**
- `icon` (required): the icon element; sized by the component (20px at `md`, 16px at `sm`)
- `label` (required): the action's name, used as `aria-label`
- `variant`: `ghost` (default), `secondary`, `primary`, styled by Button
- `size`: `md` (default, 44px square) or `sm` (28px square, 44px hit area)
- `onClick`, `disabled`, `loading`, `type`, `href`, as on Button; native attributes and `ref` pass through
- No `motion="expressive"`: the hover wipe needs more room than a square

**Required states**
- [x] default
- [x] hover and pressed (Button's, per variant)
- [x] focus-visible (Button's ring)
- [x] disabled: not faded; a quiet surface and border with the icon in secondary text (4.5:1), ghost without the surface; not-allowed cursor
- [x] loading (spinner replaces the icon, `aria-busy`)

**Tokens consumed**
- Button's tokens, plus `--size-touch-target`, `--size-icon-interactive`, `--size-icon-md`, `--size-icon-sm`

**Accessibility**
- Semantic element: `<button>`, or `<a>` with `href` (Button's rules)
- The `label` is the only accessible name, so it's required; the icon is `aria-hidden`
- Hit area is 44×44px at both sizes; `sm` extends it past the visible square
- Keyboard: `Enter` and `Space`, as Button

**Do**
- Use an icon people already know for the action: a cross to close, a magnifier to search, a bin to delete.
- Write the `label` as the action ("Delete row"), not the icon ("Bin").
- Add a Tooltip showing the label when the icon alone may not be clear.
- Use `ghost` for repeated actions in a list, so the row isn't a wall of filled circles.

**Don't**
- Don't use an IconButton for the main action of a view; give that a Button with a visible label.
- Don't put two different actions behind the same icon on one screen.
- Don't use `sm` where people tap a lot on touch screens; the square looks small even though the target isn't.

**Chromatic stories**
- `Default`, `Variants`, `Sizes`, `States`, `DarkMode`

---

### InputGroup

| Field | Value |
|---|---|
| **Purpose** | An Input joined to the text and buttons that belong to it: "https://", "kr.", an Apply button |
| **Figma name** | `InputGroup` |
| **Code name** | `InputGroup` (+ `InputAddon`) |
| **Storybook path** | `Components/InputGroup` |

**Compound structure**
```tsx
<InputGroup label="Price" hint="…">
  <Input />                  {/* no label of its own */}
  <InputAddon>kr.</InputAddon>
</InputGroup>
```

**Props / variants**
- `label` (required), `hint`, `error`, `required`, `disabled`, `id`, as on Field
- Children: one Input without a label, plus `InputAddon`s and Buttons / IconButtons before or after it
- Native `div` attributes, `className` and `ref` pass through

**Required states**
- [x] default, with hint
- [x] focus (the focused piece draws on top with its ring)
- [x] error (the whole group's edge turns red; message with icon)
- [x] disabled (quiet surface and border, secondary text at 4.5:1; nothing faded)

**Tokens consumed**
- `--space-inline-gap`, `--space-control-padding-x`, `--border-width-interactive`, `--color-border-strong`, `--border-radius-interactive`
- `--color-surface-secondary`, `--color-text-secondary`, `--color-feedback-error`, `--font-family-base`, `--font-size-control`
- Field's label and message styles

**Accessibility**
- The label names the Input; addon text and the hint describe it in reading order ("https:// Your site.")
- Inside a group (or a Field), an Input without a label takes its id, description, `aria-invalid`, `required` and `disabled` from `useField()`
- Addon text is 4.5:1 on its surface in every brand and mode (tested)
- Buttons in the group keep their own names and stay separate Tab stops

**Do**
- Use addons for a fixed part of the value the person doesn't type: a protocol, a unit, a currency.
- Attach a button when it acts on this one value: Apply a code, Copy a link.
- Keep addon text short; one word or symbol.

**Don't**
- Don't put the label in an addon; use `label`.
- Don't attach more than one button; move other actions out of the group.
- Don't use an addon for an icon that only decorates; that's Input's `prefix`.

**Chromatic stories**
- `Default`, `TextAfter`, `WithButton`, `Error`, `Disabled`, `DarkMode`

---

### Kbd

| Field | Value |
|---|---|
| **Purpose** | A key the user presses, drawn as a keycap |
| **Figma name** | `Kbd` |
| **Code name** | `Kbd` |
| **Storybook path** | `Components/Kbd` |

**Props / variants**
- `children`: the key's label
- Native attributes, `className` and `ref` pass through
- Combination: one Kbd per key inside a plain outer `<kbd>`, the HTML spec's form: `<kbd><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></kbd>`

**Required states**
- [x] default (static: no interactive states)

**Tokens consumed**
- `--font-family-mono`, `--font-weight-medium`, `--line-height-heading` (unitless, so it scales)
- `--color-surface-secondary`, `--color-text-primary`, `--color-border-default`, `--color-border-strong`
- `--border-width-default`, `--border-radius-sm`

**Accessibility**
- Semantic element: native `<kbd>`
- Sized in `em`, so it matches the text around it
- Text on the keycap is 4.5:1 and the lower edge 3:1 in every brand and mode (tested)
- Screen readers read symbols literally ("⌘" may be read as "place of interest"). Write the key's name, or pair the symbol with `VisuallyHidden` text

**Do**
- Use Kbd for keys in help text, menus and tooltips: "Press Esc to close".
- Write keys the way they're printed on the keyboard: "Ctrl", "Enter", "K".
- Show the platform's keys when you know it: "⌘ K" on macOS, "Ctrl K" elsewhere.

**Don't**
- Don't use Kbd for code or file names; that's `<code>`.
- Don't make a Kbd clickable. It shows a key; it isn't a button.
- Don't list a shortcut that doesn't exist yet.

**Chromatic stories**
- `Default`, `InText`, `Combination`, `Sizes`, `DarkMode`

---

### Label

| Field | Value |
|---|---|
| **Purpose** | Standalone form label element — used when a label must be decoupled from its input |
| **Figma name** | `Label` |
| **Code name** | `Label` |
| **Storybook path** | `Components/Label` |

---

### OtpInput

| Field | Value |
|---|---|
| **Purpose** | A short code sent by text or email, shown as one box per character |
| **Figma name** | `OtpInput` |
| **Code name** | `OtpInput` |
| **Storybook path** | `Components/OtpInput` |

**Props / variants**
- `label` (required), `hint` (say where the code was sent), `error`, `disabled`, `name`, `autoFocus`
- `length`: number of characters (default 6)
- `mode`: `numeric` (default; digits only, number pad) or `alphanumeric` (letters and digits, uppercased)
- `value` + `onValueChange` (controlled) or `defaultValue`
- `onComplete(code)`: once the last character is in, e.g. to submit straight away

**Required states**
- [x] empty, partly filled, complete
- [x] focus (ring on the box where the next character goes)
- [x] error (every box red, message with icon), disabled

**Tokens consumed**
- `--space-inline-gap`, `--size-touch-target`, `--border-width-interactive`, `--color-border-strong`, `--border-radius-interactive`
- `--color-surface-primary`, `--color-text-primary`, `--font-family-mono`, `--font-size-h5`
- `--color-border-focus`, `--focus-ring-width`, `--color-feedback-error`, `--duration-interaction`, `--easing-default`
- Field's label and message styles

**Accessibility**
- One real input, not one per box: screen readers hear one field with its label and hint, and paste, SMS autofill (`autocomplete="one-time-code"`) and password managers work as usual
- No `maxlength`: the browser would cut a pasted "482 913" before the space is dropped; the component trims to `length` itself (tested)
- Characters 4.5:1 and box edges 3:1 in every brand and mode (tested); each box is 44px wide
- Announce the result of checking the code in a `role="status"` (see the "Submits when complete" story)

**Do**
- Say in the hint where the code went: "We sent it to +45 •• •• •• 12".
- Submit on `onComplete` when the code is all that's asked, so there's no extra button to find.
- Offer a way to send a new code nearby.

**Don't**
- Don't clear the boxes on an error; let people fix one character.
- Don't use it for passwords or anything longer than about eight characters; use Input.
- Don't block paste.

**Chromatic stories**
- `Default`, `PartlyFilled`, `FourCharacters`, `Error`, `Disabled`, `SubmitsWhenComplete`, `DarkMode`

---

### ProgressBar

| Field | Value |
|---|---|
| **Purpose** | Shows how far a task has got, or that it's running when the end isn't known |
| **Figma name** | `ProgressBar` |
| **Code name** | `ProgressBar` |
| **Storybook path** | `Components/ProgressBar` |

**Props / variants**
- `value`: 0 to `max`; leave it out (or `null`) for indeterminate. Out-of-range values are clamped
- `max`: default `100`
- `label` (required): what is progressing; always the accessible name
- `hideLabel`: keeps the label for screen readers only
- `showValue`: shows the percentage (or `valueText`) beside the label
- `valueText`: words instead of a percentage, e.g. "3 of 10 files"; read as `aria-valuetext`
- Native `div` attributes, `className` and `ref` pass through to the wrapper

**Required states**
- [x] determinate (fill grows over `--duration-transition`)
- [x] empty (0) and complete (`max`)
- [x] indeterminate (a segment slides across; `aria-busy`)
- [x] reduced motion (no slide: the segment rests in the middle; value changes jump)

**Tokens consumed**
- `--progress-bar-height`
- `--color-surface-tertiary` (track), `--color-accent-text` (fill), `--color-text-primary`, `--color-text-secondary`
- `--font-family-base`, `--font-size-small`, `--line-height-small`, `--font-weight-medium`
- `--space-tight-gap`, `--space-inline-gap`, `--border-radius-full`
- `--duration-transition`, `--duration-entrance`, `--easing-default`

**Accessibility**
- `role="progressbar"` named by the label (`aria-labelledby`), with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`; none of the three while indeterminate
- The visible percentage is `aria-hidden`; screen readers get the value from the bar itself
- The fill is 3:1 against the track and the page in every brand and mode (`progress-fill-on-track`, `progress-fill-on-page` pairs)
- Forced colors: the track gets an outline and the fill uses `Highlight`
- Not focusable; it reports, it isn't a control. For a value the user sets, use a Slider

**Do**
- Name the task in the label: "Uploading photos", not "Progress".
- Use `valueText` when a count says more than a percentage.
- Switch from indeterminate to a value as soon as you know the total.
- Say when it's done, with a message or by moving on; a full bar alone is easy to miss.

**Don't**
- Don't show a bar for something that takes under a second; it flashes and is gone.
- Don't let the value go backwards. If a step restarts, say so in the label.
- Don't use ProgressBar for a score or a quota; that's a meter, not progress.

**Chromatic stories**
- `Default`, `States`, `ValueText`, `Indeterminate`, `HiddenLabel`, `DarkMode`

---

### NumberInput

| Field | Value |
|---|---|
| **Purpose** | A number typed or stepped: a quantity, an amount, a percentage |
| **Figma name** | `NumberInput` |
| **Code name** | `NumberInput` |
| **Storybook path** | `Components/NumberInput` |

**Props / variants**
- `label` (required), `hint`, `error`, `required`, `disabled`, `id`, `name`, `placeholder`
- `value` + `onValueChange` (controlled; `null` is empty) or `defaultValue`
- `min`, `max`, `step` (1), `largeStep` (`step × 10`)
- `unit`: text joined after the field and read with the value ("kr.", "kg", "%")
- `locale` and `formatOptions`: how the number is shown after editing (`da-DK` shows 1,5)
- `hideSteppers`: no − / + buttons; the keyboard still steps

**Required states**
- [x] empty, with a value, at the minimum and maximum (the matching button disables)
- [x] typing (the value updates on each valid number; nothing is reformatted mid-typing)
- [x] not a number (text kept, "Enter a number." after blur)
- [x] error, disabled
- [x] focus (Input's ring)

**Tokens consumed**
- None of its own: built from InputGroup, Input, InputAddon and IconButton

**Accessibility**
- WAI-ARIA spinbutton pattern on a text input: `role="spinbutton"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` including the unit ("50 kr.")
- Keyboard: arrows step, Page Up / Down take big steps, Home / End jump to the limits
- The − / + buttons are named after the field ("Increase Guests") and kept out of the Tab order, as the pattern suggests; the keys do the same
- `inputMode="decimal"` brings up a number keyboard on phones
- Not `<input type="number">`: that changes value on scroll and rejects a decimal comma

**Do**
- Set `min` and `max` whenever there are limits, so the buttons and End / Home can use them.
- Use `unit` instead of putting the unit in the label.
- Accept the person's own decimal mark: "1,5" and "1.5" both work.

**Don't**
- Don't use NumberInput for numbers that aren't amounts, like a phone number, a card or a postcode; use Input.
- Don't use it for a rough value on a wide range; that's Slider.
- Don't format with thousand separators while someone types; it happens after.

**Chromatic stories**
- `Default`, `Money`, `Decimal`, `NoSteppers`, `States`, `Controlled`, `DarkMode`

---

### Radio

| Field | Value |
|---|---|
| **Purpose** | Single-selection control within a mutually exclusive group |
| **Figma name** | `Radio` |
| **Code name** | `Radio` |
| **Storybook path** | `Components/RadioGroup` |

---

### Search

| Field | Value |
|---|---|
| **Purpose** | A site or list search: a search landmark with Enter to search, Escape to clear and an optional shortcut |
| **Figma name** | `Search` |
| **Code name** | `Search` |
| **Storybook path** | `Components/Search` |

**Props / variants**
- `label`: names the landmark and the field (default "Search"); make it specific when there's more than one
- `value` + `onValueChange` (controlled, for search-as-you-type) or `defaultValue`
- `onSearch(query)`: Enter or the button
- `showSubmit`: a Search button after the field
- `shortcut`: one key that jumps to the field from anywhere ("/"), shown as a Kbd hint while empty and unfocused
- `loading`: spinner in place of the hint, `aria-busy` on the field
- `disabled`, `name` (default `q`), `placeholder`; native `form` attributes reach the `<form>`; `ref` reaches the input

**Required states**
- [x] empty (with shortcut hint), typing (clear button), loading
- [x] focus (Input's ring), disabled

**Tokens consumed**
- `--space-inline-gap`; the rest is Input's search mode, Button, Kbd and Spinner

**Accessibility**
- A `<form role="search">` landmark and a searchbox (`type="search"`), both named by `label`
- Enter searches without reloading; Escape clears, a second Escape leaves the field
- The shortcut is announced with `aria-keyshortcuts` and ignored while someone types in another field, so "/" still types a slash there
- Loading sets `aria-busy`; announce the result count yourself with a `role="status"` near the results (see the "Search as you type" story)
- Each search landmark on a page needs its own name (axe: landmark-unique)

**Do**
- Name it after what it searches: "Search components", not just "Search", when the page has other searches.
- Say how many results there are in a status region, so screen-reader users know it worked.
- Keep the query in the field after searching, so it can be refined.

**Don't**
- Don't use Search to filter a short list that fits on screen; that can be a plain Input.
- Don't pick a shortcut that a browser or screen reader already uses; single keys like "/" are safest.
- Don't use a placeholder as the only label; `label` names it for screen readers either way.

**Chromatic stories**
- `Default`, `WithShortcut`, `WithSubmit`, `Loading`, `AsYouType`, `DarkMode`

---

### SegmentedControl

| Field | Value |
|---|---|
| **Purpose** | One choice from a few, shown side by side: a view switch, a time range |
| **Figma name** | `SegmentedControl` |
| **Code name** | `SegmentedControl` |
| **Storybook path** | `Components/SegmentedControl` |

**Props / variants**
- `options` (required): `{ value, label, icon?, disabled? }[]`, two to five
- `label` (required): the group's accessible name
- `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled; defaults to the first option)
- `hideLabels`: icons only, square segments; each `label` becomes the segment's name
- `fullWidth`: stretches, segments share the width equally
- `disabled` (whole control) or per option; `name` submits with a form; native attributes and `ref` reach the group

**Required states**
- [x] chosen (accent fill)
- [x] not chosen, and hover (neutral surface)
- [x] focus-visible (ring on the focused segment)
- [x] disabled per option (secondary text, 4.5:1) and whole control (quieter outline, the chosen segment still shown on the quiet surface); never faded

**Tokens consumed**
- `--button-border-radius` (matches the brand's Button shape)
- `--border-width-default`, `--color-border-strong`, `--color-surface-primary`, `--color-surface-secondary`
- `--color-text-primary`, `--color-accent-default`, `--color-accent-foreground`
- `--font-family-base`, `--font-size-control`, `--font-weight-control`
- `--space-tight-gap`, `--space-compact-padding-x`, `--space-inline-gap`, `--size-touch-target`, `--size-icon-md`
- `--color-border-focus`, `--focus-ring-width`, `--focus-ring-offset`, `--color-border-default`, `--color-text-secondary`, `--duration-interaction`, `--easing-default`

**Accessibility**
- A radio group (Radix): `role="radiogroup"` named by `label`, segments are `role="radio"` with `aria-checked`
- Keyboard: one Tab stop (the chosen segment); arrow keys move and choose, wrap at the ends and skip disabled segments
- Chosen text 4.5:1 on the fill and the outline 3:1 on the page in every brand and mode (tested); the chosen segment is filled, so the state doesn't rely on colour alone
- 44px tall; forced colors: the chosen segment uses `Highlight`

**Do**
- Use it when the choice changes what's shown right away: a chart's range, list or grid.
- Keep labels to one or two short words, about the same length.
- Name the group with `label` ("Time range"), even when the context makes it obvious to sighted users.

**Don't**
- Don't use more than five segments; use a Select.
- Don't use it for actions; each segment is a choice, not a command. That's ButtonGroup.
- Don't use it for navigation between pages; that's Tabs or NavigationMenu.
- Don't mix icon-only and labelled segments in one control.

**Chromatic stories**
- `Default`, `WithIcons`, `IconsOnly`, `FullWidth`, `Disabled`, `Controlled`, `DarkMode`

---

### Section

| Field | Value |
|---|---|
| **Purpose** | A band of a page: edge-to-edge background, space above and below, content centred at a set width with the page gutter |
| **Figma name** | `Section` |
| **Code name** | `Section` |
| **Storybook path** | `Components/Section` |

**Props / variants**
- `width`: `text`, `media`, `wide`, `page` (default) or `full`, each the brand's `--size-container-*` token
- `spacing`: `section` (default, grows with the viewport), `component` or `none`
- `tone`: `default` (no background) or `subtle` (the secondary surface)
- `as`: `section` (default), `header`, `footer`, `main`, `article`, `aside` or `div`
- Native attributes, `className` and `ref` pass through to the outer element

**Required states**
- [x] default (layout only: no hover, focus or disabled state)
- [x] responsive: the gutter is `--space-element-gap` on a phone and `--space-container-padding` from 768px

**Tokens consumed**
- `--size-container-text`, `--size-container-media`, `--size-container-wide`, `--size-container-page`
- `--space-section-gap`, `--space-component-gap`, `--space-element-gap`, `--space-container-padding`, `--color-surface-secondary` (no component tokens; they would only pass through)

**Accessibility**
- A `<section>` is only a region landmark once it has a name: pass `aria-labelledby` pointing at its heading. Without one it's a plain grouping, which is fine for bands that don't need to be jumped to
- Named Sections need different names: two regions both called "Pricing" can't be told apart (axe `landmark-unique`, checked in the stories)
- Primary and secondary text are tested at 4.5:1 or more on the `subtle` band in all five brands, light and dark
- No dark `tone`: a dark band on a light page needs every component inside to switch, so wrap the Section in `ThemeScope mode="dark"` instead

**Do**
- Use one Section per band of a page, and let Stack or Grid lay out what's inside.
- Use `width="text"` for reading content, so lines stay a comfortable length.
- Alternate `default` and `subtle` to tell neighbouring bands apart.

**Don't**
- Don't nest Sections; the gutter and spacing would double. Use Stack inside.
- Don't name every Section as a landmark; a page with twenty regions is as hard to navigate as one with none.
- Don't set a dark background on a Section by hand; components inside would keep their light colours. Use ThemeScope.

**Chromatic stories**
- `Default`, `Bands`, `DarkBand`, `DarkMode`

---

### Skeleton

| Field | Value |
|---|---|
| **Purpose** | Placeholder loading state that mirrors the geometry of the content it replaces |
| **Figma name** | `Skeleton` |
| **Code name** | `Skeleton` |
| **Storybook path** | `Components/Skeleton` |

---

### Slider

| Field | Value |
|---|---|
| **Purpose** | One value from a range, by dragging or with the keyboard: volume, a price limit, opacity |
| **Figma name** | `Slider` |
| **Code name** | `Slider` |
| **Storybook path** | `Components/Slider` |

**Props / variants**
- `label` (required): the input's accessible name; shown above the track unless `hideLabel`
- `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled; defaults to `min`)
- `min` (0), `max` (100), `step` (1)
- `showValue`: the current value beside the label
- `formatValue`: words for the value, shown and read as `aria-valuetext` (`v => \`${v} kr.\``)
- `hint`: help text under the track (`aria-describedby`)
- `disabled`, `name`, `id`; native input attributes and `ref` reach the `<input>`
- One thumb only. A two-thumb range is not supported yet

**Required states**
- [x] default (track filled up to the thumb)
- [x] hover (thumb on the neutral surface)
- [x] focus-visible (ring around the thumb)
- [x] disabled (track fill and thumb in secondary text; nothing faded, the label stays readable)

**Tokens consumed**
- `--slider-track-height`
- `--color-surface-tertiary` (track), `--color-accent-text` (fill and thumb edge), `--color-surface-primary`, `--color-surface-secondary`
- `--size-icon-md` (thumb), `--size-touch-target` (row height), `--border-width-medium`, `--border-radius-full`
- `--color-border-focus`, `--focus-ring-width`, `--focus-ring-offset`
- `--font-family-base`, `--font-size-small`, `--font-weight-label`, `--line-height-label`, `--font-size-caption`, `--line-height-caption`, `--color-text-primary`, `--color-text-secondary`
- `--space-tight-gap`, `--space-inline-gap`, `--duration-interaction`, `--easing-default`

**Accessibility**
- Native `<input type="range">` with a `<label>`: announced as a slider with its value
- Keyboard: arrows step, Page Up / Down take bigger steps, Home / End jump to the ends
- Fill and thumb edge 3:1 on the track and the page in every brand and mode (the progress-fill pairs, tested)
- The whole 44px row is the target; the fill runs the other way in right-to-left layouts
- Forced colors: the thumb uses `Highlight`

**Do**
- Use a Slider when the exact number matters less than the feel: volume, brightness, a rough limit.
- Show the value (`showValue`) when people need to know it, and format it with its unit.
- Pick a `step` that matches what people can tell apart.

**Don't**
- Don't use a Slider for a precise number, like an age or a quantity; that's a number input.
- Don't use it for a choice from a few named options; that's SegmentedControl.
- Don't apply each change to something slow while dragging; wait until the value settles.

**Chromatic stories**
- `Default`, `Formatted`, `WithHint`, `HiddenLabel`, `Disabled`, `Controlled`, `DarkMode`

---

### Spinner

| Field | Value |
|---|---|
| **Purpose** | Indeterminate loading indicator for in-progress operations |
| **Figma name** | `Spinner` |
| **Code name** | `Spinner` |
| **Storybook path** | `Components/Spinner` |

---

### Stack

| Field | Value |
|---|---|
| **Purpose** | Lays children out in one direction with a consistent gap from the brand's spacing roles |
| **Figma name** | `Stack` (auto layout) |
| **Code name** | `Stack` |
| **Storybook path** | `Components/Stack` |

**Props / variants**
- `direction`: `vertical` (default, a column) or `horizontal` (a row)
- `gap`: `none`, `tight`, `inline`, `element` (default), `component` or `section`, each the brand's `--space-*-gap` token
- `align`: `start`, `center`, `end`, `stretch` (default) or `baseline`
- `justify`: `start` (default), `center`, `end` or `between`
- `wrap`: lets a horizontal Stack wrap onto more lines
- `as`: `div` (default), `section`, `article`, `aside`, `header`, `footer`, `nav`, `main`, `ul`, `ol` or `span`
- Native attributes, `className` and `ref` pass through

**Required states**
- [x] default (layout only: no hover, focus or disabled state)

**Tokens consumed**
- `--space-tight-gap`, `--space-inline-gap`, `--space-element-gap`, `--space-component-gap`, `--space-section-gap` (no component tokens; they would only pass through)

**Accessibility**
- No role of its own: it renders the element in `as`, so pick the one that matches what the group is
- As `ul` or `ol` it removes markers and indent and sets `role="list"`, because Safari drops list semantics once `list-style` is `none`. A `role` you pass wins
- Visual order follows source order (no `reverse` prop), so reading and tab order match what's on screen

**Do**
- Use Stack instead of margins on children, so the spacing lives in one place and follows the brand.
- Pick the gap by role: `inline` between buttons, `element` between items in a group, `component` between form fields or cards.
- Use `as="ul"` when the items are a list a reader should hear counted.

**Don't**
- Don't nest Stacks just to add one extra space; choose a larger gap role.
- Don't use Stack for two-dimensional layouts; that's Grid.
- Don't reorder children with CSS on a Stack; change the source order so keyboard and screen-reader order match.

**Chromatic stories**
- `Default`, `Horizontal`, `Gaps`, `AsList`, `DarkMode`

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

### FileUpload

| Field | Value |
|---|---|
| **Purpose** | Pick files by button or by dragging them in, see what's chosen, and remove any |
| **Figma name** | `FileUpload` |
| **Code name** | `FileUpload` (+ `matchesAccept`) |
| **Storybook path** | `Components/FileUpload` |

**Props / variants**
- `label` (required), `hint` (say what's allowed), `error`, `required`, `disabled`, `id`, `name`
- `accept` (like the native attribute: `"image/*,.pdf"`), `maxSize` (bytes), `maxFiles` (`1` makes a single-file picker that replaces its file)
- `files` + `onFilesChange` (controlled) or uncontrolled
- Uploading is up to the app: FileUpload hands over the chosen `File`s

**Required states**
- [x] empty, dragging over (solid accent edge), with files
- [x] files turned away (a reason for each, in the error colour)
- [x] focus (ring on the "Choose files" face while the real input has focus)
- [x] error (red zone edge), disabled (flat, nothing faded)

**Tokens consumed**
- `--space-element-gap`, `--space-inline-gap`, `--space-tight-gap`, `--space-container-padding`, `--border-width-medium`, `--border-radius-component`
- `--color-border-strong`, `--color-border-default`, `--color-accent-text`, `--color-surface-primary`, `--color-surface-secondary`, `--color-feedback-error`
- `--color-text-primary`, `--color-text-secondary`, `--font-family-base`, `--font-size-small`, `--line-height-small`, `--font-size-caption`, `--font-weight-control`
- `--size-icon-md`, `--size-icon-lg`, `--size-touch-target`, `--button-border-radius`, `--button-secondary-foreground`, `--button-secondary-border`, `--button-outline-border-width`
- `--color-border-focus`, `--focus-ring-width`, `--focus-ring-offset`, `--duration-interaction`, `--easing-default`

**Accessibility**
- A real `<input type="file">`, hidden visually but focusable: Tab, Enter / Space and the system picker work as usual; its name reads "Attachments, Choose files" and the hint describes it
- Dragging is an extra, never the only way; "or drag them here" is hidden from screen readers
- Each file has a remove button named after it ("Remove portfolio.pdf"); after removing, focus moves to the next file's button, or back to the picker when the list is empty
- A polite status says what happened: "2 files added.", "cv.pdf removed.", and why a file was turned away
- Disabled doesn't fade the words, so they stay 4.5:1

**Do**
- Say in the hint which types and sizes are allowed.
- Tell people why a file was turned away, as FileUpload does, and keep the ones that were fine.
- Show upload progress in your app after choosing, with ProgressBar.

**Don't**
- Don't hide the button and rely on dragging alone.
- Don't clear the chosen files when another field has an error.
- Don't set `maxFiles` without saying the limit in the hint.

**Chromatic stories**
- `Default`, `WithFiles`, `Single`, `Error`, `Disabled`, `DarkMode`

---

### Grid

| Field | Value |
|---|---|
| **Purpose** | Lays items out in rows and columns: fixed columns per breakpoint, or as many as fit |
| **Figma name** | `Grid` (auto layout, wrap) |
| **Code name** | `Grid` (+ `GridItem`) |
| **Storybook path** | `Components/Grid` |

**Compound structure**
```tsx
<Grid columns={{ base: 1, tablet: 2, desktop: 4 }} gap="component">
  <GridItem span="full">…</GridItem>            {/* only needed to span */}
  <Card>…</Card>                                {/* plain children take one column */}
</Grid>
```

**Props / variants**
- `columns`: 1–12 equal columns, or one per breakpoint (`{ base, tablet, desktop }`, mobile first; a breakpoint left out takes the one below). Default 1
- `minItemWidth`: `sm`, `md` or `lg`: as many columns as fit with each item at least that wide; overrides `columns`
- `gap`: `none`, `tight`, `inline`, `element` (default), `component` or `section`; `rowGap` when rows need a different space
- `align`: `start`, `center`, `end` or `stretch` (default)
- `as`: `div` (default), `section`, `ul` or `ol`
- `GridItem` `span`: a number of columns, `'full'`, or one per breakpoint; `as`: `div`, `li`, `article` or `section`
- Native attributes, `className`, `style` and `ref` pass through on both

**Required states**
- [x] default (layout only: no hover, focus or disabled state)
- [x] responsive: columns and spans per breakpoint (768px tablet, 1024px desktop)

**Tokens consumed**
- `--space-tight-gap`, `--space-inline-gap`, `--space-element-gap`, `--space-component-gap`, `--space-section-gap`
- `--grid-min-item-sm`, `--grid-min-item-md`, `--grid-min-item-lg`

**Accessibility**
- No role of its own: it renders the element in `as`, so pick the one that matches what the items are
- As `ul` or `ol` it removes markers and indent and sets `role="list"`, because Safari drops list semantics once `list-style` is `none`. A `role` you pass wins
- Items fill in source order (no `dense` packing, no reordering), so reading and tab order match what's on screen
- With `minItemWidth`, an item shrinks below the minimum in a container narrower than it, so content reflows at 320px instead of scrolling sideways (WCAG 1.4.10)

**Do**
- Use `minItemWidth` for collections of like items (cards, swatches) so the grid works in any container, sidebar included.
- Use per-breakpoint `columns` for page layouts where the column count is a design decision.
- Render a collection as `as="ul"` with `li` items so screen readers announce how many there are.

**Don't**
- Don't use Grid for a single row or column; that's Stack.
- Don't span more columns than the grid has: the browser adds extra columns and squeezes the rest. Use `span="full"` for the whole row.
- Don't use a Grid to lay out tabular data; that's Table, which keeps row and column headers.
- Don't reorder items with CSS to change their visual position; change the source order so keyboard and screen-reader order match.

**Chromatic stories**
- `Default`, `PerBreakpoint`, `AsManyAsFit`, `Spans`, `DarkMode`

---

### Heading

| Field | Value |
|---|---|
| **Purpose** | Semantic heading element (H1–H5 visual sizes, any `<h1>`–`<h6>` tag) with a visual size decoupled from its document-outline level |
| **Figma name** | `Heading` |
| **Code name** | `Heading` |
| **Storybook path** | `Components/Heading` |

**Props / variants**
- `level` (required): `1`–`5` — controls visual size only. `1`–`3` use fluid (`clamp()`-based) sizing that scales with viewport width; `4`–`5` are static, fixed-size — see decisions/0008 for why the split sits there, and decisions/0013 for why there's no H6 size
- `as`: `'h1'`–`'h6'`, optional, defaults to matching `level` (`level={2}` renders `<h2>`) — set explicitly when the correct document-outline position diverges from the desired visual size (e.g. a visually small `H1` that must stay a real `<h1>` for SEO/screen-reader navigation)

**Required states**
- [x] H1–H3 (fluid)
- [x] H4–H5 (static)
- [x] `level`/`as` decoupled (visual size independent of rendered tag)

**Tokens consumed**
- `--font-family-heading`, `--font-weight-heading`, `--color-text-primary`, `--letter-spacing-heading`
- `--font-size-h1-fluid`, `--line-height-display`
- `--font-size-h2-fluid`, `--font-size-h3-fluid`, `--line-height-heading`
- `--font-size-h4`, `--font-size-h5`
- `--line-height-h4`, `--line-height-h5`

**Accessibility**
- Renders a real `h1`–`h6` element — always reflects the document outline correctly via `as`, never rely on `level` alone for that
- No ARIA requirements beyond correct heading-level nesting in the surrounding page

**Chromatic stories**
- `H1`, `H2`, `H3`, `H4`, `H5`, `AllLevels`, `LevelAsDecoupling`, `DarkMode`

---

### Link

| Field | Value |
|---|---|
| **Purpose** | Navigation to another page or resource; use Link for navigation and Button for actions |
| **Figma name** | `Link` |
| **Code name** | `Link` |
| **Storybook path** | `Primitives/Link` |

**Props / variants**
- `variant`: `inline` (default, underlined, for running text) or `standalone` (no underline until hover or focus)
- `external`: opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), adds an icon and visually hidden "(opens in a new tab)". Set it explicitly; it isn't detected from `href`
- `asChild`: render a router's link instead of `<a>` — `<Link asChild><NextLink href="/about">About</NextLink></Link>`
- Every native anchor attribute passes through; `className` merges; the ref reaches the `<a>`
- Link vs Button: Button still renders `<a>` when given `href`, but reach for Link whenever the element goes somewhere, and Button when it does something

**Required states**
- [x] default (accent colour, underlined when inline)
- [x] hover (accent hover colour; standalone gains its underline)
- [x] focus-visible (2px ring)

**Tokens consumed**
- `--color-accent-default`, `--color-accent-hover`, `--color-border-focus`
- `--border-width-default`, `--border-radius-interactive`, `--focus-ring-width`, `--focus-ring-offset`
- `--duration-interaction`, `--easing-default`, `--size-icon-xs`, `--space-tight-gap`

**Accessibility**
- Semantic element: `<a>` (or the `asChild` element, which must render an `<a>`)
- Link text should make sense out of context; avoid "click here"
- `external` adds "(opens in a new tab)" to the accessible name, so the new tab isn't a surprise
- Text colour is checked at 4.5:1 against the primary surface in all four modes (`tokens/contrast-pairs.json`, `link-text`)

**Chromatic stories**
- `Default`, `Standalone`, `External`, `AsChild`, `AllVariants`, `DarkMode`

---

### SkipLink

| Field | Value |
|---|---|
| **Purpose** | First Tab stop on the page that lets keyboard users jump past the header to the main content |
| **Figma name** | `SkipLink` |
| **Code name** | `SkipLink` |
| **Storybook path** | `Primitives/SkipLink` |

**Props / variants**
- `targetId`: the `id` to jump to, default `'main-content'`. Put the matching `id` on your `<main>`: `<main id="main-content">`
- `children`: the label, default "Skip to main content"
- Render it first inside `<body>` (before the header), so it's the first thing Tab reaches
- Every native anchor attribute except `href` passes through; `className` merges; the ref reaches the `<a>`

**Required states**
- [x] hidden (at rest, visually hidden but reachable)
- [x] focus (fixed to the top-left, above every other layer)

**Tokens consumed**
- `--z-skip-link` (700, one step above `--z-tooltip`)
- `--color-accent-default`, `--color-accent-foreground`, `--color-border-focus`
- `--font-family-base`, `--font-size-control`, `--line-height-control`, `--font-weight-label`
- `--space-control-padding-x`, `--space-control-padding-y`, `--space-inline-gap`
- `--border-radius-interactive`, `--focus-ring-width`, `--focus-ring-offset`

**Accessibility**
- Semantic element: `<a href="#main-content">`
- On activation it moves focus to the target, adding `tabindex="-1"` if the target isn't focusable, so the next Tab continues from the main content instead of the top of the page
- Visible whenever focused (`:focus`, not only `:focus-visible`)
- The only component with an explicit z-index after decisions/0007: it isn't portalled, so mount order can't lift it

**Chromatic stories**
- `Default`, `Focused`, `CustomTarget`, `DarkMode`

---

### Text

| Field | Value |
|---|---|
| **Purpose** | Body text in the brand's type roles (body, small, caption), with a tone and a weight |
| **Figma name** | `Text` (text styles `Body`, `Small`, `Caption`) |
| **Code name** | `Text` |
| **Storybook path** | `Components/Text` |

**Props / variants**
- `size`: `body` (default), `small` or `caption`, each the brand's `--font-size-*` and `--line-height-*` pair
- `tone`: `primary` (default), `secondary`, or `inherit` for text inside a coloured component
- `weight`: `body` (default) or `label`
- `truncate`: `true` for one line with an ellipsis, or a number of lines
- `as`: `p` (default), `span`, `div`, `strong`, `em`, `small`, `figcaption`, `li`, `dd` or `dt`
- Native attributes, `className`, `style` and `ref` pass through

**Required states**
- [x] default
- [x] truncated (one line, or clamped to n lines)

**Tokens consumed**
- `--font-family-base`, `--font-weight-body`, `--font-weight-label`, `--letter-spacing-body`
- `--font-size-body`, `--line-height-body`, `--font-size-small`, `--line-height-small`, `--font-size-caption`, `--line-height-caption`
- `--color-text-primary`, `--color-text-secondary` (no component tokens; they would only pass through)

**Accessibility**
- Primary and secondary text at every size are tested at 4.5:1 or more on the primary, secondary and tertiary surfaces, in all five brands, light and dark
- The size and the element are separate: pick `as` for meaning (`strong`, `em`) and `size`/`weight` for looks. `em` keeps its italics
- Truncated text stays whole in the page, so screen readers read all of it; sighted users only see the start, so show the full text somewhere too (a `title`, a Tooltip, a detail page)
- Sizes come from tokens in px/rem, so text scales with browser zoom (WCAG 1.4.4)

**Do**
- Use `body` for running text, `small` for supporting text, `caption` for the smallest labels.
- Use `tone="secondary"` to step text back; it still meets 4.5:1.
- Use `as="span"` inside a line, and `as="strong"` when the emphasis changes the meaning.

**Don't**
- Don't use Text for headings; that's Heading, which puts the text in the page outline.
- Don't truncate content people need to read in full, like an error or a price.
- Don't set colours on Text by hand; if a tone is missing, it's a token to add, not a one-off.

**Chromatic stories**
- `Default`, `Sizes`, `Emphasis`, `Truncated`, `DarkMode`

---

### TimePicker

| Field | Value |
|---|---|
| **Purpose** | One time of day: an appointment, a delivery slot, opening hours |
| **Figma name** | `TimePicker` |
| **Code name** | `TimePicker` |
| **Storybook path** | `Components/TimePicker` |

**Props / variants**
- `label` (required), `hint` (defaults to an example in the reader's format), `error`, `required`, `disabled`, `id`
- `value` + `onValueChange` (controlled, `"HH:mm"` or `null`) or `defaultValue`
- `min`, `max` (`"HH:mm"`), `step` in minutes (15 by default) for the list
- `locale`: decides 24-hour ("14.30", "14:30") or 12-hour ("2:30 PM") display; `name` submits `"HH:mm"`

**Required states**
- [x] empty, typed, picked from the list
- [x] list open with the nearest slot active; chosen slot filled
- [x] unreadable time, before `min`, after `max` (each with its own reason)
- [x] error, disabled

**Tokens consumed**
- `--color-surface-secondary`, `--color-accent`, `--color-accent-text`, `--color-text-on-accent`, `--space-inline-gap`, `--focus-ring-width`; Field, InputGroup, Input and Popover style the rest

**Accessibility**
- The input is a `combobox` controlling a `listbox`; the active option is followed with `aria-activedescendant`, so focus stays in the input
- Arrow Up / Down open the list at the nearest slot and move; Page Up / Down move an hour; Home / End; Enter picks; Escape closes
- Typing works in any common form ("1430", "14.30", "2pm", "9"); the time is read on Enter or blur
- Each list row is 44px tall

**Do**
- Set `step` to the slots you really offer, and `min` / `max` to the opening hours.
- Let the hint show the format people should type.

**Don't**
- Don't use TimePicker for a duration; use NumberInput with a unit.
- Don't force 24-hour or 12-hour; let `locale` decide.

**Chromatic stories**
- `Default`, `Danish`, `TwelveHour`, `OpeningHours`, `Error`, `Disabled`, `Open`, `DarkMode`

---

### ToggleButton

| Field | Value |
|---|---|
| **Purpose** | A button that stays on or off, like bold in an editor or a grid overlay |
| **Figma name** | `ToggleButton` |
| **Code name** | `ToggleButton` |
| **Storybook path** | `Components/ToggleButton` |

**Props / variants**
- `label` (required): what the toggle turns on; the same in both states
- `icon`: beside the label, or alone with `hideLabel`
- `hideLabel`: icon only, as a square (IconButton); `label` becomes the accessible name
- `pressed` + `onPressedChange` (controlled) or `defaultPressed` (uncontrolled)
- `size`: `md` or `sm`, for icon-only toggles
- `disabled`, `onClick` (runs first; `preventDefault()` cancels the toggle); native attributes and `ref` pass through

**Required states**
- [x] off (Button's `secondary`: outline)
- [x] on (Button's `primary`: filled)
- [x] hover while off (neutral surface, never the accent fill)
- [x] focus-visible (Button's ring)
- [x] disabled, off and on

**Tokens consumed**
- Button's and IconButton's tokens, plus `--color-surface-secondary` for the off hover

**Accessibility**
- Native `<button>` with `aria-pressed`; screen readers announce "toggle button, pressed / not pressed"
- The name never changes with the state; changing it would announce a different control
- On is a fill and off an outline, so the state doesn't rely on colour alone
- Keyboard: `Space` and `Enter` toggle

**Do**
- Use it for a setting that takes effect right away and stays: formatting, a view option, mute.
- Keep the label the same in both states: "Bold", not "Make bold" / "Remove bold".
- Group related toggles in an element with `role="group"` and an `aria-label`.

**Don't**
- Don't use a ToggleButton to pick one option from several; that's SegmentedControl.
- Don't use it for an action that happens once, like "Save"; that's Button.
- Don't use it for a setting in a form that's saved later; that's Switch or Checkbox.

**Chromatic stories**
- `Default`, `States`, `IconOnly`, `Controlled`, `DarkMode`

---

### VisuallyHidden

| Field | Value |
|---|---|
| **Purpose** | Text screen readers announce but sighted users don't see |
| **Figma name** | `VisuallyHidden` |
| **Code name** | `VisuallyHidden` |
| **Storybook path** | `Components/VisuallyHidden` |

**Props / variants**
- `as`: `span` (default, inline) or `div` (block)
- Native attributes, `className` and `ref` pass through

**Required states**
- [x] default (nothing visible; no interactive states)

**Tokens consumed**
- None

**Accessibility**
- Clipped to a 1px box with `clip-path: inset(50%)`, so it stays in the accessibility tree; `display: none` and `hidden` would remove it
- `white-space: nowrap` keeps screen readers from reading the clipped text one word at a time
- Not focusable. For a link that appears on focus, use `SkipLink`

**Do**
- Name an icon-only control with it when there's no visible label.
- Add context a sighted user gets from the layout, like "(opens in a new tab)" or which row a "Delete" button belongs to.
- Keep the hidden text short; it's read every time.

**Don't**
- Don't hide something sighted users need too; if it matters, show it.
- Don't put focusable content inside it: a keyboard user would land on something they can't see.
- Don't use it to hide text from screen readers; that's `aria-hidden`.

**Chromatic stories**
- `IconButtonLabel`, `LinkSuffix`, `DarkMode`

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
| **Internal** | `yes` |

Marked internal: it ships in the package because Drawer imports it, but it is excluded from agent-facing output (`llms.txt`, `llms-full.txt`, markdown twins) so an agent does not treat it as a component it may reach for.

---

### Drawer

| Field | Value |
|---|---|
| **Purpose** | Side-anchored slide-in panel for supplemental content or secondary navigation |
| **Figma name** | `Drawer` |
| **Code name** | `Drawer` |
| **Storybook path** | `Components/Drawer` |

---

### Popover

| Field | Value |
|---|---|
| **Purpose** | Content shown next to its trigger without blocking the page: a filter panel, a date picker, a short form |
| **Figma name** | `Popover` |
| **Code name** | `Popover` (+ `PopoverTrigger`, `PopoverContent`, `PopoverClose`, `PopoverAnchor`) |
| **Storybook path** | `Components/Popover` |

**Compound structure**
```tsx
<Popover>                                   {/* open / onOpenChange, or defaultOpen */}
  <PopoverTrigger asChild><Button variant="secondary">Filters</Button></PopoverTrigger>
  <PopoverContent title="Filters" showClose>
    …
    <PopoverClose asChild><Button>Apply</Button></PopoverClose>
  </PopoverContent>
</Popover>
```

**Props / variants**
- `Popover`: `open` + `onOpenChange`, or `defaultOpen`; `modal` (default `false`)
- `PopoverContent`: `title` (a heading that names it; otherwise pass `aria-label`), `showClose`, `showArrow`, and Radix positioning: `side`, `align`, `sideOffset` (8), `collisionPadding` (16)
- `PopoverAnchor`: position against something other than the trigger, such as a whole field

**Required states**
- [x] closed, open (fade and scale in; none under reduced motion)
- [x] with title and close button, with arrow
- [x] inside a ThemeScope (follows its brand and mode into the portal, decisions/0021)

**Tokens consumed**
- `--color-surface-primary`, `--border-width-interactive`, `--color-border-default`, `--border-radius-component`, `--shadow-dropdown` (the same surface as Select's dropdown)
- `--space-element-gap`, `--space-inline-gap`, `--font-family-base`, `--font-size-control`, `--line-height-control`, `--font-size-h5`, `--line-height-h5`, `--font-weight-heading`, `--color-text-primary`, `--duration-interaction`, `--easing-default`

**Accessibility**
- Radix Popover: a non-modal `role="dialog"`, named by `title` or `aria-label`
- The trigger gets `aria-expanded` and `aria-controls`
- Focus moves into the panel on open and back to the trigger on close; Escape and a click outside close it
- No z-index: like Select, it's portalled and mounts last, so it paints on top, including inside a Dialog

**Do**
- Use a Popover for something short that belongs to its trigger and can be dismissed without losing work.
- Give it a `title` when it holds a form or several controls.
- Put the confirming action in a `PopoverClose`, so applying also closes it.

**Don't**
- Don't use a Popover for a plain text hint; that's Tooltip.
- Don't use it for a list of actions; that's Menu.
- Don't put a long or important task in it; use Dialog or a page.

**Chromatic stories**
- `Default`, `FromIconButton`, `Open`, `DarkMode`

---

### HoverCard

| Field | Value |
|---|---|
| **Purpose** | A preview of what a link leads to: a person's profile, a page's summary |
| **Figma name** | `HoverCard` |
| **Code name** | `HoverCard` (+ `HoverCardTrigger`, `HoverCardContent`) |
| **Storybook path** | `Components/HoverCard` |

**Props / variants**
- `HoverCard`: `open` + `onOpenChange` or `defaultOpen`; `openDelay`, `closeDelay` in milliseconds (default from the tokens)
- `HoverCardTrigger`: wraps the link it previews; the link keeps its own role, name and click
- `HoverCardContent`: `aria-label` names the card; `side` (`bottom` by default), `align` (`start`), `sideOffset`

**Required states**
- [x] closed, opening (after the delay), open
- [x] open from the keyboard, focus inside the card
- [x] pointer moving from the link into the card (stays open)

**Tokens consumed**
- `--hover-card-open-delay` (500 ms), `--hover-card-close-delay` (300 ms), `--hover-card-width` (320 px); the surface, padding and motion are Popover's

**Accessibility**
- Built on Popover, not Radix HoverCard, which is for mouse users only: the card also opens when keyboard focus lands on the link
- Tab from the link moves into the card when it has links or buttons; Tab past the last one continues to what follows the link, and Shift+Tab goes back
- Escape closes it and keeps focus on the link; it stays open while the pointer is over it, and closes after a short grace time when the pointer leaves (WCAG 1.4.13)
- A touch doesn't open it, so tapping the link just follows it
- The link gets no popup semantics; the card is a named group, not a dialog

**Do**
- Repeat everything in the card at the link's destination; the card only saves a click.
- Keep it short: a name, a line or two, at most a couple of actions.

**Don't**
- Don't put the only way to do something in a hover card; touch users never see it.
- Don't put a hover card on a button that does something; it belongs on links to things.

**Chromatic stories**
- `Default`, `PagePreview`, `Danish`, `KeyboardOpen`, `DarkMode`

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

### Lightbox

| Field | Value |
|---|---|
| **Purpose** | Images large, one at a time, over the page: a product's photos, a portfolio piece |
| **Figma name** | `Lightbox` |
| **Code name** | `Lightbox` (+ `LightboxGallery`, `LightboxImage` type) |
| **Storybook path** | `Components/Lightbox` |

**Props / variants**
- `images`: `{ src, alt, caption?, width?, height?, thumbnail? }`; `alt` is required
- `open` + `onOpenChange`, `index` + `onIndexChange` (controlled)
- `title` (names the dialog, with the position: "Places 2 of 4"), `labels` (`previous`, `next`, `close`, `of`) for other languages
- `LightboxGallery`: thumbnails that open it at the one chosen

**Required states**
- [x] one image (no previous and next), several images, with and without captions
- [x] wide (arrows at the sides), narrow (arrows at the bottom)
- [x] thumbnail hover and focus

**Tokens consumed**
- `--color-surface-primary` (the whole screen, so the brand's tested contrast holds), `--color-text-primary`, `--color-text-secondary`, `--color-border-default`, plus type, spacing, focus and motion tokens; the buttons are IconButtons

**Accessibility**
- A modal dialog named by its title and position; focus starts on Close and stays inside
- Previous and Next buttons, Left and Right, Home and End, and a sideways swipe move through the images, wrapping at the ends so no button is ever disabled
- Each change is announced: "3 of 4: Skanderborg Lake at night"
- Escape or Close shuts it and focus returns to what opened it, such as the thumbnail
- Each thumbnail is a button named "Open <alt>"; the thumbnail image itself is decorative
- Images are fitted, never cropped, and keep their space while loading when `width` and `height` are given

**Do**
- Write `alt` for what the image shows, and put credits or places in `caption`.
- Pass a smaller `thumbnail` for galleries.
- Give `width` and `height`, so nothing jumps while images load.

**Don't**
- Don't use a Lightbox for content people need to act on; use a Dialog.
- Don't autoplay through images; people move at their own pace.

**Chromatic stories**
- `Gallery`, `Open`, `Single`, `Danish`, `DarkMode`

---

### Menu

| Field | Value |
|---|---|
| **Purpose** | Dropdown list of actions opened from a trigger: account menus, overflow ("more") menus, row actions |
| **Figma name** | `Menu` |
| **Code name** | `Menu` |
| **Storybook path** | `Composition/Menu` |

**Props / variants**
- `trigger`: the element that opens the menu, a single element that forwards its ref. Use `Button` with its functional default: `trigger={<Button variant="secondary">Actions</Button>}`
- `groups`: `{ label?: string; items: MenuItem[] }[]`. A separator is drawn between groups; one unlabelled group is a plain list
- Each item: `{ id, label, onSelect?, disabled?, variant?: 'default' | 'destructive', icon? }`. `destructive` is for deletes and other actions that can't be undone
- `align` (`start` default, `center`, `end`), `side` (`bottom` default)
- `open` / `defaultOpen` / `onOpenChange` for controlled or uncontrolled use
- Actions only: no checkbox or radio items and no submenus yet (deferred, see `docs/backlog.md`). For navigation between pages use `NavigationMenu`, not Menu

**Required states**
- [x] closed / open
- [x] highlighted item (pointer or arrow keys)
- [x] disabled item
- [x] destructive item, at rest and highlighted

**Tokens consumed**
- `--color-surface-primary`, `--color-surface-secondary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`
- `--color-feedback-error`, `--color-feedback-error-background`
- `--border-width-interactive`, `--border-width-default`, `--border-radius-component`, `--border-radius-interactive`, `--shadow-dropdown`
- `--font-family-base`, `--font-size-control`, `--line-height-control`, `--font-size-small`, `--line-height-label`, `--font-weight-label`
- `--space-tight-gap`, `--space-inline-gap`, `--space-compact-padding-y`, `--space-control-padding-x`, `--size-icon-sm`

**Accessibility**
- Built on Radix DropdownMenu: `role="menu"` / `menuitem`, the trigger gets `aria-haspopup` and `aria-expanded`
- Keyboard: `Enter`, `Space` or `ArrowDown` opens and focuses the first item; arrow keys move; typing jumps to a matching item; `Escape` closes and returns focus to the trigger
- An icon-only trigger needs an `aria-label` on the trigger itself
- No z-index (decisions/0007): the panel is portalled, so it layers correctly inside a Dialog or Drawer (`Menu.nesting.test.tsx`)

**Chromatic stories**
- `Default`, `Open`, `WithGroupLabelsAndIcons`, `Overflow`, `DarkMode`

---

### CommandPalette

| Field | Value |
|---|---|
| **Purpose** | Every action in an app, one search away: Ctrl+K or ⌘K, a few letters, Enter |
| **Figma name** | `CommandPalette` |
| **Code name** | `CommandPalette` (+ `useCommandPaletteShortcut`, `Command`, `CommandGroup` types) |
| **Storybook path** | `Components/CommandPalette` |

**Props / variants**
- `open` + `onOpenChange` (controlled); `useCommandPaletteShortcut(setOpen)` adds Ctrl+K / ⌘K
- `groups`: `{ label, commands }`; a command is `{ id, label, onSelect, description?, icon?, shortcut?, keywords?, disabled? }`
- `title` (dialog name, default "Command palette"), `placeholder` (search field name, default "Search commands"), `emptyMessage(text)`, `hint` (`null` hides the key hints)

**Required states**
- [x] open with everything, filtered (match in bold), nothing found
- [x] active command (band and bar), disabled command (struck through, readable)
- [x] groups, descriptions, icons, shortcuts

**Tokens consumed**
- `--size-dialog-md`, `--color-surface-primary`, `--color-border-default`, `--shadow-dropdown`, `--color-text-primary`, `--color-text-secondary`, plus type, spacing and motion tokens; the overlay is Dialog's and the options use Combobox's styles

**Accessibility**
- A modal dialog named by a hidden title; focus starts in the search field, which is a combobox over a listbox with labelled groups
- The top match is active, so Enter runs it; Up and Down move, wrap and skip disabled commands; the count ("4 commands", "No commands match …") is announced
- Enter closes the palette, returns focus to what was focused before, then runs the command; Escape closes it the same way
- Matching ignores case and accents and also searches `keywords` and descriptions
- Shortcuts are `aria-keyshortcuts`; the keycaps are hidden so they aren't read twice

**Do**
- Put every command somewhere visible in the app too; the palette is a shortcut, not the only door.
- Name commands as verbs ("New page", "Switch to dark mode") and add the words people might type as `keywords`.
- Show the Ctrl+K hint on the button that opens it.

**Don't**
- Don't use it for search results from your content; that's Search or Combobox.
- Don't run destructive commands straight from the palette; ask in an AlertDialog first.

**Chromatic stories**
- `Default`, `Open`, `Run`, `Danish`, `DarkMode`

---

### ContextMenu

| Field | Value |
|---|---|
| **Purpose** | The actions for one thing, opened where the pointer is: a file row, a card, a canvas |
| **Figma name** | `ContextMenu` |
| **Code name** | `ContextMenu` (+ `ContextMenuItem`, `ContextMenuGroup` types) |
| **Storybook path** | `Components/ContextMenu` |

**Props / variants**
- `children`: the one element that has the menu; made focusable (`tabIndex={0}`) unless it's a native control or sets its own
- `groups`: the same shape as Menu's, plus `shortcut` on an item: one key per entry, `['Ctrl', 'C']`
- `aria-label` (names the menu, e.g. "Actions for report.pdf"), `onOpenChange`, `disabled` (the browser's own menu comes back)

**Required states**
- [x] closed, open at the pointer, open from the keyboard
- [x] highlighted item, disabled item (quieter text, still 4.5:1), destructive item
- [x] groups with labels and separators, items with icons and shortcuts

**Tokens consumed**
- `--space-element-gap`, `--space-tight-gap`, `--color-text-secondary` (the shortcut column); the panel and items are Menu's, the keycaps Kbd's

**Accessibility**
- Built on Radix ContextMenu: `role="menu"` / `menuitem`, opened by right-click, a long press on touch, or Shift+F10 or the Menu key on the focused area
- From the keyboard, focus lands on the first item; after a right-click, on the menu, and the first arrow press moves to the first item
- Arrows move and skip disabled items, typing jumps to a label, Enter chooses, Escape closes; focus returns to the area
- Shortcuts are set as `aria-keyshortcuts` (`Control+C`); the keycaps are hidden from screen readers so they aren't read twice
- Non-modal, as Menu, so the rest of the page isn't hidden with `aria-hidden` while focusable

**Do**
- Put the same actions on a visible control too, like a "More" button with Menu and the same `groups`; right-click and long press aren't discoverable.
- Name the menu after its target: "Actions for report.pdf".
- Show the shortcut when the action has one, so the menu teaches it.

**Don't**
- Don't make a context menu the only way to reach an action.
- Don't replace the browser's menu on text people may want to copy, or on links.

**Chromatic stories**
- `FileRows`, `Canvas`, `Danish`, `Open`, `DarkMode`

---

### MobileNav

| Field | Value |
|---|---|
| **Purpose** | The bar at the bottom of a small screen with an app's main places |
| **Figma name** | `MobileNav` |
| **Code name** | `MobileNav` (+ `MobileNavItem` type) |
| **Storybook path** | `Components/MobileNav` |

**Props / variants**
- `items`: three to five `{ id, label, href, icon, badge?, badgeLabel? }`
- `currentHref`, `LinkComponent` (as NavigationMenu); `aria-label` (default "Main")
- `alwaysVisible`: keep it on wide screens; by default it hides from 1024px

**Required states**
- [x] current item (filled pill, heavier label), other items
- [x] badge (count, "99+" over 99), no badge
- [x] three to five items, light and dark

**Tokens consumed**
- `--color-surface-primary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`, `--color-accent-default`, `--color-accent-foreground` (current pill), `--color-feedback-error`, `--color-feedback-error-background`, `--color-feedback-error-border` (badge, as Badge's error style), `--size-touch-target`, `--size-icon-md`, `--z-sticky`, plus type, spacing and focus tokens

**Accessibility**
- A `nav` named "Main" with a list of links; each is named by its label, and a badge adds its count in brackets: "Messages (3 unread)"
- The current link has `aria-current="page"`, and a filled pill and heavier label, so it doesn't rely on colour
- Icons and the visible count are hidden; labels are always shown
- Every link is at least 44px tall; the bar clears the phone's home indicator (`safe-area-inset-bottom`)
- Hidden from 1024px up by CSS, so there's one "Main" navigation at a time with TopNav or SideNav

**Do**
- Keep it to three to five places people go often; put the rest in a "More" or profile page.
- Use short labels, one word where possible.
- Leave room at the bottom of the page so the bar doesn't cover the last content.

**Don't**
- Don't hide the labels; icons alone are ambiguous.
- Don't put actions in it (like "New post"); it's for places.

**Chromatic stories**
- `Default`, `ThreeItems`, `Danish`, `DarkMode`

---

### NavigationMenu

| Field | Value |
|---|---|
| **Purpose** | The site's header navigation: top-level links, plus groups that open a dropdown of links. Hidden below 1024px, where SideNav's drawer carries the same links (its `headerItems`) |
| **Figma name** | `NavigationMenu` |
| **Code name** | `NavigationMenu` |
| **Storybook path** | `Composition/NavigationMenu` |

**Props / variants**
- `items: NavItem[]` — each item is a link `{ id, label, href, icon? }` or a group `{ id, label, icon?, items: NavLink[] }`. Two levels at most. The types (`NavItem`, `NavLink`, `NavGroup`, `NavLinkComponent`) are exported from this component's folder and from `SideNav`'s
- `currentHref`: your router's current pathname. An exact match sets `aria-current="page"` and marks the link's group active
- `LinkComponent`: your router's Link (e.g. `next/link`), defaults to `<a>`. It must forward its ref and pass `aria-current`, `className` and `onClick` through
- `aria-label`: names the `<nav>` landmark, default "Main"
- **Hidden below 1024px** (`breakpoint.desktop`) by CSS. Pair it with `SideNav` and pass the same array as SideNav's `headerItems`, so the links move into the mobile drawer
- No mega-menu or rich content: a group is a simple list of links

**Required states**
- [x] default, hover, focus-visible
- [x] current link (`aria-current="page"`) and active group
- [x] group open

**Tokens consumed**
- `--z-dropdown` (the group dropdown isn't portalled, see Accessibility)
- `--color-surface-primary`, `--color-surface-secondary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`, `--color-border-focus`
- `--border-width-interactive`, `--border-radius-component`, `--border-radius-interactive`, `--shadow-dropdown`
- `--font-family-base`, `--font-size-control`, `--line-height-control`, `--font-weight-label`
- `--space-tight-gap`, `--space-inline-gap`, `--space-compact-padding-y`, `--space-control-padding-x`, `--size-touch-target`, `--size-icon-sm`

**Accessibility**
- Built on Radix NavigationMenu: a `<nav>` landmark, groups open from a real `<button>` with `aria-expanded`
- Keyboard: Tab moves between top-level items; `Enter`/`Space` opens a group and Tab moves into its links; `Escape` closes and returns focus to the trigger; arrow keys move between top-level items
- Hover also opens a group, after Radix's short delay
- Every top-level item is at least 44px tall (`--size-touch-target`)
- The dropdown renders inside its own item rather than in a portal, so it carries `--z-dropdown` to stay above later page content

**Chromatic stories**
- `Default`, `Open`, `WithIcons`, `NoCurrentPage`, `DarkMode` — snapshotted at 1280px, since the component is hidden below 1024px

---

### ThemeScope

| Field | Value |
|---|---|
| **Purpose** | Gives one part of a page its own brand, mode, or both; overlays opened inside it (Dialog, Drawer, AlertDialog, Menu, Select, Tooltip) take the same, although they render at the end of the page |
| **Figma name** | n/a (no visual of its own) |
| **Code name** | `ThemeScope` |
| **Storybook path** | `Composition/ThemeScope` |

**Props / variants**
- `brand?: 'portfolio'` — sets `data-brand`. Needs `styles/brands/portfolio-scoped.css` loaded, instead of `portfolio-light.css` and `portfolio-dark.css`. Left out, the part keeps the brand around it
- `mode?: 'light' | 'dark'` — sets `data-mode`. Left out, the part follows the mode around it
- Native `<div>` attributes pass through, and a ref reaches the `<div>` (decisions/0007)
- A scope inside another takes what it doesn't set from the outer one
- Toasts don't follow a scope: the viewport renders where `ToastProvider` is

**Required states**
- [x] brand, mode, both, neither; nested

**Tokens consumed**
- None of its own. It sets the attributes the brand and mode CSS select on, so every token inside resolves for that brand and mode

**Accessibility**
- A plain `<div>` with no role; it adds nothing to the accessibility tree
- Overlays keep their own focus, keyboard and layering behaviour: the scope's attributes go on the elements they already portal, so no wrapper is added (decisions/0021)

**Chromatic stories**
- `Default`, `MenuOpen`, `Nested`, `DarkMode`. Storybook loads the portfolio brand for the whole canvas, so these show the mode side only

---

### Accordion

| Field | Value |
|---|---|
| **Purpose** | Collapsible content sections with animated expand/collapse; supports single or multi-open modes |
| **Figma name** | `Accordion` |
| **Code name** | `Accordion` |
| **Storybook path** | `Patterns/Accordion` |

---

### Breadcrumb

| Field | Value |
|---|---|
| **Purpose** | Hierarchical page location trail; the last item is the current page (non-linked) |
| **Figma name** | `Breadcrumb` |
| **Code name** | `Breadcrumb` |
| **Storybook path** | `Patterns/Breadcrumb` |

**Props / variants**
- `LinkComponent`: optional component to render internal links with (e.g. `next/link` or a React Router `Link`). Defaults to a plain `<a>`.

---

### Carousel

| Field | Value |
|---|---|
| **Purpose** | A row of slides shown a few at a time, moved with buttons, dots, swipe or arrow keys |
| **Figma name** | `Carousel` |
| **Code name** | `Carousel` (+ `CarouselSlide`) |
| **Storybook path** | `Components/Carousel` |

**Compound structure**
```tsx
<Carousel label="Featured projects" perView={2}>
  <CarouselSlide>…any content: an image, a Card, a quote…</CarouselSlide>
</Carousel>
```

**Props / variants**
- `label` (required): names the carousel region
- `perView`: 1 (default), 2 or 3 slides at once; narrow screens can override `--carousel-per-view` in CSS
- `defaultIndex` (uncontrolled) or `index` + `onIndexChange` (controlled; the track scrolls to the prop)
- `autoplay`: rotate on its own, with `interval` in ms (defaults to `--carousel-autoplay-interval`, 6 s)
- `showDots`: position dots (default `true`)
- Native `section` attributes, `className` and `ref` pass through

**Required states**
- [x] first, middle and last position (Previous / Next disabled at the ends)
- [x] current dot (wider and accent-coloured)
- [x] focus-visible on the track, buttons and dots
- [x] rotating, paused by the button, waiting while hovered or focused
- [x] reduced motion (no rotation, the button offers Play; moves jump instead of scrolling smoothly)

**Tokens consumed**
- `--carousel-dot-size`, `--carousel-autoplay-interval`
- `--space-element-gap`, `--space-inline-gap`, `--color-accent-text`, `--color-border-strong`, `--border-radius-full`, `--size-touch-target`
- `--color-border-focus`, `--focus-ring-width`, `--focus-ring-offset`, `--duration-interaction`, `--easing-default`
- IconButton's tokens for the controls

**Accessibility**
- WAI-ARIA carousel pattern: a `<section>` with `aria-roledescription="carousel"` named by `label`; each slide a group with `aria-roledescription="slide"` and "n of N"
- Slides out of view are `inert`, so Tab and screen readers skip what can't be seen
- Previous / Next and the dots point at the track with `aria-controls`; the current dot has `aria-current`
- A polite status says "Slide n of N" after a user moves it; it's silent while rotating
- Rotation: the pause button comes first; rotation waits while the pointer or focus is inside, and never starts under reduced motion (WCAG 2.2.2)
- Keyboard: Tab to the track, then arrow keys move a slide (mirrored right-to-left); every control is a button
- Dots are 3:1 on the page in every brand and mode (tested), with a 44px target

**Do**
- Use a Carousel for a set of peers where seeing a few at a time is enough: projects, quotes, product images.
- Give every slide something worth seeing on its own; many people only see the first.
- Prefer `autoplay` off. If you turn it on, give each slide time to be read.

**Don't**
- Don't hide important content or the main call to action in a later slide.
- Don't use a Carousel for steps in a process; that's a Stepper.
- Don't put more than about seven slides in one; use a grid with a "show more".

**Chromatic stories**
- `Default`, `ThreePerView`, `Autoplay`, `NoDots`, `DarkMode`

---

### DataTable

| Field | Value |
|---|---|
| **Purpose** | Sortable, filterable, paginated table for structured datasets |
| **Figma name** | `DataTable` |
| **Code name** | `DataTable` |
| **Storybook path** | `Patterns/DataTable` |

---

### EmptyState

| Field | Value |
|---|---|
| **Purpose** | Placeholder for zero-content states — icon, heading, supporting text, and an optional action |
| **Figma name** | `EmptyState` |
| **Code name** | `EmptyState` |
| **Storybook path** | `Patterns/EmptyState` |

---

### FormLayout

| Field | Value |
|---|---|
| **Purpose** | The frame of a form: spacing, sections, rows, actions, and an error summary after a failed submit |
| **Figma name** | `FormLayout` |
| **Code name** | `FormLayout` (+ `FormSection`, `FormRow`, `FormActions`, `FormErrorSummary`) |
| **Storybook path** | `Components/FormLayout` |

**Compound structure**
```tsx
<FormLayout onSubmit={…} noValidate>
  <FormErrorSummary errors={errors} />          {/* nothing until there are errors */}
  <FormSection title="Contact details" description="…">
    <FormRow>                                   {/* side by side when there's room */}
      <Input label="First name" /> <Input label="Last name" />
    </FormRow>
  </FormSection>
  <FormActions>
    <Button variant="secondary">Back</Button>
    <Button type="submit">Continue</Button>     {/* main action last */}
  </FormActions>
</FormLayout>
```

**Props / variants**
- `FormLayout`: `as` (`form` default, or `div`); native form attributes
- `FormSection`: `title` (required), `description`, `headingLevel` (2 default, 3 or 4)
- `FormRow`: `columns` (2 default, or 3); stacks in a container under 26rem
- `FormActions`: end-aligned; in a narrow container, full-width and stacked with the main action on top
- `FormErrorSummary`: `errors` (`{ id, message }[]`), `title` (defaults to "There is a problem" / "There are N problems"), `focusOnChange` (default `true`)

**Required states**
- [x] wide and narrow container (container queries, not the viewport)
- [x] error summary shown, focused; link moves focus to its field
- [x] no errors (the summary renders nothing)

**Tokens consumed**
- `--space-component-gap`, `--space-element-gap`, `--space-inline-gap`, `--space-tight-gap`, `--size-container-text`
- `--font-family-base`, `--font-size-h5`, `--line-height-h5`, `--font-weight-heading`, `--font-size-small`, `--line-height-small`
- `--color-text-primary`, `--color-text-secondary`, `--color-feedback-error`, `--color-feedback-error-background`, `--color-feedback-error-foreground`
- `--border-width-thick`, `--border-radius-component`, `--size-icon-md`, `--color-border-focus`, `--focus-ring-width`, `--focus-ring-offset`

**Accessibility**
- Each FormSection is a region named by its heading, so screen-reader users can jump between parts
- The error summary (GOV.UK pattern) takes focus after a failed submit, is named by its count, and links to each field; the link moves focus to the field, not just the scroll position
- Summary text is 4.5:1 on its background in every brand and mode (tested)
- Show the same message at the field (`error` on Input / Field) as in the summary

**Do**
- Validate on submit, then show the summary and the field errors together.
- Give every field an `id` so the summary can link to it.
- Keep one column for most fields; use FormRow only for short fields that belong together.

**Don't**
- Don't disable the submit button until the form is valid; let people submit and tell them what's missing.
- Don't put the main action first in FormActions; it goes last (and on top when stacked).
- Don't use FormSection for a single question with options; that's Field with `group`.

**Chromatic stories**
- `Default`, `Validating`, `Narrow`, `DarkMode`

---

### Pagination

| Field | Value |
|---|---|
| **Purpose** | Page navigation controls for multi-page data sets; exposes current page and total page count |
| **Figma name** | `Pagination` |
| **Code name** | `Pagination` |
| **Storybook path** | `Patterns/Pagination` |

---

### SideNav

| Field | Value |
|---|---|
| **Purpose** | Section navigation: inline beside the content (240px wide) from 1024px up; below that, in a left Drawer opened by `SideNavTrigger`, which hides itself from 1024px up. Wrap both in `SideNavProvider` |
| **Figma name** | `SideNav` |
| **Code name** | `SideNav` (+ `SideNavProvider`, `SideNavTrigger`) |
| **Storybook path** | `Patterns/SideNav` |

**Compound structure**
```tsx
<SideNavProvider>                {/* holds the drawer's open state; wraps header and nav */}
  <SkipLink />
  <header>
    <SideNavTrigger />           {/* hamburger; hidden from 1024px up */}
    <NavigationMenu items={headerItems} currentHref={pathname} />
  </header>
  <SideNav items={sectionItems} headerItems={headerItems} currentHref={pathname} />
  <main id="main-content">…</main>
</SideNavProvider>
```
`SideNav` and `SideNavTrigger` throw if rendered outside `SideNavProvider`.

**Props / variants**
- `items: NavItem[]` — links `{ id, label, href, icon? }` and groups `{ id, label, icon?, items: NavLink[] }`, two levels at most. Groups are collapsible sections
- `headerItems`: the same array you give `NavigationMenu`. Rendered only in the drawer, above `items` with a separator, so header links stay reachable on mobile
- `currentHref`: your router's pathname. An exact match sets `aria-current="page"`; the group holding it starts open. A change of `currentHref` also closes the drawer
- `LinkComponent`: your router's Link, defaults to `<a>`. It must pass `aria-current`, `className` and `onClick` through, and forward its ref (the collapsed rail's tooltips need it)
- `layout`: `sidebar` (default) or `drawer-only` — nothing inline at desktop width, for a site whose desktop navigation is only the header
- `collapsed`: icon rail, labels in tooltips, inline only. Controlled, with no built-in toggle: drive it from your own Button. Needs an `icon` on every item, including links inside groups; without one it warns in development and renders expanded
- `aria-label`: the inline `<nav>`'s name, default "Section". `drawerTitle`: the drawer's heading, default "Navigation"
- `SideNavTrigger`: `aria-label` (default "Open navigation"), `className`
- **The switch is 1024px** (`breakpoint.desktop`): CSS shows the inline nav and hides the trigger from there up. If the viewport grows past it while the drawer is open, the drawer closes

**Required states**
- [x] expanded (inline), collapsed rail (inline), drawer (below 1024px)
- [x] current link, active group, group open / closed
- [x] hover, focus-visible

**Tokens consumed**
- `--side-nav-width` (240px, the expanded inline width)
- `--color-surface-secondary`, `--color-border-default`, `--color-text-primary`, `--color-text-secondary`, `--color-border-focus`
- `--border-width-default`, `--border-radius-interactive`, `--font-family-base`, `--font-size-control`, `--line-height-control`, `--font-weight-label`
- `--space-tight-gap`, `--space-inline-gap`, `--space-control-padding-x`, `--size-touch-target`, `--size-icon-sm`

**Accessibility**
- Semantic elements: `<nav>` landmarks (inline and in the drawer), links, native `<button aria-expanded aria-controls>` for groups
- The trigger has `aria-expanded` and `aria-controls` pointing at the drawer's `<nav>`
- Opening the drawer moves focus to its first link; Escape or the close button closes it and returns focus to the trigger (`SideNav.drawer.test.tsx`)
- Choosing a link in the drawer closes it
- Every link and toggle is at least 44px tall; in the collapsed rail each label stays in the DOM as the accessible name

**Chromatic stories**
- `Default`, `WithIcons`, `Collapsed`, `MobileDrawer` (375px), `DrawerOnly` and `PageShell` (375px and 1280px), `CollapsedWithoutIcons`, `DarkMode`

---

### Stepper

| Field | Value |
|---|---|
| **Purpose** | Where someone is in a process with a fixed order: checkout, sign-up, an application |
| **Figma name** | `Stepper` |
| **Code name** | `Stepper` (+ `StepperStep` type) |
| **Storybook path** | `Components/Stepper` |

**Props / variants**
- `steps`: `{ id, label, description?, error?, href? }`
- `current`: index of the current step from 0; earlier steps are done, later ones still to come; `steps.length` when all are done
- `onStepClick(index)`: finished steps become buttons back to them (or give a step an `href` for a link)
- `orientation`: `horizontal` (default) or `vertical`; `aria-label` (default "Progress"); `statusLabels` to translate the hidden state words

**Required states**
- [x] done (filled, tick), current (thick accent ring, bold label), still to come (outline, quieter label), needs attention (warning, red description)
- [x] finished steps as buttons or links, with hover and focus
- [x] horizontal, vertical, narrow horizontal (only the current label shows)

**Tokens consumed**
- `--stepper-indicator-size` (32 px), `--stepper-connector-width` (4 px); `--color-accent-default`, `--color-accent-foreground`, `--color-accent-text`, `--color-border-strong`, `--color-feedback-error`, `--color-text-primary`, `--color-text-secondary`, `--color-surface-primary`, plus type, spacing and focus tokens

**Accessibility**
- An ordered list named "Progress" (or your `aria-label`); the current step has `aria-current="step"`
- Each step's state is in words, hidden visually: "Address (Completed)", "Payment (Current step)", so nothing relies on colour, ticks or numbers; the circles are `aria-hidden`
- Only reached steps can be revisited; upcoming steps are plain text, never disabled buttons
- When narrow, the other labels are hidden visually but stay in the accessibility tree
- Not a navigation landmark: it shows progress, and going back is a convenience

**Do**
- Keep labels to one or two words, and the number of steps small (three to six).
- Mark a finished step with `error` and say what's missing in its description.
- Let people go back to finished steps, and keep what they entered.

**Don't**
- Don't use a Stepper for steps people can do in any order; use Tabs or a checklist.
- Don't make upcoming steps clickable to skip ahead.

**Chromatic stories**
- `Default`, `GoBack`, `WithError`, `Vertical`, `Narrow`, `Danish`, `DarkMode`

---

### Table

| Field | Value |
|---|---|
| **Purpose** | Static data table with semantic header, body, and row structure |
| **Figma name** | `Table` |
| **Code name** | `Table` |
| **Storybook path** | `Patterns/Table` |

---

### TableOfContents

| Field | Value |
|---|---|
| **Purpose** | The sections of a long page as links, with the one being read marked: docs, articles, policies |
| **Figma name** | `TableOfContents` |
| **Code name** | `TableOfContents` (+ `headingsToItems`, `TableOfContentsItem` type) |
| **Storybook path** | `Components/TableOfContents` |

**Props / variants**
- `items`: `{ id, label, children? }`, where `id` is the target heading's id; `headingsToItems(element, 'h2, h3')` builds them from the page
- `aria-label` (default "On this page"); `title` (shown above, defaults to the label; `null` for none)
- `offset` (px below the top where a heading counts as reached, default 96), `root` (a scrolling container instead of the page)
- `activeId` to set the current section yourself; `onActiveChange(id)`

**Required states**
- [x] no section reached yet, a section current, a nested section current
- [x] link hover and focus
- [x] the end of the page, where a short last section still becomes current

**Tokens consumed**
- `--color-border-default` (track), `--color-accent-text` (current bar), `--color-text-primary`, `--color-text-secondary`, `--border-width-interactive`, plus type, spacing and focus tokens

**Accessibility**
- A `nav` landmark named "On this page", with a nested list of ordinary in-page links
- The current link has `aria-current="location"`; it's also darker, heavier and has a bar, so it doesn't rely on colour
- The visible title is hidden from screen readers, which hear the nav's name instead of hearing it twice
- A click marks the link straight away; native in-page links move focus to the target

**Do**
- Give every heading it lists an id, and keep labels the same as the headings.
- Set `offset` to the height of a sticky header, so the right section is marked.
- Use it for pages long enough to need it: four sections or more.

**Don't**
- Don't nest deeper than two levels.
- Don't use it for site navigation; that's SideNav or NavigationMenu.

**Chromatic stories**
- `Default`, `FromHeadings`, `Danish`, `DarkMode`

---

### Toolbar

| Field | Value |
|---|---|
| **Purpose** | A row of controls for one area: the formatting buttons over an editor, the actions over a table or canvas |
| **Figma name** | `Toolbar` |
| **Code name** | `Toolbar` (+ `ToolbarSeparator`, `ToolbarSpacer`) |
| **Storybook path** | `Components/Toolbar` |

**Props / variants**
- `aria-label` (required): names the toolbar, e.g. "Text formatting"
- `orientation`: `horizontal` (default) or `vertical`
- Children: Buttons, ToggleButtons, IconButtons, Menu triggers, a short input; `ToolbarSeparator` between groups; `ToolbarSpacer` pushes what follows to the end

**Required states**
- [x] horizontal, vertical, wrapping when narrow
- [x] pressed toggles, disabled controls (skipped by the arrow keys)
- [x] keyboard focus moving inside it; a Menu opened from it

**Tokens consumed**
- `--space-tight-gap`, `--space-inline-gap`, `--border-width-default`, `--border-radius-component`, `--color-border-default`, `--color-surface-primary`; the controls and the separator (Divider) style themselves

**Accessibility**
- The WAI-ARIA toolbar: `role="toolbar"` with a name; `aria-orientation="vertical"` when vertical
- One Tab stop for the whole toolbar (roving tabindex); Left and Right (Up and Down when vertical) move between controls, wrap at the ends and skip disabled ones; Home and End jump to the first and last
- Tab back in returns to the control last used; a click also makes that control the current one
- A text field keeps its arrow keys for the caret, and keys inside a Menu opened from the toolbar stay in the menu
- The separator is a real `role="separator"` across the toolbar's direction

**Do**
- Use ToggleButtons for on/off formatting, so `aria-pressed` says the state.
- Group related controls with separators, and name the toolbar after what it acts on.
- Keep the main action at the end with a spacer before it.

**Don't**
- Don't put a SegmentedControl or Tabs inside; they have their own arrow keys. Use ToggleButtons instead.
- Don't use a toolbar for page navigation; that's a nav with links.
- Don't hide controls a keyboard user can't reach another way when the toolbar wraps or shrinks.

**Chromatic stories**
- `Default`, `Vertical`, `Danish`, `Keyboard`, `DarkMode`

---

### TopNav

| Field | Value |
|---|---|
| **Purpose** | The bar across the top of a site or app: brand, main navigation, actions |
| **Figma name** | `TopNav` |
| **Code name** | `TopNav` |
| **Storybook path** | `Components/TopNav` |

**Props / variants**
- `brand` (required): the logo or name, usually a link home
- `items` (required): the same `NavItem[]` as NavigationMenu, links and groups of links; `currentHref`, `LinkComponent`
- `actions`: search, a Command Palette button, the account menu
- `sticky`; `navLabel` (both navigations' name and the drawer heading, default "Main"); `menuLabel` (default "Menu")

**Required states**
- [x] wide: NavigationMenu with the current page marked, a group open
- [x] narrow: the Menu button, the drawer open with the current link marked
- [x] sticky

**Tokens consumed**
- `--color-surface-primary`, `--color-border-default`, `--border-width-default`, `--size-touch-target`, `--z-sticky`, plus text, type, spacing and focus tokens; the navigation is NavigationMenu and the small-screen menu a Drawer

**Accessibility**
- A `<header>` (the banner landmark when it's the page's top header)
- From 1024px up, NavigationMenu is the "Main" navigation; below it, a Menu button opens a Drawer with the same links, so there's one list of items and one "Main" navigation on the page at a time
- The current link has `aria-current="page"` in both; groups become labelled lists in the drawer
- Following a link in the drawer closes it, so the new page isn't covered
- CSS decides which shows, so there's no flash before the page is interactive

**Do**
- Keep the main navigation to about five items; put the rest in groups or the footer.
- Put the same `actions` in reach on small screens; they stay in the bar.
- Use `sticky` on long pages where people need the navigation often.

**Don't**
- Don't use TopNav and SideNav's header items for the same links; pick one place.
- Don't hide primary actions behind the Menu button on small screens.

**Chromatic stories**
- `Default`, `WithButton`, `Narrow`, `Danish`, `DarkMode`

---

### Tabs

| Field | Value |
|---|---|
| **Purpose** | Segmented view switcher with full keyboard navigation; built on Radix Tabs |
| **Figma name** | `Tabs` |
| **Code name** | `Tabs` |
| **Storybook path** | `Patterns/Tabs` |

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
