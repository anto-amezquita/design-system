# 0007 — Extend Button's passthrough pattern to every primitive, close its own className gap, and stop ranking overlay z-index by kind

## Status

Accepted — implemented in full (2026-09-14). `Textarea`, `Badge`, `Checkbox`, `Input` all extended to the passthrough pattern; `className` merged on all four plus `Button`; `Select`-in-`Dialog` z-index fixed. See Verified below.

## Context

`decisions/0006` fixed one real defect on `Button`: its prop type was a closed, hand-rolled list, so Radix's `Slot` (what powers `asChild` — `Dialog.Trigger`, `Tooltip`'s wrapped `children`, `AlertDialog.Cancel`/`Action`) could clone `aria-haspopup`, `aria-expanded`, `data-state`, and an `id` onto a `<Button>` and have all of it silently dropped. That decision's own scope was deliberately narrow — "checking first, fixing what needed it" — and explicitly flagged the rest of the composed-trigger surface as open, not fixed: `AlertDialog`'s `cancel`/`action` guidance "hasn't been updated yet" (since updated — see below), and nothing else in the primitive tier was touched.

Two independent things since confirm the rest of that surface needs the same fix, plus a second problem 0006 didn't touch at all:

**1. A real external consumer hit the identical defect on two other primitives, this week.** Ajar (a separate app on this design system, `github.com/anto-amezquita/Ajar`) ran a full migration off raw HTML controls onto this package's primitives (`decisions/0030` in that repo, 2026-09-14) and confirmed, via render spikes against the actually-installed `0.3.1`, not assumed:

- `Textarea`'s type is `{ id, label, placeholder, value, defaultValue, onChange, disabled, error, hint, rows, maxLength, characterCount, required, aria-label }` — a hand-written list, no `...rest`, not ref-capable. A consumer needing `onKeyDown`, `onBlur`, or a DOM ref (all real, tested requirements in Ajar's case) has no path to any of them. Same shape of bug as pre-0006 `Button`, confirmed still present in the current `main` source (`components/primitives/Textarea/Textarea.tsx`), not just the published npm version.
- `Badge` is a plain function component — not ref-capable, no `...rest` — used as a `Dialog`'s `asChild` trigger. `asChild` clones `onClick` and a ref onto it; neither lands. Confirmed by render-spiking the real `Dialog` + `Badge` as `trigger`: the dialog never opens. `Checkbox` was checked structurally too (same closed-prop shape, no ref) though Ajar didn't have a Checkbox-as-asChild case to spike against.

**2. `Button`'s own 0006 fix left one thing unfixed: `className` isn't merged.** Current `Button.tsx`:

```tsx
return (
  <button
    {...rest}
    ref={elementRef}
    className={className}   // ← always wins; rest.className (if any) is discarded
    ...
```

`{...rest}` spreads first, but the component's own computed `className` is written explicitly after it, so any `className` a consumer passes lands in `rest`, gets spread, and is then immediately overwritten. This isn't hypothetical — it's the exact mechanism behind three of Ajar's own migration findings (`LineRow.tsx`'s History button losing the CSS class that hides it until hover/focus, `LibraryView.tsx`'s Delete button losing its padding/hover styling, several buttons losing the `machine` typography class) — all against `Button`, the component 0006 already "fixed." `Input.tsx`, `Textarea.tsx`, and every other primitive have the identical gap; none merge or even accept an external `className` today. `lib/cn.ts` (`classes.filter(Boolean).join(' ')`) already has the exact shape needed to append one — it's just never called with one.

**3. Net new: `Select` nested inside `Dialog` renders its dropdown behind the dialog's own overlay.** `styles/brands/base-light.css` hardcodes a fixed hierarchy:

```css
--z-dropdown: 200;
--z-overlay: 300;
--z-modal: 400;
--z-toast: 500;
--z-tooltip: 600;
```

