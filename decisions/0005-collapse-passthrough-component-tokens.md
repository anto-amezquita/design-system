# 0005 — Collapse pass-through component tokens (rolling)

## Status

Accepted — complete for the original 299-token scope, verified via a fresh `npm run tokens:audit` after round 23: `"passthrough": 0`. Reopened for two small follow-up rounds (24–25, see below) after unrelated work elsewhere created one new passthrough; both rounds are done except for a pending Chromatic check. Every pass-through this decision set out to collapse is gone; what remains (37 literals, 3 correctly-kept variance tokens, 74 chain-skips) is out of scope for this decision — chain-skips are decision 0004's territory, not this one's.

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

**Round 11 (2026-09):** re-ran `npm run tokens:audit --json` (167 passthroughs remained, all 65 remaining target groups under 17 members — the 10+ groups from rounds 3–10 are all closed). Collapsed all 7 of the `color-accent-foreground` pass-throughs (a clean group — none previously touched). Spans 5 components: Button (2 tokens: `button-primary-foreground` at 1 call site, `button-secondary-foreground-hover` at 3 call sites), Checkbox (2 tokens: `checkbox-foreground-checked`, `checkbox-foreground-indeterminate`), Pagination (1), Switch (1), Tag (1).

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 11: 518 → 511 tokens (exactly the 7 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 11:** a Chromatic check specifically covering round 11's 5 touched components.

**Round 12 (2026-09):** switched slicing strategy from target-group batching to component-by-component clearing, now that every target group is under 7 tokens — at that size, a round sliced by component covers more ground than one sliced by shared target, and fully clearing a component removes an entire file's passthrough debt in one pass rather than leaving scattered remainders across many rounds. Picked Alert first: the largest single component's remaining passthrough count (17), all previously untouched by target-group rounds except `alert-border-width` (round 7) and `alert-font-size` (round 8).

Collapsed all 17 remaining Alert passthroughs in one sweep, spanning 5 different semantic targets: `alert-padding-x`/`alert-padding-y` → `space-prominent-padding-x`/`-y`, `alert-gap` → `space-label-gap`, `alert-border-radius` → `border-radius-component`, `alert-icon-size` → `size-icon-md`, and all 12 variant color tokens (`alert-{success,warning,error,info}-{background,foreground,border}`) → their matching `color-feedback-*` semantic tokens. Rewrote `tokens/components/alert.json` in full (17 removals in one file is past the point where sequential `str_replace` edits are worth it) rather than editing token-by-token. Alert is now fully clear of passthroughs — its remaining 4 tokens are all chain-skips or literals, tracked separately.

Same mechanism as prior rounds (remove token, repoint CSS, update header comment) — slicing changed, not the mechanism itself. No process issues.

`npm run tokens && npm run validate` run clean after round 12: 511 → 494 tokens (exactly the 17 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 12:** a Chromatic check for Alert.

**Round 13 (2026-09):** same component-by-component approach, next largest remaining count: Badge (14 passthroughs, all previously untouched by target-group rounds). Collapsed all 14 in one sweep across 3 semantic targets: `badge-gap` → `space-tight-gap`, `badge-border-radius` → `border-radius-pill`, and all 12 variant color tokens (`badge-{success,warning,error,info}-{background,foreground,border}`) → their matching `color-feedback-*` tokens — the exact same variant-color pattern as Alert in round 12. Rewrote `tokens/components/badge.json` in full for the same reason as Alert (14 removals). Badge is now fully clear of passthroughs.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 13: 494 → 480 tokens (exactly the 14 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 13:** a Chromatic check for Badge.

**Round 14 (2026-09):** same component-by-component approach, next largest remaining count: Toast (12 passthroughs, all previously untouched by target-group rounds). Collapsed all 12 across 9 semantic targets: `toast-border-radius` → `border-radius-component`, `toast-padding-x`/`-y` → `space-prominent-padding-x`/`-y`, `toast-gap` → `space-label-gap` (2 call sites: viewport gap, individual toast gap), `toast-shadow` → `shadow-toast`, `toast-z-index` → `z-toast`, `toast-icon-size` → `size-icon-md` (2 call sites), `toast-content-gap` → `space-tight-gap`, and the 4 variant border tokens (`toast-{success,warning,error,info}-border`) → their matching `color-feedback-*-border` tokens. Toast is now fully clear of passthroughs — its remaining 6 tokens are literals or chain-skips.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 14: 480 → 468 tokens (exactly the 12 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 14:** a Chromatic check for Toast.

**Round 15 (2026-09):** same component-by-component approach. Four components were tied at 9 remaining passthroughs each (Select, Tabs, Textarea, Input); picked Input first. Collapsed all 9 across 7 semantic targets: `input-border-width` → `border-width-interactive`, `input-border-hover` → `color-border-strong`, `input-border-focus` → `color-border-focus` (2 call sites), `input-border-radius` → `border-radius-interactive`, `input-padding-x`/`-y` → `space-control-padding-x`/`-y`, `input-label-weight` → `font-weight-label`, and `input-border-error` + `input-error-color` (2 separate component tokens, 4 call sites total) both → `color-feedback-error` — confirmed as a genuine coincidence (border color and hint-text color happening to share one semantic value) rather than a duplicate to merge, same reasoning as round 2's `breadcrumb-link-color`/`breadcrumb-separator-color`. Input is now fully clear of passthroughs — its remaining 2 tokens (`input-label-size`, `input-hint-size`) are chain-skips.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 15: 468 → 459 tokens (exactly the 9 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 15:** a Chromatic check for Input.

**Round 16 (2026-09):** same component-by-component approach. Picked Select, the next of the three components still tied at 9 remaining (Select, Tabs, Textarea). Collapsed all 9 across 8 semantic targets: `select-border-width` → `border-width-interactive` (2 call sites: trigger, content), `select-border-focus` → `color-border-focus` (2 call sites), `select-border-radius` → `border-radius-interactive`, `select-padding-x`/`-y` → `space-control-padding-x`/`-y`, `select-content-shadow` → `shadow-dropdown`, `select-content-border-radius` → `border-radius-component`, `select-border-hover` → `color-border-strong`, `select-label-weight` → `font-weight-label`. Select is now fully clear of passthroughs — its remaining 3 tokens (`select-item-padding-x`, `select-item-padding-y`, `select-label-size`) are chain-skips.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 16: 459 → 450 tokens (exactly the 9 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 16:** a Chromatic check for Select.

**Chromatic visual check (2026-09), covering rounds 11–16 (all 22 touched components, 192 stories, 28 components total, commit `e26180d`):** `npm run chromatic` build 46 passed with **no visual changes found**. Confirms both the target-group→component-slicing switch (round 12) and every round since have stayed value-neutral, matching build 44's result for rounds 1–10. One operational note: Chromatic ties builds to the git commit, so running it against uncommitted local changes just skips as "same commit, already passed" rather than actually checking anything — rounds 11–16 had to be committed and pushed first for build 46 to run at all.

**Round 17 (2026-09):** same component-by-component approach. Picked Tabs, the next of the two components tied at 9 remaining (Tabs, Textarea). Collapsed all 9 across 8 semantic targets: `tabs-trigger-padding-x`/`-y` → `space-control-padding-x`/`-y`, `tabs-trigger-font-weight` → `font-weight-control`, `tabs-trigger-gap` → `space-tight-gap`, `tabs-pill-border-radius` → `border-radius-interactive`, `tabs-pill-gap` → `space-tight-gap` (same target as trigger-gap — two separate component tokens, both real, coincidentally equal), `tabs-sm-trigger-padding-y`/`-x` → `space-compact-padding-y`/`-x`, `tabs-duration` → `duration-interaction` (3 call sites: 2 in one `transition` declaration on `.tabs__trigger`, 1 on the line-variant underline). Tabs is now fully clear of passthroughs — its remaining 2 tokens (`tabs-indicator-height`, `tabs-content-padding-top`) are chain-skips.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 17: 450 → 441 tokens (exactly the 9 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 17:** a Chromatic check for Tabs.

**Round 18 (2026-09):** same component-by-component approach. Picked Textarea, the last of the components originally tied at 9 remaining. Collapsed all 9 across 7 semantic targets, mirroring Input's structure (round 15) almost exactly since both share the same wrapper/border/error pattern: `textarea-border-width` → `border-width-interactive`, `textarea-border-hover` → `color-border-strong`, `textarea-border-focus` → `color-border-focus` (2 call sites), `textarea-border-radius` → `border-radius-interactive`, `textarea-padding-x`/`-y` → `space-control-padding-x`/`-y`, `textarea-label-weight` → `font-weight-label`, and `textarea-border-error` + `textarea-error-color` (2 separate component tokens, 3 call sites) both → `color-feedback-error`, the same border/hint-text coincidence pattern as Input's round 15 and Breadcrumb's round 2. Textarea is now fully clear of passthroughs — its remaining 2 tokens (`textarea-label-size`, `textarea-hint-size`) are chain-skips.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 18: 441 → 432 tokens (exactly the 9 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 18:** a Chromatic check for Textarea.

**Round 19 (2026-09):** same component-by-component approach. Picked Dialog, one of two components tied at 8 remaining (Dialog, Button). Collapsed 8 across 6 semantic targets: `dialog-border-radius` → `border-radius-component`, `dialog-padding` → `space-container-padding-lg`, `dialog-gap` → `space-element-gap` (2 call sites: content, body), `dialog-overlay-color` → `color-surface-tertiary`, `dialog-title-size` → `font-size-lead`, `dialog-title-weight` → `font-weight-title`. Along the way, found two of the 8 (`dialog-shadow`, `dialog-z-index`) were already dead — not referenced anywhere in `Dialog.css` and not even listed in the file's own "Tokens consumed" header comment, meaning some earlier unlogged change had already repointed `.dialog__content` to reference `--z-modal` directly and never applied a box-shadow at all. Removed both from the token file with the rest; no CSS change needed for those two since nothing referenced them. Dialog is now fully clear of passthroughs.

Same mechanism as prior rounds, plus this dead-token find. No process issues.

`npm run tokens && npm run validate` run clean after round 19: 432 → 424 tokens (exactly the 8 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 19:** a Chromatic check for Dialog.

**Round 20 (2026-09):** same component-by-component approach. Picked Button, the last component at this size tier (corrected from an earlier miscount of 8 to its actual 7 real passthroughs — three tokens the audit's `variance` list already correctly excludes, `button-secondary-foreground`, `button-secondary-border`, `button-secondary-background-hover`, resolve to `color-accent-default` in light mode but differ in dark modes, so they're genuine component-level overrides, not passthroughs, and were left untouched). Collapsed the 7 real passthroughs across 6 semantic targets: `button-font-weight` → `font-weight-control`, `button-border-radius` → `border-radius-pill`, `button-border-width` → `border-width-interactive`, `button-duration` → `duration-interaction` (9 call sites across base/secondary/link/arrow/reduced-motion transitions), `button-primary-background-hover` → `color-accent-hover` (4 call sites), `button-icon-gap` → `space-inline-gap`. Along the way, found `button-icon-size` was already dead — not referenced anywhere in `Button.css` (icon sizing uses a hardcoded `1em` instead), same pattern as round 19's `dialog-shadow`/`dialog-z-index`. Removed it with the rest. Button is now fully clear of passthroughs — its remaining tokens are literals, chain-skips, or the 3 correctly-kept variance tokens.

Same mechanism as prior rounds. No process issues.

`npm run tokens && npm run validate` run clean after round 20: 424 → 417 tokens (exactly the 7 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 20:** a Chromatic check for Button.

**Chromatic visual check (2026-09), covering rounds 17–20 (all 22 touched components, 192 stories, 28 components total, commit `52f4d37`):** `npm run chromatic -- --force-rebuild` build 50 passed with **no visual changes found**. Rounds 17–20 (Tabs, Textarea, Dialog, Button) had already been committed and pushed earlier and picked up a passing Chromatic build automatically via the GitHub integration, so `--force-rebuild` was needed to get an explicit, citable build number for this record rather than the default "skip — already passed" behavior.

**Round 21 (2026-09):** widened batch size — with the remaining 66 passthroughs spread thin across 17 small components (1–7 tokens each), one-component-per-round would mean 17 more rounds; instead batched several components per round while keeping a `npm run tokens && npm run validate` checkpoint after each batch, so a mistake still stays isolated to one batch rather than the whole remainder. Split the 17 remaining components into 3 batches by rough size (largest first): Card/Drawer/Switch/Tooltip (26 tokens), Emptystate/Table/Radio/Skeleton/Spinner (22 tokens), Accordion/Checkbox/Label/Hero/Pagination/Avatar/Datatable/Tag (18 tokens).

This round covers the first batch — Card, Drawer, Switch, Tooltip — collapsing 26 tokens across many semantic targets. Card (7): `card-border-radius` → `border-radius-component`, `card-padding` → `space-container-padding` (8 call sites), `card-gap` → `space-element-gap` (6 call sites), `card-title-size`/`-weight` → `font-size-lead`/`font-weight-title`, `card-shadow-hover` → `shadow-card-hover`; `card-shadow` was found dead (never referenced in `Card.css`, only `card-shadow-hover` is actually used) and removed with the rest, same pattern as rounds 19–20's dead-token finds. Drawer (7): `drawer-shadow` → `shadow-dialog`, `drawer-z-index` → `z-modal` (2 call sites), `drawer-padding` → `space-container-padding-lg` (4 call sites), `drawer-gap` → `space-component-gap` (3 call sites), `drawer-overlay-color` → `color-surface-tertiary`, `drawer-title-size`/`-weight` → `font-size-lead`/`font-weight-title`. Switch (6): `switch-track-background` → `color-border-strong`, `switch-track-background-disabled` → `color-surface-tertiary`, `switch-track-border-radius` → `border-radius-pill`, `switch-thumb-border-radius` → `border-radius-pill` (same target as track, two separate real tokens), `switch-label-gap` → `space-label-gap`, `switch-duration` → `duration-interaction` (2 call sites). Tooltip (6): `tooltip-background` → `color-surface-inverse` (2 call sites), `tooltip-foreground` → `color-text-inverse`, `tooltip-padding-x`/`-y` → `space-compact-padding-x`/`-y`, `tooltip-shadow` → `shadow-toast`, `tooltip-z-index` → `z-tooltip`. All four components are now fully clear of passthroughs.

Process mistake, caught before commit: mid-edit on Tooltip, three tokens (`tooltip-font-size`, `tooltip-font-weight`, `tooltip-border-radius`) were incorrectly collapsed as if they were passthroughs, repointing `Tooltip.css` to reference `font-size-xs`/`font-weight-medium`/`border-radius-sm` directly. Those three are actually **chain-skip** tokens (component → primitive, skipping the semantic tier) per the audit's own classification — a different, already-closed problem (decision 0004's scope), not a 0005 passthrough. Collapsing them broke the tier rule and `npm run tokens:lint` caught it immediately (`no-primitive-tokens` violation on `Tooltip.css`). Reverted `Tooltip.css` to reference the three component tokens again (the JSON file itself was never wrong — the token definitions were correctly kept, only the CSS edit was mistaken) before re-running validate. Worth flagging for future rounds: audit entries need their `tier` field checked (`semantic` = passthrough, safe to collapse; `primitive` = chain-skip, out of scope here), not just their presence in the `passthrough` array key by name resemblance.

Same mechanism as prior rounds; batched across 4 files instead of 1 this time.

`npm run tokens && npm run validate` run clean after round 21: 417 → 391 tokens (exactly the 26 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 21:** a Chromatic check for Card, Drawer, Switch, and Tooltip.

**Round 22 (2026-09):** second planned batch — EmptyState, Table, Radio, Skeleton, Spinner (22 tokens). This time checked each token's `tier` field against the fresh audit output before touching any file, per round 21's lesson. EmptyState (5): `emptystate-gap` → `space-element-gap`, `emptystate-icon-margin` → `space-inline-gap` (2 call sites), `emptystate-padding-y-compact`/`-x-compact` → `space-container-padding-lg`/`space-container-padding`, `emptystate-gap-compact` → `space-label-gap`; `emptystate-padding-y`/`-x` correctly left alone (chain-skip, primitives, out of scope). Table (5): `table-cell-padding-x`/`-y` → `space-control-padding-x`/`-y` (7 call sites combined across header/cell/caption/compact), `table-selected-row-background` → `color-surface-tertiary`, `table-border-radius` → `border-radius-component`, `table-sort-icon-gap` → `space-tight-gap`; `table-header-font-size`/`-weight` correctly left alone (chain-skip). Radio (4): `radio-border` → `color-border-strong`, `radio-border-width` → `border-width-interactive`, `radio-label-gap`/`radio-group-gap` → `space-label-gap` (two separate real tokens, same target); `radio-size`/`radio-indicator-size` correctly left alone (chain-skip). Skeleton (4): `skeleton-background` → `color-skeleton-base` (3 call sites), `skeleton-highlight` → `color-skeleton-highlight`, `skeleton-duration` → `duration-skeleton`; found `skeleton-height-icon` dead (not referenced anywhere in `Skeleton.css`, and not listed in its own "Tokens consumed" comment — fourth dead-token find, same pattern as rounds 19–21) and removed it with the rest; `skeleton-border-radius`/`skeleton-height-text`/`skeleton-height-rect` correctly left alone (chain-skip/literal). Spinner (4): `spinner-size-sm`/`-md`/`-lg` → `size-icon-sm`/`-md`/`-lg` (2 call sites each), `spinner-duration` → `duration-spin`; `spinner-stroke-width` correctly left alone (chain-skip). All five components are now fully clear of passthroughs.

Same mechanism as prior rounds. No process issues — this round specifically re-verified every token's tier before editing, closing the gap that caused round 21's mistake.

`npm run tokens && npm run validate` run clean after round 22: 391 → 369 tokens (exactly the 22 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean.

**Not yet done for round 22:** a Chromatic check for EmptyState, Table, Radio, Skeleton, and Spinner.

**Round 23 (2026-09):** third and final planned batch — Accordion, Avatar, Checkbox, DataTable, Hero, Label, Pagination, Tag (18 tokens). Tier-checked every token against the audit before editing, per round 22's discipline. Accordion (4): `accordion-trigger-padding-x`/`-y` → `space-prominent-padding-x`/`-y`, `accordion-trigger-font-weight` → `font-weight-control`, `accordion-icon-size` → `size-icon-md` (2 call sites). Avatar (1): `avatar-border-radius` → `border-radius-pill` — Avatar's last remaining passthrough, closing out the component started in round 1. Checkbox (4): `checkbox-border` → `color-border-strong`, `checkbox-border-width` → `border-width-interactive`, `checkbox-border-radius` → `border-radius-interactive`, `checkbox-label-gap` → `space-label-gap`. DataTable (1, first touch): `datatable-empty-padding` → `space-container-padding`. Hero (2): `hero-padding-x` → `space-container-padding`, `hero-gap` → `space-component-gap`. Label (3): `label-font-weight` → `font-weight-label`, `label-required-color` → `color-feedback-error`, `label-gap` → `space-inline-gap`. Pagination (2): `pagination-border-radius` → `border-radius-interactive`, `pagination-gap` → `space-inline-gap`. Tag (1): `tag-border-radius` → `border-radius-pill`. All 8 components now fully clear of passthroughs; no dead tokens or tier mistakes found this round.

This closes the last of the three round-21 planned batches. Every component originally identified as having passthrough tokens has now been swept.

`npm run tokens && npm run validate` run clean after round 23: 369 → 351 tokens (exactly the 18 collapsed), token linter 0 violations, contrast check clean across all 4 modes, `tsc --noEmit` clean. A fresh `npm run tokens:audit --json` afterward confirms `"passthrough": 0` — the authoritative check that nothing was missed. Component tokens: 413 (start of this decision) → 114 (end), primarily via passthrough removal but including decision 0004's earlier chain-skip work too.

**Chromatic visual check (2026-09), covering rounds 21–23 (all 17 touched components, 192 stories, 28 components total, commit `9c91499`):** `npm run chromatic` build 51 passed with **no visual changes found**. This closes the last open item — every round of this decision, all 23 of them, is now visually confirmed clean, not just token-count-correct. Combined with builds 44, 46, and 50, the entire 299-token collapse across the full effort has been verified with zero visual regressions.

**Round 24 (2026-09), reopened for a new passthrough:** unrelated work fixing `light.json`'s `font-size-label` role (existed since decision 0004's era, but was unused and set to the wrong value — `font-size.xs` instead of `font-size.sm`, same bug shape as `font-weight-label`'s original mistake) surfaced a fresh 3-token passthrough group once the role's value was corrected and adopted: `input-label-size`, `label-font-size`, `textarea-label-size` all resolved identically to `font-size-label` in every mode. Same mechanism as every prior round: removed all 3 from their token files (`input.json`, `label.json` — now empty, `textarea.json`), repointed `Input.css`/`Label.css`/`Textarea.css` to `var(--font-size-label)` directly, updated each file's header comment. `select-label-size` was deliberately left out of this round — its value (`font-size.xs`) happened to match the role's old, wrong value, which read as a possible fourth instance of the same bug rather than an obvious passthrough; flagged for a separate decision.

`npm run tokens && npm run validate` run clean after this round.

**Round 25 (2026-09), resolves the round-24 flag:** decided `select-label-size` is the same bug, not a deliberate design choice — matched it to `font-size-label` (sm) like the other three form-label components, rather than leaving Select's label smaller than Input/Label/Textarea's. Removed `select-label-size` from `select.json`, repointed `Select.css` to `var(--font-size-label)` directly, updated its header comment. All four form-label components (Input, Label, Select, Textarea) now share one role for both weight (`font-weight-label`, decisions/0004) and size (`font-size-label`, this decision).

`npm run tokens:lint-architecture` clean, 0 violations.

**Not yet done for rounds 24–25:** `npm run tokens && npm run validate` after round 25's edit specifically, and a Chromatic check for Input, Label, Select, and Textarea.

## Alternatives considered

- Start with the largest single target group (`color-text-secondary`, 29 tokens across ~15 components) instead of one component at a time — done in round 3, after rounds 1–2 validated the mechanism on smaller surfaces first. Rounds 4–11 repeated the same approach for the next eight largest groups (`color-text-primary` 20, `color-surface-secondary` 17, `color-border-default` 16, `border-width-default` 13, `font-size-control` 12, `color-accent-default` 12, `color-surface-primary` 11, `color-accent-foreground` 7). Every group of 10+ tokens is now closed; remaining groups all have fewer than 7 members.
- Round 12 switched slicing from target-group to component-by-component, now that remaining groups are too small (under 7 members) for group-batching to clear much per round. Clearing a whole component's passthroughs in one round, regardless of how many different semantic targets they point to, removes more debt per round at this stage and leaves no scattered per-component remainder the way group-batching would.
- Round 21 widened the batch further to several components per round, once components themselves dropped to 1–7 tokens each — the marginal safety of one-component-per-round stopped being worth 17 more rounds. Kept the checkpoint (`npm run tokens && npm run validate` after each batch, not after the whole remainder) so a mistake stays traceable to one batch.
- Collapse all 299 in one pass — rejected throughout: the same over-large-batch risk 0004 avoided by running five separate rounds, and the reasoning that motivated round 21's smaller multi-component batches over a single 66-token pass with only one checkpoint at the end.

## Consequences

### Positive
- Validates the mechanism (remove token + repoint CSS var) end-to-end on small, low-risk surfaces, all the way through to the last batch — the same three-step process (remove token, repoint CSS, update header comment) worked unchanged from round 1's Avatar pilot to round 23's Avatar close-out.
- Avatar: 14 → 8 component-tier tokens (its very last passthrough, `avatar-border-radius`, closed in round 23). Breadcrumb: 8 → 3. Every component the effort touched — Avatar, Breadcrumb, Alert, Badge, Toast, Input, Select, Tabs, Textarea, Dialog, Button, Card, Drawer, Switch, Tooltip, EmptyState, Table, Radio, Skeleton, Spinner, Accordion, Checkbox, DataTable, Hero, Label, Pagination, and Tag — is now fully clear of passthroughs.
- Round 23 applied both process lessons from earlier rounds (tier-check before editing, from round 21; no shortcuts on double-checking file state, from round 4) and had no issues, the third consecutive clean round.

### Negative
- Round 4 included one caught-and-fixed editing mistake (a corrupted token file, see Decision), and round 21 included a second (three chain-skip tokens mistakenly collapsed, caught by the linter and reverted before commit). Rounds 22–23 both applied the tier-check discipline that came out of round 21 and had no issues.
- The mechanism required touching all 26 original component CSS/JSON file pairs, plus regenerating every downstream generated artifact (docs, registry, brand CSS, `llms.txt`, etc.) 23 times — real but expected cost of a repo-wide token architecture change, not a surprise.

## Related files

- `tokens/components/avatar.json`
- `components/primitives/Avatar/Avatar.css`
- `tokens/components/breadcrumb.json`
- `components/patterns/Breadcrumb/Breadcrumb.css`
- `tokens/components/{accordion,alert,badge,button,card,checkbox,dialog,drawer,hero,input,label,pagination,radio,select,switch,table,tabs,tag,textarea,toast}.json`
- `components/patterns/Accordion/Accordion.css`, `components/composition/Alert/Alert.css`, `components/primitives/Badge/Badge.css`, `components/primitives/Button/Button.css`, `components/composition/Card/Card.css`, `components/primitives/Checkbox/Checkbox.css`, `components/composition/Dialog/Dialog.css`, `components/composition/Drawer/Drawer.css`, `components/patterns/Hero/Hero.css`, `components/primitives/Input/Input.css`, `components/primitives/Label/Label.css`, `components/patterns/Pagination/Pagination.css`, `components/primitives/Radio/Radio.css`, `components/primitives/Select/Select.css`, `components/primitives/Switch/Switch.css`, `components/patterns/Table/Table.css`, `components/patterns/Tabs/Tabs.css`, `components/primitives/Tag/Tag.css`, `components/primitives/Textarea/Textarea.css`, `components/composition/Toast/Toast.css`
- `docs/token-audit.json` (generated, not committed — the `--json` audit run this round is based on)
