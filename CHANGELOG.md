# @amezquita/design-system

## 1.6.5

### Patch Changes

- ff5ad14: A disabled Button no longer reacts to hover. The variants' `:hover` rules had the same specificity as `.button:disabled` and came later in the file, so a disabled secondary button turned the accent colour under the pointer, as if it could be pressed. Every hover rule now skips `:disabled` and `.button--disabled`, which also covers a loading Button (natively disabled).

## 1.6.4

### Patch Changes

- 6622526: ContextMenu opens from the keyboard on macOS. Shift+F10 and the Menu key relied on the browser turning them into a `contextmenu` event, which Windows and Linux do and macOS doesn't, so a Mac keyboard user had no way to open the menu. The trigger now handles both keys itself on every platform, opening the menu at the area's bottom-left corner with focus on the first item.

## 1.6.3

### Patch Changes

- 62cc545: Table: an overflowing table is a keyboard-reachable scroll region from its first frame. The wrapper measured its overflow in `useEffect`, so it was painted once as a scrolling box without `tabIndex`, `role="region"` or a name. Under React 19.3 the axe check (`scrollable-region-focusable`) landed in that frame. It now measures in `useLayoutEffect`, before paint. No API or token changes.

## 1.6.2

### Patch Changes

- 2a7059d: Overlays open above sticky headers. Dialog, Drawer, AlertDialog, Select, Popover, HoverCard, Menu, ContextMenu, CommandPalette and Lightbox had no z-index (decisions/0007), so anything on the page with one, such as TopNav's or MobileNav's `--z-sticky`, or a site's own sticky header, painted over them: a Drawer's title and Close button sat under the header. They now share one layer, `--z-overlay` (300), above the page's sticky layer; equal values tie, so the overlay opened last still paints on top, as before (decisions/0027). `z-overlay` is no longer deprecated.

## 1.6.1

### Patch Changes

- a39e9fa: Chart's types reach consumers: `@types/d3-scale` and `@types/d3-shape` move from devDependencies to dependencies. The package ships Chart's TypeScript source, which imports `d3-scale` and `d3-shape`, so a consumer's strict typecheck (`noImplicitAny`) failed on Chart in 1.6.0 unless it installed the types itself. Checked by installing the packed package into the docs site without its own copies: `tsc --noEmit` passes.

## 1.6.0

### Minor Changes

- 09177a6: New `Chart` pattern: line (with an optional area) and grouped bar charts drawn as SVG from tokens. Series take six new semantic tokens, `color-chart-1` to `color-chart-6`, in a fixed order, each tested at 3:1 on both surfaces in every brand and mode, and each series also has its own line style and marker shape. The plot is a focusable chart group with a summary; arrow keys move between points and series and read each one aloud, and "Show as table" shows the same data as a Table. Adds `d3-scale` 4.0.2 and `d3-shape` 3.2.0 for scales and paths (ADR 0026).
- 51f72ef: New `ChatComposer` pattern: where a message is written and sent. The field grows with the text up to `maxRows`, then scrolls. Enter sends the trimmed text and Shift + Enter adds a line, and an input method's Enter (`isComposing`) never sends. Send is disabled while the message is blank; with `status="streaming"` it becomes Stop (`onStop`) and Enter keeps the draft. Focus stays in the field after sending. A hint names the keys as keycaps and describes the field; `actions` and `attachments` take an Attach button and Tags. No new tokens.
- cdd7a6d: New `ChatMessage` pattern: one message in a conversation. `role` sets the layout: the user's words in a bubble on the end side, the assistant's as plain text in a reading column on the start side, system notes small and centred. Each message is an `article` named by its `author` and `timestamp`, so screen readers can move message by message; `continued` hides the name, time and avatar from sight for a follow-up but keeps them read out. `status="streaming"` marks the message busy and shows a typing indicator until text arrives (still under reduced motion), `error` describes a failed message, and `actions` holds Copy or Retry. No new tokens.
- 1ddb69a: New `MessageList` pattern: a conversation's messages in a scrolling list. It follows the newest message while you're at the bottom, including a reply that streams in; scroll up and it stays put, with a button that counts new messages and takes you back. Your own message always brings you back down. It's a WAI-ARIA feed: articles know their position, Page Up and Page Down move between them, and each finished reply is read aloud once through a polite status region (not while streaming, not history, not your own). No new tokens.
- c6267f5: New `PromptForm` pattern: questions an assistant asks before it goes on. One to four questions, each a set of SelectableCards (one or several) with "Other" for an answer in words. Send is never disabled: an unanswered question says what's missing and the first problem gets focus. Once sent or skipped, the form becomes a summary of question and answer that takes focus, and `answers` renders that summary for a conversation's history. No new tokens.
- 72566bd: New `ToolCall` pattern: a tool an assistant used or wants to use. The summary names the call (`title`), the tool (`name`, monospace), its status in words with an icon of its own shape (waiting, running, done, failed, needs approval, denied) and how long it took. Input and output show as JSON or text in CodeBlocks behind a Collapsible. A call with `status="awaiting-approval"` asks "Allow this?" with Allow and Deny. Running calls are `aria-busy`, and the spinning icon stops under reduced motion. No new tokens.
- 102e54b: New `TreeView` pattern: nested items that open and close, on the WAI-ARIA tree pattern. One Tab stop; Down and Up move through visible rows, Right opens a branch then moves in, Left closes then moves to the parent, Home and End, `*` to open siblings, and typing to jump. Each item is named by its own label, not its children's. `selectionMode` is `none` (rows are activated with `onAction`), `single` or `multiple` (a tick per row); selected rows get a bar and a heavier label as well as a fill. Rows are dense with a mouse and 44px on touch. No new tokens.

### Patch Changes

- 23f9e8a: Checkboxes stay square in round brands. Checkbox, SelectableCard's `multiple` indicator and MultiSelect's option mark took the brand's interactive radius whole, so demo-soft's pill and demo-cool's 12px made them circles, indistinguishable from radios. Their corner is now capped at a quarter of the box; square brands (base, portfolio, demo-warm) look the same as before. No new tokens.

## 1.5.0

### Minor Changes

