# 0008 — Split heading typography into fluid (Expressive) and static (Productive) tiers, add a Heading primitive

## Status

Accepted

## Context

This repo has no `Heading`/`Typography` primitive. Component titles (`Card`, `Dialog`, `Drawer`, `EmptyState`) each hardcode their own heading markup and reach directly for a static semantic token — `font-size-lead` (Card/Dialog/Drawer) or `font-size-h4` (EmptyState), both `{font-size.lg}`, 24px.

Separately, `tokens/brands/base/light.json` already defines four `clamp()`-based fluid font-size tokens — `font-size-h1-fluid`, `font-size-h2-fluid`, `font-size-h3-fluid`, and `font-size-display` — but only `font-size-h1-fluid` is actually referenced anywhere (`Hero.css`, `.hero__title`). `font-size-h2-fluid` and `font-size-h3-fluid` are dead: defined, never consumed, absent from `tokens/dependency-graph.json`'s `byToken` map.

Two questions needed answering before building anything: should component titles become fluid too (closing the "why is only Hero fluid" gap by extending fluid to everything), or should the fluid tokens stay reserved for large/prominent text and the dead ones get wired into something that actually needs them? And separately: is the existing `clamp()` math itself sound, given `clamp()`-based fluid type has a known accessibility failure mode?

### What other production systems do

Checked four systems this repo's own docs already treat as reference points (`docs/quality.md`, `docs/architecture.md` cite MD3 and Radix elsewhere) plus two more for range:

