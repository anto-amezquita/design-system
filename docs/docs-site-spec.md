# Human-facing docs site — specification

Storybook and the [MCP server](./mcp-server-spec.md) both serve developers and agents. Neither speaks to the other people a design system needs to win over inside an org — PMs deciding whether to adopt it, designers checking their intent survived translation, stakeholders who just want the story. This is the spec for that surface. Companion to [`ai-readiness-plan.md`](./ai-readiness-plan.md)'s backlog entry — deliberately out of scope there; this file is the spec for picking it up.

**Why not just Storybook:** Storybook is built for poking at a component in isolation. It has no narrative, no "why this exists," no foundations page, no adoption pitch. A non-technical stakeholder opening it gets a component tree, not an argument for why the org should standardize on this.

**Scope discipline, same as the MCP spec:** no new data source. Every page reads the same generated artifacts the MCP server and Storybook already read (`tokens/token-reference.json`, `tokens/component-registry.json`, `docs/components/<slug>.md`) — so the docs site can't drift out of sync with the components themselves. It adds narrative and layout, not a second source of truth.

**Existing groundwork:** portfolio already has a single `/design-system` page (case-study style). That page has a known staleness issue — it imports a local, stale copy of `token-reference.json` instead of the published package (logged in `ai-readiness-plan.md`'s 2026-08-12 entry, held pending job search). This spec doesn't fix that; a real build of this site would need to fix it first, since a docs site that quotes a wrong number undermines the whole point.

---

## State

```
Last updated:   2026-09-01
Current phase:  Not started. Spec only.
Next action:    Task 1.1 — fix the existing /design-system page's stale
                token-reference.json import (the 2026-08-12 finding) before
                building anything new on top of the same pattern.
Blocked on:     nothing; explicitly not a priority during the job search
```

---

## Audience and sections

Four sections, each answering a different player's question.

| Section | Answers | For |
|---|---|---|
| Landing / pitch | What is this, why does it exist, is it worth adopting? | PMs, stakeholders |
| Foundations | What's the design intent — color, type, spacing — shown visually? | Designers |
| Component gallery | What exists, and when do I reach for it? | Everyone browsing, not testing |
| Guidelines | How do we work — contribution, versioning, the AI-agent story | PMs, engineering leads |

### Landing / pitch
The numbers (components, tokens, zero-regression record — pulled from `component-registry.json` / `token-reference.json`, never hand-typed, same rule the README already holds itself to) plus plain-language framing of why the system exists. No code.

### Foundations
Color and type scales, spacing, rendered as swatches and visual scale, not JSON dumps. Reads `tokens/token-reference.json`; only the semantic layer needs surfacing here, not all 620 tokens.

### Component gallery
Grouped primitives / composition / patterns, matching `AGENTS.md`'s own grouping. Each component gets a live render (can reuse Storybook's iframe embed rather than re-implementing rendering) plus a one-line "when to use this," written for a human — this is new prose, not pulled from the generated prop tables, which stay technical on purpose.

### Guidelines
Contribution process, versioning (changesets), and the AI-agent story (link to `AGENTS.md`, the skill, the MCP server once it exists) — this last part is a genuine differentiator worth surfacing to a non-technical audience, not just agents.

---

## Suggested stack

Next.js + MDX — matches the stack already in use (portfolio is Next.js), so no new framework to learn, and MDX lets narrative prose and live component embeds sit in the same file.

## Phases

| Phase | Scope | Done when |
|---|---|---|
| 1 | Fix the stale `token-reference.json` import on the existing `/design-system` page (blocking — see State above) | Page's numbers match this repo's canonical `token-reference.json`, not a stale local copy |
| 2 | Landing / pitch page | Numbers traced to a generated artifact, no hand-typed stats |
| 3 | Foundations page | Color + type + spacing rendered visually from `token-reference.json` |
| 4 | Component gallery | All public components listed (pull the count from `component-registry.json`'s `meta.publicComponentCount` at build time — don't hand-type it, it's already drifted once), grouped, each with a one-line human-written "when to use this" |
| 5 | Guidelines page | Links to `AGENTS.md`, the skill, and the MCP server (if built by then) resolve |

## Local → hosted

N/A — this is hosted from the start, same domain as the rest of the site (`amezquita.dk`). No local-only phase the way the MCP server has one.