- 969300f: New `AppShell` pattern: the frame of an app's pages. It places a SkipLink, the `header` (usually TopNav), a `sidebar` (usually SideNav), `main`, an optional named `aside`, a `footer` and a `bottomNav` (usually MobileNav) in the right landmarks: one column below 1024px, side by side from 1024px. A sticky sidebar starts below a sticky header, and the page leaves room for a fixed bottom bar; both heights are measured, so they stay right when the bars wrap or hide. Adds the `app-shell-aside-width` component token.
- 050f713: New `AspectRatio` primitive: keeps an image, video, picture or embed at a fixed ratio (`1/1`, `4/3`, `3/2`, `16/9`, `21/9`, `3/4`, `9/16`, or any number) as the width changes, and holds the space on the secondary surface before the media loads, so the page doesn't jump. `fit` chooses `cover` or `contain`; `rounded` uses the brand's image radius.
- 0a124ba: Add `styles/brands/base-scoped.css`: the base theme under `[data-brand="base"]`, so a part of a page that wears another brand can go back to base with `<ThemeScope brand="base">`. `ThemeScope`'s `brand` type now includes `'base'`. Tokens a brand adds that base lacks are reset inside a base part, as on a base page (ADR 0023, 2026-10-13 amendment).
- 4afb9fd: New `Blockquote` primitive: a quotation with an optional `attribution` and `source`, which render outside the quote in a `figcaption` (the source in a `cite`), as HTML intends. `size="pull"` sets a short quote large in the heading face.
- 89e3fdb: New `ButtonGroup` primitive: related actions kept together in a `role="group"`. Spaced by default; `attached` joins Buttons, IconButtons or ToggleButtons into one shape, sharing edges and keeping round corners only at the ends, in any brand's button shape. Horizontal or vertical. No new tokens.
- d1d3bc2: New `Calendar` primitive: a month of days to choose one date or a range (`mode="range"`), on the WAI-ARIA date grid. One Tab stop; arrows, Home / End and Page Up / Down (Shift for years) move; Enter or Space chooses. `min`, `max` and `isDateDisabled` mark unavailable days, which stay reachable and are announced. Names and the first weekday come from `locale` (Monday in Danish), with optional ISO week numbers. Days take the brand's button shape. Adds dependency-free date helpers in `lib/date`. No new tokens.
- e4f18ab: Card: new `card-border-color` token (the default border in base) and Card now rests on `shadow-card`, which every brand defined but nothing used. demo-soft sets `card-border-color` to transparent, so its cards get their edge from the soft shadow in light and their lighter fill in dark. In base, demo-cool and portfolio, cards gain the faint 1px shadow their `shadow-card` already described; demo-warm's is `none`. Ghost cards stay flat.
- 933967b: New `Carousel` pattern (with `CarouselSlide`): slides shown one to three at a time on a CSS scroll-snap track, so swipe and trackpads work natively. Follows the WAI-ARIA carousel pattern: a named region, "n of N" slides, out-of-view slides `inert`, Previous / Next and position dots, arrow keys on the track, and a polite "Slide n of N" status after a user move. Optional `autoplay` puts a pause button first, waits while hovered or focused, and never rotates under reduced motion. Adds two component tokens: `carousel-dot-size` and `carousel-autoplay-interval`.
- 4afb9fd: New `Citation` primitive: a small link from a claim to its source, as a numbered marker (`index`) or a source chip (`source`). Its name reads "Source 1: <title>", with the visible text inside it for speech input; `external` opens a new tab safely and says so.
- 5a7cde9: New `CodeBlock` primitive: code in the monospace face inside a `figure` named by its `filename` or `language`, with a Copy button that confirms "Copied" and announces it, optional `lineNumbers` (not read out, not selectable) and `highlight`ed lines (a `<mark>` with a bar). Long lines scroll sideways in a keyboard-reachable ScrollArea, or `wrap`. No syntax colouring yet.
- 4e8499f: New `Collapsible` primitive: one section that shows and hides behind a button, following the WAI-ARIA disclosure pattern (`aria-expanded`, `aria-controls`). Controlled or uncontrolled; `variant="block"` is a full-width row, `inline` is a "Show more" text button; `headingLevel` puts a block section in the page outline. Closed content is out of the tab order and the accessibility tree; the height animates without measuring and is instant for reduced motion. No new dependency.
- 8ae0180: New `Combobox` primitive: one value from a long list, found by typing. It follows the WAI-ARIA combobox with list autocomplete. Typing filters the list and puts the match in bold; Arrow keys move through it, skipping unavailable options; Enter picks; Escape closes, then clears. The result count is announced as it changes. Matching ignores case and accents, and starts of words rank first. Options can carry a description, and `allowCustom` keeps typed text. `onInputChange`, `loading` and `filter={false}` support options fetched from a server. Adds `lib/match` helpers. TimePicker's active option now uses the same straight bar, which stays straight in round brands like demo-soft.
- 38991ed: New `CommandPalette` composition (+ `useCommandPaletteShortcut`): every action one search away with Ctrl+K or ⌘K. It's a modal dialog on Radix Dialog with a combobox over a grouped listbox. The top match is ready for Enter, the arrow keys wrap and skip disabled commands, and the result count is announced. Matching ignores case and accents and searches keywords. Closing returns focus to what had it before, then runs the command. Shortcuts show as keycaps and are set as `aria-keyshortcuts`.
- 2248698: New `ContextMenu` composition on Radix ContextMenu (adds `@radix-ui/react-context-menu` 2.3.7, the release that shares Menu's own Radix menu version, so nothing else is added). It opens on right-click, a long press, or Shift+F10 and the Menu key on the focused area, which it makes focusable. It takes Menu's `groups` and look, plus keyboard shortcuts shown as keycaps and set as `aria-keyshortcuts`. `Menu`'s disabled items now keep readable text (secondary colour, 4.5:1) instead of fading to the disabled opacity.
- 2404a69: New `DatePicker` primitive: a date typed in the reader's own format (order and separators from `locale`; ISO and two-digit years accepted) or picked from Calendar in a Popover. Unreadable, out-of-range and unavailable dates get a reason in words; the format is the default hint; Alt + Arrow Down opens the calendar; `name` submits `yyyy-mm-dd`. Also fixes Calendar's unavailable days, which weren't struck through (the line-through didn't reach the number). No new tokens.
- 4ca59ce: New `DateRangePicker` primitive: a start and an end date, typed in the reader's format or picked with Calendar's range mode in a Popover. It reports a range only when both ends are valid, and refuses an end before the start, dates outside `min` / `max`, and ranges that cross an unavailable day, naming the day. A fieldset with the label as legend; each field has its own name and hears the reason itself. `name` submits both ends as `yyyy-mm-dd`. No new tokens.
- 26bcfd8: New `DescriptionList` primitive: labelled values in a `dl`, from an `items` array of `{ term, description }` (several values per term become several `dd`s). `layout="inline"` puts term and value side by side once the list is 30rem wide and stacks them below that, by container query; `stacked` always stacks; `divided` draws lines between pairs.
- 1688b9e: New `Divider` primitive: a horizontal or vertical line between groups of content. It renders `role="separator"` (with `aria-orientation` when vertical), or `role="none"` with `decorative`. It uses `color-border-default` and `border-width-default`, so demo-warm's divider is 2px like its other borders, and it's drawn as a border so it stays visible in forced-colors mode.
- 848d8c2: New `Field` primitive: a label, hint and error for any control, wired the way Input wires its own. It passes `id`, `aria-describedby`, `aria-invalid`, `required` and `disabled` to a single control without overriding what the control sets, and `group` renders a `<fieldset>` with a `<legend>` for radios or a SegmentedControl. `Select` now reads the Field it sits in through `useField()`: inside a Field it takes its name from the label, so `aria-label` becomes optional, and an error gives its trigger `aria-invalid` and the same red edge as Input. No new tokens.
- 0480d01: New `FileUpload` primitive: pick files with a real (visually hidden) file input or drag them in. Type, size and count limits turn files away with a reason each; chosen files are listed with their size and a remove button named after the file, and focus moves sensibly after removing. A polite status announces what was added, removed or turned away. Field's label now has an id (`<id>-label`) so controls can point at it. No new tokens.
- 0f39b9f: New `FormLayout` pattern with `FormSection`, `FormRow`, `FormActions` and `FormErrorSummary`. Sections are regions named by their headings; rows sit side by side when the container has room (container queries) and stack when it doesn't; actions end-aligned, stacking full-width with the main action on top in a narrow form. `FormErrorSummary` follows the GOV.UK pattern: it takes focus after a failed submit, is named by its count, and each link moves focus to its field. No new tokens.
- b3c433b: New `Grid` primitive, with `GridItem`: lays items out in rows and columns with a gap from the brand's spacing roles. Set `columns` as a number or per breakpoint (`{ base: 1, tablet: 2, desktop: 4 }`), or `minItemWidth` (`sm`, `md`, `lg`) for as many columns as fit in any container. `GridItem` spans columns or the full row, per breakpoint too. As a `ul` or `ol` it keeps `role="list"`. Adds the `grid-min-item-sm/md/lg` component tokens.
- e38a4bc: New `HoverCard` composition: a preview of what a link leads to. It's built on Popover rather than Radix HoverCard, so it isn't mouse-only. It opens after a delay on hover or keyboard focus, and Tab moves into the card and on past it. Escape closes it, and it stays open while the pointer is over it (WCAG 1.4.13). A touch doesn't open it. Adds three component tokens: `hover-card-open-delay`, `hover-card-close-delay` and `hover-card-width`.
- 5a5cce7: New `IconButton` primitive: an action shown only as an icon. It's built on Button, so variants, focus, `loading` and `disabled` behave the same; `ghost` is the default. `label` is required and becomes the accessible name. `md` is a 44px square; `sm` draws a 28px square with a 44px hit area. No new tokens.
- 98dcd5a: New `Icon` primitive: a Phosphor icon (`icon={BellIcon}`) at the brand's icon sizes (`xs`–`xl`) and colours (`current`, `primary`, `secondary`, `accent`, `error`), with Phosphor's `weight`. It's hidden from screen readers by default; with `label` it reads as an image with that name. Every tone is tested at 3:1 on the page surfaces in all five brands and modes.
- 3c0b2c7: New `Image` primitive: an `img` with a required `alt`, lazy loading and async decoding by default, and the space held before it loads (from `width`/`height`, or a `ratio` through AspectRatio). If the file fails, it shows a quiet fallback at the same size that keeps the image's name for screen readers. `caption` renders it as a named `figure`.
- f30811e: New `InputGroup` primitive (with `InputAddon`): an Input joined to the text and buttons that belong to it, in one shape with one label. Addon text is part of the Input's description, so screen readers hear "kr." too; an error outlines the whole group. `Input` now reads a surrounding Field or InputGroup when it has no label of its own, taking its id, description, `aria-invalid`, `required` and `disabled`. Field's visible "Required" is no longer read twice. No new tokens.
- d0f1c9e: New `Item` primitive: one row in a List, with `leading` media, a `title` and `description`, and `trailing` metadata or actions. With `href` the whole row is one link named by its title, while trailing buttons stay their own targets; `current` marks the page you're on with `aria-current` and a bar in the brand's accent.
- b0885b9: New `Kbd` primitive: a key the user presses, drawn as a keycap on a native `<kbd>`. It's sized in `em`, so it matches the text it sits in. Text on the keycap is 4.5:1 and its lower edge 3:1 in every brand and mode. For a combination, wrap one Kbd per key in a plain `<kbd>`.
- 2232308: New `Lightbox` composition (+ `LightboxGallery`): images large, one at a time, in a modal on the brand's own surface. Previous and next buttons, the arrow keys, Home and End, and a sideways swipe move through the images, wrapping at the ends. Each change is announced. Escape or Close returns focus to what opened it, such as a thumbnail. The dialog is named with the position ("Places 2 of 4"), and `labels` translate the controls.
- d0f1c9e: New `List` primitive: a list announced as one, either rows of Items in an interface (`marker="none"`, with `role="list"` kept for Safari) or bullets and numbers in running text. `divided` draws lines between items; `gap` uses the brand's spacing roles; `ordered` gives an `ol` without numbers shown.
- 6c70a67: New `Markdown` pattern: renders a Markdown string with the system's own components (Heading, Text, Link, List, Blockquote, CodeBlock, Table, Image, Divider). Headings shift down a level by default (`headingOffset`); raw HTML in the source is shown as text and never rendered, and `javascript:` URLs are dropped. Adds `markdown-to-jsx` 9.10.3 as a dependency (ADR 0025); code blocks have no syntax colouring yet.
- 19a4b6e: New `MobileNav` pattern: the bar at the bottom of a small screen with three to five main places, each an icon with a label that's always shown. The current one has `aria-current="page"` and a filled pill. Badges show a count and read it after the label ("Messages (3 unread)"). The bar is at least 44px tall per link, clears the phone's home indicator, and hides from 1024px up unless `alwaysVisible`.
- f8e5b32: New `MultiSelect` primitive: several values from a long list, found by typing. It's a combobox over a multi-selectable listbox, sharing Combobox's matching and list styles. The list stays open while picking, and options show a checkbox mark. Chosen items appear below the field as removable Tags, with "Remove all" from two. Backspace in the empty field removes the last item. The field is described by what's chosen, and each change is announced. `max` limits how many can be chosen. `Input` now adds a passed `aria-describedby` to its own instead of replacing it.
- f1937bd: New `NumberInput` primitive: a number typed or stepped, on the WAI-ARIA spinbutton pattern rather than `<input type="number">`, so it doesn't change on scroll and accepts either decimal mark ("1,5" or "1.5"). Arrows step, Page Up / Down take big steps, Home / End jump to the limits; − / + buttons are named after the field and disable at the limits. `unit` is read with the value, `locale` and `formatOptions` format it after editing, and text that isn't a number is kept with "Enter a number." Built from InputGroup, whose error edge now covers buttons as well. No new tokens.
- f38fb76: New `OtpInput` primitive: a short code shown one box per character. It's one real input with `autocomplete="one-time-code"` drawn over the boxes, so paste, SMS autofill, password managers and screen readers work as with any field. Numeric or alphanumeric, any length, `onComplete` when full. It has no `maxlength`, so a pasted "482 913" keeps its last digit. Label, hint and error come from Field. No new tokens.
- 064fcd6: New `Popover` (with `PopoverTrigger`, `PopoverContent`, `PopoverClose`, `PopoverAnchor`), built on `@radix-ui/react-popover` (new dependency, 1.1.23 to match the Radix packages already in use). A non-modal dialog named by its `title`, with optional close button and arrow; focus moves in and back, Escape and a click outside close it, and it follows a ThemeScope into its portal. Styled like Select's dropdown. It came forward from Wave 3 because DatePicker, DateRangePicker, TimePicker and Combobox need it. No new tokens.
- 6e08807: New `ProgressBar` primitive: how far a task has got, or an indeterminate bar while the end isn't known. It's a `role="progressbar"` named by its `label`, with optional `showValue` and `valueText` ("3 of 10 files"). The fill uses `color-accent-text`, which two new contrast pairs keep 3:1 against the track and the page in every brand and mode. Under reduced motion the indeterminate segment stays still. Adds one component token, `progress-bar-height`.
- 14a9105: New `ResizablePanels` pattern: two panes with a separator people drag or move with the keyboard, following the WAI-ARIA window splitter pattern. The separator is focusable and announces its size and range; arrows, Home and End move it, Enter collapses the first pane when `collapsible`, and double-click resets. Dragging uses pointer capture and follows right-to-left layouts. Controlled or uncontrolled, horizontal or vertical. No new dependency.
- 84971ba: New `ScrollArea` primitive: a box that scrolls vertically, horizontally or both, with the browser's own scrollbars styled thin in the strong border colour. It's a named, focusable region (`label` is required), so keyboard users can scroll it even when nothing inside takes focus, and `overscroll-behavior: contain` keeps the page still at its ends. No JavaScript scrollbars.
- dd4e422: New `Search` primitive: a `role="search"` landmark around Input's search mode. Enter searches through `onSearch` without reloading, Escape clears (a second Escape leaves the field), and an optional `shortcut` key such as "/" jumps to it from anywhere, shown as a Kbd hint and announced with `aria-keyshortcuts`. `loading` swaps the hint for a spinner and sets `aria-busy`; `showSubmit` adds a Search button. No new tokens.
- 4ee3fdf: New `Section` primitive: a band of a page with an edge-to-edge background, space above and below from the brand's spacing roles, and content centred at one of the brand's container widths (`text`, `media`, `wide`, `page`, `full`) with the page gutter. `tone="subtle"` sets a band apart on the secondary surface; for a dark band, wrap it in ThemeScope.
- 55734a8: New `SegmentedControl` primitive: one choice from a few, side by side. It's a Radix radio group, so arrow keys move and choose and Tab treats it as one stop. The chosen segment is filled with the accent (4.5:1 text in every brand and mode), the outline uses `color-border-strong`, and the shape follows the brand's Button radius. Supports icons, icon-only (`hideLabels`), `fullWidth`, and per-option `disabled`. No new tokens.
- a8a5bc6: New `SelectableCard` primitive, with `SelectableCardGroup`: choices shown as cards, one (`type="single"`, native radios) or several (`multiple`, native checkboxes), inside a `fieldset` whose `legend` is the question. Each card has a `title`, optional `meta` and `description`; the whole card is clickable, arrow keys and forms work as usual, and checked shows as a doubled accent edge and a filled indicator. `columns` lays cards side by side through Grid.
- 2780652: New `Slider` primitive: one value from a range on a native `<input type="range">`, so arrow keys, Page Up / Down and Home / End work and screen readers announce it as a slider. The track fills to the thumb in `color-accent-text` (3:1 on the track and the page in every brand and mode), `formatValue` sets `aria-valuetext`, and the whole 44px row is the target. When disabled, only the track fades and the label stays readable. Adds one component token, `slider-track-height`.
- 72fd9d9: New `Stack` primitive: lays its children out in a column or a row with a gap from the brand's spacing roles (`tight`, `inline`, `element`, `component`, `section`), so spacing lives in one place instead of in margins. It takes `align`, `justify` and `wrap`, and an `as` prop for semantic elements; as a `ul` or `ol` it drops the markers and keeps `role="list"` so Safari still announces it as a list.
- 738b450: New `StatusDot` primitive: a small dot in a feedback role's colour (`neutral`, `info`, `success`, `warning`, `error`) that always comes with words, either shown (`children`) or read to screen readers (`label`); the types require one. `pulse` adds a slow ring for something live, off under reduced motion. Adds the `status-dot-size` and `status-dot-pulse-duration` component tokens. Known limit: in light mode, `success` and `warning` dots measure about 2.9:1 on the secondary surface.
- 57f1d03: New `Stepper` pattern: where someone is in a process with a fixed order. It's an ordered list where the current step has `aria-current="step"`, and each step's state is also given in hidden words ("Address (Completed)"), translatable through `statusLabels`. Finished steps can lead back, as buttons with `onStepClick` or links with `href`; upcoming steps never can. A step can be marked as needing attention. Horizontal or vertical; when narrow and horizontal, only the current label shows. Adds two component tokens, `stepper-indicator-size` and `stepper-connector-width`.
- f4b86e3: New `TableOfContents` pattern: the sections of a long page as links, with the one being read marked. It's a `nav` named "On this page" with a nested list. The current link gets `aria-current="location"` and an accent bar, so it doesn't rely on colour. It follows the scroll of the page or a container, marks a clicked link at once, and counts a short last section at the end of the page. `headingsToItems` builds the items from the page's headings.
- fe5cd5e: New `TagInput` primitive: free-text values as tags. Enter, comma or semicolon add what's typed. A pasted list is split, and leaving the field adds what's typed. Duplicates (ignoring case and accents), `validate` failures and going over `max` each get their own reason, and the refused text stays in the field. With `suggestions`, it's a combobox like Combobox. Tags show below the field, Backspace removes the last, and each change is announced. `Tag`'s Remove button is now an icon at full text colour (4.5:1) with a 24px target and a hover state, replacing the "×" glyph at 60% opacity. The Tag docs now cover its icon, removable and clickable forms.
- 95a008f: New `Text` primitive: body text in the brand's type roles (`body`, `small`, `caption`), with `tone` (`primary`, `secondary`, `inherit`), `weight` (`body`, `label`), and `truncate` to one line or a number of lines while the full text stays in the page. `as` picks the element (`p` by default, `span`, `strong`, `em`, and more). Primary and secondary text are tested at 4.5:1 on all three page surfaces in every brand and mode.
- 88ce640: New `TimePicker` primitive: an input with a list of time slots, built on Field, InputGroup and Popover. The input is a combobox over a listbox, so focus stays in the input while arrow keys, Page Up / Down, Home / End, Enter and Escape move through the slots. People can also type a time in common forms ("1430", "14.30", "2pm"). The display follows the locale (24-hour or 12-hour), and the value is always "HH:mm". `min`, `max` and `step` limit the slots, and a time outside them gets its own error. Adds `lib/time` helpers.
- 40d830e: New `Timestamp` primitive: a `time` element that says a moment the way people do ("now", "5 minutes ago", "yesterday", in the given locale) and switches to a date after `relativeLimitDays` (default 7), or shows a `date`, `datetime` or `time`. The exact moment is in `dateTime` and the full date is the tooltip. Relative text stays current while the page is open, updating less often as the moment gets older.
- c422b79: New `ToggleButton` primitive: a button that stays on or off, with `aria-pressed`. It's built on Button, so each brand's shape carries over: off looks like `secondary` (outline), on like `primary` (filled), and an off toggle hovers with the neutral surface so the fill only ever means "on". Controlled (`pressed`, `onPressedChange`) or uncontrolled (`defaultPressed`). `hideLabel` makes it an icon-only square via IconButton.
- 8b4d741: New `Toolbar` pattern (+ `ToolbarSeparator`, `ToolbarSpacer`): the WAI-ARIA toolbar. The whole row is one Tab stop, and the arrow keys move between controls, wrapping at the ends and skipping disabled ones. Home and End jump to the first and last control, and Tab back in returns to the control last used. Text fields keep their arrow keys, and so does a Menu opened from the toolbar. Horizontal or vertical.
- a8a0cf2: New `TopNav` pattern: the bar across the top with brand, main navigation and actions. From 1024px it shows NavigationMenu. Below that, a Menu button opens a Drawer with the same items, so there's one list and one "Main" navigation on the page at a time. The current link is marked in both, following a drawer link closes it, and the bar can be sticky.
- beb01ad: New `VisuallyHidden` primitive: text screen readers announce but sighted users don't see, such as the name of an icon-only button or "(opens in a new tab)". It's clipped to a 1px box rather than removed, so it stays in the accessibility tree. Renders a `span` by default, or a `div` with `as="div"`.

