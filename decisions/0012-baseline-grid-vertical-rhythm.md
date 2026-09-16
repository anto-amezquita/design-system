# 0012 — Tie line-height to the 4px spacing grid for a baseline vertical rhythm

## Status

Proposed

## Context

Reading experience across all apps consuming this design system is a first-class goal, not a nice-to-have (Antonio, voice session 2026-09-16). Vertical rhythm — text and layout sharing one repeating unit so a page reads as visually consistent top to bottom — is one concrete, checkable way to guarantee that.

The spacing scale (`tokens/global.json`, `space.1`–`space.13`) is already a strict 4px grid: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 96, 128px. Line-height is not tied to it. `line-height-body`/`-heading`/`-display` are unitless ratios (1.5 / 1.25 / 1.125) applied across font sizes that don't share a common ratio to the grid. Resolved to pixels against real font sizes:

| Pairing | Resolved | 4px-aligned? |
|---|---|---|
| body (18px × 1.5) | 27px | No — nearest 28px |
| control (16px × 1.5) | 24px | Yes |
| small (14px × 1.5) | 21px | No — nearest 20px |
| h1 (64px × 1.25) | 80px | Yes |
| h2 (48px × 1.25) | 60px | Yes |
| h3 (32px × 1.25) | 40px | Yes |
| h4 (24px × 1.25) | 30px | No — nearest 32px |
| h5 (20px × 1.25) | 25px | No — nearest 24px |
| h6 (18px × 1.25) | 22.5px | No — nearest 24px |
| lead (24px × 1.25) | 30px | No — nearest 32px |
| label (14px, fixed 16px) | 16px | Yes — already deliberate |

6 of 11 pairings are off-grid, including `body` — the size most reading content actually uses.

### What other production systems do

- **Material Design** states the rule explicitly and strictly: a text's baseline must sit on the 4dp grid, and line-height must be a value divisible by 4 to maintain it — line-height is treated as a constraint of the spacing grid, not an independent decision. MD3's web guidance leans more on box-model mechanics (line-height = bounding-box height, CSS half-leading) but doesn't abandon the underlying grid discipline.
- **Carbon** does not formalize a line-height-to-spacing-grid rule. Its spacing-scale docs frame the grid around component/layout consistency and rhythm generally, not a specific baseline-snap requirement tying type to it.
- Broader typography-grid literature treats Material's approach as the standard for genuine vertical rhythm: leading and inter-block spacing tied to one repeating base unit. Modern token systems (e.g. Tailwind v4's single `--spacing` base) follow the same shared-unit principle.

Material is the strongest precedent for what this repo needs; Carbon offers no comparable rule to adopt instead.

### Why a single unitless ratio can't fix this

A shared ratio (e.g. `line-height-body: 1.5`) cannot 4px-align every font size that uses it — 18px needs a ratio of 1.556 to hit 28px, 16px needs exactly 1.5 to hit 24px, 14px needs 1.429 to hit 20px. They're different ratios. Re-tuning the existing 4 shared roles can improve alignment but can't guarantee it for every paired size.

Fixed-pixel line-heights (as `line-height-label` already does) guarantee exact alignment, but only work for **fixed** font-size tokens. This repo's fluid, `clamp()`-based tokens (`font-size-display`, `font-size-h1-fluid`, `font-size-h2-fluid`, `font-size-h3-fluid` — see decisions/0008) scale continuously with viewport width and cannot take a fixed pixel line-height without breaking proportional scaling.

## Decision

Adopt Material's rule, applied everywhere it can be, with the fluid tier as a documented, deliberate exception:

**1. Add a fixed line-height primitive scale to `tokens/global.json`**, mirroring the existing `space` scale's 4px grid — only the values this system actually needs: 16px, 20px, 24px, 28px, 32px.

**2. Every fixed-size font-size token gets its own fixed-pixel line-height role**, replacing the shared unitless roles that can't align them all:

| Font-size token | Old line-height | New line-height role | New value |
|---|---|---|---|
| `font-size-body` (18px) | `line-height-body` (1.5) | `line-height-body` (redefined) | 28px |
| `font-size-control` (16px) | `line-height-body` (1.5) | `line-height-control` (new) | 24px |
| `font-size-small` (14px) | `line-height-body` (1.5) | `line-height-small` (new) | 20px |
| `font-size-h4` (24px) | `line-height-heading` (1.25) | `line-height-h4` (new) | 32px |
| `font-size-h5` (20px) | `line-height-heading` (1.25) | `line-height-h5` (new) | 24px |
| `font-size-h6` (18px) | `line-height-heading` (1.25) | `line-height-h6` (new) | 24px |
| `font-size-lead` (24px) | `line-height-heading` (1.25) | `line-height-lead` (new) | 32px |
| `font-size-label` (14px) | `line-height-label` (16px, fixed) | unchanged | 16px |

