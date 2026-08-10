# AGENTS.md

Router, not a rulebook. Read this, then follow the links — don't try to hold the whole system in context.

Adding or changing a component? Read its compiled twin first: `docs/components/<slug>.md` (real prop table, real tokens, a real usage example — generated from source, not hand-maintained). If the twin doesn't exist yet, `npm run tokens` regenerates it after you add the component to `docs/components.md`.

## Never violate

- No raw hex colors in component CSS (`#0A0A0A`) — use a semantic token.
- No primitive tokens in component CSS (`--color-warm-500`, `--color-black`, `--color-teal-*`) — go through the semantic layer.
- No `var(--token, fallback)` two-argument form — a token either exists or it doesn't; a fallback hides the difference instead of failing loud.
- No hardcoded motion (`transition: 200ms`) — use a `--duration-*` token.
- No hardcoded spacing (`padding: 16px`) — use a `--space-*` token.

`npm run tokens:lint` enforces all five, plus `no-fabricated-token` (any `var(--x)` that doesn't resolve to something real in `tokens/`) and a couple of structural rules. Read the errors — they tell you the fix and how to suppress a genuine exception (`/* lint-ignore: rule-id */`), which is different from working around a real one.

## Real token prefixes

Global primitives — never reference these directly from component CSS, only from the semantic layer: `color-`, `space-`, `font-size-`, `font-weight-`, `line-height-`, `border-radius-`, `duration-`, `easing-`, `opacity-`, `feedback-`, `shadow-`, `icon-size-`, `border-width-`, `size-`.

Component tokens follow `--<component-slug>-*` (e.g. `--button-padding-x`, `--dialog-max-width`). The real, complete list per component is in `tokens/token-reference.json` and each component's `docs/components/<slug>.md` — not memorized, not guessed.

**If a token you want isn't in `tokens/token-reference.json`, it doesn't exist yet.** Add it to the right layer (`tokens/global.json` for a primitive, `tokens/brands/*/tokens.json` for semantic, `tokens/components/<name>.json` for component-scoped) and run `npm run tokens`. Don't reference a name that isn't there.

## Components that exist

27 public components. Anything not on this list is provably invented — check `tokens/component-registry.json` if this list is ever stale.

- **Primitives (13):** Avatar, Badge, Button, Checkbox, Input, Label, Radio, Select, Skeleton, Spinner, Switch, Tag, Textarea
- **Composition (6):** Alert, Card, Dialog, Drawer, Toast, Tooltip
- **Patterns (8):** Accordion, Breadcrumb, DataTable, EmptyState, Hero, Pagination, Table, Tabs

(`BaseSheet` also ships in the package but is internal — Drawer's overlay primitive, not something to reach for directly.)

## Not done until

`npm run validate` exits `0`. It chains the token linter, the contrast checker, the component-registry check, the story-coverage check, and `tsc --noEmit`. A non-zero exit on any of them means the change isn't finished — fix the underlying issue, don't route around the check.

## Roadmap

This system's AI-readiness roadmap — what's shipped, what's in progress, why — lives in [`docs/ai-readiness-plan.md`](docs/ai-readiness-plan.md). Read its State block before starting unrelated work here; it names the current phase and the next action, so a session doesn't have to be told.
