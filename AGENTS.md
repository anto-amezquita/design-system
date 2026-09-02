# AGENTS.md

Router, not a rulebook. Read this, then follow the links — don't try to hold the whole system in context.

**Full technical rules:** [`docs/architecture.md`](docs/architecture.md) (stack, token tiers, repo structure, conventions) and [`docs/quality.md`](docs/quality.md) (what `npm run validate` checks and why). **Feature work:** one file per body of work in [`/specs`](specs). **Significant decisions:** one ADR per choice in [`/decisions`](decisions) — read [`/decisions/README.md`](decisions/README.md) for the template before making an architectural call, and write one when you make it. **Repeatable workflows:** [`/contributor-skills`](contributor-skills) (distinct from the generated `skills/amezquita-design-system/`, which is the consumer-facing skill `npm run tokens` rebuilds — don't hand-edit that one).

Adding or changing a component? Read its compiled twin first: `docs/components/<slug>.md` (real prop table, real tokens, a real usage example — generated from source, not hand-maintained). If the twin doesn't exist yet, `npm run tokens` regenerates it after you add the component to `docs/components.md`.

## Prefer the MCP tools when connected

If the `amezquita-design-system` MCP server is connected (check `claude mcp list`), its tools are the same data as the files below, one call instead of a path to remember: `list_components`/`get_component` for props and usage, `search_tokens`/`get_token`/`validate_token` for tokens, `get_registry_item` for the shadcn-spec manifest, `get_skill` for this system's agent skill. Not connected? Nothing here is MCP-only — every file pointer in this document still works. Spec: [`specs/mcp-server-spec.md`](specs/mcp-server-spec.md).

## Never violate

- No raw hex colors in component CSS (`#0A0A0A`) — use a semantic token.
- No primitive tokens in component CSS (`--color-warm-500`, `--color-black`, `--color-teal-*`) — go through the semantic layer.
- No `var(--token, fallback)` two-argument form — a token either exists or it doesn't; a fallback hides the difference instead of failing loud.
- No hardcoded motion (`transition: 200ms`) — use a `--duration-*` token.
- No hardcoded spacing (`padding: 16px`) — use a `--space-*` token.
- No hardcoded `line-height` values (bare `1`/`0` excepted for tight single-line/icon-only controls) — use a `--line-height-*` token.

`npm run tokens:lint` enforces all six, plus `no-fabricated-token` (any `var(--x)` that doesn't resolve to something real in `tokens/`), `no-deep-bem-nesting`, and `no-missing-reduced-motion` — 9 rules total, itemized in [`docs/quality.md`](docs/quality.md) §2. Read the errors — they tell you the fix and how to suppress a genuine exception (`/* lint-ignore: rule-id */`, with a one-line reason), which is different from working around a real one.

## Do not

- Hand-edit anything generated (`docs/components/`, `tokens/token-reference.json`, `tokens/component-registry.json`, `registry/`, `llms.txt`/`llms-full.txt`/`tokens.json`, `skills/amezquita-design-system/`) — fix the generator in `scripts/` and run `npm run tokens`.
- Add a component token that's a pass-through or chain-skip to its referent in all 4 modes without a reason — it's a collapse candidate on day one, not free (see the token-architecture backlog in `docs/ai-readiness-plan.md`).
- Introduce a second full semantic token tier for a new brand — a brand is a thin override skin on `base` (see ADR [`0001`](decisions/0001-white-label-base-portfolio-brand-split.md)), never its own complete color/type/spacing tier.
- Adopt an external library or convention wholesale for one technique you need from it — see ADR [`0002`](decisions/0002-reject-transitions-dev-library-adopt-audit-technique.md).
- Make an architectural change (new token tier, new brand, changed component model, changed package structure) without writing an ADR in `/decisions`.
- Consider a change done because `npm run tokens` and `npm run validate` pass locally but you haven't checked whether generated artifacts are stale — CI's staleness check (`git add -N` + diff) is the real gate; reproduce it locally if unsure.
- Edit `AGENTS.md`, `docs/architecture.md`, `docs/quality.md`, or add/edit an ADR or spec without running [`contributor-skills/governance-audit`](contributor-skills/governance-audit/SKILL.md) first — `npm run validate` doesn't catch contradictions between documents, only between code and docs (see that skill's origin note for what it caught here on 2026-09-02).

## Real token prefixes

Global primitives — never reference these directly from component CSS, only from the semantic layer: `color-`, `space-`, `font-size-`, `font-weight-`, `line-height-`, `border-radius-`, `duration-`, `easing-`, `opacity-`, `feedback-`, `shadow-`, `icon-size-`, `border-width-`, `size-`.

Component tokens follow `--<component-slug>-*` (e.g. `--button-padding-x`, `--dialog-max-width`). The real, complete list per component is in `tokens/token-reference.json` and each component's `docs/components/<slug>.md` — not memorized, not guessed.

**If a token you want isn't in `tokens/token-reference.json`, it doesn't exist yet.** Add it to the right layer (`tokens/global.json` for a primitive, `tokens/brands/*/tokens.json` for semantic, `tokens/components/<name>.json` for component-scoped) and run `npm run tokens`. Don't reference a name that isn't there.

## Components that exist

28 public components. Anything not on this list is provably invented — check `tokens/component-registry.json` if this list is ever stale.

- **Primitives (13):** Avatar, Badge, Button, Checkbox, Input, Label, Radio, Select, Skeleton, Spinner, Switch, Tag, Textarea
- **Composition (7):** Alert, AlertDialog, Card, Dialog, Drawer, Toast, Tooltip
- **Patterns (8):** Accordion, Breadcrumb, DataTable, EmptyState, Hero, Pagination, Table, Tabs

(`BaseSheet` also ships in the package but is internal — Drawer's overlay primitive, not something to reach for directly.)

## Not done until

`npm run validate` exits `0`. It chains the token linter, the contrast checker, the component-registry check, the story-coverage check, and `tsc --noEmit` — full detail and rationale in [`docs/quality.md`](docs/quality.md). A non-zero exit on any of them means the change isn't finished — fix the underlying issue, don't route around the check.

## Roadmap

This system's AI-readiness roadmap — what's shipped, what's in progress, why — lives in [`docs/ai-readiness-plan.md`](docs/ai-readiness-plan.md). Read its State block before starting unrelated work here; it names the current phase and the next action, so a session doesn't have to be told.
