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

**What's left is all GitHub-UI work.** The two code steps are done — the path list is extracted to `scripts/generated-artifacts.mjs` and `.github/workflows/self-heal-stale-artifacts.yml` is written (detail in the spec's session log). The workflow is uncommitted-to-`main` and unrun: it can't run until step 1 exists.

1. Create the GitHub App (Contents: write, Pull requests: write, nothing else), install it on this repo, store its credentials as the repo secrets `SELF_HEAL_APP_CLIENT_ID` and `SELF_HEAL_APP_PRIVATE_KEY`. Cheap falsification first: confirm a `GITHUB_TOKEN`-authored bot PR really doesn't trigger `chromatic.yml`, rather than taking the docs on faith — if it does, the App isn't needed. **This has to land before the workflow is pushed**, or every non-`main` push fails on the missing secret.
2. Verify against the spec's acceptance list — including that `chromatic.yml` actually runs on the bot's PR, and that a second drifting push updates the same PR instead of opening a second.
3. Add branch protection on `main`: `validate` required, review required, no bypass entry for the App.

**Phase 2 stays parked** until Phase 1 has been boring for a while. Its open questions are in the spec, not here.

Status: Phase 1 code written and locally verified; blocked on the GitHub App.

## Human-facing docs site (backlog)

Opened 2026-09-01, outside the six roadmap phases. Not a priority, not scheduled — recorded so the idea isn't lost. Spec'd in [`specs/docs-site-spec.md`](../specs/docs-site-spec.md).

Full rationale (why Storybook and the MCP server don't cover this audience) lives in the spec itself, not repeated here. Portfolio already has a single `/design-system` overview page (case-study style, see the Aug 12 entry in `roadmap.md`'s session log for its known staleness issue) — the sketch is a proper four-section site built on the same generated artifacts the MCP server and Storybook already read, so it can't drift out of sync with them.

Status: spec only, not started.
