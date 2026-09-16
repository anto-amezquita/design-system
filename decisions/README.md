# Decisions

This folder contains Architecture Decision Records.

Use one small file per important decision.

## Proposed drafts

[`proposed/`](./proposed/) holds automatically harvested drafts, not decisions. A `SessionEnd` hook runs [`scripts/propose-decision.mjs`](../scripts/propose-decision.mjs), which reads the session transcript and, when it finds real signal, writes quoted evidence into an ADR-shaped draft — rejected alternatives first, then component decisions, then AI-readiness reasoning. Drafts are gitignored and nothing commits them; accepting one means rewriting it as a numbered file here, by hand. See [`proposed/README.md`](./proposed/README.md), [`contributor-skills/decision-proposal`](../contributor-skills/decision-proposal/SKILL.md), and [`0009`](./0009-living-memory-adr-proposals.md).

## File naming

Use:

`0001-short-decision-name.md`

Examples:

- `0001-use-nextjs.md`
- `0002-store-theme-in-css-tokens.md`
- `0003-use-supabase-auth.md`

## ADR template

```md
# 0001 — [Decision title]

## Status

Proposed | Accepted | Superseded

## Context

[What situation or problem required a decision?]

## Decision

[What did we decide?]

## Alternatives considered

- [Alternative]
- [Alternative]

## Consequences

### Positive
- [Consequence]

### Negative
- [Consequence]

## Related files

- [Relevant spec]
- [Relevant architecture section]
```
