# AI-readiness plan

Execution plan for the machine-facing layer. Rationale, benchmarks, and scope boundaries live in [`ai-readiness.md`](./ai-readiness.md) — read that once, then work from this file.

**This file is the session anchor.** Open it first, work the current phase, update the State block and the Session log before finishing. Every phase is independently shippable; nothing here depends on a later phase existing.

---

## State

```
Last updated:   2026-08-10
Current phase:  Phase 1 — in progress
Next action:    Re-run `npm run tokens` (now also rebuilds llms.txt), confirm the
                index reads 27 and BaseSheet is gone, then Task 1.2
Blocked on:     nothing
```

**Phase 0 headline: 1/5 on the DesignSystems.one signals, 1/10 shipped (+1 partial) on the Kaelig affordances.** The foundation scores well and the distribution layer scores near zero — which is exactly the shape the strategy predicted. Four correctness issues were found during the audit and are listed under the scorecard; fix those before quoting any number publicly.

## Phase status

| Phase | Outcome | Effort | Status |
|---|---|---|---|
| 0 | Baseline self-audit recorded | 1 h | **Done — 2026-08-10** |
| 1 | Compiled machine-readable docs layer | 1 weekend | In progress |
| 2 | Agent contract + single validate gate | ½ weekend | Not started |
| 3 | shadcn-spec public registry | 1 weekend | Not started |
| 4 | Agent skill at `/.well-known/skills/` | ½ weekend | Optional |
| 5 | Publish the audit | ½ weekend | Optional |

**Guardrail: do Phases 0–3. Treat 4 and 5 as optional.** The failure mode is building a bigger affordance surface than the system underneath it.

---

## Phase 0 — Baseline

Record where the system stands before changing anything, so the delta is provable later. This is the number the case study and any post will cite.

**Tasks**
- [x] 0.1 Score the system against the five DesignSystems.one signals (MCP, llms.txt, DTCG, registry, Code Connect). Write the score and the evidence URL (or "absent") into the scorecard below.
- [x] 0.2 Score against the ten affordances in the Kaelig field study (MCP, llms.txt, agent skill, editor rules, repo agent files, AI docs, registry, CLI, Code Connect, Storybook).
- [x] 0.3 Commit the scorecard. Do not backfill it later from memory.

**Acceptance:** a dated before-score exists in this file, with evidence, and is committed.

### Scorecard

| Date | DS.one score | Kaelig affordances | Notes |
|---|---|---|---|
| 2026-08-10 | **1 / 5** | **1 / 10 shipped, 1 partial** | baseline, pre-Phase 1 |
| 2026-08-10 | 1 / 5 | **2 / 10 shipped** | after Task 1.0 — v0.1.4 published, token artifacts confirmed in a consumer's `node_modules`. Registry signal moves partial → shipped. DS.one unchanged: its registry signal means a shadcn-spec CLI registry (Phase 3), not machine-readable artifacts. |

#### DesignSystems.one — five signals

Scoring rule: one point per signal where the maintainer publishes the artifact at a first-party URL.

| Signal | Score | Evidence |
|---|---|---|
| MCP server | ✗ | No server, no `mcp.json`, no MCP dependency in `package.json`. |
| llms.txt | ✗ | No `llms*` file in this repo or in the portfolio repo that serves amezquita.dk. Confirmed absent at source, not just unreachable. |
| DTCG tokens | ✓ | `tokens/global.json` uses `$value` / `$type` throughout; Style Dictionary resolves them. Public via the GitHub repo. |
| Component registry | ✗ | `tokens/component-registry.json` exists but is an internal governance artifact, not a shadcn-spec registry, and is not served anywhere. |
| Figma Code Connect | ✗ | No `*.figma.tsx`, no `figma.config.json`, nothing on a `code-connect` path. |

**Context for this score:** in the 37-system audit, 20 systems scored 0/5, the top score was 3/5, and DTCG was the rarest signal shipped (3 of 37). A 1/5 built on the *hardest* signal is a better starting position than the number suggests.

#### Kaelig field study — ten affordances

