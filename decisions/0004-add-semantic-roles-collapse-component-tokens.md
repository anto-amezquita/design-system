# 0004 — Collapse component token chain-skips into a closed semantic-role vocabulary (MD3-style)

## Status

Accepted

**Final state (all rounds):** chain-skip component tokens down from 164 to 74 (90 collapsed). 9 new semantic roles added (`border-width-default`, `font-size-control`, `font-weight-title`, `font-weight-control`, `space-control-padding-x/y`, `space-prominent-padding-x/y`, `space-compact-padding-x/y`, `space-container-padding`, `space-container-padding-lg`), plus 1 existing role corrected (`font-weight-label`, was pointing at the wrong value). Zero regressions throughout — `npm run validate` stayed green after every round. Remaining 74 chain-skips are genuinely scattered one-off values (`font-size-sm`/`.xs` across unrelated small text, `font-weight-semibold` across 5 different functions) that don't share a real function under the 3+-component rule below, not roles left unnamed.

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

## Follow-up: padding roles, with two real outliers

Re-checked the padding groups against actual token values (not just the earlier grouping) and found the three groups hold cleanly, but two tokens don't actually fit either group they'd been provisionally assigned to:

- **Control** (`space.4`/`space.3`, 16px/12px): Input, Select, Table-cell, Tabs-trigger, Textarea — 5 components, 10 tokens, clean match.
- **Prominent** (`space.5`/`space.4`, 24px/16px): Accordion-trigger, Alert, Toast — 3 components, 6 tokens, clean match.
- **Compact** (`space.3`/`space.2`, 12px/8px): Tooltip, Tabs-sm-trigger — 2 components, 4 tokens, clean match.

Added 6 new roles to `light.json`: `space-control-padding-x/y`, `space-prominent-padding-x/y`, `space-compact-padding-x/y`. Collapsed the 20 tokens above to them.

**Left as raw primitives, deliberately not collapsed:**
- `button-padding-x/y` is `space.5`/`space.3` (24px/12px) — x matches Prominent but y is 12px, not 16px. Button doesn't actually share Prominent's shape; it only looked like it did before checking real values.
- `select-item-padding-x/y` is `space.4`/`space.2` (16px/8px) — x matches Control, y matches Compact. A genuine mixed case, not a fourth group (only one component has this shape).

Per the 3+-shared-value rule, neither outlier gets a role of its own. They stay on raw primitives until a third component turns up with the same shape.

## Follow-up: border-radius-full adoption, and a second unnamed-role bug

Collapsed five more free-match tokens (same pattern as the round-2 spacing adoptions — an existing role, `border-radius-pill` → `border-radius.full`, used only by Tag): Avatar, Badge, Switch (track + thumb), Button all referenced the raw primitive directly. No new role needed.

Investigating the `font-weight.medium` chain-skip (11 uses, the largest remaining target) surfaced a second instance of the round-1 `font-size-body` bug: the semantic role `font-weight-label` already existed but was set to `font-weight.semibold` (600), while every actual label-shaped component — `input-label-weight`, `select-label-weight`, `textarea-label-weight`, `label-font-weight` — used `font-weight.medium` (500) directly. The role and the components it was named for disagreed, and nothing referenced the role as written. Corrected `font-weight-label` to `{font-weight.medium}` and adopted it across those 4 components.

The remaining `font-weight.medium` uses split by function rather than one shared role: added `font-weight-control` (`{font-weight.medium}`, pairs with `font-size-control`) for Button, Tabs-trigger, and Accordion-trigger — the same 3 components that already share `font-size-control`. Tooltip, Badge, Pagination-button, and Tag also use `font-weight.medium` but don't share a single function or paired size with each other or the control group, so left on the raw primitive rather than forcing a role. `font-weight.semibold` (5 uses: Table-header, Alert-title, Toast-title, Avatar-fallback, Hero-eyebrow) has the same problem — same value, five different functions — and is also left open.

