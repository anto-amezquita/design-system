# Making a design system agent-ready: a before/after audit

Most "AI-ready design system" claims aren't checkable. This one is. I scored `@amezquita/design-system` against two public benchmarks, fixed what was missing, and scored it again. Every number below traces to a commit or a live URL — check any of it in under a minute.

## The benchmarks

**DesignSystems.one, Agent-Ready Design Systems Index** (37 systems, 5 signals: MCP server, `llms.txt`, DTCG tokens, shadcn-spec component registry, Figma Code Connect). One point per signal, only if the maintainer publishes the artifact at a first-party URL — not for having built it, for shipping it.

**Kaelig Deloumeau-Prigent, State of AI in Design Systems** (20 systems already investing in this, 10 affordances). Same rule: shipped or not.

## The scores

| | DesignSystems.one | Kaelig affordances |
|---|---|---|
| Before | 1 / 5 | 1 / 10 shipped, 1 partial |
| After | 4 / 5 | 6 / 10 shipped |

4/5 exceeds the top score in the original 37-system audit (3/5). It's built on three of the four hardest signals to ship — DTCG tokens, a real shadcn-spec registry, and an MCP server — not the easy ones.

## What shipped

**A compiled machine-readable layer.** `llms.txt` and `llms-full.txt` at the repo root, a `tokens.json` with every token resolved across all four theme axes, and a `.md` twin per public component — real prop tables, real tokens, a real usage example, generated from the `.tsx` source and the component registry, never hand-typed. All of it live at `amezquita.dk`, not just committed to a repo.

**A shadcn-spec registry.** `npx shadcn add https://amezquita.dk/r/button.json` installs the real npm package and injects the component's actual light/dark design tokens into the consumer's CSS. I didn't take this on faith — I ran it. Built a scratch Next.js app, ran the real CLI against the real production URL, and confirmed the rendered Button with a screenshot: correct shape, correct color, correct icon, both themes. One system in the original 37 had shipped this. Now two do.

**A single validate gate.** `npm run validate` chains the token linter, a WCAG AA contrast check, a component-registry check, story coverage, and a type check — one command, non-zero exit on any failure. Wiring in the type check surfaced something worth naming: it had never actually completed a run on this codebase. A TypeScript config deprecation was silently swallowing every check behind it. Fixed, and now enforced in CI, not just locally.

**A fabrication linter.** Two new rules: a `var(--token, fallback)` two-argument form is now a hard failure — a fallback hides a missing token instead of surfacing it, which is exactly how other pipelines have shipped fabricated tokens undetected. And any `var(--x)` that doesn't resolve to a real token anywhere in the source files fails the build. Run against the full component set before either rule was allowed to ship: one legitimate exception found (a documented customization hook), everything else clean.

**An agent skill, tested cold.** `SKILL.md` at `/.well-known/skills/`, format checked against a real published example before writing a line — not guessed. Then tested against a subagent with zero memory of this work and no access to the source, given nothing but the skill file and a page to build. It found a real gap: one component's prop type was left opaque, forcing a dig into the installed package's source to find the real shape. Fixed at the generator, not just the doc — the fix improved four components' pages, not one. Re-tested against a second fresh agent on a different task: zero guessing, build passed first try, and the skill's "here's what doesn't exist" section visibly did its job — it's what stopped the agent from reaching for a token that sounds real but isn't.

**A repo agent file.** `AGENTS.md` at the root, `CLAUDE.md` symlinked to it — the real component list and token prefixes pulled from the registry at write time, not typed from memory. (Memory is exactly how a stale count crept into an earlier draft of this file. Caught it, fixed it, left a note.)

