# Component coverage: from 35 toward 100

Status: research 2026-10-08; build plan chosen 2026-10-08, schedule set 2026-10-14 and re-planned 2026-10-15; progress updated 2026-10-20. Progress is tracked under "Progress" below; the tier tables stay as the 2026-10-08 snapshot.

## Why

The library ships 35 components. For a consumer that is a working core; as a showcase for UX/UI and frontend roles it reads as a starter kit. This compares our set with three references and ranks what a comprehensive system includes, as a roadmap toward roughly 100.

## Method

- **Ours:** the 35 items in `registry/registry.json` (16 primitives, 10 composition, 9 patterns). Avatar Group ships inside Avatar but has its own row below, so the tables count 36.
- **Astryx** (astryx.atmeta.com/components, read 2026-10-08): 239 entries, of which about 100 are top-level components; the rest are sub-parts (`TableCell`, `DialogHeader`) and hooks (`useToast`), not counted.
- **shadcn/ui** (ui.shadcn.com/docs/components, read 2026-10-08): 64 components.
- **Material 3** (m3.material.io/components, read 2026-10-08): 36 components.
- Names differ between systems, so each row is one concept mapped by hand (Material "snackbar" = Toast; shadcn "Sheet" and Material "side sheets" = Drawer; Astryx "Selector" = Select). The mapping is a judgement call; check any row against the sources.
- **Score** = how many of the three references include it. A concept all three agree on is a stronger must-have than one only Astryx has.
- **Effort** (missing rows only) is my estimate, S / M / L: S is a styled primitive with few states, L needs real interaction logic (keyboard models, date maths, virtualisation, streaming).
- **Showcase** marks components that demonstrate UX depth an interviewer will notice: complex interaction, data, AI.

## Totals

| | Concepts | We have | Missing |
|---|---|---|---|
| Tier 1 — in all three references | 23 | 16 | 7 |
| Tier 2 — in two references | 41 | 14 | 27 |
| Tier 3 — in one reference | 35 | 3 | 32 |
| Ours only | 3 | 3 | 0 |
| **All** | **102** | **36** | **66** |

The union of the four lists is 102 concepts, so "100 components" means covering nearly everything any of the three references ships.

## Tier 1 — in all three references

| Component | Category | Astryx | shadcn | Material | Ours | Effort | Showcase |
|---|---|---|---|---|---|---|---|
| Button Group | Actions | ● | ● | ● | — | S |  |
| Segmented Control / Toggle Group | Actions | ● | ● | ● | — | M |  |
| Carousel | Display | ● | ● | ● | — | L |  |
| Divider / Separator | Display | ● | ● | ● | — | S |  |
| Progress Bar | Feedback | ● | ● | ● | — | S |  |
| Date Picker | Inputs | ● | ● | ● | — | L | ★ |
| Slider | Inputs | ● | ● | ● | — | M |  |
| Button | Actions | ● | ● | ● | ✓ |  |  |
| Dropdown Menu | Actions | ● | ● | ● | ✓ |  |  |
| Badge | Display | ● | ● | ● | ✓ |  |  |
| Card | Display | ● | ● | ● | ✓ |  |  |
| Spinner / Loading Indicator | Feedback | ● | ● | ● | ✓ |  |  |
| Toast / Snackbar | Feedback | ● | ● | ● | ✓ |  |  |
| Checkbox | Inputs | ● | ● | ● | ✓ |  |  |
| Radio Group | Inputs | ● | ● | ● | ✓ |  |  |
| Switch | Inputs | ● | ● | ● | ✓ |  |  |
| Text Input | Inputs | ● | ● | ● | ✓ |  |  |
| Textarea | Inputs | ● | ● | ● | ✓ |  |  |
| Side Nav / Sidebar | Navigation | ● | ● | ● | ✓ |  |  |
| Tabs | Navigation | ● | ● | ● | ✓ |  |  |
| Dialog | Overlays | ● | ● | ● | ✓ |  |  |
| Drawer / Sheet | Overlays | ● | ● | ● | ✓ |  |  |
| Tooltip | Overlays | ● | ● | ● | ✓ |  |  |

