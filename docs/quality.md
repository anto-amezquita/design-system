# quality.md

## Purpose

This file defines the quality bar for this design system and names exactly what enforces each part of it — no rule here should be unenforced and unverifiable at the same time as it's stated.

Adapted from the ai-product-starter-kit's `quality.md` template — sections that assume a full product (content.md, brand.md, analytics, browser/device support matrix, deployment rollback) are dropped or marked **N/A**: this is a component-library package, not an end-user product.

---

## 1. Definition of done

Work is done when:

- `npm run validate` exits `0` (see §2 — this is the single gate, not a suggestion).
- The relevant spec in `/specs` is satisfied, or a new one was written for work big enough to need it.
- A significant architectural choice made along the way is recorded as an ADR in `/decisions`.
- Generated artifacts (`docs/components/`, `tokens/token-reference.json`, `registry/`, `llms*.txt`, `tokens.json`, `skills/amezquita-design-system/`) were regenerated via `npm run tokens`, not hand-edited.
- No known lint violation is suppressed without a one-line reason in the `lint-ignore` comment.

## 2. `npm run validate` — the one gate

```
npm run validate = tokens:lint && tokens:contrast && check-components-doc.mjs && check-stories.mjs && typecheck
```

| Step | What it checks | Script |
|---|---|---|
| `tokens:lint` | 8 rules against component CSS (below) | `scripts/lint-tokens.mjs` |
| `tokens:contrast` | Color contrast across all 4 brand/mode combinations | `scripts/check-contrast.mjs` |
| `check-components-doc.mjs` | Every component in `tokens/component-registry.json` has a `docs/components.md` entry | — |
| `check-stories.mjs` | Every public component has a Storybook story | — |
| `typecheck` | `tsc --noEmit` | — |

`&&`-chained: it stops and exits non-zero at the first failure. Not composition-only in spirit either — read the failing step's own error, it names the fix.

### The 8 token-lint rules (`scripts/lint-tokens.mjs`)

| Rule | Enforces |
|---|---|
| `no-raw-hex` | No hex color literals in component CSS — use a semantic token |
| `no-primitive-tokens` | No `--color-warm-*`, raw `--space-N`, raw `--font-size-*`/`--line-height-*` in component CSS — go through the semantic layer |
| `no-hardcoded-motion` | No bare ms timing values — use `--duration-*` |
| `no-hardcoded-line-height` | No raw `line-height` values — use `--line-height-*` (bare `1`/`0` allowed for tight single-line/icon-only controls — see ADR [`0003`](../decisions/0003-enforce-line-height-tokens-via-lint-rule.md)) |
| `no-hardcoded-spacing` | No px values in padding/margin/gap properties — use `--space-*` |
| `no-deep-bem-nesting` | No `.block__el__el` selectors |
| `no-missing-reduced-motion` | Any file with a transition/animation must contain a `prefers-reduced-motion` block |
| `no-fabricated-token` | Every `var(--x)` must resolve to a real token in `tokens/`, a same-file custom property, or a `--radix-*` runtime variable |
| `no-token-fallback` | No `var(--token, fallback)` two-argument form — a token exists or it doesn't |

Suppress a genuine exception inline: `/* lint-ignore: rule-id */` with a one-line reason in the same comment — never to route around a real violation.

## 3. Accessibility

Enforced, not just reviewed:

- `addon-a11y` (axe) runs against every Storybook story.
- `npm run a11y` / `a11y:stories` runs `test-storybook` against a built Storybook headlessly.
- Contrast is checked programmatically across all 4 theme combinations (`tokens:contrast`), not eyeballed.
- `no-missing-reduced-motion` lint rule (§2) — enforced, not a checklist item.
- Keyboard/focus/semantic-HTML behavior comes largely from Radix primitives; component-specific a11y notes live in each component's `docs/components/<slug>.md` (compiled from `docs/components.md`) where documented.

## 4. Visual quality

- Tokens used instead of arbitrary values — enforced by `tokens:lint` (§2), not a review step.
- Every push runs Chromatic; a PR with unreviewed visual changes doesn't merge clean.
- Cross-brand/mode consistency: currently `portfolio-light`/`portfolio-dark` have story-level Chromatic coverage; `base-light`/`base-dark` do not yet (same gap `bold` had before it was removed — noted in `docs/ai-readiness-plan.md`'s token-architecture backlog). Don't claim 4-mode visual coverage until this is closed.

## 5. Technical quality

- Implementation follows `architecture.md` — three-tier token discipline, no hand-editing generated files.
- `tsc --noEmit` passes with zero errors (part of `npm run validate`).
- No new component ships without a named `<Component>Props` type alias (§5 of `architecture.md`) — an unparseable type means a degraded compiled doc for every consumer, human or agent.

## 6. Testing expectations

No unit-test framework in this repo (see `architecture.md` §7 for why). What actually gates a change:

- **Visual regression** — Chromatic, every push.
- **Story coverage** — `check-stories.mjs`.
- **Stateful/interaction logic** (sort+filter+selection interplay, etc.) — a throwaway Playwright script against a real dev server, written for that piece of work. Not persisted as a suite; written fresh, run, deleted or kept per the spec's own call.
- **Agent-facing artifacts** (compiled docs, the skill file, the MCP server) — a cold test: a fresh subagent with zero memory of the session, given only the compiled artifact, attempting a real task. This is the only way doc-generator gaps have actually been found (see `docs/ai-readiness-plan.md` Phase 4 and Phase 6 findings) — a self-assessment doesn't substitute for it.

## 7. Release checklist

- [ ] `npm run validate` exits 0
- [ ] `npm run tokens` produces no diff against the committed tree (staleness check — what CI runs)
- [ ] Chromatic reviewed, no unexplained visual changes
- [ ] Significant architectural choices recorded as an ADR in `/decisions`
- [ ] Changeset written (`npm run changeset`) if the change should land in the published package
- [ ] For a new component: story exists, `docs/components.md` entry exists, `docs/components/<slug>.md` twin generates cleanly

## 8. Post-release checks

- [ ] `npm run tokens:audit` if component tokens were added — check they resolve differently from their referent in at least one mode, or are literal; a pass-through/chain-skip token is a collapse candidate, not new precedent (see the token-architecture backlog in `docs/ai-readiness-plan.md`)
- [ ] If published, confirm the version lands in a real consumer install before considering distribution done (this repo's own precedent: v0.1.4 was checked in a real `node_modules`, not assumed from the changelog)

## Not applicable to this repo

Content/copy quality (`content.md`), brand expression review (`brand.md`), browser/device support matrix, analytics/observability, and security/privacy review from the starter-kit template don't apply at the component-library layer — those are consumer-app concerns. If this repo ever ships something with its own runtime surface (a hosted MCP server, a docs site with a backend), add the relevant sections here.