| Affordance | Score | Evidence |
|---|---|---|
| MCP server | ✗ | Absent. Deliberately out of scope — see `ai-readiness.md` §5. |
| llms.txt | ✗ | Absent. |
| Agent skill | ✗ | No `SKILL.md` anywhere. |
| Editor rules | ✗ | No `.cursor/`, no `.cursorrules`, no `.github/copilot-instructions.md` or `.github/instructions/`. |
| Repo agent files | ✗ | No `AGENTS.md`, no `CLAUDE.md` at any depth. |
| AI docs | ✗ | No consumer-facing "working with AI" page. (`docs/ai-readiness.md` is internal strategy — it does not count.) |
| Registry | ~ | **Partial.** `component-registry.json` and `token-reference.json` are genuinely machine-readable, comparable to Cloudscape's per-component JSON API definitions — but `tokens/` is not in `package.json` `files`, so they reach no consumer. The artifact exists; the distribution doesn't. |
| CLI | ✗ | Absent. |
| Code Connect | ✗ | Absent. |
| Storybook | ✓ | `.storybook/`, per-component stories, axe run against every story, Chromatic on every build. |

### Correctness issues found during the audit

The audit surfaced four claims that don't currently match the repo. **Fix these before any number goes into a case study, README, or post** — a stale figure in public is a worse outcome than a lower true one.