## Tier 2 — in two references

| Component | Category | Astryx | shadcn | Material | Ours | Effort | Showcase |
|---|---|---|---|---|---|---|---|
| Chat Message / Bubble | AI and chat | ● | ● | · | — | M | ★ |
| Message List / Scroller | AI and chat | ● | ● | · | — | L | ★ |
| Command Palette | Actions | ● | ● | · | — | L | ★ |
| Context Menu | Actions | ● | ● | · | — | M |  |
| Icon Button | Actions | ● | · | ● | — | S |  |
| Toggle Button | Actions | ● | ● | · | — | S |  |
| Toolbar | Actions | ● | · | ● | — | M |  |
| Aspect Ratio | Display | ● | ● | · | — | S |  |
| Collapsible | Display | ● | ● | · | — | S |  |
| Item (list row) | Display | ● | ● | · | — | S |  |
| Kbd | Display | ● | ● | · | — | S |  |
| List | Display | ● | · | ● | — | S |  |
| Text / Typography | Display | ● | ● | · | — | S |  |
| Calendar | Inputs | ● | ● | · | — | L |  |
| Combobox / Typeahead | Inputs | ● | ● | · | — | L | ★ |
| Field (label, hint, error) | Inputs | ● | ● | · | — | S |  |
| File Upload | Inputs | ● | ● | · | — | M |  |
| Input Group (prefix/suffix) | Inputs | ● | ● | · | — | S |  |
| Search | Inputs | ● | · | ● | — | M |  |
| Tag Input / Tokenizer | Inputs | ● | · | ● | — | L |  |
| Time Picker | Inputs | ● | · | ● | — | L |  |
| Resizable Panels | Layout | ● | ● | · | — | L |  |
| Scroll Area | Layout | ● | ● | · | — | M |  |
| Mobile Nav / Bottom Bar | Navigation | ● | · | ● | — | M |  |
| Top Nav / App Bar | Navigation | ● | · | ● | — | M |  |
| Hover Card | Overlays | ● | ● | · | — | M |  |
| Popover | Overlays | ● | ● | · | — | M |  |
| Accordion | Display | ● | ● | · | ✓ |  |  |
| Avatar | Display | ● | ● | · | ✓ |  |  |
| Data Table | Display | ● | ● | · | ✓ |  | ★ |
| Empty State | Display | ● | ● | · | ✓ |  |  |
| Table | Display | ● | ● | · | ✓ |  |  |
| Tag / Chip | Display | ● | · | ● | ✓ |  |  |
| Alert / Banner | Feedback | ● | ● | · | ✓ |  |  |
| Skeleton | Feedback | ● | ● | · | ✓ |  |  |
| Label | Inputs | ● | ● | · | ✓ |  |  |
| Select | Inputs | ● | ● | · | ✓ |  |  |
| Breadcrumb | Navigation | ● | ● | · | ✓ |  |  |
| Navigation Menu / Mega Menu | Navigation | ● | ● | · | ✓ |  |  |
| Pagination | Navigation | ● | ● | · | ✓ |  |  |
| Alert Dialog | Overlays | ● | ● | · | ✓ |  |  |

## Tier 3 — in one reference