## Follow-up: border-radius-interactive adoption, same split pattern

`border-radius.sm` (5 uses) had the same shape as the padding groups: an existing role (`border-radius-interactive`, already `{border-radius.sm}`, previously only used by Input/Select/Textarea) fit some of the uses but not all. Checkbox, Pagination-button, and Tabs-pill are genuinely interactive elements — adopted the role there. Skeleton and Tooltip share the same value but aren't interactive components; left on the raw primitive rather than stretch the role's meaning to cover them.

## Follow-up: container padding resolved (closes the round-1 held-back item)

Checked the actual `space.6`/`space.7` values behind the round-1 container-padding question. Two clean groups, though shaped differently from the earlier control/prominent/compact groups — these are mostly single-value all-around padding, not matched x/y pairs:

- **32px** (`space.6`): `card-padding`, `hero-padding-x`, `datatable-empty-padding`, `emptystate-padding-x-compact` → new role `space-container-padding`
- **48px** (`space.7`): `dialog-padding`, `drawer-padding`, `emptystate-padding-y-compact` → new role `space-container-padding-lg`

EmptyState's compact-variant x and y padding land on two different roles since the component is genuinely asymmetric (32px horizontal, 48px vertical) — not a matched pair like the control-group tokens. Hero's y-padding (`space.9`) isn't part of either group and was left untouched; only its x-padding matched. This closes the item held back at the end of round 1.

## Alternatives considered

- Add a token per stuck component value instead of a shared role — rejected, this is exactly the Polaris/Primer pattern (semantic layer for color only) rather than the MD3-style closed role vocabulary this system is following elsewhere; it would also not have caught the Checkbox/Radio/Input/Select inconsistency.
- Point Checkbox/Radio/Input/Select at the new `border-width-default` instead of fixing them to `border-width-interactive` — rejected, these are interactive controls and the existing role for that already exists (Button, Textarea); using `-default` would have papered over the inconsistency instead of fixing it.
- Collapse the container-padding chain-skips now by picking whichever value the majority of components use — rejected, the 32px/48px split looks intentional (component-level vs. overlay-level padding) and picking one value under time pressure risks encoding a visual regression as a "semantic role."

## Consequences

### Positive
- Component chain-skip count drops from 164 to 74 across five rounds (90 tokens now resolve through a named role instead of a raw primitive).
- Fixes two real cross-component inconsistencies rather than just renaming them: the Checkbox/Radio/Input/Select border-width drift, and the `font-weight-label` role pointing at the wrong value (semibold instead of medium) while being unused by any actual label component.
- Establishes the reuse bar for future semantic roles: a role needs 3+ components sharing the same function before it's added, not one component's stuck value — confirmed by three separate cases (Button padding, Select-item padding, Tooltip/Skeleton border-radius) that were checked against this bar and correctly left uncollapsed.
- Container-padding split (the item originally held back) is resolved: `space-container-padding` (32px) and `space-container-padding-lg` (48px).

### Negative
- `border-width-default` and `border-width-interactive` currently resolve to the same primitive (`border-width.thin`) — no visual change yet, but the two roles now exist as distinct hooks if interactive and static borders ever need to diverge.
- The remaining 74 chain-skips (`font-size-sm`/`.xs`, `font-weight-semibold`, and similar) are deliberately left as raw primitives rather than forced into roles, since none clears the 3+-shared-function bar. Revisit only if a third component genuinely shares one of these shapes.

## Related files

- `tokens/brands/base/light.json`
- `tokens/components/card.json`, `dialog.json`, `drawer.json`, `accordion.json`, `alert.json`, `avatar.json`, `checkbox.json`, `radio.json`, `input.json`, `select.json`, `textarea.json`, `button.json`, `switch.json`, `table.json`, `tabs.json`, `tag.json`, `toast.json`, `pagination.json`, `breadcrumb.json`, `label.json`, `badge.json`, `hero.json`, `tooltip.json`, `datatable.json`, `empty-state.json`