**A local MCP server.** Seven read-only tools — `list_components`, `get_component`, `search_tokens`, `get_token`, `validate_token`, `get_registry_item`, `get_skill` — each a thin wrapper over an artifact the build already generates, not a new source of truth; `validate_token` reuses the token linter's real fabrication-rule functions instead of a second copy that could drift. Reviewed against all seven tools together, then fault-injected by corrupting the JSON files it reads one at a time to see how it actually failed — found and fixed a startup crash on a malformed registry file. Cold-tested twice against fresh subagents with zero memory of this work: both built a real component using only tool output and zero guessed props; one validated a token against `validate_token` on its own initiative, unprompted. Confirmed connected in a real Claude Code session — `/mcp` shows it live alongside two other servers, all seven tools present. It's local and unhosted by design, not by oversight — see below.

## What broke along the way, and got fixed for real

The honest version of "shipped" includes the bugs found while shipping it, not just the features:

- `tokens/token-reference.json` only ever covered color primitives — 83 others (spacing, type scale, radii, motion, shadows, sizes, every feedback color) were invisible to anything reading it. Total went from 537 to 620 tokens once fixed.
- A shadcn registry item referencing another item in the same custom registry by a bare name silently resolves against the *default* shadcn registry instead, every time. Found by actually running the CLI, not by reading the schema — the schema alone gives no hint this is wrong.
- A prop whose type pointed at another local type alias showed the alias name with no shape behind it — real information, invisible to anything but someone willing to read the installed package's source. Found by an agent that had to do exactly that.

None of these were visible from the outside. All of them would have quietly undercut the claim this whole effort makes.

## What was deliberately skipped

**Hosting the MCP server.** The server itself shipped (see above) — what's still skipped is making it reachable over a network: swapping stdio for HTTP/SSE and adding auth. Only matters once a second real consumer, not just this solo maintainer, needs it.

**Figma Code Connect, a project-specific CLI, editor-specific rules files.** Real gaps, not attempted this round — the compiled docs layer, the registry, and the skill mattered more, in that order, and that's what got built.

**Growing the component count.** No component #30 until there's a second real consumer. Breadth is the losing axis for a solo-maintained system.

## Verifiability

Every commit below is public and checkable, on [`github.com/anto-amezquita/design-system`](https://github.com/anto-amezquita/design-system):

- [`ac73430`](https://github.com/anto-amezquita/design-system/commit/ac73430) — per-component `.md` twins
- [`52b7f8e`](https://github.com/anto-amezquita/design-system/commit/52b7f8e) — `tokens.json` published
- [`dc6e970`](https://github.com/anto-amezquita/design-system/commit/dc6e970) — token-reference completeness fix, 537 → 620 tokens
- [`5216566`](https://github.com/anto-amezquita/design-system/commit/5216566) — `npm run validate`, and the type-check gap it surfaced
- [`124ea00`](https://github.com/anto-amezquita/design-system/commit/124ea00) — the fabrication and fallback linter
- [`84ca446`](https://github.com/anto-amezquita/design-system/commit/84ca446) — `AGENTS.md` / `CLAUDE.md`
- [`8e0ba88`](https://github.com/anto-amezquita/design-system/commit/8e0ba88) — the shadcn-spec registry generator
- [`6ac4d2d`](https://github.com/anto-amezquita/design-system/commit/6ac4d2d) — the bare-name registry bug, found by running the real CLI
- [`2b0c559`](https://github.com/anto-amezquita/design-system/commit/2b0c559) — the agent skill, and the fix its own cold test found

The live artifacts: [`amezquita.dk/llms.txt`](https://amezquita.dk/llms.txt), [`amezquita.dk/tokens.json`](https://amezquita.dk/tokens.json), [`amezquita.dk/r/registry.json`](https://amezquita.dk/r/registry.json), [`amezquita.dk/.well-known/skills/index.json`](https://amezquita.dk/.well-known/skills/index.json). The docs site that serves them lives in a private repo — its deploy history isn't independently linkable, but every artifact it serves is live at the URL above, right now, checkable by anyone.

The full task-by-task record — every decision, every dead end, every "not done yet and here's why" — is in [`docs/ai-readiness-plan.md`](./ai-readiness-plan.md).
