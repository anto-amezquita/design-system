# Self-healing CI — specification

An agent that reacts to a failing CI check and opens a fix, rather than a human noticing the red X and running the fix by hand. Named as a future roadmap item during [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md)'s work, deliberately parked there: reacting to a check needs a check that actually runs code, and before 0006 this repo had none. That blocker is gone — `npm run validate` now includes real tests, not just linters.

**Scope discipline, same as the MCP and docs-site specs:** no new failure-detection logic. Every phase below reacts to a check `npm run validate` or `chromatic.yml` already runs — this spec doesn't add a new thing that can fail, it adds a response to failures that already exist.

---

## State

```
Last updated:   2026-09-08
Current phase:  Not started. Spec only.
Next action:    Phase 1 — the deterministic stale-artifacts workflow.
Blocked on:     nothing
```

---

## The honest scoping call this spec makes

The two failure classes this repo actually produces are not the same kind of problem, and treating them the same would be a mistake in both directions.

**Stale generated artifacts** — `chromatic.yml`'s "Check generated files are in sync" step, or a local `npm run tokens` producing a diff against the committed tree — has exactly one correct fix: run the generator, commit its output. There is no judgment call. This isn't a hypothetical; it happened for real during this same session's Button work — `docs/components/button.md` sat stale across several commits because nothing had re-run `npm run tokens` after `Button.tsx`'s prop type changed, and it was only caught by chance during an unrelated commit review, not by CI (which hadn't run yet). An agent "fixing" this would mean spending a model call to decide to run a command that has only one possible correct output. That's not intelligence, it's latency and cost for nothing.

**Everything else `npm run validate` gates** — a lint violation, a contrast failure, a type error, a failing test — requires reading the error, understanding what's actually wrong, and writing a real code change. That's a job for something that can reason about code, not a script.

So this spec has two phases with two different mechanisms, not one mechanism applied twice:

| | Phase 1 | Phase 2 |
|---|---|---|
| Failure class | Stale generated artifacts only | Lint, contrast, types, tests — anything `npm run validate` gates |
| Mechanism | Plain script, no AI | Claude Code in a GitHub Action |
| Why | The fix is deterministic — the diff *is* the fix | The fix requires reading and reasoning about code |
| Risk if wrong | None — worst case, an unnecessary PR with a no-op diff | Real — a plausible-looking but wrong fix, reviewed like any other PR |

## What both phases are allowed to do

Decided up front, not left implicit: **open a PR, never push directly to a working branch and never merge anything itself.** Whatever either phase produces goes through the same review a human's own commit would — this repo's discipline (`npm run validate` as the one gate, ADRs for real decisions, "fix the generator, never hand-edit the output") doesn't get a silent exception just because the committer is automated.

---

## Phase 1 — stale generated artifacts

### Architecture

A new, independent GitHub Actions job — not folded into `chromatic.yml`'s existing `chromatic` job, deliberately. That job's own staleness check (`git diff --exit-code` after `npm run tokens`) already gates every PR correctly; this phase doesn't replace it or depend on parsing its step outcome. It's a second, parallel job that does the same regenerate-and-diff check independently, and if it finds a diff, acts on it instead of just failing red.

```
.github/workflows/self-heal-stale-artifacts.yml

on: push
  branches-ignore: [main]     # main's staleness is chromatic.yml's job to catch
                               # pre-merge; this phase reacts to a contributor's
                               # own branch, not to what's already landed

jobs:
  regenerate-and-open-pr:
    permissions:
      contents: write
      pull-requests: write
    steps:
      - checkout (the pushed branch, full history not needed)
      - npm ci
      - npm run tokens
      - check for a diff (git diff --quiet, same predicate chromatic.yml uses)
      - if diff exists:
          - create a new branch off the current one: chore/regen-artifacts-<short-sha>
          - commit the regenerated files, using the same set chromatic.yml's
            staleness check already names (tokens/dependency-graph.json,
            tokens/token-reference.json, tokens/component-registry.json,
            styles/brands/, tokens.json, docs/components/, llms.txt,
            llms-full.txt, registry/, skills/) — not "everything git diff
            finds," the same explicit list, so this can never accidentally
            sweep up an unrelated uncommitted change
          - open a PR: chore/regen-artifacts-<short-sha> → <the pushed branch>
          - title: "chore(tokens): regenerate stale artifacts"
          - body: which files changed, and a one-line note that this PR was
            opened automatically because npm run tokens produced a diff
```

Uses [`peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request) for the branch/commit/PR steps rather than hand-rolling `gh` CLI calls — a well-established action for exactly this shape, not a new thing to debug.

### Why a PR onto the branch, not onto `main`

The contributor is still mid-work on their own branch. A PR that lands the fix into `main` directly would bypass whatever else they're doing on that branch. A PR *into* their branch is the same shape as any other reviewer suggestion — they see it, and either merge it into their own branch or fix it another way, before their own PR into `main` goes anywhere.

### Guard against a loop

This job's own commits go onto a **new** branch, never back onto the branch that triggered it. There's no `[skip ci]` guard needed the way `chromatic.yml`'s `update-changelog` job needs one (that job pushes directly to `main`, which re-triggers itself without the guard) — a new branch pushing for the first time doesn't re-trigger this same `push` event on the original branch.

### Acceptance

- A commit that changes something `npm run tokens` derives from (a component's props, a token value) without regenerating, pushed to a non-`main` branch, produces exactly one new PR targeting that branch, containing only the regenerated files.
- A commit that doesn't cause any drift produces no PR — confirmed by testing against a genuinely clean branch, not just a broken one.
- Re-pushing after merging the fix PR produces no new PR (the drift is gone).

## Phase 2 — judgment-requiring failures (named, not built)

**Deliberately not scoped in detail here.** Phase 1 should ship and prove itself first — a mechanism this repo trusts to open PRs unattended is worth getting right on the safe case before extending it to one with real risk.

The shape, for when this gets picked up:

- **Trigger:** the `chromatic` job in `chromatic.yml` failing on `Typecheck`, the `A11y`/test step, or `Token linter` — the steps that represent an actual code problem, not the staleness or changelog-sync steps Phase 1 (or the existing `update-changelog` job) already own.
- **Mechanism:** [`anthropics/claude-code-action@v1`](https://github.com/anthropics/claude-code-action), triggered via `workflow_run` on the failing `chromatic` workflow, given the actual failure log and repo access, with an explicit `prompt` describing the task (read the failure, propose a minimal fix, open a PR) rather than the action's default `@claude`-mention mode. Anthropic maintains this action for exactly this "CI fails → understand why → propose a fix" shape — no custom API-calling harness to build.
- **Same PR-not-push rule as Phase 1.** Claude Code opens a PR; nothing here gets write access to `main` or to merge anything.
- **Real open questions, not yet decided:** how many failure classes to trust it with first (probably lint violations only, initially — mechanically closest to Phase 1's determinism, since a lint fix is usually a small, local, low-ambiguity change; a failing *test* is a much bigger trust step, since "make the test pass" and "fix the actual bug" aren't always the same edit); a turn/cost budget per invocation; what happens if it can't find a fix (comment-only fallback, per the "no PR at all" option this spec's own scoping conversation considered and set aside for Phase 1).

## Out of scope, deliberately

- **Anything auto-merging.** Not for Phase 1, not for Phase 2, not ever without a separate decision revisiting this spec.
- **Reacting to flaky/infra failures** (the cache-race and browser-instance-naming bugs found during `decisions/0006`'s own work). Those need a human diagnosing an infrastructure problem, not a fix proposed against a moving target — explicitly the failure class this spec's own scoping conversation ruled out for now.
- **A new CI check.** This spec only reacts to checks that already exist.

---

## Session log

| Date | Phase | What changed |
|---|---|---|
| 2026-09-08 | — | Spec written. Scoping decided directly with Antonio: PR-with-human-merge (not direct push, not comment-only) as the action for both phases; Phase 1 covers stale generated artifacts only; Phase 2 (broader `npm run validate` failures) named and pointed at `anthropics/claude-code-action@v1` but deliberately not built yet. |