- **IBM Carbon** explicitly ships two separate type sets: "Productive" (fixed sizes, for dense product UI) and "Expressive" (fluid, for headlines and marketing surfaces). Carbon's fluid heading styles are pinned at multiple real breakpoints, not a single two-point `clamp()`/interpolation — a deliberate hedge against the "smooth curve reads as a glitch at in-between viewport widths" problem large fluid type can have.
- **Material Design 3** keeps every type-scale role's size fixed. Where a heading needs to look different at different breakpoints, MD3 reassigns which role the heading uses (e.g. a page title uses `headline-large` on a wide screen, `headline-medium` on a narrow one) rather than interpolating the same role's size continuously.
- **GitHub Primer** (dense product UI, the closest analog to this repo's own component-title use case) keeps all typography static — no fluid scaling anywhere in the system.
- **Adobe Spectrum** and **Shopify Polaris** are both fixed-scale typography systems, no `clamp()`-driven headings.
- The counterexample: editorial/marketing-first tools like **Utopia.fyi** treat fluid type as the default for nearly everything, headings and body both — but that toolset is built for long-form editorial and marketing pages, not the dense product-UI component titles (`Card`, `Dialog`, `Drawer`, `EmptyState`) this repo is deciding about.

**Conclusion:** across every mainstream production system checked, `clamp()`-based fluid scaling is reserved for large, prominent display/headline text — not for dense UI chrome (component titles, body copy, labels, controls), which stays static everywhere except purely editorial tooling that isn't this repo's audience. This repo's existing tokens already followed that split by accident — `Hero` fluid, `Card`/`Dialog`/`Drawer`/`EmptyState` static — this ADR makes it deliberate and documented instead of something a future session "fixes" by making everything fluid.

### The accessibility constraint on any `clamp()` token here

WCAG 1.4.4 (Resize Text) requires text to reach 200% zoom without loss of content or function. A `clamp()` preferred value expressed in pure `vw` doesn't respond to browser zoom — viewport units scale with window size, not with the user's zoom level — so a heading sized that way can fail to grow at all under a 200% zoom test, a real accessibility bug, not a theoretical one.

The documented safe pattern (Barvian's fluid-typography research, the same source underlying the widely-used [Utopia.fyi](https://utopia.fyi) calculator) is: keep the ratio between a token's max and min size at or under **2.5×**, and mix `rem` and `vw` in the preferred value (`0.75rem + 4vw`, not `4vw` alone) — the `rem` term guarantees a zoom-responsive floor even at the smallest viewport.

Checked against the four existing tokens:

| Token | `clamp()` | min → max | ratio | Preferred value form |
|---|---|---|---|---|
| `font-size-h1-fluid` | `clamp(1.75rem, 0.75rem + 4vw, 4rem)` | 28px → 64px | **2.29×** | mixed rem+vw ✓ |
| `font-size-h2-fluid` | `clamp(1.375rem, 0.75rem + 2.5vw, 3rem)` | 22px → 48px | **2.18×** | mixed rem+vw ✓ |
| `font-size-h3-fluid` | `clamp(1.5rem, 1rem + 2vw, 2.5rem)` | 24px → 40px | **1.67×** | mixed rem+vw ✓ |
| `font-size-display` | `clamp(2rem, 0.75rem + 5vw, 5rem)` | 32px → 80px | **2.5×** | mixed rem+vw ✓ |

All four already comply — `font-size-display` sits exactly at the 2.5× boundary, the other three are comfortably under it, and none uses a pure-`vw` preferred value. **This was correct before this ADR** — recorded here so it isn't mistaken for something this decision fixed, and so a future change to any of these four values gets checked against the same 2.5×/mixed-unit bar rather than assumed safe by precedent.

## Decision

**1. Build a new `Heading` primitive** at `components/primitives/Heading/`, rendering `H1`–`H6` via a `level` prop (`1`–`6`) that controls visual size, decoupled from an `as` prop (`'h1'`–`'h6'`, defaults to matching `level`) that controls the real semantic tag — so a visually-small `H1` can stay a genuine `<h1>` for document outline / SEO / screen-reader navigation while looking like a smaller heading, and vice versa. Follows this repo's existing primitive conventions: `forwardRef`, native heading attributes via `Omit<React.HTMLAttributes<HTMLHeadingElement>, …>` where a prop collides (decisions/0007), `className` merged via `lib/cn.ts` last, a contract test covering ref/rest/`className` passthrough (the same shape `Textarea.passthrough.test.tsx` established).

**2. Fluid tier — H1, H2, H3:**
- `H1` uses `font-size-h1-fluid` (already existed, now consumed by a second thing besides `Hero`) paired with `line-height-display`.
- `H2` uses `font-size-h2-fluid` (previously dead — now wired in) paired with `line-height-heading`.
- `H3` uses `font-size-h3-fluid` (previously dead — now wired in) paired with `line-height-heading`.
- All three pair with `letter-spacing-heading`.

**3. Static tier — H4, H5, H6, deliberately not fluid**, per the research above (fluid is reserved for large/prominent text; dense UI headings stay static):
- `H4` reuses the existing static `font-size-h4` (`{font-size.lg}`, 24px).
- `H5` and `H6` needed new static semantic tokens — none existed. Checked the primitive `font-size` scale in `tokens/global.json` rather than inventing new primitive values: added `font-size-h5` → `{font-size.emphasis}` (20px) and `font-size-h6` → `{font-size.md}` (18px), continuing the same descending scale H4 (24px) already sits on.
- All of H4–H6 pair with `line-height-heading` and `letter-spacing-heading`, same as H2/H3.

**4. `Card`, `Dialog`, `Drawer`, `EmptyState` component titles are explicitly NOT touched.** Their static sizing (`font-size-lead`/`font-size-h4`) was already correct under this split — they're dense UI chrome, not large/prominent display text — and this ADR records that explicitly so a future session doesn't "fix" them into fluid sizing by assuming the split above implies migrating everything.

## Alternatives considered

- **Make all typography fluid, including component titles.** Rejected — contradicts every production system checked here except purely editorial tooling (Utopia.fyi), which isn't the audience for `Card`/`Dialog`/`Drawer`/`EmptyState` title text. Would also mean re-litigating four components' visual baselines for no confirmed problem.
- **Discrete breakpoint tokens under `@media`, matching the Dialog responsive-padding pattern** (`docs/backlog.md`'s space-scale-expansion work — `space-dialog-padding-mobile/tablet/desktop` switched via `@media`) **instead of `clamp()`, for headings.** Rejected specifically for headings: `clamp()` is continuous rather than snapping at breakpoints, which suits large display text better — a visible jump in a page-level `H1`/`H2` at a breakpoint reads as a layout glitch in a way a padding snap doesn't. The fluid mechanism and its four tokens already exist and are already WCAG 1.4.4-compliant (see above), so no new infrastructure was needed to reach for it here.

## Consequences

### Positive
- `font-size-h2-fluid` and `font-size-h3-fluid` go from dead tokens to real, consumed ones — `tokens/dependency-graph.json` now lists `Heading.css` under both.
- The Productive/Expressive split this repo already had by accident (Hero fluid, everything else static) is now a documented, deliberate rule instead of an artifact nobody chose on purpose — the next session touching heading sizes has a rule to check against instead of guessing from precedent.
- Every fluid heading token in the system (existing and reused) is confirmed WCAG 1.4.4-safe under the 2.5×-ratio / mixed-rem-vw rule, recorded once so it doesn't need re-deriving per token.
- `Card`/`Dialog`/`Drawer`/`EmptyState` titles are explicitly out of scope, in writing — protects their current correct-by-accident static sizing from a well-intentioned future "shouldn't headings be fluid?" pass.

### Negative
- Two different heading vocabularies now coexist in the same file tree: `Heading`'s own `level`/`as` API, and `Card`'s pre-existing `CardTitle` `as`-only polymorphic pattern (`components/composition/Card/Card.tsx`), which renders its own heading markup rather than using this new primitive. Not unified in this decision — `CardTitle` (and the equivalent inline title markup in `Dialog`/`Drawer`/`EmptyState`) keep their current static sizing and their own component-scoped implementation; migrating them onto the new `Heading` primitive is a separate, larger change (four components' worth of markup + snapshot review) this ADR doesn't take on.
- `font-size-h5`/`font-size-h6` are new semantic roles with exactly one consumer each (`Heading`) at the time of writing — matches this repo's own reuse bar loosely (decisions/0004 requires 3+ shared consumers before adding a role) only because they're direct, deliberate extensions of the existing `font-size-h1`–`h4` heading-role family, not a stuck single-component value being promoted; flagged here rather than silently assumed to clear the bar.

## Related files

- `components/primitives/Heading/Heading.tsx`, `Heading.css`, `Heading.stories.tsx`, `Heading.passthrough.test.tsx`
- `tokens/brands/base/light.json` — `font-size-h1-fluid`, `font-size-h2-fluid`, `font-size-h3-fluid`, `font-size-display` (unchanged, now-cited), `font-size-h4` (unchanged), `font-size-h5`, `font-size-h6` (new), `line-height-display`, `line-height-heading`, `letter-spacing-heading`
- `components/patterns/Hero/Hero.css` — the pre-existing, only-prior consumer of `font-size-h1-fluid`
- `components/composition/Card/Card.css`, `components/composition/Dialog/Dialog.css`, `components/composition/Drawer/Drawer.css`, `components/patterns/EmptyState/EmptyState.css` — the static titles this decision deliberately leaves untouched
- `decisions/0004-add-semantic-roles-collapse-component-tokens.md` — the semantic-role reuse bar `font-size-h5`/`font-size-h6` are checked against
- `decisions/0007-universal-prop-passthrough-and-nesting-safe-z-index.md` — the primitive prop-passthrough pattern `Heading` follows
- `docs/backlog.md` — the Dialog responsive-padding precedent considered and rejected as this decision's mechanism for headings