### Patch Changes

- 6981c21: Lines and marks that show a state use `color-accent-text` instead of the accent fill: Radio's checked ring, dot and hover border, the active Tabs indicator, Card's featured border, Checkbox's hover border and Table's sort arrows. Unchanged in every brand where the two are equal (base, portfolio, demo-cool, demo-warm); in a pastel brand like demo-soft they now meet 3:1 against the surface (1.83:1 before).
- 88006a4: Button: `loading` keeps the variant's colours at full strength. It used to pick up the disabled opacity (a loading `<button>` is natively disabled), so a loading primary Button looked almost disabled and its spinner was hard to see.
- 9186949: Card: a `CardHeader` that is the card's last part now pads its bottom, as `CardFooter` would (half that on a compact card). A card of media and header used to end flush under its text.
- cb5866a: Form controls get an edge you can see. Input, Textarea and Select draw their border with `color-border-strong` at rest (it was `color-border-default`, 1.21:1 against the surface in base light, 1.04:1 in demo-soft), and `color-text-secondary` on hover. `color-border-strong` moves a step darker in light mode (`neutral-400` to `neutral-500`, about 4.5:1), so checkboxes, radios and the off switch track pass too; dark mode is unchanged. demo-warm points it at its ink border. New `control-boundary` contrast pairs keep it at 3:1 on both surfaces in every brand and mode (WCAG 1.4.11).
- a8bf66b: Disabled controls stay readable. Button, Checkbox, Radio, Switch, Field, Input, Textarea, OtpInput, Select, Slider, Accordion, Tabs and Pagination no longer fade to the 0.1 disabled opacity; disabled now uses a quiet surface and border with secondary text (4.5:1 in every brand, light and dark). A loading Button keeps its variant's colours. `--opacity-disabled` is no longer used by any component.
- b223df8: `IconButton` and `SegmentedControl` no longer fade when disabled. The shared disabled opacity (0.1) left their icons and labels close to invisible. A disabled IconButton now has a quiet surface and border with the icon in secondary text (4.5:1), and a ghost IconButton stays without the surface. A disabled segment keeps its label in secondary text. A fully disabled SegmentedControl keeps its chosen segment visible. Tests check 4.5:1 in every brand and mode.
- 4afb9fd: Component docs: props typed as "one or the other" now list correctly. StatusDot's page was missing `label`, and Badge and Dialog showed `never` in their prop types (`boolean | never`); the generator now splits a union of object types into its parts, splits one-line objects at `;`, and drops `never` while keeping the prop optional.

