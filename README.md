# Design System

Token-first, multi-brand design system built and maintained solo — DTCG tokens, Style Dictionary, CI-enforced linting/contrast/accessibility, Figma sync, and agent-safe governance. Extracted from and still powering [amezquita.dk](https://amezquita.dk), and built to be shared across other projects.

[Live component docs →](https://design.amezquita.dk) · [Storybook →](https://anto-amezquita.github.io/design-system/)

## What this is

A single source of truth for tokens and components, designed to be consumed as a package rather than copy-pasted between projects. The governance model — deterministic linting, contrast checks, story coverage, Figma sync detection — runs the same whether a human or an AI agent is making the change, and every rule that fails does so with a specific fix, not just a red X.

- **DTCG-compliant tokens** (`$value`/`$type`) — three layers: global primitives → semantic tokens → component tokens, resolved through [Style Dictionary](https://styledictionary.com); 400 tokens total — 126 global primitives, 151 semantic tokens, and 123 component tokens, each resolved across all four theme axes
- **Multi-brand, multi-mode** — a brand-agnostic `base` theme (real neutral gray) and thin skins layered on top via CSS cascade (`portfolio`, plus `demo-cool`, `demo-warm` and `demo-soft` for the docs site), each with light/dark, no per-brand forking
- **98 components** across primitives, composition, and pattern tiers — 97 of them public, with full Storybook coverage including a required dark-mode story (BaseSheet is an internal overlay primitive with no stories of its own); 567 stories, each checked with axe in CI
- **CI-enforced governance** — a token linter (no raw hex, no primitive leakage, no hardcoded motion/spacing), a WCAG AA contrast checker across every brand and mode, and a component-registry check that fails the build if a component ships without documentation
- **Figma drift detection** — `npm run figma:status` compares the resolved token state against a committed snapshot of what was last pushed to Figma (`figma/sync-state.json`), making staleness detectable offline and reviewable in a diff, with a weekly automated check. The checker is in place; the snapshot is baselined per Figma file via `--baseline`
- **Agent-safe by design** — every governance script gives specific, actionable failures; nothing here requires a human to interpret vague CI output

## Use via the component registry

```bash
npx shadcn add https://design.amezquita.dk/r/button.json
```

Works with any [shadcn-spec](https://ui.shadcn.com/docs/registry) registry client. Adds `@amezquita/design-system` as a dependency and injects the component's resolved design tokens (light + dark) into your project's CSS — no copy-pasted source, this is the same npm package either way. Swap `button` for any [public component](https://design.amezquita.dk/components), or browse the full manifest at [design.amezquita.dk/r/registry.json](https://design.amezquita.dk/r/registry.json).

If you're on Next.js, you'll also need the `transpilePackages` config below — the registry installs the dependency, not your bundler config.

## Install

```bash
npm install @amezquita/design-system
```

```tsx
import { Button } from '@amezquita/design-system/components/primitives/Button'
import '@amezquita/design-system/styles/brands/base-light.css'
import '@amezquita/design-system/styles/brands/base-dark.css'
import '@amezquita/design-system/styles/brands/portfolio-light.css'
import '@amezquita/design-system/styles/brands/portfolio-dark.css'
```

Peer dependencies: `react` and `react-dom` ^19.

### Both brands on one page

`portfolio-light.css` and `portfolio-dark.css` restyle the whole page from `:root`. To show the portfolio brand inside one part of a page and keep the rest on `base`, load `portfolio-scoped.css` instead of those two, and wrap the part in `ThemeScope`:

```tsx
import '@amezquita/design-system/styles/brands/base-light.css'
import '@amezquita/design-system/styles/brands/base-dark.css'
import '@amezquita/design-system/styles/brands/portfolio-scoped.css'
import { ThemeScope } from '@amezquita/design-system/components/composition/ThemeScope'

<ThemeScope brand="portfolio">…</ThemeScope>
```

The part follows the page's mode, or its own with `mode="light"` or `mode="dark"`; `mode` works without a brand too. Dialogs, drawers, menus, selects and tooltips opened inside it take the same brand and mode, although they render at the end of the page. `ThemeScope` renders a `<div data-brand data-mode>`; writing those attributes by hand styles the part, but overlays opened in it fall back to the page's brand and mode ([ADR 0021](decisions/0021-theme-scope.md)). Don't load `portfolio-scoped.css` next to `portfolio-light.css`: the `:root` one would still restyle everything.

The other way round works too: on a page that wears a brand, `base-scoped.css` and `<ThemeScope brand="base">` bring one part back to base ([ADR 0023](decisions/0023-demo-brands-and-n-brand-build.md), 2026-10-13 amendment).

### Light and dark mode

The dark values apply under `<html data-mode="dark">`, not from `prefers-color-scheme`, so a visitor can pick. `lib/color-mode` sets the attribute from their pick, or from the system setting until they pick. It runs before first paint, so a dark page never flashes light. Put its script in `<head>`, ahead of the stylesheets:

```tsx
// Next.js App Router, app/layout.tsx (a Server Component)
import Script from 'next/script'
import { colorModeScript } from '@amezquita/design-system/lib/color-mode'

<html lang="en" suppressHydrationWarning>
  <head>
    <Script id="color-mode" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
  </head>
```

With Vite, add the same string to `index.html`'s `<head>` with `transformIndexHtml`. The script keeps following the system setting while the visitor hasn't picked. For a switch, `useColorMode()` gives `preference` (`light`, `dark` or `system`), `mode` (what the page is in now) and `setPreference`:

```tsx
import { useColorMode, type ColorModePreference } from '@amezquita/design-system/hooks/useColorMode'

const { preference, setPreference } = useColorMode()
<SegmentedControl value={preference} onValueChange={value => setPreference(value as ColorModePreference)} … />
```

The pick is remembered in `localStorage` under `amezquita-color-mode`. Pass `{ storageKey }` to both `colorModeScript` and `useColorMode` to use your own key.

### Fonts

The package ships no font files. The `base` theme sets its text in a system font stack and its code in JetBrains Mono; `portfolio` adds Schibsted Grotesk for text; each demo brand names its own fonts. Load them from Google Fonts with the `<link>` tags in [`tokens/fonts.json`](tokens/fonts.json): `brands.<brand>.href` is the stylesheet, `brands.<brand>.preconnect` the origins to preconnect to. The same links are in `llms.txt`. Both are generated from the font tokens, so they change when a font does. Why there are no font files: [ADR 0020](decisions/0020-fonts-from-google-fonts-no-font-files.md).

### Your project's own brand

A product's brand lives in the product's repo: a folder with `tokens.json` (light) and `dark.json`, in the same shape as `tokens/brands/demo-cool/`. [`docs/brand-contract.md`](docs/brand-contract.md) lists the tokens a brand may set. Tokens of the project's own are named after the brand (`ajar-signal-*`). Check the brand, locally or in CI:

```bash
npx amezquita-brand check tokens/brands/ajar
npx amezquita-brand check tokens/brands/ajar --pairs tokens/brands/ajar/contrast-pairs.json
```

It fails on a token the brand may not set, a misspelt name, a wrong `$type`, a light value that would leak into dark mode, and any contrast pair below its ratio. Each error says how to fix it. `--pairs` adds contrast pairs for the brand's own tokens, in the format of [`tokens/contrast-pairs.json`](tokens/contrast-pairs.json). For the results as data, `import { checkBrand } from '@amezquita/design-system/brand/check.mjs'`.

Then build its CSS. `build` runs the check first and builds nothing from a brand that fails. It needs `style-dictionary` ^5 in the project, an optional peer dependency of this package:

```bash
npm install --save-dev style-dictionary@^5
npx amezquita-brand build tokens/brands/ajar --out src/styles/brand
```

It writes the three files a brand in this package gets, plus the font link:

- `ajar-light.css` and `ajar-dark.css`, for a whole page: load them after `base-light.css` and `base-dark.css`.
- `ajar-scoped.css`, for one part of a page: load it instead of the other two, and wrap the part in `<ThemeScope brand="ajar">`.
- `ajar-fonts.json`, the Google Fonts `<link>` for the fonts the brand names. A font the link can't cover is printed as a warning, for the project to load itself.

Why brands live in projects: [ADR 0028](decisions/0028-brand-contract-for-project-brands.md).

This package ships source `.tsx`/`.css` directly rather than a pre-built bundle, so your bundler needs to be told to process it — most tools skip transforming `node_modules` by default:

- **Next.js**: add `transpilePackages: ['@amezquita/design-system']` to `next.config.js`
- **Vite**: no config needed for dev, but for a production build add `'@amezquita/design-system'` to `optimizeDeps.include` if you hit a pre-bundling issue

## Development

```bash
npm install
npm run tokens       # build CSS from token sources + regenerate derived JSON
npm run storybook    # dev server at localhost:6006
```

| Script | What it does |
|---|---|
| `npm run tokens` | Full token build: dependency graph → CSS (Style Dictionary) → token reference, component registry, changelog |
| `npm run tokens:lint` | Token usage linter over component CSS |
| `npm run tokens:brands` | Every brand in `tokens/brands/` against the brand contract, and WCAG AA contrast for base and every brand in light and dark |
| `npm run tokens:graph` | Rebuilds the token → component-file dependency graph |
| `npm run figma:status` | Reports drift between token sources and the last Figma push |
| `npm run storybook` | Storybook dev server |
| `npm run build-storybook` | Static Storybook build |
| `npm run a11y` | Builds Storybook, then runs axe against every rendered story |
| `npm run chromatic` | Visual regression run against Chromatic |

## Architecture

```
tokens/
  global.json              primitives — raw values, never referenced directly by components
  brands/base/              brand-agnostic foundation — light.json + dark.json, standalone-usable
  brands/portfolio/        brand skin layered on base — tokens.json (light) + dark.json
  brands/demo-*/           three demo skins for the docs site's hero (decisions/0023), same shape
  components/*.json        component-scoped tokens, aliasing semantic tokens

components/
  primitives/               16 — Button, Input, Select, Avatar, Link, SkipLink, etc.
  composition/              10 — Dialog, AlertDialog, Drawer, Menu, NavigationMenu, Toast, Tooltip, Card, Alert, BaseSheet
  patterns/                  9 — DataTable, Accordion, Tabs, Hero, Pagination, SideNav, etc.
```

Component CSS never references a primitive token directly — everything routes through the semantic layer, enforced by the token linter. The portfolio skin and dark mode are both pure CSS custom-property overrides layered via cascade order and scoped by `[data-mode]` attributes; no component needs its own theme-aware logic.

Full governance docs — the component registry, Storybook requirements, and Chromatic policy — live in [`docs/components.md`](./docs/components.md).

## License

MIT
