# 0011 — Migrate Card/Dialog/Drawer/EmptyState titles onto the Heading primitive

## Status

Accepted, retroactively. Implemented and merged to `main` before this file was written; recorded here because `decisions/0008` explicitly deferred a call on whether this migration needed its own ADR, and this document is that call.

## Context

`decisions/0008` built the `Heading` primitive but explicitly left `Card`/`Dialog`/`Drawer`/`EmptyState`'s existing inline title markup untouched, naming it "a separate, larger change" out of scope for that decision. The backlog item tracking the migration opened the same day.

Whether the migration itself warranted a numbered ADR was an open question by the time the migration shipped (2026-09-15) — surfaced explicitly during code review on the migration branch rather than decided unilaterally, and left in `backlog.md` as "needs the user's call." Two things pointed toward yes: `decisions/0008`'s own Consequences section had already called this out as a separate decision, not just leftover implementation; and this repo's `CLAUDE.md` requires an ADR before any architectural change. Two things pointed toward no: no new token tier, brand, or package was introduced, and no component-facing public API changed.

## Decision

Migrate `Card`, `Dialog`, `Drawer`, and `EmptyState`'s title markup to compose the `Heading` primitive internally, rather than each rendering its own inline heading markup against a hardcoded token.

All four titles map to `level={4}` — confirmed rather than assumed: `font-size-lead` (used by `Card`/`Dialog`/`Drawer`) and `font-size-h4` (used by `EmptyState`) both resolve to the same primitive value in `tokens/brands/base/light.json`, so no new `Heading` level was needed. `CardTitle`'s and `EmptyState`'s pre-existing `as`-only APIs (size always fixed regardless of the tag) mapped directly onto `Heading`'s `level`/`as` split — `level` pinned to `4`, `as` forwarded through with each component's existing default. `Dialog` and `Drawer` render their titles through Radix's own `Dialog.Title` (a real `<h2>` with auto-wired `aria-labelledby`) inside `BaseSheet.tsx`, so `Heading` is composed via Radix's `asChild` pattern with `as="h2"` to preserve both the semantic tag and the ARIA wiring exactly as before.

Two real style mismatches (not assumed identical) were found by checking computed values: `Card`/`Dialog`/`Drawer` needed `font-weight-title` (bold) where `Heading`'s base class supplies `font-weight-heading` (semibold), and `EmptyState`'s title had never set `letter-spacing` where `Heading` always applies `letter-spacing-heading`. Both were fixed with additive, higher-specificity compound selectors rather than editing each title's pre-existing rule — `Dialog.css` specifically had to stay untouched at its base `.dialog__title` rule because `AlertDialog.tsx` (out of scope for this migration) reuses that class directly. The font-weight compound-selector pattern this created was later replaced by a `weight` prop on `Heading` itself (`decisions/0010`), for all three; `.heading.dialog__title` stays in `Dialog.css` only for its font-size pin.

Verification: every affected story (`Card`, `Dialog`, `Drawer`, `EmptyState` default/compact/all-variants, plus `AlertDialog` as a control for the shared-class risk) was screenshotted before and after via a throwaway Playwright script against local Storybook — every pair came back byte-identical, computed styles matched exactly, and `aria-labelledby`/`role` wiring on `Dialog`/`Drawer` stayed intact. A follow-up code review pass on the same branch found and fixed three further real issues before merge: `registry/dialog.json`/`drawer.json` hadn't picked up `heading.json` as a dependency (the generator didn't walk through the internal `BaseSheet` sibling), `tokens/changelog.json` was stale by the same commit-can't-describe-itself gap the Self-healing CI backlog item already documents, and `Card`/`Drawer`/`EmptyState`'s title CSS still duplicated properties `Heading`'s own rules already supplied.

## Alternatives considered

- **Leave each component's inline title markup as-is, keep `Heading` only for new standalone headings.** Rejected — this is exactly what `decisions/0008` deferred rather than ruled out, and leaving it deferred indefinitely means any future fix to shared heading behavior (the `weight` prop added in `decisions/0010`, for example) has to be applied in four separate places instead of one.
- **Skip writing an ADR for this, on the grounds that no new token tier or public API changed.** Considered and rejected — `CLAUDE.md`'s rule requires an ADR for architectural changes, not only API or token changes, and `decisions/0008` had already flagged this specific migration as a decision in its own right, not a routine implementation detail.

## Consequences

### Positive
- One implementation of heading markup and ARIA wiring shared across four components, rather than four independent copies that could drift from each other.
- Future fixes to shared heading behavior (e.g. `decisions/0010`'s `weight` prop) now apply in one place and propagate to all four components automatically, instead of needing four coordinated edits.
- The registry dependency gap (`dialog.json`/`drawer.json` missing `heading.json`) was caught and fixed as a direct consequence of this migration's own review, not left latent for a future registry consumer to hit.

### Negative
- Components composing `Heading` via `asChild` (`Dialog`, `Drawer`) now carry a real risk shape: any place-specific style deviation from `Heading`'s defaults requires a compound-selector override understood at the CSS level, not just the component's own prop type. `Dialog.css`'s font-size pin (guarding against `font-size-lead`/`font-size-h4` ever diverging) is the clearest example — a contributor unfamiliar with the pattern could remove it without realizing why it's there. (Resolved by `decisions/0013`, which merged the two tokens and deleted the pin.)
- Two heading vocabularies now coexist for a period: `Heading`'s own `level`/`as`/`weight` API, and any component still using its own inline title pattern outside the four migrated here (none currently, but nothing prevents a new component from reintroducing the pattern this migration closed).

## Related files

- `components/composition/Card/Card.tsx`, `Card.css`
- `components/composition/Dialog/Dialog.css`, `components/composition/Drawer/Drawer.css`, and `BaseSheet.tsx` (shared by both)
- `components/patterns/EmptyState/EmptyState.css`
- `components/composition/AlertDialog/AlertDialog.tsx` — deliberately out of scope, the reason `.dialog__title`'s base rule stays intact
- `registry/dialog.json`, `registry/drawer.json` — the dependency-graph gap found and fixed during this migration's review
- `decisions/0008-productive-expressive-typography-split.md` — built `Heading`, explicitly deferred this migration
- `decisions/0010-heading-weight-prop.md` — replaced this migration's font-weight compound-selector pattern for `Card`/`Dialog`/`Drawer` with a prop