## 1.4.0

### Minor Changes

- ccfe761: Three demo brands, a build for any number of brands, and Button in depth:

  - **Three new brands: `demo-cool`, `demo-warm` and `demo-soft`.** Thin skins on `base`, made for the docs site's hero, where one Card switches between them. Import `<brand>-light.css` and `<brand>-dark.css` for a whole page, or `<brand>-scoped.css` with `<ThemeScope brand="demo-cool">` for part of one. Their Google Fonts links are in `tokens/fonts.json`. Why they ship in the package: ADR 0023.
  - **Any folder in `tokens/brands/` is now a brand.** The build, the contrast check, the linters, the token reference and the font list find brands instead of naming `portfolio`. `base` and `portfolio` are unchanged.
  - **New tokens, each with a base value that changes nothing:** `font-variation-heading` (a heading font's variable axes, applied by Heading, Hero and Dialog), `button-border-radius` (Button's shape, apart from Badge's and Tag's pill), and `color-accent-text` / `color-accent-text-hover` (the accent as text; Link now uses them).
  - **Button has a pressed state**, from a new `color-accent-pressed` token, for mouse and touch. Before, `:active` only existed on touch and reused the hover colour.
  - **Ghost Buttons keep a transparent border on hover.** They picked up the near-black one from the base hover rule.
  - **Every Button prop is described** in its docs, and Button's docs gain a Best practices section with Do / Don't. Any component's docs can now have one, from `**Do**` / `**Don't**` blocks in `docs/components.md`.

## 1.3.3

### Patch Changes

- 8480d0f: Token clean-up, no visual change:

  - **28 unused variables are gone from the dark CSS.** `base-dark.css`, `portfolio-dark.css` and `portfolio-scoped.css` declared `--checkbox-*`, `--radio-*` and `--textarea-*` colour variables that nothing reads. They were left over from an earlier clean-up that moved Checkbox, Radio and Textarea onto the shared colour tokens. They had no light value and never appeared in `tokens.json` or the token reference.
  - **Four tokens now say what they're for:** `shadow-card`, `z-sticky`, `font-size-display` and `letter-spacing-body`.
  - **Four tokens are deprecated** and will be removed in 2.0: `z-overlay`, `z-modal`, `opacity-overlay` and `size-dialog-default`. Nothing in the package uses them. If you do, their descriptions in `tokens.json` say what to use instead.

## 1.3.2

### Patch Changes

- 8a82e95: `ThemeScope`'s `brand` type (`'portfolio'`) is now generated from the scoped brand files in `styles/brands/`, as `lib/theme-brands.ts`, so a new scoped brand appears in it on its own. Storybook's dark stories render their overlays dark too: dialogs, drawers, menus, selects and tooltips opened in a dark story used to come out light, except Menu's and SideNav's. No component, token or CSS changes.

## 1.3.1

### Patch Changes

- a92f6ef: Storybook links that open the right story. The registry's Storybook paths (`storybookPath`, `storybookTitleId` in `tokens/component-registry.json`, and the "Storybook:" line in each doc twin and in `llms-full.txt`) were wrong for 8 components: Accordion, Breadcrumb, DataTable, EmptyState, Pagination, Table and Tabs are filed under `Patterns/` in Storybook, not `Components/`, and Radio's stories are `Components/RadioGroup`. They now come from each story file's own `title`. A new registry field, `defaultStoryId`, is the id Storybook gives a component's first story (Heading's `H1` is `components-heading--h-1`), so a link to `?path=/story/<defaultStoryId>` opens it. Storybook for `main` is published at https://anto-amezquita.github.io/design-system/. No component, token or CSS changes.

## 1.3.0

### Minor Changes

- 8832d22: Three additions, all non-breaking:

  - **`ThemeScope`.** A new composition component that gives one part of a page its own brand, mode, or both: `<ThemeScope brand="portfolio" mode="dark">…</ThemeScope>`. Dialogs, drawers, alert dialogs, menus, selects and tooltips opened inside it now take the same brand and mode, although they render at the end of the page. Before, a menu opened in a portfolio panel came out in `base`, and one opened in a dark panel on a light page came out light. `brand` needs `portfolio-scoped.css` loaded; `mode` works on its own. A scope inside another takes what it doesn't set from the outer one. Toasts stay page-level. If you wrote `data-brand` or `data-mode` on an element yourself, that part still styles as before, but switch to `ThemeScope` for its overlays to follow. Nothing is added to the DOM, so overlay stacking and close animations are unchanged.
  - **Breadcrumb takes an `aria-label`**, default `"Breadcrumb"`, so two breadcrumbs on one page can have different landmark names. It also passes native `<nav>` attributes through and forwards a ref, like the other components.
  - **The agent files point at the docs site.** `llms.txt`, `llms-full.txt`, the skill and the registry now use `https://design.amezquita.dk`, with component docs at `/components/<slug>.md`. Every registry item's dependencies name the docs site, so `npx shadcn add` no longer goes through `amezquita.dk`. The old URLs still work: they redirect.