1. ~~**Component count.** README says 29; `component-registry.json` `meta.componentCount` says 28.~~ **Resolved 2026-08-10 — 28 is correct.** `npm pack --dry-run` shows 13 primitives + 7 composition + 8 patterns = 28. The README's own architecture breakdown already says 13/7/8; only the headline bullet says 29. Fix the bullet.
2. ~~**Token count.** README says 630; `token-reference.json` `meta.tokenCount` says 537.~~ **Resolved 2026-08-10 — both were misleading; 630 matched nothing.** The true counts, derived from source: `global.json` holds **101** primitives; `token-reference.json`'s 537 is **18 colour primitives + 519 semantic and component tokens**. Total distinct tokens: **620**. README now states 620 with the breakdown.

   **This surfaced a real gap, not just a counting error.** `build-token-reference.mjs` includes only the `color.*` group from `global.json` — "included for completeness in the Primitives section." The other **83** primitives are absent from the artifact: the entire spacing scale, type scale, font weights, line heights, radii, durations, easings, opacities, shadows, icon sizes, border widths, sizes, **and every `feedback.*` colour** (error/success/warning/info — colours that aren't under the `color` key). An agent reading `token-reference.json` to find `--space-4` or `--feedback-error-500` will not find them and may conclude they don't exist. Fix in Phase 1 (see Task 1.3a).
3. ~~**Figma sync detection is scaffolded, not live.**~~ **Resolved 2026-08-10 by rewording.** README now describes what `figma:status` actually does — compares resolved state against a committed snapshot — and says the snapshot is baselined per Figma file, rather than implying a live sync exists. If you later set `FIGMA_FILE_KEY` and baseline it, no README change is needed.
4. **`tokens/` is not published.** `package.json` `files` ships `components`, `lib`, `hooks`, `styles/brands`, `styles/reset.css` — so the DTCG tokens, the component registry, and the token reference reach nobody who installs the package. This is the cheapest fix on the entire roadmap and it moves the Kaelig registry signal from partial to shipped. It is now Task 1.0. **Closed 2026-08-10 — shipped in v0.1.4.**
5. **Story count.** README said "176 Chromatic stories"; summing the `stories` arrays in `component-registry.json` gives **184**. **Resolved 2026-08-10** — README now says 184 stories and drops the word "Chromatic" from the count, because a Chromatic snapshot count is not the same thing as a declared-story count and the 8-story gap is unexplained. **Open question:** if Chromatic genuinely renders 176, something is being skipped — worth one look at the dashboard.
6. **"Each component has full Storybook coverage" was an overclaim.** BaseSheet has zero stories and zero component tokens — it is an internal overlay primitive consumed by Drawer, not a public component. **Resolved 2026-08-10** by saying 27 of 28 and naming the exception, and by adding the `internal` flag end to end (docs/components.md → registry → llms generator).

### Package payload note (2026-08-10)

`npm pack --dry-run` after Task 1.0: 162 files, 97.9 kB tarball, 683.7 kB unpacked.

`tokens/token-reference.json` alone is 227.2 kB — a third of the unpacked package. It is the right artifact to ship (resolved values across all four axes, exactly what an agent needs) but its size is the context-budget problem in miniature. **Phase 1 must slice it, not inline it**: `llms.txt` links to per-component `.md` twins; only `llms-full.txt` carries the bulk. Do not paste 227 kB into an agent's context and call it a machine interface.

`tokens/dependency-graph.json` (55.8 kB) is build scratch for the linter and token-reference generator — no consumer needs it. **Excluded 2026-08-10** by replacing the blanket `"tokens"` entry with targeted paths; `contrast-pairs.json` (governance input) is excluded by the same change.

**`.stories.tsx` files ship deliberately** (~110 kB across the component set). They are the corpus of correct usage — the same role Cloudscape's addressable code-snippet exemplars play — and Task 1.2's correct/incorrect usage pairs will be generated from them. Do not "optimise" them out of the package in a later cleanup pass without revisiting this decision.

---

## Phase 1 — Compiled machine-readable docs

The highest-leverage phase. Everything is generated from sources that already exist: `tokens/`, `tokens/component-registry.json`, `docs/components.md`, and the component tree.

**Hard rule: if any output in this phase is hand-edited, the phase has failed.** Fix the generator instead.

**Tasks**
- [x] 1.0 Add `tokens` to `package.json` `files` so the DTCG source, component registry, and token reference ship with the package. One line; unblocks everything downstream. **Done 2026-08-10** — narrowed to targeted token paths, published as v0.1.4, verified present in a consumer install.
- [x] 1.1 `scripts/build-llms-txt.mjs` — emit `llms.txt` (index: what the system is, install, links to every component's `.md` twin and the token reference) and `llms-full.txt` (everything inlined, for a single-fetch agent). **Done 2026-08-10** — reads `package.json`, `README.md`, `tokens/component-registry.json`, and `tokens/token-reference.json`; writes `llms.txt` + `llms-full.txt` at repo root. `llms.txt` links to each component's future `.md` twin at `{docsBaseUrl}/{slug}.md` and to the future `tokens.json` — both paths don't resolve yet (Tasks 1.2 and 1.3), by design; it's a forward index. `llms-full.txt` inlines everything currently compiled per component (purpose, import path, token prefix + count, storybook path, story names) plus a token-count-by-category summary, without pasting the 227 kB `token-reference.json` blob. Verified deterministic: re-running the script twice produces byte-identical output. Not yet wired into `npm run tokens` or CI — that's Task 1.4. Not added to `package.json` `files` — npm distribution wasn't in scope; Phase 1.5 covers web distribution via the docs site.
- [ ] 1.2 Extend it to emit one `.md` twin per component from the registry + prop types + story names: purpose, tier, import path, full prop table with literal unions spelled out, the component's token list, and a correct/incorrect usage pair. **Edge case:** two of the 28 components have no file in `tokens/components/` — BaseSheet (headless, no CSS) and EmptyState (styles straight off the semantic layer). The generator must handle a missing component-token file without crashing or emitting an empty token section.
- [ ] 1.3 Emit `tokens.json` at a stable public path — the DTCG source, resolved, so an agent can read every token name and value without running a build.
- [ ] 1.3a **Include all global primitives in `token-reference.json`**, not just the `color.*` group — 83 primitives (spacing, type scale, radii, motion, shadows, sizes, and all `feedback.*` colours) are currently invisible to anything reading the artifact. Then emit a `meta` breakdown (`primitiveCount` / `semanticCount` / `componentCount` / `total`) so the README can quote a generated figure instead of a hand-counted one — the same "compiled, not written" rule that governs the rest of this phase.
- [ ] 1.4 Wire all of it into `npm run tokens` so it regenerates on every token build, and into CI so a stale artifact fails the build. **Partly done 2026-08-10** — `buildLlmsTxt()` now runs last in `sd.config.mjs`, after the registry and token reference. Remaining: the CI staleness check (rebuild, `git diff --exit-code`, fail if anything changed).
- [ ] 1.5 Serve the artifacts from the docs site at canonical paths (`/llms.txt`, `/llms-full.txt`, `/design-system/<component>.md`, `/tokens.json`).

**Publish gate:** `llms.txt` links to URLs the docs site does not serve until 1.5. **Do not announce, link, or reference `llms.txt` anywhere — README, case study, LinkedIn — until 1.2 and 1.5 have both landed and the links resolve.** An index of dead links is worse than no index: an agent that fetches it once and gets 404s has no reason to try again. This gate is repeated in the header comment of `build-llms-txt.mjs`.

**Internal components:** components can be flagged `| **Internal** | \`yes\` |` in `docs/components.md`. The registry carries the flag through as `internal: true` and adds `meta.publicComponentCount`; the llms generator excludes them from both files. BaseSheet is the only one today — it ships because Drawer imports it, but an agent should never see it as available. Task 1.2 must apply the same exclusion when generating `.md` twins.

**Acceptance:** `curl https://amezquita.dk/llms.txt` returns content; deleting a component and rebuilding removes it from every artifact with no manual edit; CI fails if artifacts are stale.

**Why this order:** it takes the system from 1/5 to 2/5 on the field benchmark, and it's the prerequisite for Phases 3 and 4 — both consume these artifacts rather than duplicating them.

---

## Phase 2 — Agent contract and one gate

The governance scripts already exist but there is no single entrypoint and no contract telling an agent it must run them.

**Tasks**
- [ ] 2.1 `npm run validate` — one command chaining `tokens:lint`, `tokens:contrast`, the component-registry check, the stories check, and `tsc --noEmit`. Non-zero exit on any failure. No new checks needed; this is composition.
- [ ] 2.2 Add a fabrication check to `tokens:lint`: fail on any `var(--…)` in component CSS that is not present in the resolved token set, and fail on any `var(--token, fallback)` two-argument form. Fallbacks mask missing tokens silently — that is exactly how 27 fabricated tokens shipped in the field study's pipeline.
- [ ] 2.3 `AGENTS.md` at repo root — deliberately short, a router not a rulebook. Must contain: the never-violate rules (no raw hex, no primitive tokens in component CSS, no `var()` fallbacks, no hardcoded motion/spacing), the real token prefixes spelled out so a model can't invent one, an allow-list of the 29 exported components so anything else is provably invented, and the line that a change is not done until `npm run validate` exits zero. Symlink `CLAUDE.md` to it.
- [ ] 2.4 Point `AGENTS.md` at this plan file so a future agent session picks up the roadmap without being told.

**Acceptance:** a fresh Claude Code session in this repo, given only "add a Badge component," reads `AGENTS.md`, uses real tokens, and runs `validate` unprompted.

---

## Phase 3 — Public registry

One system in thirty-seven ships a CLI-installable registry. This is the single highest-differentiation item on the list and it costs a JSON manifest per component, not a rewrite.

**Tasks**
- [ ] 3.1 `scripts/build-registry-manifests.mjs` — emit shadcn-spec `registry-item.json` per component from the existing registry, with correct `dependencies`, `registryDependencies`, and `cssVars`.
- [ ] 3.2 Publish at `https://amezquita.dk/r/<component>.json` plus a `registry.json` index.
- [ ] 3.3 Verify end-to-end in a scratch Next.js app: `npx shadcn add https://amezquita.dk/r/button.json` produces a working, correctly themed Button.
- [ ] 3.4 Document the one-liner in the README above the npm install instructions.

**Acceptance:** the command works from a clean machine and is demoable live in an interview.

---

## Phase 4 — Agent skill *(optional)*

Chosen over an MCP server deliberately: a fraction of the maintenance surface, most of the value, and it follows the `/.well-known/skills/` pattern Nord and React Spectrum established.

**Tasks**
- [ ] 4.1 Compact `SKILL.md` — a router with progressive disclosure, not a dump. Keep the always-loaded surface small; gate detail behind explicit reads of the `.md` twins from Phase 1.
- [ ] 4.2 Prohibition rules that name the specific hallucination, in the leaders' style: state that the invented prefix does not exist, list the real ones, list the components that exist so anything else is provably invented.
- [ ] 4.3 Serve from `/.well-known/skills/` with an `index.json` manifest.
- [ ] 4.4 Test against a real task in a clean project and record what it got wrong. Encode each failure as a rule. Re-run.

**Acceptance:** an agent with only the skill installed builds a page using real components and real tokens, first try.

---

## Phase 5 — Publish the audit *(optional)*

The artifact that converts the work into positioning. Not a launch post for the package — nobody needs another component library. A before/after audit of a real system against two named public benchmarks, with the commits linked.

**Tasks**
- [ ] 5.1 Re-score against both benchmarks. Record the after-score in the scorecard.
- [ ] 5.2 Write it up: what scored what, what was fixed, what was deliberately skipped and why.
- [ ] 5.3 Link the commits. The verifiability is the whole point.

---

## Session protocol

1. Read the State block at the top of this file.
2. Read `ai-readiness.md` only if the *why* is unclear — otherwise skip it.
3. Work the current phase. Tick tasks as they land.
4. Before ending: update State (phase, next action, blockers), add a Session log line, commit.
5. If a task turns out to be wrong, delete it and write down why — do not leave dead tasks ticked or silently abandoned.

## Session log

| Date | Phase | What changed |
|---|---|---|
| 2026-08-10 | — | Plan and strategy docs created. |
| 2026-08-10 | 0 | Baseline audit run against both benchmarks: 1/5 DS.one, 1/10 (+1 partial) Kaelig. Four correctness issues logged. Phase 0 closed; next action is Task 1.0. |
| 2026-08-10 | 1 | Task 1.0 done — `tokens` added to `package.json` `files`, changeset written. Correctness issues 1–3 (component count, token count, Figma sync claim) still open. Next: Task 1.1. |
| 2026-08-10 | 1 | Payload verified via `npm pack --dry-run`. `files` narrowed to targeted token paths (drops `dependency-graph.json` + `contrast-pairs.json`); stories kept on purpose. Correctness issue 1 resolved: 28 components is correct. Issues 2–3 still open. |
| 2026-08-10 | 1 | v0.1.4 published; token artifacts confirmed in a consumer install. Task 1.0 closed. Kaelig score 1 → 2/10. Next: README reconciliation (issues 2–3), then Task 1.1. |
| 2026-08-10 | 1 | README reconciled: 28 components, 620 tokens with breakdown, Figma claim reworded to match the checker. Correctness issues 1–3 all closed. Found that `token-reference.json` omits 83 non-`color` primitives — logged as Task 1.3a. Next: Task 1.1. |
| 2026-08-10 | 1 | Story count reconciled: 184 declared stories, not 176 (issue 5). "Each component has full Storybook coverage" corrected to 27 of 28 — BaseSheet has none (issue 6). Every number in the README is now traced to a generated artifact. Next: Task 1.1. |
| 2026-08-10 | 1 | Task 1.1 done — `scripts/build-llms-txt.mjs` written, compiling `llms.txt` + `llms-full.txt` from `package.json` + `README.md` + `tokens/component-registry.json` + `tokens/token-reference.json`. Confirmed deterministic across two runs. Links to the `.md` twins and `tokens.json` are forward references — they 404 until Tasks 1.2 and 1.3 ship. |
| 2026-08-10 | 1 | Post-1.1 follow-ups, before starting 1.2: `internal` flag added end to end (docs/components.md → registry → llms generator; BaseSheet excluded from agent-facing output, `meta.publicComponentCount` added), the "each with a markdown twin" overclaim removed from the generator, and a publish gate recorded here and in the generator header. |
| 2026-08-10 | 1 | `npm run tokens` confirmed the internal flag works: registry now reports 28 components, 27 public. Caught that `build-llms-txt.mjs` was never wired into the build — llms.txt would have silently drifted from the registry, exactly the failure the "compiled, not written" rule exists to prevent. Added `buildLlmsTxt()` to the end of `sd.config.mjs` (part of Task 1.4). Next: re-run, verify, then Task 1.2. |