| Component | Category | Astryx | shadcn | Material | Ours | Effort | Showcase |
|---|---|---|---|---|---|---|---|
| Chat Composer | AI and chat | ● | · | · | — | L | ★ |
| Questionnaire / Prompt Form | AI and chat | · | ● | · | — | M |  |
| Tool Call Display | AI and chat | ● | · | · | — | L | ★ |
| Floating Action Button | Actions | · | · | ● | — | S |  |
| Menubar | Actions | · | ● | · | — | M |  |
| Split Button | Actions | · | · | ● | — | S |  |
| Blockquote | Display | ● | · | · | — | S |  |
| Chart | Display | · | ● | · | — | L | ★ |
| Citation | Display | ● | · | · | — | S |  |
| Code / Code Block | Display | ● | · | · | — | M |  |
| Description / Metadata List | Display | ● | · | · | — | S |  |
| Icon | Display | ● | · | · | — | S |  |
| Image / Thumbnail | Display | ● | · | · | — | S |  |
| Markdown | Display | ● | · | · | — | L |  |
| Selectable / Clickable Card | Display | ● | · | · | — | M |  |
| Timestamp / Relative Time | Display | ● | · | · | — | S |  |
| Tree View | Display | ● | · | · | — | L | ★ |
| Status Dot | Feedback | ● | · | · | — | S |  |
| Date Range Picker | Inputs | ● | · | · | — | L |  |
| Form Layout | Inputs | ● | · | · | — | M |  |
| Multi-select | Inputs | ● | · | · | — | L |  |
| Number Input | Inputs | ● | · | · | — | M |  |
| One-time Code Input | Inputs | · | ● | · | — | M |  |
| App Shell | Layout | ● | · | · | — | L |  |
| Grid | Layout | ● | · | · | — | S |  |
| Section / Container | Layout | ● | · | · | — | S |  |
| Stack | Layout | ● | · | · | — | S |  |
| Navigation Rail | Navigation | · | · | ● | — | M |  |
| Stepper | Navigation | ● | · | · | — | M | ★ |
| Table of Contents | Navigation | ● | · | · | — | M |  |
| Lightbox | Overlays | ● | · | · | — | M |  |
| Visually Hidden | Utilities | ● | · | · | — | S |  |
| Link | Actions | ● | · | · | ✓ |  |  |
| Avatar Group | Display | ● | · | · | ✓ |  |  |
| Heading | Display | ● | · | · | ✓ |  |  |

## Build plan (chosen 2026-10-08: credibility first)

Five waves, released at most weekly under [ADR 0022](../decisions/0022-release-at-most-weekly.md), so a long wave ships in parts. These components are built without waiting for a consumer, unlike the rule in `component-roadmap-spec.md`; [ADR 0024](../decisions/0024-build-components-for-coverage-not-only-consumers.md) records why and what replaces that check. Credibility first: close the gaps every reviewer expects before the showcase pieces. Ends at 97 components (35 + 62).

| Wave | Area | Components | Count | Running total |
|---|---|---|---|---|
| 1 | Core gaps | Divider, Progress Bar, Icon Button, Button Group, Segmented Control, Toggle Button, Slider, Carousel, Kbd, Visually Hidden | 10 | 45 |
| 2 | Forms | Field, Input Group, Number Input, Search, Calendar, Date Picker, Date Range Picker, Time Picker, Combobox, Multi-select, File Upload, Tag Input, One-time Code Input, Form Layout | 14 | 59 |
| 3 | Overlays and navigation | Popover, Hover Card, Context Menu, Command Palette, Toolbar, Lightbox, Stepper, Top Nav, Mobile Nav, Table of Contents | 10 | 69 |
| 4 | Layout and content | Stack, Grid, Section, App Shell, Scroll Area, Resizable Panels, Aspect Ratio, Text, Icon, Image, Code Block, Blockquote, Citation, Markdown, Timestamp, List, Item, Description List, Status Dot, Selectable Card, Collapsible | 21 | 90 |
| 5 | Data and AI | Tree View, Chart, Chat Composer, Chat Message, Message List, Tool Call Display, Prompt Form | 7 | 97 |

Wave 1 closes six of the seven Tier 1 gaps; Date Picker comes in wave 2 with the rest of the date family, which needs Calendar first.

**Left out on purpose:** Split Button, Floating Action Button, Navigation Rail (Material-only), Menubar (a desktop-app pattern). Revisit if a real consumer needs one.

