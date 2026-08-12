# Media-system vision — origin, landscape, and what's real

**Status: documented ambition, not a roadmap.** Nothing described past
the "Current state" section below is built. This file exists so the
ambition and the research behind it are recorded durably, the same
way `ai-readiness.md` records the reasoning for that work — not as a
commitment to build it on any timeline.

---

## 1. The original intent

This system was never scoped to a personal website. The ambition
behind it, from the start, was a design system for a media house: one
token source governing not just web products but digital graphics and
motion graphics — websites, social content, launch video — all
provably on-brand because they all read from the same place, not
because a human checked each one against a guideline PDF.

## 2. Current state

What exists today is the web slice only: tokens, components, the
AI-readiness layer documented elsewhere in this repo. There is no
graphics pipeline and no motion pipeline. Nothing below this line
should be read as shipped.

## 3. Why this doesn't already exist somewhere else

Checked the obvious categories before assuming the gap was real.

**Digital asset management platforms (Frontify, Bynder) solve a
different problem.** They govern *approved, pre-made* assets —
storage, guideline documents, template distribution, permissions.
Reliably converting design data between different tools requires
heavy custom scripting per tool, an approach that doesn't scale past
one team — which is exactly why these platforms stop at asset
governance rather than attempting a live, generative pipeline.

**The strongest evidence the gap is real: Frontify doesn't have it
either.** Frontify — a company whose product *is* brand consistency
software — commissioned an outside motion studio (Buff) to build a
one-off "Motion Toolkit" to produce its own on-brand video content.
If the vendor selling this problem's solution has to buy a bespoke
fix for its own brand, the product doesn't exist yet, full stop.

**Traditional motion graphics tooling has a hobbyist workaround, and
nothing better replaced it.** Storing brand values in a `.jsx` file
and referencing them via After Effects expressions dates to at least
2021 (documented at motiondeveloper.com) and is still the technique
being taught in 2026. Adobe's own answer — Motion Graphics Templates
via Creative Cloud Libraries — is proprietary and template-based, not
a code-driven single source of truth.

**Four structural reasons, not one:**

1. **Runtime incompatibility, not a data problem.** JSON tokens move
   anywhere trivially. The blocker is that CSS, iOS, Android, and
   After Effects are different *rendering engines* — three accept
   simple value substitution, After Effects' proprietary expression
   system doesn't. Style Dictionary solved the easy three.
2. **Incentives don't point there.** Adobe's business model runs on
   Creative Cloud Libraries locking motion work into its own
   ecosystem — an open, code-first standard competes with that. DAM
   vendors sell governance software to marketing departments, not
   developer tooling.
3. **The practitioner overlap is rare.** Motion designers are trained
   in Adobe tools; frontend engineers who understand token pipelines
   usually aren't also motion designers. A market needs people who
   can want *and* build a thing before a product emerges from demand.
4. **The timing wasn't there until recently** — see the unlock below.

## 4. The unlock: Remotion

Remotion renders video from React and CSS — the same stack a website
already runs on. It doesn't need to translate tokens into a foreign
format the way After Effects does; it reads the same tokens, because
it's the same rendering paradigm, not a fourth one.

Evidence this is real and current, not speculative:

- A documented build renders **nine video compositions from one
  codebase — three brands across three formats — with a single
  tokens file as the source of truth.** Structurally close to this
  system's own four-combination token architecture (light/dark ×
  default/bold), applied to video instead of a page.
- **remocn** — a shadcn-style component registry, specifically for
  Remotion, distributed the same way: `/r/[name]`, install via a CLI
  command. A near-exact parallel to this repo's own Phase 3 registry
  (`docs/ai-readiness-plan.md`), built independently, for the motion
  side of the same problem.
- **chuk-mcp-remotion** exposes an explicit "Design Token System" for
  MCP-driven video generation — colour, typography, and motion
  tokens, modelled on Tailwind/Chakra conventions, "optimized for
  video." Direct prior art for the AI-agent angle, not just the
  human-authored one.

Remotion 1.0 shipped in 2021. It only became practical for real
brand-video output at scale recently, and became dramatically more
accessible once AI coding agents could write the Remotion code for
people without a traditional engineering background. The original
ambition here predates the point where the tooling made it a
one-person project — early, not mistaken.

## 5. Honest limit

This unlock is strongest for **templated, repeatable** video — social
content, campaign variants, personalised output — the category tokens
are good at governing. Bespoke, hand-art-directed broadcast motion
design resists full tokenisation the way a button's border-radius
doesn't. That's a permanent ceiling on this idea, not a gap waiting to
close with more engineering.

## 6. What would make this real

Not a plan — a list of what the next honest step would actually be,
if this gets picked up:

- A proof-of-concept Remotion composition reading directly from this
  system's existing `tokens.json`, not a parallel token set.
- One real deliverable (a single branded video format, e.g. a social
  export) rather than a general "motion system" — same discipline as
  refusing to grow the component count past what has a real consumer.
- No claim on this system's README, case study, or anywhere public
  until something in this section actually renders.

---

**Sources.** Bynder, *Top Frontify alternatives in 2026*; Buff Motion,
*Frontify Motion Toolkit* case study; Motion Developer, *Share design
tokens across projects with JSX files*; Adobe Help, *Create Motion
Graphics templates with Essential Graphics panel*; Georgy Malanichev,
*Design Tokens: The promise of a single source of truth* (Medium/DAN
Stories); shawnos.ai, *How to Build a React Video Rendering System
with Remotion*; remotion.dev; toolhunter.cc, *remocn*; glama.ai,
chuk-mcp-remotion token system docs.
