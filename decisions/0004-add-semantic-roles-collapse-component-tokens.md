# 0004 — Add three semantic roles (`border-width-default`, `font-size-control`, `font-weight-title`); collapse 30 component tokens; fix border-width role misuse in four form controls

## Status

Accepted

## Context

The component token audit (`docs/ai-readiness-audit.md`) flagged 164 component tokens that chain-skip past the semantic layer straight to a primitive — a tier violation, and dead weight if the value never diverges across brand/mode. A manual pass across all 26 component token files found this wasn't 164 one-off cases: it was mostly four repeating patterns, each reused by many components, meaning the semantic layer was simply missing the matching role rather than every component needing its own literal:

- `{border-width.thin}` referenced directly by 15 components (Card, Dialog, Accordion, Alert, Avatar, Drawer, Table, Tabs, Tag, Toast, Pagination, and — incorrectly — Checkbox, Radio, Input, Select).
- `{font-size.base}` (16px) referenced directly by 12 components, while the existing `font-size-body` role pointed at `font-size.md` (18px) and was used by zero components — the role existed but didn't match what components actually needed.
- `{font-weight.bold}` referenced directly by 3 components, all container title text (Card, Dialog, Drawer).
- `{space.6}` / `{space.7}` for container padding, referenced by 6 components — held back from this pass, see below.

Separately, the audit surfaced a real inconsistency, not just a missing role: Button and Textarea already used the semantic `border-width-interactive` for their borders, but Checkbox, Radio, Input, and Select — equally interactive form controls — skipped straight to the raw primitive instead. This was drift, not a naming gap.

Given the system's existing color-role precedent (Material Design 3 style: a small, closed vocabulary of function-based roles, not a role per value), any new roles needed to be justified by genuine reuse across components, not by any single component's stuck value.

## Decision

Added three new semantic roles to `tokens/brands/base/light.json`:

- `border-width-default` → `{border-width.thin}` — static, non-interactive borders (cards, dialogs, dividers, badges, table rows).
- `font-size-control` → `{font-size.base}` — default text size for form controls and interactive components, distinct from `font-size-body` (prose).
- `font-weight-title` → `{font-weight.bold}` — title weight for card/dialog/drawer-style container headers.

Collapsed the matching component tokens to reference these roles instead of the primitive: Card, Dialog, Accordion, Alert, Avatar, Drawer, Table, Tabs, Tag, Toast, and Pagination now use `border-width-default`; Card, Dialog, and Drawer use `font-weight-title`; Accordion, Alert, Button, Card, Checkbox, Input, Radio, Select, Switch, Table, Tabs, and Textarea use `font-size-control`.

Fixed the interactive-control inconsistency: Checkbox, Radio, Input, and Select now use `border-width-interactive` (matching Button and Textarea) instead of the raw primitive. Select's separator (a static divider, not an interactive edge) uses `border-width-default`.

Also collapsed a few exact-match tokens found along the way that didn't need a new role: `card-gap`/`dialog-gap` → `{space-element-gap}`, `drawer-gap` → `{space-component-gap}`, `card-title-size`/`dialog-title-size`/`drawer-title-size` → `{font-size-lead}` (all already-existing roles at matching values).

**Held back, not decided here:** container padding (`space.6`/`space.7`, 6 components). Values split roughly into a 32px group (Card, EmptyState-compact, Hero) and a 48px group (Dialog, Drawer, EmptyState default) — this looks like two roles, not one, and naming them accurately needs a value decision first rather than deriving the role from whichever primitive a component happens to use today.

## Follow-up: existing spacing roles were unadopted

A second `tokens:audit` pass (after rebuilding `tokens/token-reference.json`, which the first pass had missed — `tokens:audit` reads that generated file, not the source JSON directly) showed chain-skip dropping from 164 to 133, confirming the collapse above took effect. It also surfaced the same pattern one layer down: `space-label-gap` (`space.3`), `space-inline-gap` (`space.2`), `space-tight-gap` (`space.1`), and `space-component-gap` (`space.5`) already existed as semantic roles but were unused — 17 component tokens across Checkbox, Radio (×2), Switch, Alert, Toast (×2), Button, Breadcrumb, Label, Pagination, Badge (×2, including a `border-width.thin` chain-skip missed in the first pass), Table, Tabs (×2), and Hero referenced the raw primitive instead. Collapsed all 17 to the existing roles — no new roles needed, since the gap was adoption, not vocabulary.

Padding (`space.4`/`space.3` control, `space.5`/`space.4` prominent, `space.3`/`space.2` compact — 24 tokens) and `font-weight.medium` (11 tokens) followed the same grep-and-group pass but need new roles rather than reuse of existing ones. Held for a separate decision, same reasoning as the container-padding split above.

## Alternatives considered

- Add a token per stuck component value instead of a shared role — rejected, this is exactly the Polaris/Primer pattern (semantic layer for color only) rather than the MD3-style closed role vocabulary this system is following elsewhere; it would also not have caught the Checkbox/Radio/Input/Select inconsistency.
- Point Checkbox/Radio/Input/Select at the new `border-width-default` instead of fixing them to `border-width-interactive` — rejected, these are interactive controls and the existing role for that already exists (Button, Textarea); using `-default` would have papered over the inconsistency instead of fixing it.
- Collapse the container-padding chain-skips now by picking whichever value the majority of components use — rejected, the 32px/48px split looks intentional (component-level vs. overlay-level padding) and picking one value under time pressure risks encoding a visual regression as a "semantic role."

## Consequences

### Positive
- Component chain-skip count drops from 164: ~30 tokens now resolve through a named role instead of a raw primitive.
- Fixes a real cross-component inconsistency (Checkbox/Radio/Input/Select border-width) rather than just renaming it.
- Establishes the reuse bar for future semantic roles: a role needs 3+ components sharing the same function before it's added, not one component's stuck value.

### Negative
- Container padding chain-skips (6 components) remain unresolved pending a value decision.
- `border-width-default` and `border-width-interactive` currently resolve to the same primitive (`border-width.thin`) — no visual change yet, but the two roles now exist as distinct hooks if interactive and static borders ever need to diverge.

## Related files

- `tokens/brands/base/light.json`
- `tokens/components/card.json`, `dialog.json`, `drawer.json`, `accordion.json`, `alert.json`, `avatar.json`, `checkbox.json`, `radio.json`, `input.json`, `select.json`, `textarea.json`, `button.json`, `switch.json`, `table.json`, `tabs.json`, `tag.json`, `toast.json`, `pagination.json`
