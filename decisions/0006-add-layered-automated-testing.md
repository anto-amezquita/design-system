# 0006 — Add layered automated testing (Storybook Vitest addon + a `unit` project), narrowing the no-unit-test-framework stance

## Status

Accepted — Button's contract test written, red, and fixed (commits `c78019f`, `024ba1d`, `a05de97`, `2539512`). Tooltip, Select, and Accordion checked against the same defect class and confirmed clear (see Consequences). DataTable's stateful interplay (sort/filter/selection) is explicitly out of scope for this decision — flagged as follow-up, not silently deferred.

## Context

`architecture.md` §7 and `quality.md` §6 state "no unit-test framework in this repo" as a deliberate choice, reasoned as: Chromatic (visual regression) + `check-stories.mjs` (story coverage) + `addon-a11y` (accessibility) + throwaway Playwright scripts for stateful logic + cold-agent tests for the machine-facing artifacts together cover what a component library needs, and a persisted suite would mostly be re-testing Radix's own tested behavior.

That reasoning holds for behavior this repo doesn't own. It doesn't hold for behavior this repo does own and has no gate for. Concretely: `Button.tsx` destructured only its own declared props and spread nothing onto the rendered element. Radix's `Slot` (what powers every `asChild` composition — `Dialog.Trigger`, `Tooltip`'s wrapped `children`, `AlertDialog.Cancel`/`Action`) injects `aria-haspopup`, `aria-expanded`, `data-state`, and an `id` onto whatever child it clones. Button dropped all of it silently. A `<Button>` used as a Dialog trigger opened the dialog and looked correct — Chromatic's screenshot is pixel-identical whether `aria-expanded` is present or not, since ARIA attributes don't render. The gap was invisible to every check this repo already runs, by construction, not by an edge case those checks happened to miss.

This is also why the roadmap's own future item — a self-healing CI agent that reacts to a failing check and opens a fix — can't work under the current setup. Chromatic's failure mode is a visual diff a human has to approve; an agent can't decide "was this change intended." A failing assertion is machine-actionable in a way a screenshot diff is not.

### What other design systems do (research, 2026-09)

No major system relies on visual regression alone — every one checked runs both a screenshot layer and a behavioral layer:

- **Shopify Polaris** — Percy for screenshots, explicit that approval stays manual because sub-pixel rendering noise alone can trigger a diff.
- **Adobe React Spectrum** — Jest + react-testing-library, tests required with PRs; also ships `@react-aria/test-utils` so *consumers* can test their own usage against ARIA semantics rather than DOM structure.
- **MUI** — Argos (visual) + a full behavioral suite; house rule is to query by role/semantics, not implementation detail, so tests survive internal refactors; explicitly avoid snapshot testing.
- **IBM Carbon** — publishes a per-component accessibility-verification-testing status table as a generated artifact, the same "quote the generated artifact, never memory" discipline this repo already applies to token/component counts.
- **GitHub Primer** — runs the design system's own PR against a real consuming app (`github/github-ui`) via an integration bot, reporting back that app's CI/VRT results. This repo has two real consumers (portfolio, Ajar) and could do the same at a much smaller scale.
- **Storybook's own Vitest addon** (`@storybook/addon-vitest`) runs existing stories as browser tests for free — a story with no play function is checked for render-without-error, a story with one gets its assertions run. This repo already had 184 stories and a coverage gate (`check-stories.mjs`) forcing every public component to have one — that's a test corpus that already existed, just never executed as one.

One cautionary finding, worth keeping in view rather than a reason not to act: Carbon's AI-chat repo had two test files (968 lines covering focus management and live regions) excluded from both configured test runners for months — passing by never running. A suite that exists isn't a suite that runs; whatever gates get added here need to fail loudly if they stop executing, not silently.

## Decision

Install `@storybook/addon-vitest`, which:
- Replaces `@storybook/test-runner` (deprecated by Storybook in favor of this addon) — the `a11y:stories` script's build-storybook → serve → `wait-on` → `test-storybook` chain goes away; `addon-a11y` accessibility checks now run through the same Vitest pipeline instead.
- Runs all 184 existing stories as Chromium browser tests, for free, as an automatic consequence of the existing story-coverage discipline.

Add a second Vitest project, `unit`, alongside the addon's own `storybook` project (`vitest.config.ts`), for contract assertions that aren't visual states — the split matters because a behavioral contract like "Button forwards Radix's injected ARIA attributes" isn't a catalogue entry a human would browse to, and folding every such assertion into a story would grow the Storybook corpus (and every Chromatic snapshot) per-assertion rather than per-visual-state.