All 8 static pairings in use become exactly 4px-grid aligned.

Three sizes from the original table were left out during implementation because nothing used them:
- A 10px `font-size-micro` role and its `font-size.2xs` primitive were removed.
- The static `font-size-h1`–`h3` tokens (64/48/32px) still exist, but nothing consumes them (Heading uses the fluid ones), so they get no line-height role. If they get a consumer, add `line-height-h1`–`h3` at 80/60/40px, with matching `fixed-40/60/80` primitives.
- The unitless `line-height.normal` (1.5) and `line-height.loose` (1.75) primitives were removed too, since nothing references them once `line-height-body` is fixed.

**3. Fluid tokens keep unitless ratios, explicitly carved out.** `font-size-display` keeps `line-height-display` (1.125), and `font-size-h1-fluid`/`-h2-fluid`/`-h3-fluid` keep `line-height-heading` (unchanged, per decisions/0008). These will not be strictly grid-locked at every viewport width; that's an accepted tradeoff of continuous fluid scaling, not an oversight.

## Alternatives considered

- **Re-tune the existing 4 shared unitless roles for best-effort alignment, no new roles.** Rejected — mathematically cannot align every paired font size to the same grid at once (see above); would leave some sizes permanently off-grid by design, undermining the "guarantee" goal stated for this repo.
- **Follow Carbon's looser model (spacing scale only, no explicit line-height tie).** Rejected — Carbon doesn't solve the stated problem, it just doesn't have the problem as a stated goal. Doesn't fit a system where reading experience is explicitly first-class.
- **Fixed pixel line-heights everywhere, including fluid tokens.** Rejected — breaks proportional fluid scaling for `font-size-display`/`-h1-fluid`/`-h2-fluid`/`-h3-fluid`, contradicting decisions/0008's WCAG 1.4.4-checked fluid-type approach.

## Consequences

### Positive
- Every static (non-fluid) font-size × line-height pairing in the system resolves to an exact multiple of 4px, matching the spacing scale — the guarantee Antonio asked for, for the text people actually read.
- Follows Material's explicit, well-precedented rule rather than inventing one.
- `line-height-label`'s existing fixed-16px pattern, previously an isolated special case, becomes the norm for static text instead of an exception.

### Negative
- The line-height role vocabulary grows from 4 shared roles (`display`, `body`, `heading`, `label`) to 10 — most now paired 1:1 with a single font-size token rather than shared. This trades the compact, MD3-style shared-role vocabulary (decisions/0004's reuse bar) for an explicit per-size guarantee; consumers are uneven once implemented: `control` and `small` (9 components each) clear the 3+-component bar, while `lead`, `h4`, `h5` and `h6` have one or two. `small` also covers 12px component text for now, which this table doesn't list (see docs/backlog.md). That's the same shape as the `font-size-h5`/`h6` exception decisions/0008 already flagged.
- Every CSS rule and component token currently referencing `line-height-body` or `line-height-heading` for a **static** size needs to be re-pointed to its new specific role — a design-system-wide sweep, done in the same branch as this ADR (see docs/roadmap.md's session log, 2026-09-16). Sizes this table doesn't cover (12px component text, Hero's 20px lead) are tracked in docs/backlog.md.
- Fluid headings (H1–H3) remain unaligned to the grid at in-between viewport widths — an accepted, documented gap, not a guarantee.

## Related files

- `tokens/global.json` — new fixed line-height primitive scale
- `tokens/brands/base/light.json` — `line-height-body` (redefined), `line-height-control`, `line-height-small`, `line-height-h4`–`line-height-h6`, `line-height-lead` (all new), `line-height-label` (unchanged), `line-height-display`/`line-height-heading` (unchanged, fluid-only now)
- `decisions/0008-productive-expressive-typography-split.md` — the fluid/static split and WCAG 1.4.4 ratios this decision builds on and carves an exception around
- `decisions/0004-add-semantic-roles-collapse-component-tokens.md` — the semantic-role reuse bar this decision explicitly deviates from, with reasoning
- `docs/roadmap.md` — session log row recording the token-replacement sweep
- `docs/backlog.md` — open follow-ups for sizes outside this decision's table