`Select.css` uses `z-index: var(--z-dropdown)` on its popper content; `Dialog.css` uses `var(--z-overlay)` for its overlay and `var(--z-modal)` for its content. Ranking by *kind of overlay* has no way to represent "this dropdown is nested inside that modal, so it must win locally regardless of its kind" — and Ajar hit exactly that: a `Select` used for `RightsProfileSheet`'s "Release state," inside that same sheet's `Dialog`, had every option click intercepted by the dialog's own overlay. Reproduced with only `RightsProfileSheet`'s own `Dialog` open — not a second `AlertDialog` stacking on top, just a `Select` inside its nearest `Dialog`, used exactly as documented. This repo has no existing decision about layering strategy; `decisions/0005`'s rounds 19–21 touched `--z-modal`/`--z-toast`/`--z-tooltip` only as passthrough-collapse targets (folding `dialog-z-index`/`drawer-z-index`/`tooltip-z-index` onto the shared scale), never questioning whether the scale itself handles nesting.

**Radix hit the identical bug** (`radix-ui/primitives` [discussion #1985](https://github.com/radix-ui/primitives/discussions/1985), [issue #1317](https://github.com/radix-ui/primitives/issues/1317)) and didn't fix it with a bigger number. Maintainer Benoit Grelard's answer:

> "If you use the Portal part on all of these, you shouldn't even really need to fiddle with z-index — as they will be appended naturally one after the other in `document.body`, so layering will be correct by default."

Radix's newer `Dialog.Portal` deliberately stopped setting a z-index at all, so DOM append order (later-mounted paints on top) does the layering instead of a fixed per-component-type rank; where a component still needs an explicit value, it's exposed on that component's own `Content` part for the consumer to set per situation, not baked into a brand-wide constant.

**What the wider ecosystem does** (full research, citations, and a per-library comparison table: [The Passthrough Problem](https://claude.ai/code/artifact/23a5c026-2822-4711-bb51-358751118910)) — condensed to what's load-bearing here: every mainstream library (Radix itself, shadcn/ui, Base UI, Material UI, Chakra) types component props as the native element's own HTML attributes type, extended, and spreads the unrecognized remainder onto the root node; every one of them accepts and merges `className` (shadcn's `cn()` + `cva`, MUI's `slotProps`); and the layering fix above is Radix's own documented, shipped answer to the exact bug found here. None of this is exotic — it's the same short checklist independently converged on by every library checked.

## Decision

**1. Extend `Button`'s now-established pattern to every primitive that renders a single native element:** `Textarea`, `Badge`, `Checkbox`, `Input`, and any future primitive. Concretely, per component: type props as `Omit<React.ComponentPropsWithoutRef<'element'>, collisions> & OwnProps` (matching `Button.tsx`'s own comment on why `HTMLAttributes<HTMLElement>` was chosen over an element-specific type where a component can render more than one element), accept and place a `ref` on the real DOM node, and spread `...rest` onto it. This is not a new pattern to invent — it's `Button`, `Input` (already `Omit<React.InputHTMLAttributes<HTMLInputElement>, ...> & <own props>`), and `AccordionTrigger` (already `Omit<React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>, 'className'> & <own props>`) generalized to every remaining primitive, per 0006's own observation that three independent arrivals at this shape is a strong enough signal to name as the actual rule.

**2. Every primitive accepts a `className` prop and merges it — base classes first, consumer's last** — using `lib/cn.ts` as-is (`cn('button', variant && ..., className)`), on every primitive including `Button` itself, closing the gap left open by 0006.

**3. Stop ranking overlay z-index by component kind — for the confirmed `Select`/`Dialog` pair.** Nested-safe layering, resolved by portal mount order rather than a fixed `dropdown < overlay < modal < toast < tooltip` scale — matching Radix's own fix for the identical bug. Implemented as: remove the explicit `z-index` from **both** sides of the confirmed-broken pair (`Select.css`'s `--z-dropdown` *and* `Dialog.css`'s `--z-overlay`/`--z-modal`) rather than only the nested side. An explicit z-index on one sibling always outranks an `auto` sibling regardless of DOM order — removing only `Select`'s (the first thing tried) left `Dialog`'s own `--z-modal` still outranking it, confirmed by a real render test still failing after that partial fix. Both sides at `auto`, both portalled to `document.body`, is what actually lets mount order decide, matching un-styled Radix's own default behavior. `Drawer.css` still references `--z-modal` (unrelated, unconfirmed, untouched — see Consequences) and `Toast`/`Tooltip` keep their own tiers; this decision's scope is the pair with an actual failing test, not a blanket removal.

## Alternatives considered

- **Fix only `Button`'s `className` gap and stop there.** Rejected — the identical closed-prop-surface pattern is confirmed present, independently, on `Textarea` and `Badge` right now; fixing one primitive and not the others just relocates where the next consumer (this repo has two real ones today, portfolio and Ajar) hits it next.
- **Keep the fixed z-index scale but reorder it (e.g. rank dropdown above modal globally).** Rejected — a static reordering doesn't remove the failure mode, it moves it: a standalone dropdown that legitimately needs to stay below an unrelated already-open modal (not its parent) would now break instead. The scale itself, not its ordering, is the problem.
- **Adopt Ariakit/Base UI's `render`-prop composition model in this same decision**, replacing `asChild` outright. Rejected as scope — that's a bigger API-philosophy change than fixing the five confirmed defects requires, and Base UI's move away from `asChild` is recent enough (1.0 in December 2025) to weigh deliberately rather than fold into a fix-forward decision. Worth its own future ADR if `asChild` proves insufficient in practice, not bundled here.

## Consequences

### Positive
- Closes the same class of defect 0006 fixed, on the components where it's now confirmed to still exist, using the exact pattern this repo already validated once.
- Closes a defect in `Button` itself that 0006's own fix didn't reach.
- Removes an entire class of "an external consumer's existing CSS silently stops applying, discovered only when they migrate onto this system" — the specific way this repo found out about `Button`'s gap in the first place (via a Dialog-trigger composition, at time of use, not at build time).

### Negative
- Larger surface than 0006's single-component fix — needed the same per-component "checked and confirmed" discipline 0006 used for `Tooltip`/`Select`/`AccordionTrigger` (each primitive verified individually with its own test, not a blanket find-and-replace); `Badge`'s existing discriminated union specifically needed its own structural approach to avoid the doc-generator collapse 0006's own Alternatives section warned about (see Verified).
- The z-index fix's scope stayed narrow on purpose: only `Select`↔`Dialog`, the pair with an actual failing test. `Drawer.css` still carries an explicit `--z-modal`, and `Toast`/`Tooltip` keep their own tiers — any of those nested inside `Dialog` (or inside each other) could have the identical bug, unconfirmed either way. Flagged in `docs/backlog.md`, not fixed speculatively.
- **No published npm version contains any part of `decisions/0006`'s fix yet** — `CHANGELOG.md`'s `0.3.1` entry only covers the ref-forwarding half (`133c77d`); the `...rest`-spread fix and the `AlertDialog` cancel/action → `Button` switch (`c78019f`, `a05de97`, `95b55e8`, all 2026-09-08) landed on `main` after the `0.3.1` version bump (`8b99870`) and have no changeset queued. Every consumer, including Ajar, is blocked on all of this — the 0006 fix included — until a release actually ships. Worth acting on independently of and before this decision's own scope: this is a `npm run changeset` + release, not new engineering.

## Verified

Implemented in full, same session as this ADR (2026-09-14). `npm run validate` green throughout: 209/209 tests (up from 196 before this decision), 0 lint/architecture/contrast violations, typecheck clean.

- **`Textarea`** — widened to `Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue'> & TextareaOwnProps`, `forwardRef`, `className` merged. `Textarea.passthrough.test.tsx`: ref reaches the real `<textarea>`, `onKeyDown`/`onBlur` reach it, `className` merges — all four the exact things Ajar's `decisions/0030` needed and didn't have.
- **`Badge`** — `forwardRef`, `...rest` spread, `className` merged, while keeping `DotBadgeProps`/`OtherBadgeProps` as unchanged plain object aliases (native span attributes intersected at the *outer* union: `(DotBadgeProps | OtherBadgeProps) & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'aria-label'>`) — confirmed via `node scripts/build-component-docs.mjs` that `docs/components/badge.md` still renders both branches as real prop-table rows plus an "Also accepts all props of" note, the same degradation 0006 already accepted for `Button`, not the full collapse-to-extras 0006's Alternatives section warned a union of intersections would cause. `Badge.slot.test.tsx`: a `Badge` used as `Dialog`'s `asChild` trigger now actually opens the dialog and carries `aria-haspopup`/`data-state` — this is the literal render spike Ajar's `decisions/0030` ran against the broken version, kept as a permanent regression test.
- **`Checkbox`** — typed against `Omit<React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'onCheckedChange' | 'checked' | 'defaultChecked'> & CheckboxOwnProps`, mirroring `AccordionTrigger`'s existing precedent for a Radix-wrapped component; `forwardRef`, `className` merged. Not one of Ajar's original five findings (Ajar never needed `Checkbox` as an `asChild` target), included because it had the identical closed-prop shape and no test coverage would have caught it going forward. `Checkbox.passthrough.test.tsx`.
- **`Input`** — already extended `InputHTMLAttributes` and spread `...rest`; added the two pieces it was still missing, `forwardRef` (it worked by accident before, via `ref` landing in `...rest` with no type declaring it — confirmed by TypeScript rejecting `<Input ref={x}>` in Ajar's own migration) and `className` merge. `Input.ref.test.tsx`.
- **`Button`** — one-line fix: `className` destructured out as `classNameProp` and merged into the existing `cn(...)` call, so it's no longer silently overwritten by the component's own computed class. `Button.classname.test.tsx`, both the `<button>` and `<a>` render branches.
- **`Select` × `Dialog` z-index** — removed the explicit `z-index` from both `Select.css`'s `.select__content` and `Dialog.css`'s `.dialog__overlay`/`.dialog__content`. Removing only `Select`'s side was tried first and confirmed **still broken** by a real test (an explicit z-index on one sibling always outranks an `auto` sibling, independent of DOM order) — both sides needed to go to `auto` for mount order to actually decide. `Select.nesting.test.tsx` renders a real `Select` inside a real, open `Dialog` and drives it through `vitest/browser`'s `page` locator API (backed by this project's real Playwright provider), not `@testing-library/user-event` — confirmed empirically that `user-event`'s `.click()` doesn't perform real hit-testing and passed against the broken CSS with no fix at all; `page.click()` does, and reproduced Ajar's exact failure signature (`<div class="dialog__overlay"> intercepts pointer events`) before the fix, then passed after. The test also needed `styles/brands/base-light.css` imported directly — the `unit` Vitest project loads no brand CSS by default (unlike Storybook's `preview.tsx`), so `z-index: var(--z-dropdown)` never resolved to a real number without it, which silently made the test meaningless until this was added.
- Regenerated: `docs/components/badge.md`, `docs/components/checkbox.md`, `docs/components/textarea.md` (`npm run tokens`). `--z-dropdown` and `--z-overlay` are now fully unreferenced (`tokens/dependency-graph.json` confirms both dropped to an empty file list); left defined rather than deleted, flagged in `docs/backlog.md` as a small follow-up for a future `decisions/0005`-style dead-token round.

## Related files

- `components/primitives/Button/Button.tsx`, `Button.classname.test.tsx` — the established pattern, and its own remaining gap closed
- `components/primitives/Textarea/Textarea.tsx`, `Textarea.passthrough.test.tsx`
- `components/primitives/Badge/Badge.tsx`, `Badge.slot.test.tsx`
- `components/primitives/Checkbox/Checkbox.tsx`, `Checkbox.passthrough.test.tsx`
- `components/primitives/Input/Input.tsx`, `Input.ref.test.tsx`
- `components/primitives/Select/Select.css`, `Select.nesting.test.tsx`; `components/composition/Dialog/Dialog.css` — the confirmed-broken pair and its regression test
- `lib/cn.ts` — the merge utility used throughout, unchanged
- `styles/brands/base-light.css` (and `base-dark`/`portfolio-*`) — `--z-dropdown`/`--z-overlay` now dead; `--z-modal`/`--z-toast`/`--z-tooltip` still referenced (`Drawer`/`Toast`/`Tooltip`), unconfirmed either way
- `decisions/0006-add-layered-automated-testing.md` — the precedent this decision extends, and the source of the unreleased-fix finding above
- `decisions/0005-collapse-passthrough-component-tokens.md` rounds 19–21 — prior, unrelated z-index token touches (passthrough collapse only, never the layering strategy)
- `docs/backlog.md` — shipping the pending 0006 release, and the remaining Drawer/Toast/Tooltip nesting question
- External: Ajar's `decisions/0030-full-primitive-migration.md` (the consumer-side evidence) and [The Passthrough Problem](https://claude.ai/code/artifact/23a5c026-2822-4711-bb51-358751118910) (the cross-library research this decision draws on)
