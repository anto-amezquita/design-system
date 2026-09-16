# 0010 — Add a `weight` prop to the `Heading` primitive

## Status

Accepted

## Context

`decisions/0008` built the `Heading` primitive with a single hardcoded weight: `.heading` always applies `--font-weight-heading` (semibold, 600), regardless of level. The later `Card`/`Dialog`/`Drawer`/`EmptyState` migration (PR #24, logged in `docs/roadmap.md`'s 2026-09-15 session log) found that three of those four call sites actually need `--font-weight-title` (bold, 700) instead — so each got its own compound-selector override:

```css
.heading.card__title   { font-weight: var(--font-weight-title); }
.heading.dialog__title { font-weight: var(--font-weight-title); }
.heading.drawer__title { font-weight: var(--font-weight-title); }
```

Three near-identical overrides, each justified by its own comment repeating the same specificity argument (compound selector `(0,2,0)` beats `.heading`'s `(0,1,0)`). A real, recurring need patched at three leaves instead of once at the root — and nothing stops a fourth compound component from being added later with the wrong weight guessed instead of checked.

`EmptyState.css` is the deliberate exception: its title stayed semibold (the default) during the migration, preserved byte-identical to its pre-migration rendering rather than being bumped to bold. This is not a case the rule below governs — it's a visual-parity decision made at migration time and needs to stay on record so it doesn't get "corrected" into bold by a future pass.

### Why title text in a compact container gets bold, not semibold

Checked against two production type systems already used as reference points in this repo (`decisions/0008` cites both):

- **IBM Carbon** reserves its semibold weight for section headers, not supporting or dense-UI text.
- **Material Design 3**'s type scale pairs weight with role, not just size: the large, prominent roles (display, headline) use Regular; the smaller, supporting roles (title, label, body) use the heavier Medium. Smaller text gets *more* weight, not less — it needs it to hold visual presence against everything else on the page.

`Card`, `Dialog`, and `Drawer` titles fit the second pattern exactly: all three are pinned to the H4 tier — the smallest heading size — and sit inside compact container chrome (card body, dialog action buttons, drawer close icon). Bold is what lets that small title hold its own there. Standalone page headings (`Heading` used directly, often H1–H3) don't have that problem — they're already large — so they stay at the lighter semibold default.

## Decision

**1. Add a `weight?: 'heading' | 'title'` prop to `Heading`**, defaulting to `'heading'` (unchanged behavior — `.heading` keeps applying `--font-weight-heading`). Setting `weight="title"` adds a modifier class (`.heading--title`) that applies `--font-weight-title` instead. This replaces the need for a per-component compound-selector override: `Card`, `Dialog`, and `Drawer` pass `weight="title"` at their call sites (`CardTitle` in `Card.tsx`; `Dialog` and `Drawer` share one call site in `BaseSheet.tsx`); `.heading.card__title` and `.heading.drawer__title` are removed from `Card.css`/`Drawer.css`, and `.heading.dialog__title` loses its `font-weight` declaration.

`.heading.dialog__title` itself stays in `Dialog.css`, because weight was never its only job — it also pins `font-size` to `--font-size-h4` so the composed title follows Heading's H4 rather than tying with `.dialog__title`'s `--font-size-lead`. That base `.dialog__title` rule also keeps its own `font-weight: var(--font-weight-title)`, since `AlertDialog` uses the class directly without `Heading` and has no other source for its title weight.

**2. `EmptyState` is explicitly left alone** — it wants the default (`weight="heading"`, semibold), so it needs no prop and no override. Recorded here so this ADR isn't misread as "every title-in-a-container should be bold" — it's specifically compact chrome next to interactive controls (Card/Dialog/Drawer) that needs it, not every title-shaped slot in the system.

**3. The rule going forward:** title-level text in a compact container (a card, dialog, or drawer header sitting next to buttons or a close control) uses `weight="title"` regardless of heading level, because smaller supporting text needs more visual weight to hold presence next to the surrounding UI. A component that doesn't fit that description — a standalone page heading, or a title in open space like `EmptyState` — stays at the `heading` default.

**4. Brand-onboarding requirement:** any new brand's typeface must supply both weights this system's tokens require — at minimum whatever maps to `--font-weight-heading` (600) and `--font-weight-title` (700). This is a font-selection constraint, not a token-authoring one — checked at the point a brand's typeface is chosen, not after.

**5. Governance guidance if a brand's typeface is missing a required weight:** default to swapping the typeface for that brand — weight availability is a foundry choice, not a technical constraint, and most families that ship in this range have both 600 and 700 (or a variable-font axis covering them). Only if this recurs across multiple brands' typeface choices should it prompt revisiting the system's own weight-role requirements. Font-swap first, system-change as escalation — not the reverse.

## Alternatives considered

- **Leave the three CSS compound-selector overrides as-is.** Rejected — this is exactly the pattern this ADR exists to close: a real, recurring need (title text needs a different weight than heading text) solved three times at three leaves with duplicated reasoning in comments, instead of once at the root via the primitive's own API. A fourth component needing the same override would either duplicate the pattern again or, worse, get guessed wrong.
- **Add the weight logic as a CSS-only semantic rule (e.g., all H4-sized headings get bold) instead of an explicit prop.** Rejected — conflates size and weight, which aren't actually coupled: `EmptyState`'s title is also H4-sized and deliberately stays semibold. An implicit "H4 = bold" rule would be wrong for `EmptyState` and would hide the actual reasoning (compact container chrome, not heading level) behind a coincidental size match.

## Consequences

### Positive
- One prop on `Heading` replaces three duplicated CSS overrides — the weight decision lives in the primitive's public API, not scattered across three components' stylesheets.
- The weight-assignment rule is now written down as an explicit rule, not just implied by three separate code comments — a future compact component (a fifth call site) has something to check against instead of guessing.
- `EmptyState`'s exception is on record as deliberate, protecting its current byte-identical rendering from a well-intentioned future "shouldn't this be bold too?" pass.
- Brand onboarding has an explicit weight-availability requirement and a documented default response (swap the font) if a brand's typeface can't meet it.

### Negative
- `Heading`'s public API grows by one prop — the exact kind of change `decisions/0008` fixed on purpose when it originally shipped the primitive. Justified here because the need (three real call sites, a real recurring pattern) already exists; this isn't speculative API surface.
- The weight rule still doesn't cover every title in one place: `AlertDialog`'s title gets bold from `.dialog__title` in `Dialog.css`, not from `Heading`, because `AlertDialog` doesn't compose `Heading`. Migrating it would close that gap, but that's a separate change.

### Implementation
- Implemented 2026-09-16 on `docs/heading-weight-prop-adr`, in the same change as this ADR. Verified as a byte-identical refactor: computed title styles and full-page screenshots of all 41 Card, Dialog, Drawer, AlertDialog, EmptyState and Heading stories match before and after, and `EmptyState` titles still compute to 600.

## Related files

- `components/primitives/Heading/Heading.tsx`, `Heading.css` — where the `weight` prop and `.heading--title` modifier class get added
- `components/composition/Card/Card.css`, `components/composition/Dialog/Dialog.css`, `components/composition/Drawer/Drawer.css` — the three `.heading.<block>__title` overrides this prop replaces
- `components/patterns/EmptyState/EmptyState.css` — the deliberate exception, left at the `weight="heading"` default
- `decisions/0008-productive-expressive-typography-split.md` — built the `Heading` primitive and its hardcoded weight this ADR now makes configurable
- `docs/backlog.md` — "Whether the Heading migration itself needed its own ADR", the entry this ADR was split out of. It originally held two open questions; this ADR answers the `weight` one, and the other (whether the migration needed its own ADR) is still open, not decided here