## 1.2.1

### Patch Changes

- 1bc9dbe: `npx shadcn add` works again. Since 1.1.1 the registry's theme item (`registry/theme.json`, which every component depends on) carried `null` for four tokens that only the portfolio brand defines: `color-accent-glow`, `color-surface-spotlight`, `color-text-frozen-primary` and `color-text-frozen-secondary`. shadcn rejects a `null` css variable, so installing any component from the registry failed with "Expected string, received null". Those four are now left out of the theme, the same way `base-light.css` and `base-dark.css` leave them out, and the theme's description counts the 137 tokens it carries. Only the registry changes; no component, token or CSS file does.

## 1.2.0

### Minor Changes

- 50e5dd3: Five additions found while building the docs site, all non-breaking:

  - **Both brands on one page.** New `styles/brands/portfolio-scoped.css` holds the portfolio overrides under `[data-brand="portfolio"]` instead of `:root`. Load `base-light.css` and `base-dark.css` as usual plus this file, put `data-brand="portfolio"` on a panel, and only that panel takes the portfolio brand. It follows the page's `data-mode`, or its own. Use it _instead of_ `portfolio-light.css` and `portfolio-dark.css`, not alongside them. Those two files are unchanged, so nothing changes if you already use them.
  - **Font links you can read from the package.** New `tokens/fonts.json` gives the Google Fonts stylesheet link each brand needs: JetBrains Mono for `base`, Schibsted Grotesk plus JetBrains Mono for `portfolio`, with the weights the tokens use. The package still ships no font files. `llms.txt` and the README have the same links. It's generated from the font tokens, so it changes when a font does.
  - **Token descriptions.** Every semantic and component token has a one-line `$description`, and `tokens/token-reference.json` (and `tokens.json`) now carries it as `description` on each entry, `null` where there isn't one. Before, the field never reached the reference at all.
  - **MCP tools in `llms.txt`.** `llms.txt` and `llms-full.txt` list the MCP server's tools, generated from the server itself, so the list matches what it serves.
  - **Doc twins show base values.** The Tokens tables in `docs/components/*.md` now show the `base` theme's values. They showed the portfolio brand's, so Button's secondary colours read `#292524` instead of base's `#262626`.

