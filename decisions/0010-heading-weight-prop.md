# 0010 — Add `weight` prop to `Heading`, replacing CSS compound-selector overrides

## Status

Accepted, retroactively. Implemented and merged to `main` before this file was written; recorded here to close the gap between the shipped code and the ADR record.

## Context

The `Card`/`Dialog`/`Drawer`/`EmptyState` → `Heading` migration (see `decisions/0011`, and `roadmap.md`'s 2026-09-15 session log) composed all four components' titles through the `Heading` primitive, but `Heading`'s base `.heading` class hardcodes `font-weight-heading` (semibold, 600) while `Card`/`Dialog`/`Drawer` titles need `font-weight-title` (bold, 700) — compact container chrome sitting next to buttons or a close control needs the extra weight to hold its own visually. The migration bridged this with additive, higher-specificity CSS compound selectors per component (`.heading.card__title { font-weight: var(--font-weight-title) }`, and the equivalent for `.dialog__title`/`.drawer__title`).

Code review on that migration branch flagged this as a real gap, but deliberately didn't act on it: a `weight` prop on `Heading` would remove the compound-selector pattern entirely, but it's an API change to a primitive `decisions/0008` had already shipped, and was surfaced to the user as a judgment call rather than decided unilaterally mid-review.

The compound-selector approach worked but split the knowledge of "which titles need bold" across three separate CSS files, invisible from `Heading.tsx`'s own type surface — a future consumer composing `Heading` in a new compact-chrome context would have no way to discover the pattern without finding an existing CSS override to copy.

## Decision

Add a `weight?: 'heading' | 'title'` prop to `Heading`, defaulting to `'heading'` (semibold — the existing behavior for standalone headings). `'title'` applies a `heading--title` modifier class that resolves to `font-weight-title` (bold), for title text in compact container chrome.

`Card.css` and `Drawer.css` had their compound-selector font-weight overrides removed entirely — those two components now pass `weight="title"` and no longer reference `--font-weight-title` in their own stylesheets.

`Dialog.css` keeps its font-weight declaration on the base `.dialog__title` rule as a deliberate exception: `AlertDialog.tsx` uses that class directly, not via `Heading`, so the CSS rule is still the only thing supplying weight there. Where `Dialog`'s title composes `Heading` (via `BaseSheet.tsx`), the two rules — `.dialog__title`'s and `.heading--title`'s — both resolve to `font-weight-title` today, so which one wins is immaterial; the CSS comment in `Dialog.css` records that this tie is safe but not guaranteed to stay so if the underlying tokens ever diverge.

## Alternatives considered

- **Keep the three CSS compound-selector overrides as-is.** Rejected — the original problem stands: the "which contexts need bold" knowledge stays scattered across CSS files rather than declared once on the primitive's own prop type, where an agent or contributor reading `Heading.tsx` would actually see it.
- **Fold weight into `level` instead of a separate prop** (e.g. a `level={4.5}` or a "compact" level variant). Rejected — weight and size are independent axes here: the component titles need H4-equivalent size but title-weight, not a new size tier. Keeping them as separate props (`level`, `weight`) matches how they actually vary in practice.

## Consequences

### Positive
- Single source of truth: which weight a heading uses is now declared at the call site via a typed prop, not inferred from which CSS file happens to override it.
- `Card.css` and `Drawer.css` no longer reference `--font-weight-title` at all — one less thing for those files to get out of sync with `Heading`'s own styling.
- Closes the code-review finding from the migration branch without reopening the migration itself.

### Negative
- `Dialog.css` necessarily keeps a duplicate font-weight declaration, because `AlertDialog` bypasses `Heading` entirely. This asymmetry is now explicit (documented in `Dialog.css`'s own comment) rather than something a future pass might "clean up" by deleting, which would silently break `AlertDialog`'s title weight.

## Related files

- `components/primitives/Heading/Heading.tsx` — the `weight` prop itself
- `components/composition/Card/Card.css`, `components/composition/Drawer/Drawer.css` — overrides removed
- `components/composition/Dialog/Dialog.css` — deliberate exception, documented inline
- `decisions/0008-productive-expressive-typography-split.md` — introduced the `Heading` primitive this prop extends
- `decisions/0011-card-dialog-drawer-emptystate-heading-migration.md` — the migration that created the compound-selector pattern this ADR replaces
