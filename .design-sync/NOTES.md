# design-sync notes — @amezquita/design-system

Repo-specific knowledge for syncing this design system to claude.ai/design.
Read this before every re-sync.

## How this repo builds for the sync

- [GENERAL] The package ships TypeScript source: no `main`/`exports`, no build
  script, no barrel. `node .design-sync/build-package.mjs` (`cfg.buildCmd`)
  stages a dist-like package in `.design-sync/.cache/pkg/`. It writes a barrel
  that `export *`s every `components/*/*/index.ts` (BaseSheet is excluded as
  internal) plus the shipped stylesheets, a `tsc` declaration emit to `types/`,
  and a `package.json` with `types`. `cfg.entry` points at the staged
  `index.ts`. Run it before every converter/driver run. A component added
  upstream is picked up automatically if it has an `index.ts`.
- [GENERAL] The stylesheets in the barrel follow the user's brand decisions:
  **base is the default, every other brand is opt-in** (2026-10-09 for
  portfolio; 2026-10-13 the user chose to ship the three demo brands from ADR
  0023 too). `base-light.css` and `base-dark.css` sit at `:root` /
  `[data-mode]`, every `styles/brands/*-scoped.css` applies under its own
  `[data-brand="..."]`, and `reset.css` comes last. `build-package.mjs` globs
  the scoped files, the same files `ThemeScope`'s `brand` type is generated
  from, so a new brand folder ships on the next sync without an edit. The
  unscoped `<brand>-light/dark.css` are NOT shipped.
- [GENERAL] The repo's Storybook loads base and portfolio at `:root`, so every
  story renders in the portfolio brand. To grade like for like, `cfg.provider`
  wraps preview cards in `<ThemeScope brand="portfolio">`, outermost so that
  Toast's fixed viewport also sits inside the scope, then `ToastProvider` >
  `TooltipProvider` (the two context providers `.storybook/preview.tsx`
  decorates every story with). The provider chain only shapes the cards;
  designs default to base. `.design-sync/conventions.md` says so explicitly,
  because the generated README prints the chain as if it were required.
- [GENERAL] Fonts: since 2026-10-14 `.storybook/main.ts` adds every brand's
  Google Fonts link from `tokens/fonts.json` to the preview head (it replaced
  `preview-head.html`, which loaded DM Sans, DM Serif Display, Inter and
  JetBrains Mono and never Schibsted Grotesk). The sync still self-hosts Schibsted Grotesk and JetBrains Mono
  (Google Fonts, OFL, latin + latin-ext, variable) in `.design-sync/fonts/`,
  shipped through `cfg.extraFonts`. To fetch them again, request the Google
  Fonts css2 API with a Chrome user agent and keep the latin/latin-ext blocks.
- [GENERAL] Demo-brand fonts: `node .design-sync/fetch-demo-fonts.mjs` reads
  each brand's Google Fonts link from `tokens/fonts.json`, downloads the
  latin + latin-ext woff2 files into `.design-sync/fonts/` and writes
  `fonts/demo-brands.css` (the second `cfg.extraFonts` entry). It skips
  Schibsted Grotesk and JetBrains Mono, which `fonts.css` already covers in
  wider ranges. The converter merges both stylesheets into one
  `ds-bundle/fonts/fonts.css`, so `styles.css` still shows a single font
  `@import`. That's expected.
- [GENERAL] The reference Storybook is patched with those same fonts so the
  compare oracle renders the real typeface. After EVERY reference rebuild:
  `npx storybook build -c .storybook -o .design-sync/sb-reference && node .design-sync/patch-reference.mjs`.
