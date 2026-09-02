---
name: design-system
description: Use when creating, reviewing, or evolving design tokens, components, variants, or patterns in this repo.
---

# Design system

Help this system grow coherently instead of as a collection of one-offs. Determines whether something belongs as a token, component, pattern, or one-off.

Adapted from the ai-product-starter-kit's `design-system` skill — trimmed to drop the product-specific "read first" list (`product-north-star.md`, `brand.md`, `content.md` don't exist here; this is a library, not a product).

## Read first

1. `AGENTS.md` (router)
2. `docs/architecture.md` — especially §3 (token architecture) and §4 (multi-brand)
3. `docs/quality.md`
4. relevant files in `/specs`
5. existing tokens, components, and patterns in the codebase — `tokens/token-reference.json` and `tokens/component-registry.json` are the ground truth, not memory

## Core behaviour

- Prefer reusable system decisions over duplicated one-offs.
- Do not over-systematise a premature idea — a one-off that hasn't repeated yet stays a one-off.
- Favour semantic tokens over raw values; primitives are never referenced directly from component CSS.
- Require a clear reason before adding a new token, variant, or pattern — every component token that's a pass-through or chain-skip to its referent in all 4 modes is a collapse candidate, not free (see the token-architecture backlog in `docs/ai-readiness-plan.md`).
- Make trade-offs explicit — write an ADR (`/decisions`) when the decision materially changes token architecture, theming strategy, the component model, or package structure.

## Decide what kind of thing it is

### Token

Use when the value represents a repeatable design decision (color role, spacing step, type style, radius, motion duration, shadow, elevation).

**This system's token chain is a strict three tier:** primitive (`tokens/global.json`) → semantic (`tokens/brands/<brand>/*.json`) → component (`tokens/components/<name>.json`). No skipping a tier. See `docs/architecture.md` §3.

### Component

Use when there's a reusable interface object with stable anatomy, behaviour, and states across multiple places.

This system has 28 public components across 3 tiers (13 primitives, 7 composition, 8 patterns) — see `AGENTS.md`'s allow-list, pulled live from `tokens/component-registry.json`. A name not on that list is provably invented.

### Pattern

Several components combining into a repeatable solution (a filter bar, an empty state, a dialog flow).

### One-off

Keep it one-off when reuse is speculative or the design hasn't repeated enough to prove itself yet.

## Review areas

- **Tokens** — semantic naming, brand/theme separation, unnecessary duplication, whether a new token solves a repeatable need or could reuse an existing one.
- **Components** — clear purpose, anatomy, variants, states (at minimum default/hover/focus/active/disabled), a named `<Component>Props` type alias (required for the doc generator to produce a real prop table — see `docs/architecture.md` §5), accessibility behaviour, all token references at the semantic layer.
- **Consistency** — duplicated solutions, variant explosion, raw values appearing in 2+ places without a token (a tokenisation candidate), tokens nothing references (a removal/consolidation candidate — run `npm run tokens:audit` for real figures, don't guess).

## Workflow

1. **Understand the need** — what problem, where it appears, new/repeated/anticipated.
2. **Classify** — use existing / extend existing / create new / one-off / reject.
3. **Check architecture fit** — follows `docs/architecture.md`, uses tokens at the right tier, doesn't leak app-specific logic into a shared primitive (the DataTable filtering spec's `renderToolbar` slot is the model for this: the component owns column-level filtering, the app owns its own fields).
4. **Recommend an ADR when the decision is architectural** — new token tier, new brand, changed component model, changed package structure. Use the template in `/decisions/README.md`.
5. **Validate** — `npm run validate` must exit 0 before the change is done (`docs/quality.md`).

## Final review checklist

- Are we solving a repeated need, not inventing abstraction early?
- Token, component, pattern, one-off, or reject?
- Are all relevant states covered, and is accessibility part of the definition?
- Does a new component token resolve differently from its referent in at least one mode, or is it genuinely literal? (Otherwise it's a collapse candidate on day one.)
- Would `npm run validate` pass?
