---
name: token-audit
description: Use when auditing component CSS for hardcoded values that should reference a token — motion durations, line-heights, spacing, colors — whether prompted by a specific concern or as a periodic sweep.
---

# Token audit

The repeatable technique behind the 2026-09-02 duration audit (found zero violations, confirming existing discipline) and line-height audit (found five, leading to ADR [`0003`](../../decisions/0003-enforce-line-height-tokens-via-lint-rule.md) and a new lint rule). Originated from evaluating whether to adopt the transitions.dev library (ADR [`0002`](../../decisions/0002-reject-transitions-dev-library-adopt-audit-technique.md)) — the decision was to reject the library but keep its audit *technique*.

## When to use this

- Before adopting an external library/skill that ships its own token or convention system — audit what's already covered before assuming a gap exists.
- When a lint rule's own limits are suspected (e.g. `no-hardcoded-line-height` only catches `var()` misuse, not bare numeric values, until it's extended).
- Periodically, or when touching a component tier broadly for another reason (the line-height gap was found as a side effect of the duration audit, not a dedicated pass).

## Workflow

1. **Get the real file list.** Don't assume — enumerate every file in the scope (`components/primitives/*/*.css`, `components/composition/*/*.css`, `components/patterns/*/*.css`). The 2026-09-02 audits covered all component CSS files, not a sample — 27 today (`npm run tokens:lint` reports the current count; don't hardcode a number here, it drifts as components are added).
2. **Know what the existing lint rule already catches vs. misses.** Read `scripts/lint-tokens.mjs`'s rule descriptions (`docs/quality.md` §2 has the current list) before auditing — don't re-find what's already enforced. The line-height gap existed specifically because the rule only checked `var(--line-height-*)` misuse, not bare numbers like `1.4`.
3. **Scan for the raw pattern**, not just the token reference — a hardcoded value doesn't announce itself as a violation. For durations: bare `ms`/`s` values in `transition`/`animation` declarations. For line-heights: any `line-height:` not using `var(--line-height-*)`.
4. **Classify each hit before fixing anything.** Some raw values are intentional and shouldn't become violations — e.g. bare `line-height: 1` for tight single-line controls (Button, Badge, Tag) and bare `line-height: 0` for icon-only controls collapsing the line box. Check for an existing established pattern before assuming a hit is a bug.
5. **Fix the real violations**, then **close the detection gap** — if the audit found something the linter should have caught, add or extend a lint rule so it doesn't silently regress. A fix without a new rule is a one-time patch, not a closed gap.
6. **Verify with the full pipeline**, not just the new rule in isolation: `npm run tokens:lint` (should show the new rule's file/violation count), then `npm run validate`, then Chromatic if the fix touches rendered output — confirm zero or explained visual diff.
7. **Log the decision.** If the audit rejected adopting an external library/convention, or added a new lint rule, that's ADR material (`/decisions`) — not just a commit message.

## What NOT to do

- Don't adopt an external library wholesale to get its audit technique — the technique is usually separable from the library (see ADR 0002).
- Don't fix a hit without checking whether it's an established intentional pattern first (bare `1`/`0` for line-height).
- Don't add a lint rule without running it against the full existing codebase first to build the allow-list from real hits, not assumption.
