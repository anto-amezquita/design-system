# Backlog

Live, actionable work for this repo. **Open this file first in any new session** — not `roadmap.md`, which is finished-work history now.

- **History / what shipped:** [`roadmap.md`](./roadmap.md) — condensed phase checklists, State block, recent session log.
- **Full build detail:** [`roadmap-archive.md`](./roadmap-archive.md) — every task's reasoning, every bug found, the complete session log.
- **Why any of this matters:** [`ai-readiness.md`](./ai-readiness.md) — strategy and scope, read once.

---

## Session protocol

1. Read this file. If it's empty, there's no open backlog work — check `roadmap.md`'s State block for any lingering decision instead (e.g. a publishing call), or ask the user what to work on.
2. Pick an item (or ask, if more than one is open and it's not obvious which).
3. When an item ships or a decision is made, remove it from this file and log what happened as a new row in `roadmap.md`'s Session log — this file only ever holds what's still open, never a record of what's done.
4. If new backlog work surfaces mid-session (a deferred fix, a follow-up idea), add it here before finishing the session, not just in memory.

---

## Migrate Card/Dialog/Drawer/EmptyState titles onto the Heading primitive (backlog) — TOP PRIORITY

Opened 2026-09-15, alongside [`decisions/0008`](../decisions/0008-productive-expressive-typography-split.md), which built the `Heading` primitive (`components/primitives/Heading/`) but explicitly left this migration out of scope as a separate, larger follow-up.

Right now two heading implementations coexist: the new `Heading` primitive (`level`/`as` props, used for real page-level H1–H6), and each of `Card`/`Dialog`/`Drawer`/`EmptyState`'s own inline title markup (`CardTitle` and equivalents), which renders its own `<h*>` tag and reaches directly for `font-size-lead`/`font-size-h4` rather than composing `Heading`. They currently agree by coincidence — same static values, same `font-family-heading`/`line-height-heading`/`letter-spacing-heading` tokens — not because one is built from the other.

**Goal:** migrate `CardTitle` and the equivalent title markup in `Dialog`, `Drawer`, and `EmptyState` to render via the `Heading` primitive internally (static `level`, e.g. `H4`/`H5` depending on which matches each component's current static size — check against `font-size-h4`/`h5`/`h6`'s actual values from `0008` rather than assuming), instead of each maintaining parallel heading CSS. Consumer-facing API (`<CardTitle>`, `<Dialog title="...">`, etc.) should not change — this is an internal implementation consolidation, not a public API change.

**Why this matters, not just tidiness:** two independent heading implementations is exactly the kind of drift `decisions/0004`/`0005`'s chain-skip and pass-through collapses exist to prevent elsewhere in this system — right now a future change to heading typography (weight, letter-spacing, a new static step) has to be made in five places by hand and could silently diverge, the same failure shape those ADRs already fixed for spacing and border tokens.

**Care needed:** four components' worth of markup change plus Chromatic snapshot review (visual output should be byte-identical if done right — this is a refactor, not a value change), and `CardTitle`'s current API is `as`-only polymorphic (per `decisions/0008`'s own Consequences section) — reconcile that with `Heading`'s `level`/`as` split rather than just swapping the render call in place.

Status: not started.

## Self-healing CI (backlog)

Opened 2026-09-08, unblocked by [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md) (real tests now exist for CI to react to). Spec'd in [`specs/self-healing-ci-spec.md`](../specs/self-healing-ci-spec.md), validated against industry precedent in [`self-healing-ci-research.md`](./self-healing-ci-research.md).

Two phases, deliberately different mechanisms: Phase 1 (stale generated artifacts) is a plain deterministic script — the fix is the diff, no judgment needed. Phase 2 (lint/contrast/type/test failures) is named but not built — Claude Code in a GitHub Action, for when a real code fix is required. Both phases open a PR; neither pushes directly or merges anything.

**Phase 1 works and is fully verified.** `amez-ds-self-heal` is live, and all five acceptance criteria pass against real runs — a drifting branch gets one correctly-scoped PR, `chromatic` goes green on it unattended, a second push updates that same PR, a clean branch produces nothing, and merging leaves both staleness checks clean with the bot's branch deleted. Detail in the spec's Acceptance table and session log.

Merged to `main` 2026-09-10 (PR #13). Two things remain, both deliberately deferred rather than forgotten.

**1. Watch the PR rate before doing anything else.** Deferred by decision, not blocked. The changelog can never be current in the commit that updates it — you build it, then commit, and the commit you just made isn't in it. So *every* `feat/fix/refactor/perf/style/docs` commit touching `tokens/`, `components/`, `sd.config.mjs` or `styles/brands/` leaves it one entry stale, however carefully you work. The bot therefore fires on nearly every component branch, not only when you forget to regenerate. Two readings, and only real use decides between them: useful (it closes a gap you were absorbing by hand) or noise (a PR per branch, most of them one changelog line). **Do a few real pieces of work, then judge.** If it reads as noise, the lever is `build-changelog.mjs` writing `meta.generatedAt` only on real change, which would let the strict and self-heal path lists collapse back into one.

**2. Branch protection on `main`.** Required check **`chromatic`** (there is no check named `validate` — it's an npm script inside that job), approvals **0** (GitHub blocks self-approval, so requiring 1 makes your own PRs unmergeable on a solo repo), no bypass entry for the App. **Decide first:** `chromatic.yml`'s `update-changelog` job pushes directly to `main`, so a require-a-PR ruleset rejects that push — silently, on every merge from then on. Either add a bypass actor for the Actions bot, or rework that job to open a PR like everything else. **Recommend the rework:** `main` currently has one bot pushing straight to it while Phase 1's bot is forbidden from doing exactly that, and a bypass entry makes that inconsistency permanent.

Worth knowing when you get to it: the stale-by-one changelog behaviour predates Phase 1, so `chromatic` has always failed the changelog step on component branches. Requiring it before Phase 1 existed would have made component PRs unmergeable. Phase 1 is what makes branch protection viable at all — which is an argument for enabling it *after* the bot has earned trust, not alongside it.

**Phase 2 stays parked** until Phase 1 has been boring for a while. Its open questions are in the spec, not here.

Status: Phase 1 shipped and verified. Branch protection open, gated on one decision and on watching the bot in real use first.

## Human-facing docs site (backlog)

Opened 2026-09-01, outside the six roadmap phases. Not a priority, not scheduled — recorded so the idea isn't lost. Spec'd in [`specs/docs-site-spec.md`](../specs/docs-site-spec.md).

Full rationale (why Storybook and the MCP server don't cover this audience) lives in the spec itself, not repeated here. Portfolio already has a single `/design-system` overview page (case-study style, see the Aug 12 entry in `roadmap.md`'s session log for its known staleness issue) — the sketch is a proper four-section site built on the same generated artifacts the MCP server and Storybook already read, so it can't drift out of sync with them.

Status: spec only, not started.