**Each component counts as done when** it has every state, keyboard support, light and dark in all five brands (`base`, `portfolio`, `demo-cool`, `demo-warm`, `demo-soft`) with contrast pairs passing, tokens, a doc twin, a story, a registry entry, and Do / Don't guidance (written in `docs/components.md`, compiled into each twin's Best practices section). The count only grows with components that meet that bar.

## Schedule (re-planned 2026-10-15)

The first schedule (set 2026-10-14) gave waves 1 and 2 until 11 Nov. They took two days: 73 planned hours by the sizes above (S = 1 h, M = 2 h, L = 6 h), plus Popover. The rest is 95 planned hours: wave 3 22 h, wave 4 39 h, wave 5 34 h.

This plan assumes half that pace, about 18 planned hours per 4-hour day, because the later waves hold the hardest showcase pieces and each day includes review and merge time. Same done bar; if an L row runs over, the next day moves, not the bar.

| Day | Date | Work |
|---|---|---|
| 3 | Fri 16 Oct | Hover Card, Context Menu, Toolbar, Stepper, Table of Contents |
| 4 | Mon 19 Oct | Command Palette, Lightbox, Top Nav, Mobile Nav; wave 3 wrap-up (69) |
| 5 | Tue 20 Oct | Stack, Grid, Section, Aspect Ratio, Text, Icon, Image, Status Dot, Blockquote, Citation, Timestamp |
| 6 | Wed 21 Oct | List, Item, Description List, Collapsible, Scroll Area, Code Block, Selectable Card |
| 7 | Thu 22 Oct | App Shell, Resizable Panels |
| 8 | Fri 23 Oct | Markdown; wave 4 wrap-up (90) |
| 9 | Mon 26 Oct | Chat Message, Prompt Form, Chat Composer |
| 10 | Tue 27 Oct | Message List, Tool Call Display |
| 11 | Wed 28 Oct | Tree View |
| 12 | Thu 29 Oct | Chart |
| 13 | Fri 30 Oct | Wave 5 wrap-up, count check (97) |

The week of 2 Nov is slack for whatever ran over. The case study can start after that, instead of after 18 Dec.

Releases, at most weekly (ADR 0022): 1.5.0 the week of 19 Oct with waves 1 and 2 and whatever of wave 3 has merged; 1.6.0 the week of 26 Oct; 1.7.0 the week of 2 Nov.

## Progress

Checked 2026-10-20 against `main` at `ac063a5`: `registry/registry.json` has 80 components (81 items, one of them the theme), and `tokens/component-registry.json` counts 80 public.

| Wave | Planned | Done | PRs | Count after |
|---|---|---|---|---|
| 1 Core gaps | Wed 14 – Wed 21 Oct | 14–15 Oct | #81–#93 | 45 |
| 2 Forms | Thu 22 Oct – Wed 11 Nov | 15 Oct | #94–#107 | 59 |
| Popover (from wave 3) | 12 Nov | 15 Oct, with Date Picker, which needed it | #102 | 60 |
| 3 Overlays and navigation, the other nine | Fri 16 – Mon 19 Oct (re-planned) | 15 Oct | #109–#116 | 69 |
| 4 Layout and content, day 1 (11 of 21) | Tue 20 Oct | 20 Oct | #119, #121–#122, #124, #127–#132 | 80 |

