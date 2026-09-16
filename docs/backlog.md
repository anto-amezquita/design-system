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

## `0.5.0` release (PR #23) blocked on Chromatic's monthly snapshot limit (backlog)

Opened 2026-09-15. `main` already has everything a `0.5.0` release needs: the `Heading` primitive (PR #22) and the `Card`/`Dialog`/`Drawer`/`EmptyState` migration + registry fix (PR #24), both changesets present and correctly reflected in the changesets bot's open "Version Packages" PR (#23) — confirmed by diffing `origin/changeset-release/main`'s `CHANGELOG.md` against `main`.

**What's actually blocking it:** PR #23's Chromatic check is frozen at `action_required` — confirmed via the GitHub API (0 completed check-runs on the PR's head commit), the same GITHUB_TOKEN-triggered-workflow freeze `roadmap.md`'s 2026-09-15 session log already documents for PR #22 ("the run is created but frozen at `action_required`, never starting without a human click"). The user confirmed the same day that the account's Chromatic monthly snapshot limit is hit and needs roughly 7 days to refresh (so check back around **2026-09-22**).

Branch protection isn't enabled on `main`, so the merge button on PR #23 isn't technically blocked — but merging it now would publish `0.5.0` with zero real visual verification, not something to do just because the button is clickable.

**When it's time:** confirm Chromatic's limit has actually reset (check the account's build page, not just the calendar), get PR #23's frozen run to actually execute (a manual "Run workflow" click, or push something that re-triggers `synchronize`), confirm it goes green, then merge to publish.

**Separate manual step after publishing, easy to forget:** the registry fix in PR #24 (`registry/dialog.json`/`drawer.json` now correctly list `heading.json`) only exists in this repo. The registry real consumers hit (`https://amezquita.dk/r/*.json`) is a manually-maintained static copy in the portfolio repo — `scripts/build-registry-manifests.mjs`'s own header says so ("not an automated pipeline — re-copy there when these manifests change"). Publishing to npm does not fix this on its own.

Status: waiting on Chromatic's limit, not on any code or decision.

## Whether the Heading migration itself needed its own ADR (backlog)

Opened 2026-09-15, surfaced by code review on [`refactor/heading-migration`](../decisions/0008-productive-expressive-typography-split.md) (the `Card`/`Dialog`/`Drawer`/`EmptyState` → `Heading` migration, see `roadmap.md`'s session log for both entries). A companion item — whether `Heading` needed a `weight` prop instead of three CSS overrides — was decided 2026-09-16: see `decisions/0010-heading-weight-prop.md`.

**Whether the migration itself needed its own numbered ADR** (next free number is `0011`). `decisions/0008`'s own Consequences section explicitly deferred this migration as "a separate, larger change," and the backlog entry that opened it (now removed) argued it was closing real architectural drift, not just tidying — both signals that lean toward "this was a decision, not just an implementation." Against that: no new token tier, brand, or package was introduced, and the component-facing API didn't change. Repo `CLAUDE.md`'s "Do not… make an architectural change… without writing an ADR" rule is the thing in tension here; `decisions/README.md`'s bar is described as low ("one small file per important decision"), so writing one costs little if the answer is yes.

Status: not started — needs the user's call.

## Baseline grid: sizes `decisions/0012`'s table doesn't cover (backlog)

Opened 2026-09-16, surfaced while implementing `decisions/0012` on `baseline-grid-vertical-rhythm` (see `roadmap.md`'s session log). The ADR maps line-height roles to the semantic font-size tokens, but three real text sizes in the system aren't in its table. Each got the nearest sensible on-grid value so nothing is left off-grid, and each needs a call.

**1. 12px text has no role of its own.** `font-size.xs` is used through component tokens (`tooltip-font-size`, `input-hint-size`, `textarea-hint-size`, `table-header-font-size`), never through a semantic font-size token, so the ADR never listed it. Interim call (2026-09-16): those rules use the next role up, `line-height-small` (20px, the 14px role). That keeps them on the grid, but 12/20 is looser than 12/16, which is Material's caption pairing. Still open: whether 12px gets its own `caption` role and an amendment to 0012.

**2. Hero's lead is 20px, not `font-size-lead`'s 24px.** `hero-lead-size` resolves to `font-size.emphasis`, so `.hero__lead` still uses `line-height-body`, now 28px (was 30px). On grid, and it reads fine, but it's a body role on non-body text.

**3. `<body>` has no font-size.** `reset.css` sets `line-height-body` (28px) on `<body>` but leaves font-size at the browser default of 16px, so any consumer text that inherits both gets 16/28 instead of the ADR's 18/28. Components are unaffected now: every component rule that sets a font-size also gets its line-height from its own component CSS, except Avatar's fallback and Pagination's ellipsis, which sit in fixed-size flex boxes. Setting `font-size: var(--font-size-body)` on `<body>` would fix the pairing but changes the default size for every consumer, so it's a release-notes-level change, not a quiet one.

Also open: `decisions/0012` is still marked `Proposed`, though the code now implements it.

Status: 1 has an interim answer; 2 and 3 need the user's call.

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
