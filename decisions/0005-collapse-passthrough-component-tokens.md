# 0005 — Collapse pass-through component tokens (rolling)

## Status

Accepted (rolling — 132 of 299 pass-throughs collapsed; eight full target groups closed. Rest tracked in `docs/backlog.md`)

## Context

`decisions/0004` closed most of the chain-skip problem (component token → primitive, skipping the semantic tier). A re-run of `npm run tokens:audit --json` (2026-09-07) surfaced a second, larger class: 299 pass-through component tokens (72% of all 413) that alias a semantic token 1:1, identical in every mode. Unlike a chain-skip, a pass-through isn't a tier violation — it's a component token that resolves to exactly the same value as the semantic token it references, in every brand and mode, forever. It adds a hop with no payoff: a rename with extra steps.

Collapsing a pass-through is a bigger edit than a chain-skip collapse. `decisions/0004` repointed a token's own `$value` and left every consuming `.css` file untouched, since the component-tier CSS variable (`--avatar-border`) still existed. Collapsing a pass-through removes the component-tier variable entirely, so every `var(--avatar-border)` reference in the component's CSS has to be repointed to `var(--color-border-default)` directly. Confirmed via `sd.config.mjs` that semantic tokens are emitted as real CSS custom properties at `:root`/`[data-mode]` selectors (`preserveSemanticRefs`), so referencing them directly from component CSS is valid and resolves through the same cascade a component token would have.

Given the size (299 tokens, all 26 component files) and the larger blast radius per token, this started as a pilot on a single component (Avatar) before committing to a scoped-rounds plan like 0004's, then continued component-by-component.

## Decision

**Round 1 (2026-09):** collapsed Avatar's 5 pass-through tokens:

| Component token | Was a passthrough of |
|---|---|
| `avatar-border` | `color-border-default` |
| `avatar-border-width` | `border-width-default` |
| `avatar-ring-color` | `color-border-focus` |
| `avatar-fallback-background` | `color-surface-secondary` |
| `avatar-fallback-foreground` | `color-text-secondary` |

Removed all 5 from `tokens/components/avatar.json`. Updated `Avatar.css` to reference the semantic vars directly (`var(--color-border-default)` etc.) in place of the removed component vars, and updated the file's own "Tokens consumed" header comment to reflect both the remaining component tokens and the semantic tokens now referenced directly.

`npm run tokens` / `npm run validate` run clean after this round.

**Round 2 (2026-09):** same treatment for Breadcrumb's 5 pass-throughs:

| Component token | Was a passthrough of |
|---|---|
| `breadcrumb-link-color` | `color-text-secondary` |
| `breadcrumb-link-color-hover` | `color-text-primary` |
| `breadcrumb-current-color` | `color-text-primary` |
| `breadcrumb-separator-color` | `color-text-secondary` |
| `breadcrumb-gap` | `space-inline-gap` |

`breadcrumb-link-color` and `breadcrumb-separator-color` both pointed at `color-text-secondary` and both collapse to the same var — confirmed as two genuinely separate component tokens sharing one value, not a duplicate to merge further (link and separator are different visual roles that happen to agree today). `breadcrumb-gap` was referenced twice in the CSS (list gap and item gap) — both call sites repointed.

