# Design System

Token-first, multi-brand design system built and maintained solo — DTCG tokens, Style Dictionary, CI-enforced linting/contrast/accessibility, Figma sync, and agent-safe governance. Extracted from and still powering [amezquita.dk](https://amezquita.dk), and built to be shared across other projects.

[Live component docs →](https://amezquita.dk/design-system)

## What this is

A single source of truth for tokens and components, designed to be consumed as a package rather than copy-pasted between projects. The governance model — deterministic linting, contrast checks, story coverage, Figma sync detection — runs the same whether a human or an AI agent is making the change, and every rule that fails does so with a specific fix, not just a red X.

- **DTCG-compliant tokens** (`$value`/`$type`) — three layers: global primitives → semantic tokens → component tokens, resolved through [Style Dictionary](https://styledictionary.com)
- **Multi-brand, multi-mode** — light/dark × default/bold, composed independently via a mode/expression token axis, no per-brand forking
- **28 components** across primitives, composition, and pattern tiers, each with full Storybook coverage including a required dark-mode story
- **CI-enforced governance** — a token linter (no raw hex, no primitive leakage, no hardcoded motion/spacing), a WCAG AA contrast checker across all four theme combinations, and a component-registry check that fails the build if a component ships without documentation
- **Figma sync detection** — a committed manifest (`figma/sync-state.json`) makes drift between the token source and the last Figma push detectable and reviewable in a diff, with a weekly automated check
- **Agent-safe by design** — every governance script gives specific, actionable failures; nothing here requires a human to interpret vague CI output

## Install

```bash
npm install @amezquita/design-system
```

```tsx
import { Button } from '@amezquita/design-system/components/primitives/Button'
import '@amezquita/design-system/styles/brands/portfolio.css'
```

Peer dependencies: `react` and `react-dom` ^19.

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
| `npm run tokens:contrast` | WCAG AA contrast check across light/dark/bold/darkBold |
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
  brands/portfolio/        base semantic tokens (light, default expression)
  brands/dark/              mode-axis overrides
  brands/bold/               expression-axis overrides
  components/*.json        component-scoped tokens, aliasing semantic tokens

components/
  primitives/               13 — Button, Input, Select, Avatar, etc.
  composition/               7 — Dialog, Drawer, Toast, Tooltip, Card, Alert, BaseSheet
  patterns/                  8 — DataTable, Accordion, Tabs, Hero, Pagination, etc.
```

Component CSS never references a primitive token directly — everything routes through the semantic layer, enforced by the token linter. Dark mode and the bold expression are pure CSS custom-property overrides scoped by `[data-mode]`/`[data-expression]` attributes; no component needs its own theme-aware logic.

Full governance docs — the component registry, Storybook requirements, and Chromatic policy — live in [`docs/components.md`](./docs/components.md).

## License

MIT
