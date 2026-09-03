# Design System

Token-first, multi-brand design system built and maintained solo — DTCG tokens, Style Dictionary, CI-enforced linting/contrast/accessibility, Figma sync, and agent-safe governance. Extracted from and still powering [amezquita.dk](https://amezquita.dk), and built to be shared across other projects.

[Live component docs →](https://amezquita.dk/design-system)

## What this is

A single source of truth for tokens and components, designed to be consumed as a package rather than copy-pasted between projects. The governance model — deterministic linting, contrast checks, story coverage, Figma sync detection — runs the same whether a human or an AI agent is making the change, and every rule that fails does so with a specific fix, not just a red X.

- **DTCG-compliant tokens** (`$value`/`$type`) — three layers: global primitives → semantic tokens → component tokens, resolved through [Style Dictionary](https://styledictionary.com); 650 tokens total — 112 global primitives, 125 semantic tokens, and 413 component tokens, each resolved across all four theme axes
- **Multi-brand, multi-mode** — a brand-agnostic `base` theme (real neutral gray) and a `portfolio` skin layered on top via CSS cascade, each with light/dark, no per-brand forking
- **28 components** across primitives, composition, and pattern tiers — 27 of them with full Storybook coverage including a required dark-mode story (BaseSheet is an internal overlay primitive with no stories of its own); 192 stories, zero visual regressions across every Chromatic build
- **CI-enforced governance** — a token linter (no raw hex, no primitive leakage, no hardcoded motion/spacing), a WCAG AA contrast checker across all four theme combinations, and a component-registry check that fails the build if a component ships without documentation
- **Figma drift detection** — `npm run figma:status` compares the resolved token state against a committed snapshot of what was last pushed to Figma (`figma/sync-state.json`), making staleness detectable offline and reviewable in a diff, with a weekly automated check. The checker is in place; the snapshot is baselined per Figma file via `--baseline`
- **Agent-safe by design** — every governance script gives specific, actionable failures; nothing here requires a human to interpret vague CI output

## Use via the component registry

```bash
npx shadcn add https://amezquita.dk/r/button.json
```

Works with any [shadcn-spec](https://ui.shadcn.com/docs/registry) registry client. Adds `@amezquita/design-system` as a dependency and injects the component's resolved design tokens (light + dark) into your project's CSS — no copy-pasted source, this is the same npm package either way. Swap `button` for any [public component](https://amezquita.dk/design-system/components), or browse the full manifest at [amezquita.dk/r/registry.json](https://amezquita.dk/r/registry.json).

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
| `npm run tokens:contrast` | WCAG AA contrast check across base-light/base-dark/portfolio-light/portfolio-dark |
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
  components/*.json        component-scoped tokens, aliasing semantic tokens

components/
  primitives/               13 — Button, Input, Select, Avatar, etc.
  composition/               7 — Dialog, Drawer, Toast, Tooltip, Card, Alert, BaseSheet
  patterns/                  8 — DataTable, Accordion, Tabs, Hero, Pagination, etc.
```

Component CSS never references a primitive token directly — everything routes through the semantic layer, enforced by the token linter. The portfolio skin and dark mode are both pure CSS custom-property overrides layered via cascade order and scoped by `[data-mode]` attributes; no component needs its own theme-aware logic.

Full governance docs — the component registry, Storybook requirements, and Chromatic policy — live in [`docs/components.md`](./docs/components.md).

## License

MIT