**Not yet done for round 2:** Chromatic visual check (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 2: 650 → 640 tokens (exactly the 10 collapsed across both rounds), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 3 (2026-09):** switched from component-by-component to target-group batching, now that the mechanism is validated. Collapsed the remaining 26 of the 29 `color-text-secondary` pass-throughs (3 were already done in rounds 1–2: `avatar-fallback-foreground`, `breadcrumb-link-color`, `breadcrumb-separator-color`) — the full group is now closed. Spans 17 components: Accordion (2), Badge (1), Card (1), Checkbox (1), Dialog (1), Drawer (1), Hero (2), Input (5), Label (1), Pagination (1), Radio (1), Select (1), Switch (1), Table (2), Tabs (1), Tag (2), Textarea (2).

Same mechanism as rounds 1–2: removed each token from its `tokens/components/*.json` file, repointed the consuming CSS to `var(--color-text-secondary)` directly, updated each file's "Tokens consumed" header comment.

Found and fixed two now-redundant rules while repointing, both a direct consequence of the collapse rather than pre-existing debt:
- `Card.css` had a `[data-mode="dark"] .card__description { color: var(--color-text-secondary); }` override, added when `--card-description-color` was a component var that needed re-declaring per mode. Once `.card__description` references `--color-text-secondary` directly, the semantic token's own dark-mode value cascades automatically — the override became a no-op and was removed.
- `Input.css` had separate `.input-field__prefix` / `.input-field__suffix` color rules pointing at two different component tokens (`input-prefix-color`, `input-suffix-color`) that were both pass-throughs of the same semantic token. Collapsing both left two rules setting the same property to the same value — merged into the existing combined `.input-field__prefix, .input-field__suffix` selector, one rule removed.

**Not yet done for round 3:** Chromatic visual check across all 17 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 3: 640 → 614 tokens (exactly the 26 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 4 (2026-09):** collapsed the remaining 18 of the 20 `color-text-primary` pass-throughs (2 were already done in round 2: `breadcrumb-link-color-hover`, `breadcrumb-current-color`) — the full group is now closed. Spans 15 components: Accordion (1), Button (1), Checkbox (1), Dialog (1), Drawer (1), Hero (1), Input (2), Label (1), Radio (1), Select (1, used at two call sites: trigger and item), Switch (1), Table (1, used at three call sites: `.table`, `.table__header-btn:hover`, `.table__cell`), Tabs (2), Textarea (2), Toast (1).

Same mechanism as prior rounds. One process note: mid-edit on `input.json`, a malformed `old_str`/`new_str` pair corrupted the file's JSON structure (a stray brace left two token blocks merged). Caught immediately by re-reading the file before the next edit, and fixed with a full rewrite of the file from the last-known-good structure rather than patching around the damage — confirmed correct by diffing the token list against round 3's end state before proceeding. No corrupted state was left in place between the mistake and the fix.

**Not yet done for round 4:** Chromatic visual check across all 15 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 4: 614 → 596 tokens (exactly the 18 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 5 (2026-09):** collapsed the remaining 16 of the 17 `color-surface-secondary` pass-throughs (1 already done in round 1: `avatar-fallback-background`) — the full group is now closed. Spans 13 components: Accordion (1), Badge (1), Card (1), Checkbox (1), Input (1), Pagination (1), Radio (1), Select (1), Table (1 token, 3 call sites: `.table__head`, hover, striped-even), Tabs (2, one at two call sites: trigger-hover and pill-active), Tag (1), Textarea (1), Button (1 token, 3 call sites: wipe-fill, active, reduced-motion hover).

Same mechanism as prior rounds. No process issues this round — double-checked file state after each edit per round 4's lesson.

**Not yet done for round 5:** Chromatic visual check across all 13 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 5: 596 → 580 tokens (exactly the 16 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 6 (2026-09):** collapsed the remaining 15 of the 16 `color-border-default` pass-throughs (1 already done in round 1: `avatar-border`) — the full group is now closed. Spans 13 components: Accordion (1 token, 2 call sites), Badge (1), Card (1), Dialog (1), Drawer (1 token, 4 call sites: right/left/bottom panel borders + footer border-top), Input (1), Pagination (1), Select (2 tokens: border used at 2 call sites, separator-color at 1), Table (1 token, 5 call sites: wrapper/header/cell/foot-cell/bordered-variant), Tabs (1), Tag (2), Textarea (1), Toast (1).

Same mechanism as prior rounds. No process issues.

**Not yet done for round 6:** Chromatic visual check across all 13 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 6: 580 → 565 tokens (exactly the 15 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 7 (2026-09):** collapsed the remaining 12 of the 13 `border-width-default` pass-throughs (1 already done in round 1: `avatar-border-width`) — the full group is now closed. Spans 12 components, one touched for the first time (Alert): Accordion (1 token, 2 call sites), Alert (1), Badge (1), Card (1), Dialog (1), Drawer (1 token, 4 call sites), Pagination (1), Select (1: `select-separator-height`, repointed to `border-width-default` since the separator's height is a border-width value, not a spacing one), Table (1 token, 5 call sites), Tabs (1 token, 2 call sites: list border + indicator underline offset), Tag (1), Toast (1).

Same mechanism as prior rounds. No process issues.

**Not yet done for round 7:** Chromatic visual check across all 12 touched components (Alert now included for the first time; build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 7: 565 → 553 tokens (exactly the 12 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 8 (2026-09):** collapsed all 12 of the `font-size-control` pass-throughs (a clean group — none previously touched). Spans 12 components: Accordion (1 token, 2 call sites: trigger + body), Alert (1), Button (1), Card (1), Checkbox (1), Input (1), Radio (1), Select (1 token, 2 call sites: trigger + item), Switch (1), Table (1), Tabs (1), Textarea (1).

Same mechanism as prior rounds. No process issues.

**Not yet done for round 8:** Chromatic visual check across all 12 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 8: 553 → 541 tokens (exactly the 12 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 9 (2026-09):** collapsed all 12 of the `color-accent-default` pass-throughs (a clean group — none previously touched). Spans 8 components: Button (2 tokens: `button-primary-background`, `button-primary-border`, both used on the same `.button` rule), Checkbox (2 tokens: `checkbox-background-checked` used at 2 properties in one rule, `checkbox-border-hover`), Pagination (1 token, 2 properties in `.pagination__button--active`), Radio (2 tokens: `radio-border-hover`, `radio-indicator-color` used at 2 call sites), Switch (1), Table (1 token, 2 call sites: sort-asc/sort-desc arrows), Tabs (1), Tag (2 tokens: `tag-accent-background`, `tag-accent-border`, both in `.tag--accent`).

Same mechanism as prior rounds. No process issues.

**Not yet done for round 9:** Chromatic visual check across all 8 touched components (build/lint/typecheck are clean — see below).

`npm run tokens && npm run validate` run clean after round 9: 541 → 529 tokens (exactly the 12 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Round 10 (2026-09):** collapsed all 11 of the `color-surface-primary` pass-throughs (a clean group — none previously touched). Spans 10 components: Card (1), Checkbox (1), Dialog (1), Drawer (1), Hero (1), Input (1), Radio (2 tokens: `radio-background`, `radio-background-checked`), Select (1 token, 2 call sites: trigger + content), Textarea (1), Toast (1).

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 10: 529 → 518 tokens (exactly the 11 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Chromatic visual check (2026-09), covering rounds 1–10 (all 22 touched components, 192 stories, 28 components total):** `npm run chromatic` build 44 passed with **no visual changes found**. Confirms the collapse mechanism (removing a component token and repointing its consuming CSS to reference the semantic token directly) has been value-neutral across every round so far — the CSS cascade resolves identically whether a component token or a direct semantic reference is used, as the design predicted before round 1 began.

## Alternatives considered

- Start with the largest single target group (`color-text-secondary`, 29 tokens across ~15 components) instead of one component at a time — done in round 3, after rounds 1–2 validated the mechanism on smaller surfaces first. Rounds 4–10 repeated the same approach for the next seven largest groups (`color-text-primary` 20, `color-surface-secondary` 17, `color-border-default` 16, `border-width-default` 13, `font-size-control` 12, `color-accent-default` 12, `color-surface-primary` 11). Every group of 10+ tokens is now closed; remaining groups all have fewer than 10 members.
- Collapse all 299 in one pass — rejected as the same over-large-batch risk 0004 avoided by running five separate rounds.

## Consequences

### Positive
- Validates the mechanism (remove token + repoint CSS var) end-to-end on small, low-risk surfaces before scaling to the remaining ~167 pass-throughs.
- Avatar: 14 → 9 component-tier tokens. Breadcrumb: 8 → 3. Eight full target groups (`color-text-secondary` 29/29, `color-text-primary` 20/20, `color-surface-secondary` 17/17, `color-border-default` 16/16, `border-width-default` 13/13, `font-size-control` 12/12, `color-accent-default` 12/12, `color-surface-primary` 11/11) closed end to end across their respective components.
- Confirms target-group batching scales cleanly across many files and multiple rounds, not just a single pilot. All target groups of 10+ tokens are now done — every remaining group is under 10 members, a natural point to reconsider round sizing.

### Negative
- 132 collapses confirmed via nine clean `npm run tokens && npm run validate` runs (rounds 3–10), each matching the exact token-count delta predicted by the audit, and now also confirmed pixel-identical by a clean Chromatic build (build 44, 2026-09) across all 192 stories.
- ~167 pass-throughs remain uncollapsed across the other 57 target groups, all under 10 tokens each.
- Round 4 included one caught-and-fixed editing mistake (a corrupted token file, see Decision) — worth double-checking file state after each edit in future rounds rather than assuming a batch of edits all landed cleanly. Rounds 5–10 had no such issue.

## Related files

- `tokens/components/avatar.json`
- `components/primitives/Avatar/Avatar.css`
- `tokens/components/breadcrumb.json`
- `components/patterns/Breadcrumb/Breadcrumb.css`
- `tokens/components/{accordion,alert,badge,button,card,checkbox,dialog,drawer,hero,input,label,pagination,radio,select,switch,table,tabs,tag,textarea,toast}.json`
- `components/patterns/Accordion/Accordion.css`, `components/composition/Alert/Alert.css`, `components/primitives/Badge/Badge.css`, `components/primitives/Button/Button.css`, `components/composition/Card/Card.css`, `components/primitives/Checkbox/Checkbox.css`, `components/composition/Dialog/Dialog.css`, `components/composition/Drawer/Drawer.css`, `components/patterns/Hero/Hero.css`, `components/primitives/Input/Input.css`, `components/primitives/Label/Label.css`, `components/patterns/Pagination/Pagination.css`, `components/primitives/Radio/Radio.css`, `components/primitives/Select/Select.css`, `components/primitives/Switch/Switch.css`, `components/patterns/Table/Table.css`, `components/patterns/Tabs/Tabs.css`, `components/primitives/Tag/Tag.css`, `components/primitives/Textarea/Textarea.css`, `components/composition/Toast/Toast.css`
- `docs/token-audit.json` (generated, not committed — the `--json` audit run this round is based on)
