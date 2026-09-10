# Self-healing CI — specification

An agent that reacts to a failing CI check and opens a fix, rather than a human noticing the red X and running the fix by hand. Named as a future roadmap item during [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md)'s work, deliberately parked there: reacting to a check needs a check that actually runs code, and before 0006 this repo had none. That blocker is gone — `npm run validate` now includes real tests, not just linters.

**Scope discipline, same as the MCP and docs-site specs:** no new failure-detection logic. Every phase below reacts to a check `npm run validate` or `chromatic.yml` already runs — this spec doesn't add a new thing that can fail, it adds a response to failures that already exist.

---

## State

```
Last updated:   2026-09-10
Current phase:  Phase 1 complete and proven. All five acceptance criteria pass
                against real runs. The App (amez-ds-self-heal) is live, the
                workflow heals both the generated artifacts and the changelog,
                and a merged bot PR leaves a genuinely clean branch.
Next action:    Land `ci/self-heal-phase-1` on main, then step 5 (branch
                protection).
Blocked on:     one decision before branch protection — chromatic.yml's
                update-changelog job pushes directly to main, which a
                require-a-PR ruleset would break.
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

on:
  push:
    branches-ignore:
      - main                       # main's staleness is chromatic.yml's job to
                                   # catch pre-merge; this phase reacts to a
                                   # contributor's own branch, not to what's
                                   # already landed
      - 'chore/regen-artifacts/**' # the bot's own branches — see "Guard
                                   # against a loop"
  workflow_dispatch:               # manual re-run without an empty commit

concurrency:
  group: regen-artifacts-${{ github.ref }}
  cancel-in-progress: true

jobs:
  regenerate-and-open-pr:
    permissions:
      contents: read              # GITHUB_TOKEN is used only by checkout —
                                  # every write goes through the App token
                                  # below, so it needs nothing more
    steps:
      - mint a GitHub App installation token (see "Auth")
      - checkout (the pushed branch, fetch-depth: 0 — see below)
      - npm ci
      - npm run tokens
      - peter-evans/create-pull-request, with:
          token:       the App installation token, not GITHUB_TOKEN
          branch:      chore/regen-artifacts/<the pushed branch>
          base:        <the pushed branch>
          add-paths:   the generated-artifact list (see "The path list")
          delete-branch: true
          title:       "chore(tokens): regenerate stale artifacts"
          body:        which files changed, and a one-line note that this PR
                       was opened automatically because npm run tokens
                       produced a diff
```

**`fetch-depth: 0` is required, and this spec originally said the opposite.** The sketch above used to read "full history not needed". That is wrong: `scripts/build-changelog.mjs` derives `tokens/changelog.json` from `git tag` and `git log`, so a default depth-1 checkout produces a near-empty changelog. The bug was latent until the changelog joined the commit list — before that the garbage was rebuilt and discarded. Once committed, it showed up as the bot deleting 220 lines of changelog and `chromatic.yml` (which checks out full history) failing on the result. Found by acceptance run 2, PR #10.

**As built, three details the sketch above didn't fix.** `permissions` came out
*narrower* than this spec originally wrote (`contents: read`, not
`contents: write` + `pull-requests: write`): every write in the job goes
through the App installation token, so GITHUB_TOKEN only ever needs what
`actions/checkout` uses to clone. Granting it write as well would widen the
blast radius of the job for no capability gained. `delete-branch: true` is what
actually satisfies the acceptance criterion about the bot's branch being
cleaned up once the drift is gone. And the App token step uses
`client-id`, not the action's deprecated `app-id` input — so the secrets are
`SELF_HEAL_APP_CLIENT_ID` and `SELF_HEAL_APP_PRIVATE_KEY`.