Both projects run in **real Chromium via Playwright, not jsdom** — not the addon's default left alone, a load-bearing choice: `Button.tsx`'s `useEffect` calls `window.matchMedia` unguarded, which throws under jsdom before any assertion runs. Hoisted into one shared `browser` const in `vitest.config.ts` so the two projects can't drift apart on this.

`npm run validate`'s `typecheck` step needed `vitest.setup.ts` added to `tsconfig.json`'s `include` — it was type-checking test files under `components/` (correctly) but never seeing the file where `@testing-library/jest-dom/vitest` registers its matcher types, so `toHaveAttribute` etc. resolved to `never`. Same class of gap as the Button defect itself: a file existing and even running correctly, with nothing wiring it into the check meant to see it.

### The Button fix itself

Widened `ButtonProps` from a closed hand-rolled list to `Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'type'> & ButtonOwnProps`, and spread the resulting `...rest` onto both the `<button>` and `<a>` render branches. `HTMLAttributes<HTMLElement>` rather than `ButtonHTMLAttributes`/`AnchorHTMLAttributes` specifically, since Button renders either element depending on `href` and an element-specific type would be wrong for one branch.

This isn't a new pattern introduced for Button — it's Button catching up to precedent that already existed twice in this repo: `Input.tsx` (`Omit<React.InputHTMLAttributes<HTMLInputElement>, ...collisions> & <own props>`) and `AccordionTrigger` (`Omit<React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>, 'className'> & <own props>`, already spreading `...rest`). Three independent arrivals at "type against the real element/library type, spread the rest" is a strong enough signal to name as the actual rule, not infer it after the fact.

Confirmed this doesn't degrade the compiled docs (`architecture.md` §5's stated risk for `Omit`/`ComponentPropsWithoutRef`-only types): `scripts/build-component-docs.mjs`'s `decomposeProps` only falls back to a prose-only note for a type that is *purely* passthrough with nothing else; an intersection with a real own-props object still produces the full prop table plus an "Also accepts all props of…" note — exactly what `Input.tsx`'s and `TableHeader.tsx`'s generated docs already show.

Two adjacent things fixed in the same change, since they were live in the exact code path being edited:
- `onClick` widened from `() => void` to `(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void` — the old signature couldn't `preventDefault()` or read the target, and didn't compose with what Radix expects a consumer-supplied handler to look like.
- The `<a>` branch's non-internal-link fallback changed from `onClick={undefined}` to `onClick={onClick}` — a dormant, separate bug where an external-link Button never called a consumer's `onClick` at all.

### Test evidence (the actual before/after)

`components/primitives/Button/Button.slot.test.tsx` — Button rendered inside a real `Dialog` via its real `trigger` prop (not a mock), against a plain-`<button>` control in the identical composition:

- **Before the fix:** control passes (`aria-haspopup="dialog"`, `aria-expanded="false"`, `data-state="closed"` all present); Button fails — `aria-haspopup` resolves to `null`.
- **After the fix:** both pass, identically.

