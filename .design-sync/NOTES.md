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
- [GENERAL] The stylesheets in the barrel follow the user's brand decision
  (2026-10-09): **base is the default, portfolio is opt-in**. `base-light.css`
  and `base-dark.css` sit at `:root` / `[data-mode]`, `portfolio-scoped.css`
  applies under `[data-brand="portfolio"]`, and `reset.css` comes last. The
  unscoped `portfolio-light/dark.css` are NOT shipped.
- [GENERAL] The repo's Storybook loads base and portfolio at `:root`, so every
  story renders in the portfolio brand. To grade like for like, `cfg.provider`
  wraps preview cards in `<ThemeScope brand="portfolio">`, outermost so that
  Toast's fixed viewport also sits inside the scope, then `ToastProvider` >
  `TooltipProvider` (the two context providers `.storybook/preview.tsx`
  decorates every story with). The provider chain only shapes the cards;
  designs default to base. `.design-sync/conventions.md` says so explicitly,
  because the generated README prints the chain as if it were required.
- [GENERAL] Fonts: `.storybook/storybook.css` sets `Schibsted Grotesk`, but
  `.storybook/preview-head.html` never loads it. It loads DM Sans, DM Serif
  Display, Inter and JetBrains Mono, so the repo's own Storybook renders a
  fallback sans-serif. The sync self-hosts Schibsted Grotesk and JetBrains Mono
  (Google Fonts, OFL, latin + latin-ext, variable) in `.design-sync/fonts/`,
  shipped through `cfg.extraFonts`. To fetch them again, request the Google
  Fonts css2 API with a Chrome user agent and keep the latin/latin-ext blocks.
- [GENERAL] The reference Storybook is patched with those same fonts so the
  compare oracle renders the real typeface. After EVERY reference rebuild:
  `npx storybook build -c .storybook -o .design-sync/sb-reference && node .design-sync/patch-reference.mjs`.
- [GENERAL] Fork `overrides/css-fallback.mjs`: `scrapeRemoteImports` returns
  `[]`. Without it, the Google Fonts `<link>` from preview-head (Storybook
  chrome, unused DS families) would be `@import`ed into `styles.css` for every
  design.
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

## Known render warns

- None at the end of the first sync (validate exits clean, no warnings).

## Re-sync risks

- **Owned previews** (SkipLink, Menu, NavigationMenu) copy the story's `play`
  logic by hand. A changed `play` step, trigger label ("Writing") or story
  export name will silently stop matching. Watch for `[STORY_CHANGED]`.
- **Reference patch**: `sb-reference` must be patched with
  `patch-reference.mjs` after every rebuild, or the oracle falls back to a
  default font. A green compare against an unpatched reference means nothing.
  If `.storybook/preview-head.html` starts loading Schibsted Grotesk itself,
  the patch and the `css-fallback` fork can both go.
- **Fonts are a snapshot** of Google Fonts as of 2026-10-09 (variable
  Schibsted Grotesk 400–900, JetBrains Mono 100–800, latin + latin-ext). If
  `tokens/fonts.json` changes families, refetch them.
- **Brand CSS list** is hard-coded in `build-package.mjs` (base-light,
  base-dark, portfolio-scoped, reset). A new brand or a renamed stylesheet
  needs an edit there.
- **Story cap**: compare captures up to 14 stories per component. Only Button
  has 14. Raise `--max-stories` if any component grows past that.
- **Not pixel-verified**: open Dialog, AlertDialog, Drawer, Toast and Tooltip
  overlays, and SideNav's mobile drawer (see above).
- **Toolchain**: built with node 26.2, Storybook 10.3, playwright 1.62.1 /
  chromium-1234.