- [GENERAL] Fork `overrides/css-fallback.mjs`: `scrapeRemoteImports` returns
  `[]`. Without it, the Google Fonts `<link>`s Storybook's preview head
  carries (the brands' fonts, from `tokens/fonts.json`) would be `@import`ed
  into `styles.css` for every design, on top of the self-hosted copies and
  depending on the network.
- [GENERAL] Playwright: `.ds-sync` pins `playwright@1.62.1` to match the repo's
  own pin and the cached `chromium-1234`. The latest version wants a browser
  that isn't installed here.
- `titleMap`: story title `Components/Toast` -> export `ToastProvider` (Toast
  has no component export; the stories demo `useToast` under the provider).
- `docsMap`: `RadioGroup` -> `docs/components/radio.md` and `ToastProvider` ->
  `docs/components/toast.md`. The other components match
  `docs/components/<slug>.md` (the generated compiled twins) through `docsDir`.
- Card layout overrides (presentation only, from `[GRID_OVERFLOW]`):
  NavigationMenu, DataTable and Pagination use `cardMode: column`. ThemeScope
  (Default), SideNav (Default) and SkipLink (Focused) use `cardMode: single`.

- [GENERAL] Fork `overrides/source-storybook.mjs`: the component group comes
  from the story file's tier folder (`components/<primitives|composition|patterns>/`),
  not the story title prefix. The titles mix `Components/`, `Primitives/`,
  `Composition/` and `Patterns/` for the same three tiers. The fork imports
  `esbuild` by bare name, so each fresh clone needs
  `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`.

## Owned previews (`.design-sync/previews/`)

- [GENERAL] Previews never run a story's `play` function. Stories that reach
  their snapshot state through `play` need an owned preview that replays the
  step on mount (`playOnMount` / `focusOnMount` wrappers):
  - `SkipLink`: Focused, CustomTarget and DarkMode call `link.focus()`.
  - `Menu`: Open, WithGroupLabelsAndIcons, Overflow and DarkMode click the
    trigger. Radix DropdownMenu opens on `pointerdown` (button 0), not `click`.
  - `NavigationMenu`: Open and DarkMode focus, then click the "Writing"
    trigger. The focus reproduces the ring `userEvent.click` leaves.
  If any of those stories change, update the owned file.

## Capture viewports (`cfg.overrides.<Name>.viewport`)

- [GENERAL] compare screenshots the Storybook story ROOT ELEMENT (any height)
  but only the preview's viewport (default 900x700), so tall stories look
  clipped on the preview side only. The fix is a taller per-component
  viewport: Textarea, Pagination and DataTable use 900x1200, Table 900x1500
  (All variants is 1453px) and EmptyState 900x1900 (All variants is 1790px).
- NavigationMenu (1280x700) and SideNav (1280x800) are desktop-only above
  1024px, the same as their Chromatic viewports. At 900 both sides render
  blank. SideNav's drawer stories (`MobileDrawer`, `DarkMode`) gate their
  `play` on desktop, so at 1280 they show the inline nav on both sides. **The
  open mobile drawer itself is not verified by this sync.**
- Menu uses `cardMode: single` (primaryStory Open), because the open menu is
  portalled overlay content.

## Verification learnings

- First sync 2026-10-09: all 35 components graded `match`, every story,
  including Button's tail stories (--max-stories 14).
- Solo set (graded exhaustively, all match): Button (all 14 stories), Avatar,
  Dialog, Hero, ThemeScope. The Avatar remote image (github.com/shadcn.png)
  loaded on both panels, so there's no network sandbox problem.
- Framing differences to ignore when grading: Storybook pads every story by
  48px on a `--color-surface-primary` canvas, while preview cells sit on white
  at the top-left. Text-wrapping differences in full-width components (Hero
  dark mode, Card's All variants grid, DataTable cells) come from that padding.
  Disabled fields look different only because they're translucent over a
  different page color.
- Dialog, AlertDialog, Drawer, Toast and Tooltip stories render the closed
  state (trigger only) on both sides, because they open on click or hover.
  That's faithful, not a bug, but it means their open overlays are not
  pixel-verified here.

- Re-sync 2026-10-13 (package 1.4.0: demo brands, Button pressed state and
  radius token, `font-variation-heading`, `color-accent-text`): no story
  source changed, so all 35 grades carried. Spot-checked nine fresh sheets
  against their recorded grades, all still `match`: the driver's five
  (DataTable, Drawer, NavigationMenu, Heading, Skeleton) plus the four whose
  CSS changed (Button, Link, Dialog, Hero).
- The demo brands have no stories, so the compare oracle never sees them. They
  were checked by eye instead: a page built from `ds-bundle/` (`styles.css`
  only, like a design) rendering Heading, Link, Card, Badge, Button, Input,
  Tag and Switch under each brand in light and dark. Every family loaded from
  `fonts/`, no failed requests, and the computed styles matched the brand CSS
  (Archivo at `'wdth' 112.5`, Fraunces at `'SOFT' 100, 'WONK' 0`, demo-warm's
  2px button radius, demo-soft's pill).
- `CardHeader` is a column flex container, so a `Badge` placed in it stretches
  to full width. The conventions example sets `alignSelf: 'flex-start'` on it
  and says why.

## Known render warns

- None at the end of the first sync (validate exits clean, no warnings).

## Re-sync risks

- **Owned previews** (SkipLink, Menu, NavigationMenu) copy the story's `play`
  logic by hand. A changed `play` step, trigger label ("Writing") or story
  export name will silently stop matching. Watch for `[STORY_CHANGED]`.
- **Reference patch**: `sb-reference` must be patched with
  `patch-reference.mjs` after every rebuild, or the oracle falls back to a
  default font. A green compare against an unpatched reference means nothing.
  Storybook now loads Schibsted Grotesk itself (from Google, 2026-10-14), but
  the patch stays: it makes the oracle use the same self-hosted files the
  bundle ships, with no network.
- **Fonts are a snapshot** of Google Fonts: Schibsted Grotesk 400–900 and
  JetBrains Mono 100–800 as of 2026-10-09, the seven demo-brand families as of
  2026-10-13 (all variable, latin + latin-ext). If `tokens/fonts.json` gains
  or changes a family, run `node .design-sync/fetch-demo-fonts.mjs` before the
  driver. A brand whose font is missing renders a fallback in designs, and
  nothing in the sync flags it, because no story uses the demo brands.
- **Brands ship by glob** (`styles/brands/*-scoped.css`), so a new brand's CSS
  arrives on its own, but its fonts don't (see above), and
  `.design-sync/conventions.md` names the brands by hand. A new, renamed or
  removed brand needs that paragraph updated.
- **Demo brands are not oracle-verified.** Repeat the by-eye check from
  Verification learnings when a demo brand's tokens change.
- **Story cap**: compare captures up to 14 stories per component. Only Button
  has 14. Raise `--max-stories` if any component grows past that.
- **Not pixel-verified**: open Dialog, AlertDialog, Drawer, Toast and Tooltip
  overlays, SideNav's mobile drawer (see above), and anything under a demo
  brand.
- **Local git exclude**: on the machine that ran the first two syncs,
  `.git/info/exclude` lists `.design-sync/`, so a NEW file under it (a font, an
  owned preview, a script) never shows in `git status`. Check with
  `git status --short --ignored .design-sync` and add new durable files with
  `git add -f`.
- **Toolchain**: built with node 26.2, Storybook 10.3, playwright 1.62.1 /
  chromium-1234.
