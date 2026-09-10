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

## Self-healing CI (backlog)

Opened 2026-09-08, unblocked by [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md) (real tests now exist for CI to react to). Spec'd in [`specs/self-healing-ci-spec.md`](../specs/self-healing-ci-spec.md), validated against industry precedent in [`self-healing-ci-research.md`](./self-healing-ci-research.md).

Two phases, deliberately different mechanisms: Phase 1 (stale generated artifacts) is a plain deterministic script — the fix is the diff, no judgment needed. Phase 2 (lint/contrast/type/test failures) is named but not built — Claude Code in a GitHub Action, for when a real code fix is required. Both phases open a PR; neither pushes directly or merges anything.

**The App is live and the mechanism is proven.** `amez-ds-self-heal` is created, installed on this repo, and its secrets are stored. Acceptance 1, 2 and 4 pass against real runs — including the one the App exists for, `chromatic` running unattended on the bot's PR. Detail in the spec's session log and its Acceptance table.

1. Re-run acceptance 1–3 and 5 against a fresh drift branch, now that the changelog gap the first run exposed is fixed (`scripts/changelog-sync.mjs`). 3 and 5 have never been run.
2. Land `ci/self-heal-phase-1` on `main`.
3. Add branch protection on `main`: required check **`chromatic`** (there is no check named `validate` — it's an npm script inside that job), review required, no bypass entry for the App. **Decide first:** `chromatic.yml`'s `update-changelog` job pushes directly to `main`, so a require-a-PR ruleset breaks it. Either add a bypass actor for the Actions bot, or rework that job to open a PR like everything else. Also note requiring 1 approval makes your own PRs unmergeable on a solo repo — GitHub blocks self-approval.

**Phase 2 stays parked** until Phase 1 has been boring for a while. Its open questions are in the spec, not here.

Status: Phase 1 live and mostly verified; acceptance 3 and 5 outstanding, branch protection needs one decision.

## Human-facing docs site (backlog)

Opened 2026-09-01, outside the six roadmap phases. Not a priority, not scheduled — recorded so the idea isn't lost. Spec'd in [`specs/docs-site-spec.md`](../specs/docs-site-spec.md).

Full rationale (why Storybook and the MCP server don't cover this audience) lives in the spec itself, not repeated here. Portfolio already has a single `/design-system` overview page (case-study style, see the Aug 12 entry in `roadmap.md`'s session log for its known staleness issue) — the sketch is a proper four-section site built on the same generated artifacts the MCP server and Storybook already read, so it can't drift out of sync with them.

Status: spec only, not started.