## 1.1.2

### Patch Changes

- 727ee4e: `Link`, `SkipLink` and `Tag` now start with `'use client'`. They use client-only React (Radix `Slot` in Link, click handlers in SkipLink and a removable Tag) without saying so, so a Next.js App Router consumer couldn't render them from a Server Component: the build failed with `createContext is not a function` or "Event handlers cannot be passed to Client Component props". The docs site hit it first and worked around it with a client re-export, which it can now delete. Nothing changes in the browser or for consumers outside the App Router.

  `npm run validate` gains `check-client-directives.mjs`, which fails any component that uses state or effect hooks, context, Radix or an inline event handler without the directive. The tests and Storybook render in a browser, where the directive does nothing, which is how these three shipped without it.

## 1.1.1

### Patch Changes

- 6b8a811: Ship the agent-facing files in the package: `tokens.json`, `skills/` (the agent skill and its `index.json`), `registry/` (the shadcn-spec registry manifests) and `docs/components/` (the per-component Markdown docs). The docs site (`design-system-site`) generates its `/.well-known/skills/`, registry and doc pages from the installed package at build time, instead of from hand-copied files. The URLs inside these files still point at amezquita.dk and move when the docs site's subdomain is live.

  Fix: the shadcn registry's `cssVars` now carry the `base` theme. They were resolved from the portfolio brand, so `npx shadcn add` installed the portfolio's colours instead of the brand-neutral default every consumer is meant to start from. Anyone who installed components through the registry and relied on those colours should import the portfolio brand CSS or set their own values. Consumers who install the npm package and import the brand CSS are unaffected.

## 1.1.0

### Minor Changes

