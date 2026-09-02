# AI-readiness — strategy and scope

Why this system invests in a machine-facing layer, what that layer is, and — just as important — what it deliberately will not become.

Companion document: [`ai-readiness-plan.md`](./ai-readiness-plan.md) is the execution plan and the file to open first in any working session.

---

## 1. The position

This system does not compete with shadcn/ui, MUI, Ant Design, or Carbon on breadth, and no amount of AI tooling would change that. A 29-component library maintained by one person will never win a component-count comparison, and trying to is the fastest way to burn the maintenance budget on work nobody asked for.

What it competes on is a different axis: **being a fully governed, machine-consumable system at a size one person can actually keep green.** The industry benchmarks make that a defensible claim rather than a hopeful one.

**DesignSystems.one, Agent-Ready Design Systems Index (audited 2026-06-10, 37 systems, 5 signals):**

| Signal | Systems shipping it |
|---|---|
| MCP server | 11 / 37 |
| llms.txt | 10 / 37 |
| DTCG tokens (`$value` / `$type`) | 3 / 37 |
| Figma Code Connect | 2 / 37 |
| shadcn-spec component registry | 1 / 37 |

Top score in the entire audit is 3/5 (shadcn/ui). Nobody scores 4 or 5. Brand and enterprise systems lag the open-source React libraries by 12–24 months on every signal except llms.txt.

**Kaelig Deloumeau-Prigent, State of AI in Design Systems (data gathered 26–28 July 2026, 20 systems):** among systems already investing in this, MCP server 19/20 (17/20 counting official servers only — use the qualifier whenever quoting this figure), agent skill 18/20, repo agent files 15/20, llms.txt 14/20, registry 11/20, Code Connect 2/20.

The two studies do not contradict each other — they sample different populations. **Table stakes among the leaders is not table stakes across the field.** The leader set is the bar to be judged against; the field set is what most systems actually clear.

**zeroheight Design Systems Report 2026 (147 practitioners)** supplies the demand side: buy-in satisfaction fell from 42% to 32% year over year, 61% of teams report being understaffed, only 40% have any token pipeline at all (60% sync manually), only 5% measure ROI, and "AI hallucination — none of these AIs support a design system out of the box without hallucinating" was named directly as an unfilled tooling gap.

The gap this system sits in: the governance and token maturity most teams lack, at a scale one person can maintain, with the machine layer that even the leaders have only partly built.

## 2. The thesis

From the field study's synthesis, the state of the art has moved through three generations:

1. **Documentation reshaped for machines** — llms.txt, markdown twins, condensed component indexes. Near-universal now.
2. **Instruction** — rules files and skills telling the model what to do and what never to do.
3. **Structural coercion** — redesigning the task so the model cannot go off-system even if it wants to. Tool-gating, registries that resolve real artifacts, validation loops that must pass.

> Instruction hopes the model complies. Structure checks.

*(Kaelig Deloumeau-Prigent's words, from the field study's synthesis
essay — https://state-of-ai-in-design-systems.netlify.app/insights.
Quote and credit it; don't restate it as this project's own reading.
The three-generation framing above is his too.)*

Two rules follow, and both are load-bearing for everything in the plan:

- **Compiled, not written.** Agent-facing context files must be generated from the same sources as the human docs, on every build. Hand-written agent docs rot within two releases. Compiled ones can't.
- **Constrained, not permissive.** `size?: string` lets an agent invent `size="huge"`. A literal union rejects it at type-check. Constrained APIs are the only ones that survive automated editing.

The cautionary tale worth keeping in view: an eight-agent pipeline completed a run successfully — 34 stories, 17 passing interaction tests — and shipped a component that rendered completely unstyled. All 27 CSS custom properties had been fabricated with a plausible-but-nonexistent prefix. Tests passed because tests check behaviour, not appearance. **Agent systems can be systematically wrong in ways that pass their own validation.** That is the entire argument for machine-readable tokens plus a hard validator, in one story.

## 3. What this system already has

Assessed honestly, the foundation is further along than the benchmarks' median:

- **DTCG-conformant tokens** (`$value` / `$type`), three layers, 630 tokens — this alone puts it in the 3-of-37 club on the hardest signal to verify.
- **Deterministic governance in CI** — token linter (no raw hex, no primitive leakage, no hardcoded motion/spacing), WCAG AA contrast check across all four theme combinations, component-registry check that fails the build if a component ships undocumented.
- **Constrained component APIs** — literal unions rather than open `string` props across the component set.
- **A machine-readable component registry already generated** (`tokens/component-registry.json`) from `docs/components.md` + the component tree + stories + component tokens.
- **176 Chromatic stories, zero visual regressions**, a11y run via axe against every rendered story.
- **Published package with OIDC trusted publishing**, changesets, no long-lived tokens.
- **Figma drift detection** via a committed sync manifest.

## 4. What is missing

Most of the distribution layer shipped after this document was first written — `llms.txt` + per-component markdown twins, `AGENTS.md`, a single validate entrypoint, the agent skill, the shadcn-spec registry, and now a local MCP server are all live. See `docs/ai-readiness-plan.md` for the build log and `docs/ai-readiness-audit.md` for the audited before/after. What's left:

| Gap | Benchmark context |
|---|---|
| Figma Code Connect | 2/37 field, 2/20 leaders |
| Editor-specific rules files (`.cursorrules`, Copilot instructions) | part of the Kaelig field study's affordance set |
| A dedicated "working with AI" docs page | distinct from `AGENTS.md`/`SKILL.md`, which are operational instructions for an agent, not a narrative page about using AI with this system |
| A project-specific CLI | part of the Kaelig field study's affordance set |

## 5. Explicitly out of scope

Recorded here so a future session doesn't quietly re-open them:

- **Component-count growth.** No component #30 until there is a second real consumer. Breadth is the losing axis.
- **Hosting the MCP server.** A local, unhosted, read-only MCP server shipped 2026-09-01/02 (see `docs/mcp-server-spec.md`) — seven tools wrapping artifacts the build already generates, cold-tested against fresh subagents, confirmed connected in a real Claude Code session. What remains out of scope is hosting it: swapping stdio for HTTP/SSE and adding auth, which only matters once a second real consumer exists.
- **Hand-written agent documentation of any kind.** If it isn't generated by a script in CI, it doesn't ship.
- **Chasing a 5/5 score.** The score is a byproduct of useful work, not the goal. Signals that don't serve a real consumer are theatre.

## 6. Why this is worth doing at all

Three returns, in priority order:

1. **Own workflow.** The compiled context layer plus a hard validator permanently deletes the fabricated-token failure class from day-to-day work in this repo. Worth building even if nobody else ever sees it.
2. **Evidence.** A public, self-audited score against two named industry benchmarks is a more specific claim than "I build design systems," and it is verifiable by anyone in under a minute.
3. **A sellable capability.** "Make your design system agent-safe — DTCG token export, compiled context files, constrained APIs, a validator in CI" is a scoped engagement with a concrete deliverable. This repo is the reference implementation to point at. Note the distinction: the *capability* is sellable; the *package* is not a product and should not be marketed as one.

## 7. Abandon conditions

If any of these become true, freeze the system (pin it, document it, stop the roadmap) rather than continuing:

- Upkeep exceeds roughly 10 hours per month with still only one consumer.
- Any part of the machine layer has to be hand-maintained to stay accurate.
- The roadmap starts generating work that serves the score rather than the workflow, the evidence, or the offer.

Frozen is a legitimate end state. It is not failure.

---

**Sources.** DesignSystems.one, *Agent-Ready Design Systems Index*, audited 2026-06-10 — https://www.designsystems.one/ai-ready/systems · Kaelig Deloumeau-Prigent, *State of AI in Design Systems*, July 2026 — https://state-of-ai-in-design-systems.netlify.app/ · Kaelig Deloumeau-Prigent, *Building design system components with agent teams*, April 2026 — https://www.kaelig.fr/design-system-components-with-ai-agent-teams/ · zeroheight, *Design Systems Report 2026* — https://report.zeroheight.com/