Commit sequence: `c78019f` (failing test + Vitest addon setup), `024ba1d` (tsconfig fix — test infra couldn't type-check without it), `a05de97` (the actual fix — test goes green), `2539512` (staging cleanup: two addon-generated files that should have been in `c78019f` but were missed, plus `.gitignore` entries for Vitest's browser-mode debug output, which the tool writes on every failure/trace and isn't meant to be versioned — same category as the CI-output ignores already in `.gitignore`).

## Alternatives considered

- **`type ButtonProps` as a discriminated union of two intersections** (button-branch props | anchor-branch props), which would type each render branch exactly instead of the shared `HTMLAttributes<HTMLElement>` compromise. Rejected: `decomposeProps` only resolves a top-level `|` when every branch is a bare identifier pointing at a local object alias — a union of two intersections collapses entirely into the generator's `extras` fallback and the component loses its prop table. The chosen approach costs precision (accepting some anchor-only or button-only attributes on the wrong branch, silently) to keep the generated docs intact; flagged here rather than fixed, since fixing the generator to resolve that union shape is real, separate work.
- **An explicit allow-list of pass-through attributes** (Option B from the earlier trade-off discussion) — richest possible generated docs, since each attribute gets its own description row. Rejected: the list would have to be maintained against Radix's own implementation details, and the failure mode when Radix adds a new injected attribute is the exact same silent drop this decision fixes, just smaller. Not worth owning a shadow copy of someone else's library surface.
- **Splitting Button into a curated component plus a lower-level spreading primitive** (Option C) — cleanest typing, but grows the public component count (currently 28, deliberately capped per the AI-readiness roadmap — see `docs/ai-readiness.md`) and requires a real answer to "which do I reach for," which nothing about this defect actually calls for.
- **Fixing the whole composed-trigger surface in one sweep** before writing this ADR — rejected in favor of checking first, fixing what needed it, and reporting the rest as verified-clean or explicit follow-up. Tooltip and Select turned out to have no version of this defect (see Consequences); fixing components that weren't broken would have been unjustified scope.

## Consequences

### Positive
- Closed a real accessibility defect: any existing composition of `<Button>` as a Dialog/AlertDialog trigger was invisible to assistive technology as a disclosure control. Confirmed, not assumed — the test's control/subject pair makes the defect and the fix both falsifiable.
- `npm run validate` stayed fully green through the fix (token lint, architecture lint, contrast, registry, story coverage, typecheck) — confirms the change didn't regress anything else touching Button.
- Checked the rest of the composed-trigger surface rather than assuming Button was representative:
  - **Tooltip** — wraps arbitrary `children` directly in `RadixTooltip.Trigger asChild`; forwards nothing itself, so it never had this class of bug to have. The defect lived entirely in the composed child (Button), not the wrapper — confirms the fix was correctly scoped to the leaf component.
  - **Select** — renders `RadixSelect.Trigger` directly with no `asChild` composition; doesn't apply.
  - **AccordionTrigger** — already typed against `React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>` and already spreads `...rest`; independent pre-existing precedent for the exact pattern this decision applies to Button.
- Modernizes test infra as a side effect of, not instead of, the actual fix: `@storybook/test-runner` (deprecated) is gone; 184 stories now run as browser tests with zero additional authoring.
- Superseded language for `architecture.md` §7 / `quality.md` §6 (not yet edited into those files — see Related files): the "no unit-test framework" framing should narrow to "no unit-test framework *for behavior Radix already owns*" — composed-trigger prop contracts, stateful interplay this repo's own components own (DataTable), and any future component whose typed contract is easy to silently violate are now this decision's territory, via the `unit` Vitest project.

### Negative
- Two staging misses in the process (`vitest.shims.d.ts` and `.storybook/main.ts`'s addon registration, both generated by the setup command but not included in the first commit) — caught via `git status` before push, not before commit; cost a follow-up commit (`2539512`) rather than a clean single commit for the infra setup.
- `AlertDialog`'s `cancel`/`action` props (`React.ReactElement`, rendered via `asChild`) share Button's exact composition shape and were not given their own contract test in this pass — the AlertDialog docs' existing "use plain `<button>`, not Button" guidance is now more conservative than necessary (both props declare `onClick` and would forward correctly with the fix in place), but that guidance hasn't been updated yet.
- DataTable's sort/filter/selection interplay — real, owned, stateful logic, exactly the kind of thing `quality.md` §6 already names as needing "a throwaway Playwright script against a real dev server, written for that piece of work" — remains untested by that mechanism today. Out of scope for this decision, not fixed by it.
- The discriminated-union alternative (more precise per-branch typing) was rejected on a generator limitation, not on its own merits — if `decomposeProps` is ever extended to resolve a union of intersections, this decision's Button typing is worth revisiting.

## Related files

- `vitest.config.ts`, `vitest.setup.ts`, `vitest.shims.d.ts` — new
- `tsconfig.json` — `vitest.setup.ts` added to `include`
- `.storybook/main.ts` — `@storybook/addon-vitest` registered
- `.gitignore` — `__screenshots__/`, `.vitest-attachments/` added
- `components/primitives/Button/Button.tsx`, `components/primitives/Button/Button.slot.test.tsx` — the fix and its test
- `components/primitives/Input/Input.tsx`, `components/patterns/Accordion/Accordion.tsx` (`AccordionTrigger`) — cited precedent for the typing pattern
- `docs/architecture.md` §5 (prop-type/doc-generator interaction), §7 (testing strategy — narrowed by this decision, not yet edited)
- `docs/quality.md` §6 (testing expectations — narrowed by this decision, not yet edited)
- `docs/roadmap.md` — self-healing CI item, whose feasibility this decision unblocks
- `scripts/build-component-docs.mjs` (`decomposeProps`) — the generator behavior this decision's typing choice was checked against