- 55b3606: Five navigation components (`decisions/0015`) and breakpoint tokens (`decisions/0018`).

  **`Link`** (primitive): use it for navigation, and Button for actions. `variant="inline"` (underlined, for running text) or `"standalone"` (underline on hover and focus). `external` opens a new tab and says so to screen readers. `asChild` renders your router's link: `<Link asChild><NextLink href="/about">About</NextLink></Link>`.

  **`SkipLink`** (primitive): put it first in `<body>` and `id="main-content"` on your `<main>`. It shows on the first Tab and moves focus into the main content. Stacks with the new `--z-skip-link` token.

  **`Menu`** (composition): a dropdown of actions from a `trigger`, in groups, with disabled and destructive items. Opens correctly inside a Dialog or Drawer.

  **`NavigationMenu`** (composition): the header navigation, from 1024px up. Links and groups that open a dropdown of links. Takes `currentHref` for `aria-current="page"` and `LinkComponent` for your router.

  **`SideNav`** (pattern), with **`SideNavProvider`** and **`SideNavTrigger`**: section navigation inline beside the content from 1024px up, and in a left Drawer opened from `SideNavTrigger` below it. `headerItems` puts NavigationMenu's links in that drawer too, so a site with a header nav gets a mobile menu with `layout="drawer-only"`. `collapsed` turns the inline nav into an icon rail. The `NavItem` type both components take is exported from each of their folders.

  **Breakpoint tokens:** `breakpoint.tablet` (768px) and `breakpoint.desktop` (1024px), emitted as `--breakpoint-tablet` and `--breakpoint-desktop`. Custom properties can't be read in `@media`, so write the literal value, mobile-first: `@media (min-width: 1024px)`. For JS, `lib/breakpoints.ts` exports `BREAKPOINTS` and `mediaQuery('desktop')`.

  **One visible change to an existing component:** Card's description used to hide below 1200px and now hides below 1024px, the nearest breakpoint token. Between 1024px and 1199px it now shows.

  New dependencies: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-navigation-menu`, and `@radix-ui/react-slot` (already installed with the other Radix packages, now declared directly).

## 1.0.0

### Major Changes

- d30931a: Button is functional by default, and the expressive hover is opt-in (`decisions/0016`). Every Button changes on upgrade.

  **Hover:** a plain background change over a short CSS transition — the rules that previously only reached people with `prefers-reduced-motion: reduce`. The GSAP wipe and cursor-following glow are now behind `motion="expressive"`.

  **The arrow is opt-in.** `noArrow` is gone; use `arrow`:

  - `<Button noArrow>` → `<Button>`
  - `<Button>` (was getting an arrow) → `<Button arrow>`

  **To keep the previous look**, set both: `<Button motion="expressive" arrow>`. A wrapper in your own app is the tidier place for that than repeating it at every call site.

  **GSAP** now loads through a dynamic `import()` on the expressive path, so it never executes in an app that doesn't use it. It remains a regular dependency rather than an optional peer — this package ships raw source with no build step, so the import has to stay resolvable.

  **Tokens:** `--button-glow-color` is now a real component token instead of a hardcoded value in `Button.css`, so a brand can override it.

  Unchanged: `motion="expressive"` still does nothing under `prefers-reduced-motion: reduce` or on a device without hover, where it falls back to the functional hover.

  **Removed: `hooks/useButtonWipe.ts`.** Nothing in this package used it. It imported GSAP statically, so importing it pulled GSAP into your bundle whatever Button's `motion` prop said, and its default fill pointed at `--button-primary-background-hover`, a token removed in an earlier release. If you imported it directly, copy it into your own app; the expressive wipe on Button itself is unaffected.

### Patch Changes

- fb7a7eb: The package now ships its agent and reference docs alongside the code: `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CHANGELOG.md`, and the ADRs in `decisions/*.md` (`decisions/0017`). An agent working in a consumer project can read them from `node_modules/@amezquita/design-system/`, and the docs site builds its Changelog, Working with AI and Decisions pages from the published package instead of from this repo. No code or token changes.

## 0.6.0

### Minor Changes

This release reworks the type scale and adds container widths. It removes tokens, so read **Removed** before upgrading.

- 5c061df, cff0463, 797c753: **Line-heights on the 4px grid, and a simpler type scale** (`decisions/0012`, `decisions/0013`). Every static font size now has a fixed pixel line-height on the same 4px grid as the spacing scale. The static scale goes from 13 sizes to 9:

  | Role            | Size / line-height                                            |
  | --------------- | ------------------------------------------------------------- |
  | `h1`            | 64 / 80px                                                     |
  | `h2`            | 48 / 60px                                                     |
  | `h3`            | 32 / 40px                                                     |
  | `h4`            | 24 / 32px                                                     |
  | `h5`            | 20 / 24px                                                     |
  | `body`          | 18 / 28px                                                     |
  | `control`       | 16 / 24px                                                     |
  | `small`         | 14 / 20px (form labels: 14 / 16px with `--line-height-label`) |
  | `caption` (new) | 12 / 16px                                                     |

  Fluid `display` and `h1`–`h3` keep their unitless ratios (`--line-height-display`, `--line-height-heading`).

  **`--line-height-body` is now a fixed `28px`, not `1.5`.** It no longer scales with the element's font size: text inheriting it from `<body>` gets 28px whatever its size. Pair each font size with its own line-height role instead (`--font-size-small` with `--line-height-small`, and so on).

  **Removed, with replacements:**

  - `--font-size-micro` → `--font-size-caption` (10px text becomes 12px)
  - `--font-size-h6` → `--font-size-h5` / `--line-height-h5`, or `--font-size-body` if you need 18px
  - `--font-size-label` → `--font-size-small` (same 14px; keep `--line-height-label` for one-line labels)
  - `--font-size-lead` → `--font-size-h4` / `--line-height-h4` (same 24 / 32px)
  - `--tooltip-font-size`, `--input-hint-size`, `--textarea-hint-size`, `--table-header-font-size`, `--badge-font-size`, `--tag-font-size` → `--font-size-caption`
  - `--line-height-normal` (1.5) and `--line-height-loose` (1.75) primitives, and the `font-size.2xs` (10px) primitive: set the value in your own CSS if you used them

  **`Heading`:** `level` is now `1`–`5`. `level={6}` no longer type-checks; use `level={5}`, adding `as="h6"` if you need a real `<h6>`.

  **Visible changes:**

  - Tooltip, Input and Textarea hints, and Table header/foot/caption text: line-height 20px → 16px.
  - `--font-size-h2-fluid` is now `clamp(1.625rem, 1rem + 2.5vw, 3rem)` (26px → 48px, was 22px → 48px). Fluid H2 is up to 4px larger below about 1280px wide, and never smaller than H3 (before, it was smaller at every width under 800px).
  - EmptyState's compact title: 18 / 24px → 20 / 24px.
  - Dialog's title resolves to `--font-size-h4` / `--line-height-h4` directly; the `.heading.dialog__title` override is gone. Same size as before.
  - Most other static text moves by 1–2px of line-height.

- 476911f: **Container width scale** (`decisions/0014`): `--size-container-text` (45rem), `--size-container-media` (60rem), `--size-container-wide` (80rem), `--size-container-page` (90rem) and `--size-container-site` (90vw, applied from 1024px up; below that the site is 100% wide with `--space-layout-margin` gutters). Use them directly as `max-width`; as a `width` or grid track, wrap them in `min(var(--size-container-*), 100%)` so they fill narrow screens.

  `--space-layout-max-width` is deprecated in favour of this scale. It keeps its 1200px value in this release.

## 0.5.0

### Minor Changes

- 868e727: Added `Heading`, a new primitive rendering `H1`–`H6` via a `level` prop (visual size) decoupled from an `as` prop (real semantic tag, defaults to matching `level`) — so a heading's visual size and its place in the document outline can diverge deliberately (e.g. a visually small `H1` that stays a real `<h1>` for SEO/screen-reader navigation).

  `H1`–`H3` use fluid, `clamp()`-based sizing (`font-size-h1-fluid`, and the previously-defined-but-unused `font-size-h2-fluid`/`font-size-h3-fluid`, now wired in for the first time). `H4`–`H6` are deliberately static: `H4` reuses the existing `font-size-h4`; `H5` and `H6` get two new static semantic tokens, `font-size-h5` (20px) and `font-size-h6` (18px). The fluid/static split follows the pattern every major production design system (IBM Carbon, Material 3, GitHub Primer, Adobe Spectrum, Shopify Polaris) already uses — fluid scaling reserved for large/prominent display text, dense UI chrome stays static — recorded in `decisions/0008-productive-expressive-typography-split.md`, along with confirmation that all four fluid tokens already meet the WCAG 1.4.4 200%-zoom-safe bar (max/min ratio ≤ 2.5×, mixed rem+vw preferred values).

  `Card`, `Dialog`, `Drawer`, and `EmptyState` component titles keep their existing static sizing under this split — that was already correct, not something this release "fixes." (Their internal implementation was later migrated onto this primitive; see the separate changeset for that.)

  No breaking changes. No existing component's rendered output changes.

### Patch Changes

- 582aded: `CardTitle`, `Dialog`'s and `Drawer`'s title, and `EmptyState`'s title now render via the `Heading` primitive internally instead of each maintaining its own parallel heading CSS/markup — closing the gap `decisions/0008` deliberately left open as a follow-up. No public API change and no visual change: every affected title was verified byte-identical before/after (computed styles and rendered pixels), and `CardTitle`/`EmptyState`'s existing `as`/`level` props behave exactly as before.

  Fixes a real bug found while migrating: `Dialog` and `Drawer`'s registry manifests (`registry/dialog.json`, `registry/drawer.json`) were missing `heading.json` as a `registryDependency`, because the manifest generator only traced a component's own direct imports and both compose `Heading` one hop away, through the internal `BaseSheet` component. A consumer installing `Dialog` or `Drawer` via the shadcn-style registry CLI would get source that imports `Heading` without ever fetching it. The generator now follows imports through internal siblings.

## 0.4.0

### Minor Changes

- 8d733cd: Expanded the primitive `space` scale from 10 to 13 steps (4/8/12/16/20/24/28/32/40/48/64/96/128, `space.1`–`space.13`), filling gaps the old scale had past 16px (no 20px, no 28px step). Every existing token reference was repointed to the new step holding the same pixel value — this is non-breaking, no resolved value changes for existing usages.

  Added three new semantic tokens — `space-dialog-padding-mobile`, `space-dialog-padding-tablet`, `space-dialog-padding-desktop` (16px/24px/32px) — and made `Dialog`'s content padding responsive via a real `@media` query (768px/1024px breakpoints) switching between them, replacing the previous single static padding value.

## 0.3.2

### Patch Changes

- 8d3b110: Every primitive now forwards a ref, spreads unrecognised props onto its rendered element, and merges a consumer's `className` instead of discarding it. Fixes `Select`'s dropdown rendering behind its own containing `Dialog`.

  - **Button**, **Textarea**, **Badge**, **Checkbox**, **Input** all extend the real native element's (or, for `Checkbox`, the real Radix primitive's) own props type and spread `...rest` onto the rendered element — `onKeyDown`, `onBlur`, arbitrary `data-*`/`aria-*` attributes, and third-party libraries that spread their own props onto a rendered node (e.g. `@dnd-kit/sortable`'s `attributes`/`listeners`) now all reach the real DOM node. Previously only `Button` had this (`decisions/0006`); this extends the same pattern to every other primitive with a single rendered element.
  - **`className` is now merged, not silently overwritten**, on all five of the above — including `Button`, which `decisions/0006`'s fix didn't close: it spread `...rest` (which carries `className`) but then wrote its own computed `className` after it, unconditionally overwriting whatever a consumer passed.
  - **`Button` now forwards Radix's `asChild`-injected ARIA contract _and_ an external `className`** — both needed for `Button`/`Badge` to work correctly as a `Dialog`/`AlertDialog` trigger with consumer-supplied styling.
  - **`Select`'s dropdown no longer renders behind a `Dialog` it's nested inside**, and **`Drawer`'s content/overlay no longer outrank `Dialog`/`AlertDialog`.** `Select.css`, `Dialog.css`, and `Drawer.css` no longer set an explicit `z-index` on their overlay/content — all now layer by DOM mount order instead of a fixed `dropdown < overlay < modal` rank, the same fix Radix's own maintainers shipped for the identical bug. `--z-dropdown`, `--z-overlay`, and `--z-modal` are now unreferenced (not removed from the token files in this release).
  - **`AlertDialog`'s `cancel`/`action` slots can now safely use `Button`** instead of a plain `<button>` — the guidance recommending a raw element there is retired; `Button`'s own `asChild`-composition contract test (`Button.slot.test.tsx`) now covers this.
  - **`Badge`, `Checkbox`, `Textarea`, and `Input` each explicitly reject one or two props they can't actually support**, caught by review rather than shipped silently broken: `Badge` no longer accepts `role` (it always computes its own — a deliberate a11y decision, not a passthrough gap); `Checkbox` no longer accepts `children`/`asChild` (its check/indeterminate icon is fixed markup); `Textarea`/`Input` no longer accept `children` (both are controlled via `value`, and `<input>` is a void element besides — passing `children` to either was always going to misbehave, this just makes the type say so instead of admitting it silently).

  No breaking changes for any real existing usage — the three components above were never designed to accept `role`/`children`/`asChild` in the first place; nothing that worked before stops working. No component removed or renamed.

## 0.3.1

### Patch Changes

- 5db3e32: Fix Button not forwarding a ref, fix a dark-mode-only textarea border mismatch, and correct 17 component tokens with an inaccurate `$type`.

  - **Button** now forwards a ref via `React.forwardRef` to its underlying `<button>` or `<a>` element — needed for anything Radix clones a ref onto via `asChild` (e.g. AlertDialog's `triggerRef` restoring focus to a Button trigger).
  - **Textarea** border color in dark mode (`base` brand) was overridden to a different neutral-scale step than `color-border-default`, causing it to render a visibly different border from every other control in dark mode only. Removed the stray override so it inherits like `input-border` already does.
  - Collapsed 90 component-token chain-skips into 9 new semantic roles (`space-control-padding-*`, `space-prominent-padding-*`, `space-compact-padding-*`, `space-container-padding*`, `font-weight-control`) and adopted 2 existing-but-unused roles (`border-radius-pill`, `border-radius-interactive`) more broadly — reduces the token architecture's chain-skip count from 164 to 74 with zero visual regressions.
  - Fixed `font-weight-label` role, which was set to `font-weight.semibold` but every label component actually used `font-weight.medium` — the role existed but was unused and wrong.
  - Fixed `tabs-indicator-height`, which was typed `"color"` but held a dimension value.
  - Corrected 17 tokens across `avatar`, `spinner`, `skeleton`, `dialog`, `drawer`, `toast`, `tooltip`, and `accordion` from `$type: "other"` to their accurate DTCG type (`dimension`, `color`, `number`, or `duration`) — matters beyond metadata correctness since `sd.config.mjs`'s `size/rem` transform filters on `$type`.

  No breaking changes. No component API changes besides the additive Button ref. `npm run validate` and `tokens:audit` green throughout — chain-skip 164 → 74, zero regressions.

## 0.3.0

### Minor Changes

- Add `AlertDialog` — a confirmation gate for actions the user must explicitly accept or decline, distinct from `Dialog`: real `alertdialog` role, no outside-click dismiss, no free-floating close button, forces a Cancel/Action choice. Built on `@radix-ui/react-alert-dialog` (new dependency); reuses `Dialog`'s own CSS classes and tokens rather than duplicating them, since visually it's the same box with a different behavioral contract underneath.

  Also extends `Dialog` with an optional `triggerRef` prop, merged with its existing internal one — lets a consumer keep a handle on the trigger element to restore focus there manually after a separate follow-up `AlertDialog` closes (a cross-dialog focus-restore case `Dialog`'s own internal focus-restore hook doesn't cover, since it only knows about itself). Non-breaking addition.

## 0.2.0

### Minor Changes

- 3216252: `tokens/token-reference.json` now resolves every global primitive, not
  just the `color.*` group — 83 previously-invisible primitives
  (spacing, type scale, radii, motion, shadows, sizes, `feedback.*`
  colours) are now included. Total goes from 537 to 620 tokens (101
  primitive, 114 semantic, 405 component).

  **Breaking, within this field:** `meta.tokenCount` is renamed to
  `meta.total`, and now sits alongside `meta.primitiveCount`,
  `meta.semanticCount`, and `meta.componentCount`. Any consumer reading
  `tokenReference.meta.tokenCount` directly needs to switch to
  `meta.total`.

  `tokens/component-registry.json` gains an `internal` flag per
  component (set on components that ship in the package because
  something else imports them, but aren't meant to be used directly —
  currently just `BaseSheet`) and a `meta.publicComponentCount` field
  alongside the existing `meta.componentCount`.

  No changes to component source, styles, or hooks — this release only
  touches the two generated token/registry JSON files.

## 0.1.4

### Patch Changes

- 531f6bd: Ship the token artifacts with the package.

  `tokens/` is now included in `files`, so consumers and coding agents get the DTCG token source (`$value` / `$type`), the resolved token reference, and the component registry on install — previously these existed only in the repo and reached nobody who installed the package.

  First step of the AI-readiness roadmap (`docs/ai-readiness-plan.md`, Task 1.0).

## 0.1.3

### Patch Changes

- 82a353c: fix: convert remaining internal @/ imports to relative paths

## 0.1.2

### Patch Changes

- 475e59a: fix: resolve internal @/ imports to relative paths in Button, EmptyState

## 0.1.1

### Patch Changes

- 1e89f3e: Verify npm trusted publishing pipeline end-to-end