Uses [`peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request) for the branch/commit/PR steps rather than hand-rolling `gh` CLI calls — a well-established action for exactly this shape, not a new thing to debug. It also removes the need for an explicit diff check: the action no-ops when there's nothing to commit, and deletes its own branch when a previously-open PR's drift is gone.

**The branch name is keyed to the source branch, not the commit SHA.** `create-pull-request` is idempotent *per branch name* — a second run updates the existing branch and PR instead of opening a duplicate. A SHA-keyed name (which this spec originally specified) defeats that: every drifting push during one work session would spawn a fresh branch and a fresh PR. One PR per branch, updated in place, is the correct shape.

### Auth — a GitHub App token, not `GITHUB_TOKEN`

**This is the load-bearing implementation decision, and it isn't optional.** GitHub deliberately prevents workflows authenticated with the default `GITHUB_TOKEN` from triggering further workflow runs (loop protection). A PR opened with it would therefore **not run `chromatic.yml`** — the bot would open a PR with no checks on it, which is worse than the red X it replaces.

**Confirmed firsthand on 2026-09-10, not taken on faith** (this is the falsification test this section used to call for; it has now been run and doesn't need running again). A throwaway workflow opened a `github-actions[bot]` PR (#8) against a drifting branch. `chromatic.yml` did not run. The precise failure mode is the *partial* exception [`docs/self-healing-ci-research.md`](../docs/self-healing-ci-research.md) § 2 already documents: for `pull_request` events the run **is** created, but in an `action_required` state that never starts until a human clicks "Approve workflows to run" — observed as `Chromatic #94 | action_required`. So the earlier wording here ("silently skips every check") was wrong in one detail worth correcting: it isn't silent, it's a visible yellow banner. It is still unattended-hostile, which is what matters — a self-healing bot whose every PR waits on a human click hasn't removed the trip to GitHub. Approving-per-PR is the NeMo metadata-predicate model the research names and rejects for exactly this reason.

The fix: a GitHub App owned by Antonio, installed on this repo, scoped to **Contents: write** and **Pull requests: write** and nothing else. Mint a short-lived installation token in-workflow with `actions/create-github-app-token`, pass it to `create-pull-request`.

Why an App rather than a PAT: the token is short-lived and repo-scoped, its commits are signed and attributed to a distinguishable `[bot]` identity, and it doesn't ride on a personal account's credentials. This is what the Changesets docs recommend and what Shopify Polaris's release bot (`shopify-github-actions-access[bot]`) is. A PAT is an acceptable fallback, not the target.

*Cheap falsification first:* before building the App, push a branch with deliberate drift and open a PR from a `GITHUB_TOKEN`-authored bot commit. If `chromatic.yml` runs on it, the App isn't needed. Current documented GitHub behavior says it won't.

### The path list

The commit is scoped via `create-pull-request`'s `add-paths` to the same explicit artifact list `chromatic.yml`'s staleness check already names — never `git add -A` — so the bot can never sweep up an unrelated change or touch a source file.

Note that **this list is the enforcement.** GitHub App permissions scope by repository and permission *type*; there is no path-level write scoping anywhere in GitHub Actions. `contents: write` + `pull-requests: write` is already the narrowest grant available, and it is repo-wide by construction. Anything narrower has to be done in the workflow.

That list used to appear twice in `chromatic.yml` (the `git add -N` line and the `git diff --exit-code` line). Adding a third copy here would have made it a four-way sync hazard of exactly the kind `governance-audit` exists to catch, so it was extracted first, not after: **[`scripts/generated-artifacts.mjs`](../scripts/generated-artifacts.mjs) is now the only place the list is written down.** `chromatic.yml`'s staleness step became one line (`node scripts/check-generated-sync.mjs`), and this workflow resolves `add-paths` by shelling out to the same module rather than restating the paths in YAML.

`tokens/changelog.json` needs its own handling, and **the first version of this workflow got it wrong.** It is generated, but `meta.generatedAt` moves on every build, so a plain diff always says "changed" — putting it in the commit list would have made the bot open a PR on every single push. So it was excluded.

Acceptance testing on 2026-09-10 showed why excluding it isn't enough either. The changelog builder includes any `feat|fix|refactor|perf|style|docs` commit touching `tokens/`, `components/`, `sd.config.mjs` or `styles/brands/` — which is most real work here. A drifting branch therefore has *two* stale artifacts, and a bot that heals only one leaves `chromatic.yml`'s changelog step failing. Observed for real: PR #9 regenerated `docs/components/tag.md` correctly, the staleness check went green, and the PR was still red on `Check changelog is in sync`. The human still had to run `npm run tokens` — the exact trip Phase 1 exists to save.

The resolution is a second list and one extra step. [`scripts/changelog-sync.mjs`](../scripts/changelog-sync.mjs) owns the content-only comparison (`meta.generatedAt` nulled) in both directions: `--check` is what `chromatic.yml` gates on, and `--restore-if-unchanged` puts the committed file back when only the timestamp moved. The workflow runs the latter right after `npm run tokens`, then commits `SELF_HEAL_PATHS` (`GENERATED_PATHS` plus the changelog). Clean branch → the changelog is restored and there is nothing to commit; genuinely drifting branch → it is committed alongside the rest and the PR can go green.

That comparison was previously written inline in `chromatic.yml` and was about to be copied into this workflow — the same duplication the path list itself was extracted to avoid, caught the second time by having a script to put it in.

### Pin third-party actions to a commit SHA

`peter-evans/create-pull-request` (`5f6978f`, v8.1.1) and `actions/create-github-app-token` (`bcd2ba4`, v3.2.0) are pinned to a full commit SHA, not a floating tag. This workflow holds a write-scoped token; a tag that silently moves under it is a supply-chain path into the repo. (The existing workflows' tag pins are a separate, pre-existing question — not this spec's to change.)

### Why a PR onto the branch, not onto `main`

The contributor is still mid-work on their own branch. A PR that lands the fix into `main` directly would bypass whatever else they're doing on that branch. A PR *into* their branch is the same shape as any other reviewer suggestion — they see it, and either merge it into their own branch or fix it another way, before their own PR into `main` goes anywhere.

### Guard against a loop

This job's own commits go onto a **separate** branch, never back onto the branch that triggered it. There's no `[skip ci]` guard needed the way `chromatic.yml`'s `update-changelog` job needs one (that job pushes directly to `main`, which re-triggers itself without the guard).

Two guards, not one:

- `branches-ignore: 'chore/regen-artifacts/**'` — pushing the bot's branch would otherwise re-trigger this same workflow on the bot's own output. It would find no drift and open nothing, so it isn't an infinite loop, but it burns a run every time and stops being harmless the moment a generator is non-deterministic.
- `concurrency: { group: regen-artifacts-<ref>, cancel-in-progress: true }` — two rapid pushes to the same branch would otherwise race two runs onto the same bot branch. Cancellation is safe here specifically because this workflow never runs on `main` and never feeds a merge queue; a superseded run has nothing worth finishing.

### Acceptance

- A commit that changes something `npm run tokens` derives from (a component's props, a token value) without regenerating, pushed to a non-`main` branch, produces exactly one new PR targeting that branch, containing only the regenerated files.
- **`chromatic.yml` actually runs on that PR.** This is the acceptance criterion the whole "Auth" section exists to satisfy — a green-looking PR with no checks attached is the failure this design is guarding against, and it's silent.
- A *second* drifting push to the same branch updates that same PR. It does not open a second one.
- A commit that doesn't cause any drift produces no PR — confirmed by testing against a genuinely clean branch, not just a broken one.
- Re-pushing after merging the fix PR produces no new PR, and the bot's branch is cleaned up (the drift is gone).
- Branch protection on `main` treats the bot's PRs exactly like a human's: the required check is **`chromatic`** (there is no check named `validate` — that is an npm script running inside the `chromatic` job), review required, no bypass entry for the App.

**Results, 2026-09-10.** Run against the real App, not simulated.

| # | Criterion | Result |
|---|---|---|
| 1 | Drift produces exactly one PR, only regenerated files | **Pass** — PR #12: `docs/components/switch.md` plus one `tokens/changelog.json` entry, nothing else |
| 2 | `chromatic.yml` runs on the bot's PR | **Pass, green** — ran unattended and passed. Compare the `GITHUB_TOKEN` control, frozen at `action_required` |
| 3 | A second drifting push updates the same PR | **Pass** — bot branch moved `9fc9254` → `2c6d5e6`, still one PR and one branch. The per-branch-name keying this spec fixed on paper, now exercised |
| 4 | A clean branch produces no PR | **Pass** — run #2 on `ci/self-heal-phase-1`, green, no PR |
| 5 | Merging the fix leaves no new PR, branch cleaned up | **Pass** — PR #12 merged, `chore/regen-artifacts/test/drift-3` deleted automatically by `delete-branch: true`, self-heal run #9 green with no new PR |

**The load-bearing check is the merge, not the diff.** Merging PR #12 into its source branch left both `check-generated-sync` and `changelog-sync --check` exiting 0 — the branch was genuinely healed, not partially. That is the criterion the two earlier attempts failed while still producing correctly-scoped PRs (#9 red on the changelog, #10 red on an emptied one), and it is why the acceptance bar here is "green and mergeable", not "correctly scoped".

Two things confirmed incidentally: `create-pull-request`'s `sign-commits: true` produces `verified: true, reason: valid` commits authored by `amez-ds-self-heal[bot]`, and the App token step is the job's first step — so getting past it proves both secrets are correct.

**It took three attempts, and both failures came from trusting this document over the repo.** The first (PR #9) went red because the changelog was excluded from the commit list; the second (PR #10) because the sketch above said "full history not needed" and the shallow checkout emptied the changelog. Both were written here, both read as reasonable, and neither survived contact with a real run. Worth remembering the next time this spec sounds authoritative.

## Phase 2 — judgment-requiring failures (named, not built)

**Deliberately not scoped in detail here.** Phase 1 should ship and prove itself first — a mechanism this repo trusts to open PRs unattended is worth getting right on the safe case before extending it to one with real risk.

The shape, for when this gets picked up:

- **Trigger:** the `chromatic` job in `chromatic.yml` failing on `Typecheck`, the `A11y`/test step, or `Token linter` — the steps that represent an actual code problem, not the staleness or changelog-sync steps Phase 1 (or the existing `update-changelog` job) already own.
- **Mechanism:** [`anthropics/claude-code-action@v1`](https://github.com/anthropics/claude-code-action), triggered via `workflow_run` on the failing `chromatic` workflow, given the actual failure log and repo access, with an explicit `prompt` describing the task (read the failure, propose a minimal fix, open a PR) rather than the action's default `@claude`-mention mode. Anthropic maintains this action for exactly this "CI fails → understand why → propose a fix" shape — no custom API-calling harness to build. Start from its `examples/ci-failure-auto-fix.yml`, whose shape is the one to copy: an explicit `--allowedTools` allow-list rather than open-ended shell access, plus a `max_turns` cap.
- **Never `pull_request_target` with an untrusted checkout.** This is the single most exploited GitHub Actions pattern (documented RCEs at Microsoft, Google, MITRE, Splunk; Microsoft's own `symphony` repo drew a CVSS 9.3). A solo maintainer working on their own repo never needs it — `push` / `workflow_run` cover every trigger here.
- **Walled off from Phase 1's territory.** The agent fixes source. It never regenerates the artifacts Phase 1 owns, and never edits CI config, lock files, or dependency manifests — the same exclusion CodeRabbit's productized `fix-ci` draws.
- **No precedent to follow.** No major design system — Carbon, Spectrum, Polaris, Atlaskit, Material, Radix, shadcn/ui, Ant Design, Fluent UI — is publicly confirmed to run an AI-agent-fixes-CI workflow in production. Phase 2 rests on the vendor's own examples and one productized general-purpose tool. That's an early-adopter position, not a follower's, and it's the reason Phase 2 stays behind Phase 1 on trust.
- **Same PR-not-push rule as Phase 1.** Claude Code opens a PR; nothing here gets write access to `main` or to merge anything.
- **Real open questions, not yet decided:** how many failure classes to trust it with first (probably lint violations only, initially — mechanically closest to Phase 1's determinism, since a lint fix is usually a small, local, low-ambiguity change; a failing *test* is a much bigger trust step, since "make the test pass" and "fix the actual bug" aren't always the same edit); a turn/cost budget per invocation; what happens if it can't find a fix (comment-only fallback, per the "no PR at all" option this spec's own scoping conversation considered and set aside for Phase 1).

## Out of scope, deliberately

- **Anything auto-merging.** Not for Phase 1, not for Phase 2, not ever without a separate decision revisiting this spec.
- **Reacting to flaky/infra failures** (the cache-race and browser-instance-naming bugs found during `decisions/0006`'s own work). Those need a human diagnosing an infrastructure problem, not a fix proposed against a moving target — explicitly the failure class this spec's own scoping conversation ruled out for now.
- **A new CI check.** This spec only reacts to checks that already exist.
- **Anything involving Chromatic baselines — including auto-accepting them.** Proposed during the 2026-09-10 review and rejected on two independent grounds. First, there is nothing to heal: `chromatic.yml` already runs `exitZeroOnChanges: true` (a visual diff never fails CI here) and `autoAcceptChanges: main` (main already auto-accepts), so the manual "Accept" click is Chromatic-UI queue hygiene, not a CI failure. Second, deciding whether a diff is the expected consequence of a source change in the same PR is a judgment call — it would be Phase 2 reasoning wearing a Phase 1 badge, and [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md) already reached this conclusion from the other direction ("an agent can't decide 'was this change intended'"). Both Chromatic items only become real work if visual diffs are ever made to gate, which is a separate decision needing its own ADR.

---

## Session log

| Date | Phase | What changed |
|---|---|---|
| 2026-09-10 | 1 | **Phase 1 acceptance complete — all five criteria pass.** Third attempt; the first two produced correctly-scoped PRs that were still red, and both failures traced to this spec rather than to the implementation. Fix one: the changelog was excluded from the bot's commit list, so a drifting branch stayed red on `Check changelog is in sync` (PR #9) — resolved with `scripts/changelog-sync.mjs` owning the content-only comparison in both directions plus a second `SELF_HEAL_PATHS` list. Fix two: the architecture sketch said "full history not needed", so the default depth-1 checkout left `build-changelog.mjs` seeing 1 eligible commit and 0 tags against 69, and the bot committed a changelog with 220 lines deleted (PR #10) — resolved with `fetch-depth: 0`, matching what `chromatic.yml` already does on both its jobs, and diagnosed by cloning the repo at `--depth 1` and running the builder's own git query rather than reasoning about shallow clones. Final run (PR #12) passed all five: one correctly-scoped PR, `chromatic` green unattended, a second drifting push updating the same PR rather than opening a second, a clean branch producing nothing, and a merge that deleted the bot branch and left both staleness checks exiting 0. Sandbox branches removed afterwards; `main` untouched throughout. |
| 2026-09-10 | 1 | Phase 1 went live and was tested against real runs. GitHub App `amez-ds-self-heal` created, installed on this repo only, scoped to Contents + Pull requests read/write; secrets stored. Acceptance 1, 2 and 4 pass — **2 is the one that matters**: `chromatic` ran unattended on the bot's PR, against the `GITHUB_TOKEN` control from earlier the same day that stayed frozen at `action_required`. **Acceptance found a real design gap that paper review missed.** The bot healed `docs/components/tag.md` correctly and the PR was still red, because a drifting branch also drifts `tokens/changelog.json` — any `feat/fix/refactor/perf/style/docs` commit touching `tokens/`, `components/`, `sd.config.mjs` or `styles/brands/` changes its content — and the changelog was excluded from the commit list to stop `meta.generatedAt` triggering a PR on every push. Healing one of two stale artifacts still leaves the human running `npm run tokens`, which is the whole trip Phase 1 exists to save. Fixed with `scripts/changelog-sync.mjs`, which now owns the content-only comparison in both directions (`--check` for `chromatic.yml`, `--restore-if-unchanged` for the bot) plus a second `SELF_HEAL_PATHS` list, verified against both cases: timestamp-only churn restores and commits nothing, real content change is kept and committed. That comparison had been inline in `chromatic.yml` and was one copy-paste away from being duplicated — the same hazard the path list was extracted to avoid, caught this time because there was a script to put it in. Also corrected the acceptance list's required-check name from `validate` (no such check exists) to `chromatic`. |
| 2026-09-10 | 1 | Steps 2 and 3 built. **Step 2:** the generated-artifact path list extracted to `scripts/generated-artifacts.mjs` — one source, read by the new `scripts/check-generated-sync.mjs` (which replaces the two inline copies in `chromatic.yml`'s staleness step) and by the new workflow's `add-paths`. Verified it catches both drift shapes locally: a modified generated file and a brand-new untracked one. **Step 3:** `.github/workflows/self-heal-stale-artifacts.yml` written to the architecture above, with three deliberate divergences recorded there — `contents: read` instead of write (every write goes through the App token, so GITHUB_TOKEN needs nothing more), `delete-branch: true` (what actually satisfies the branch-cleanup acceptance criterion), and `client-id` instead of the action's deprecated `app-id`. The PR-body step was run verbatim against simulated drift rather than assumed to work. Steps 1, 4 and 5 are all GitHub-UI work and remain open; the workflow must not be pushed before step 1 or every non-`main` push fails on the missing secret. Also fixed two pre-existing governance divergences found by the audit pass: `docs/quality.md` and `AGENTS.md` both described `npm run validate` without `tokens:lint-architecture`, and `AGENTS.md` omitted the test suite too. |
| 2026-09-10 | 1 | Spec validated against industry precedent ([`docs/self-healing-ci-research.md`](../docs/self-healing-ci-research.md)) and revised. Phase 1 gained the load-bearing auth decision (GitHub App token, not `GITHUB_TOKEN` — otherwise the bot's PRs silently skip every check), a `concurrency` group, SHA-pinned actions, and `add-paths` scoping. Fixed a real bug in the original architecture: the branch name was keyed to the commit SHA, which defeats `create-pull-request`'s per-branch idempotency and would have opened a new PR per drifting push. Three divergences between the research report's derived backlog and this spec resolved with Antonio: trigger stays non-`main` (the report's push-to-`main` recommendation rested on a job-contention premise that doesn't apply — the two are already separate workflows writing to different branches); "glob-scoped write permissions" dropped as not a thing GitHub offers; Chromatic auto-accept dropped entirely and moved to Out of scope. |
| 2026-09-08 | — | Spec written. Scoping decided directly with Antonio: PR-with-human-merge (not direct push, not comment-only) as the action for both phases; Phase 1 covers stale generated artifacts only; Phase 2 (broader `npm run validate` failures) named and pointed at `anthropics/claude-code-action@v1` but deliberately not built yet. |
