# 0003 — Add `no-hardcoded-line-height` lint rule; fix five raw line-height values

## Status

Accepted

## Context

A full scan of all 26 component CSS files (done during the transitions.dev duration audit, see 0002) surfaced five raw/hardcoded `line-height` values that didn't match any of the four line-height primitives (`tight`, `tighter`, `normal`, `loose`). The existing linter only caught raw `--line-height-*` `var()` references, not bare numeric values, so these had gone undetected: `Input` (`.input-field__hint`), `Radio` (`.radio__label`), `Switch` (`.switch__label`), and `Textarea` (`.textarea-field__textarea`, `.textarea-field__hint`) all used `1.4` or `1.5` directly instead of `var(--line-height-body)`.

## Decision

Fixed all five to reference `var(--line-height-body)`. Added a new linter rule, `no-hardcoded-line-height`, to `scripts/lint-tokens.mjs`, flagging any `line-height:` declaration that isn't a `var(--line-height-*)` reference — with explicit exceptions for bare `1` (tight single-line controls: Button, Badge, Tag, Tabs, Pagination, Input/Textarea labels) and bare `0` (icon-only controls collapsing the line box, e.g. Pagination's nav buttons).

## Alternatives considered

- Fix the five values without adding a lint rule — rejected, the same class of drift would go undetected again since the existing rule doesn't check bare numbers.
- Flag bare `1` and `0` as violations requiring explicit token references — rejected, these aren't really "line-height as typography" — they're intentional box-collapsing/tight-single-line patterns already used consistently elsewhere in the system.

## Consequences

### Positive
- Closes a real gap in the existing linter (previously blind to bare numeric line-heights).
- `npm run tokens:lint` now checks 8 rules total, still 0 violations across 27 files.
- Verified zero visual regression (Chromatic Build 40, commit `fa5fe14`).

### Negative
- None identified — the fix was visually negligible per Chromatic, and the new rule only adds coverage, doesn't change any existing passing pattern.

## Related files

- `scripts/lint-tokens.mjs`
- `components/primitives/Input/Input.css`
- `components/primitives/Radio/Radio.css`
- `components/primitives/Switch/Switch.css`
- `components/primitives/Textarea/Textarea.css`
