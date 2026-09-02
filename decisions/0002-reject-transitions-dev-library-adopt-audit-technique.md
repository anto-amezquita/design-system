# 0002 — Reject transitions.dev as a library/skill; borrow only its duration-audit technique

## Status

Accepted

## Context

Evaluated [transitions.dev](https://transitions.dev/skill.html) (github.com/Jakubantalik/transitions.dev): ~18-27 pre-built CSS UI transitions, distributed as copy-paste CSS and as an installable Claude Code/Cursor agent skill (`npx skills add Jakubantalik/transitions.dev`). It ships its own motion-token scale and a `transitions refine` read-only audit command that matches hardcoded durations against tokens. The design system already has its own duration-token tier (`duration-interaction`, `duration-transition`, `duration-entrance`, `duration-reveal`, `duration-reveal-delay`, `duration-skeleton`, `duration-spin`).

## Decision

Do not install the library or the agent skill — doing so would create a second, competing token system for motion. Instead, borrowed only the audit *technique*: manually scan all component CSS files for hardcoded transition/animation durations against the design system's own existing `--duration-*` tokens.

## Alternatives considered

- Install the transitions.dev skill wholesale — rejected, would introduce a parallel duration-token scale alongside the existing one.
- Adopt individual transition patterns from the library where the design system lacks a pattern — not pursued this session; no gap was found once the audit ran (see result below).
- Ignore the library and skip the audit — rejected, the technique was valuable independent of the library itself.

## Consequences

### Positive
- No second token system introduced.
- The audit itself found zero hardcoded durations across all 26 component CSS files — every transition/animation already references a `--duration-*` token, and every file with motion has a `prefers-reduced-motion` guard. Confirms the existing motion-token discipline is already solid.

### Negative
- None of transitions.dev's pre-built transition patterns were evaluated for gaps in the design system's own transition catalog — that comparison wasn't done, only the audit technique was reused.

## Related files

- `components/primitives/*`, `components/composition/*`, `components/patterns/*` (all 26 component CSS files, audited)
- `tokens/global.json` (duration primitives)