- **Done bar:** every new component has a story with a dark-mode version, unit tests, a docs entry with accessibility notes and Do / Don't, a doc twin and a registry entry, and was screenshotted in all five brands, light and dark, before merge. `npm run validate` on `main` passes: contrast pairs in all 10 brand and mode combinations, 1,570 tests including axe on every story.
- **Wave 4 so far:** Stack, Grid, Section, Aspect Ratio, Text, Icon, Image, Status Dot, Blockquote, Citation, Timestamp. Still to come: List, Item, Description List, Collapsible, Scroll Area, Code Block, Selectable Card (Wed 21), App Shell, Resizable Panels (Thu 22), Markdown and the wrap-up (Fri 23).
- **Shared pieces added on the way:** `lib/field`, `lib/date`, `lib/time`, `lib/match`, `lib/highlight` (waves 1–3); `lib/relative-time` (Timestamp's wording rules) and `lib/date-test-utils` (wave 4).
- **New component tokens in wave 4:** `grid-min-item-sm/md/lg`, `status-dot-size`, `status-dot-pulse-duration`. Everything else in wave 4 uses existing semantic roles.
- **Fixes found while building:** Select and Input read Field; Input merges a passed `aria-describedby`; Tag's Remove button; Menu's disabled items (waves 1–3). Disabled controls across all components keep readable text instead of fading, IconButton and SegmentedControl included (#117, #118), which closes the follow-up recorded here on 2026-10-15.
- **CI was red from #101 to #118** and nobody saw it: the Calendar, Date Picker and Date Range Picker tests hardcoded labels like "Thursday 22 October 2026", and CI's Chromium formats them with a comma after the weekday. Fixed in #120 by building expected labels with the component's own `Intl` options. Lesson: check the CI run after each push, not only local `validate`.
- **Generated artifacts on `main` went stale** after Grid, Section and Aspect Ratio were each brought up to date with "Merge main into" on GitHub, which keeps one side of the generated files instead of rebuilding them. Rebuilt in #126; since then each branch starts from the current `main` and merges before the next one is cut.
- **Docs generator:** props typed "one or the other" (a union of object types) were garbled or missing from the twins: StatusDot's `label`, and `never` in Badge's and Dialog's prop types. Fixed in `scripts/build-component-docs.mjs` (#131).
- **Known limits, accepted and documented:** Status Dot's `success` and `warning` dots measure about 2.9:1 on the secondary surface in light mode (3:1 on the primary surface everywhere; the types require words with every dot). For the brand work: demo-soft's `label` weight (500 in Nunito) is barely heavier than body text, and demo-warm's `accent` and `error` colours are hard to tell apart.
- **Dependencies:** none added in wave 4. Wave 3 added `@radix-ui/react-context-menu` 2.3.7 only.
- **Release tooling:** `package-lock.json` now follows `package.json` on release (#108).
- **Still to do:** 1.5.0 hasn't been released yet; the "Version Packages" PR (#70) holds everything since 1.4.0. The docs site pages for the new components come with that release, which the site syncs on publish.

## Ours only

| Component | Category | Astryx | shadcn | Material | Ours | Effort | Showcase |
|---|---|---|---|---|---|---|---|
| Hero | Display | · | · | · | ✓ |  |  |
| Skip Link | Navigation | · | · | · | ✓ |  |  |
| Theme Scope | Utilities | · | · | · | ✓ |  |  |

## Reading it

- **Tier 1 gaps first.** Every reference has these and we don't: Button Group, Segmented Control / Toggle Group, Slider, Date Picker, Carousel, Divider / Separator, Progress Bar. Closing them makes the core credible to anyone who knows Material or shadcn.
- **Cheap breadth.** About 26 missing rows are effort S (Divider, Kbd, Visually Hidden, Stack, Icon Button, Progress Bar…). They raise the count fast but say little about skill.
- **Showcase depth.** The ★ rows are where a UX/UI reviewer sees interaction design: Date Picker, Combobox, Command Palette, Tree View, Stepper, Chart, and the AI and chat set (Composer, Message, Message List, Tool Calls). The chat set also fits the "Working with AI" story and the AI-applications roles.
- **Count versus depth.** A reviewer reads one component page closely, not the count. A component with every state, keyboard support, light and dark, tokens and Do / Don't guidance (each twin's Best practices section) shows more than five without. Breadth gets attention; depth is what survives a close look.

## What "ours only" says

Hero, Skip Link and Theme Scope appear in none of the three as named components. Skip Link and Theme Scope are a strength worth pointing out (accessibility and multi-brand); Hero is a page pattern the others leave to templates.
