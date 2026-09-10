# Validating a Two-Phase "Self-Healing CI" Design for a Solo-Maintained Design System

## TL;DR
- **Phase 1 (deterministic regenerate-and-open-a-PR, never push to main) is strongly validated by industry precedent** — Shopify Polaris, Chakra UI, and virtually every Changesets-based design system use exactly this "bot opens a PR, human merges" pattern; adopt it with confidence.
- **The single most important implementation decision is the bot's auth token: do NOT use the default `GITHUB_TOKEN`** if you want your existing `npm run validate` / Chromatic checks to run on the auto-generated PR. Use a **GitHub App installation token** (via `actions/create-github-app-token`) — this is what Shopify's `shopify-github-actions-access[bot]` does, and it is the explicitly documented fix in the Changesets docs, preferred over a PAT.
- **Phase 2 (AI agent proposes fixes) is technically ready but has essentially no public precedent among the big design systems** — `anthropics/claude-code-action` ships an official `ci-failure-auto-fix` example, but no major design system (Carbon, Spectrum, Polaris, Atlaskit, Material) is publicly known to run it in production. Treat Phase 2 as experimental, scope it tightly, and never let it touch generated artifacts that Phase 1 already owns.

## Key Findings

1. **The "regenerate → open PR → human merges, never auto-merge" pattern is the industry norm.** Shopify Polaris uses the Changesets bot to open a `changeset-release/main` branch and a "Version Packages" PR that a human reviews and merges. This directly validates your Phase 1 "PR not direct push" requirement.

2. **The default `GITHUB_TOKEN` loop-protection problem is real, well-documented, and affects exactly your use case.** GitHub deliberately prevents workflows authenticated with `GITHUB_TOKEN` from triggering further workflow runs (to prevent infinite loops). This means a Phase 1 PR opened with `GITHUB_TOKEN` will NOT trigger your staleness/Chromatic/validate checks.

3. **The recommended fix is a GitHub App token, not a PAT.** GitHub's own docs, the Changesets docs, and the `peter-evans/create-pull-request` maintainer all converge on: use a GitHub App installation token (preferred) or a PAT to get downstream checks to run. Shopify's release bot `shopify-github-actions-access[bot]` is a GitHub App.

4. **AI-agent-fixes-CI is available as an official pattern but unproven in major design systems.** `anthropics/claude-code-action` ships example workflows including `ci-failure-auto-fix.yml` and `test-failure-analysis.yml`. By default Claude commits to a new branch and opens a PR for human review; auto-merge requires explicitly granting elevated permissions.

5. **`pull_request_target` + untrusted-code checkout is the dominant supply-chain footgun** and should be avoided entirely for a solo maintainer. Real RCEs have been found in Microsoft, Google, MITRE, and Splunk repos from this exact misconfiguration.

6. **Concurrency races between your existing checks and a new regeneration job are a known problem with a standard fix** — GitHub Actions `concurrency` groups.

## Details

### 1. How the major design systems handle automated artifact regeneration

**Shopify Polaris — the closest analog to your Phase 1, and fully confirmed.**
Polaris (repo now archived as `Shopify/polaris-react-archive`, workflow at `.github/workflows/release.yml`) uses Changesets. Per its own `documentation/Releasing.md`, the flow is:
- On merge to `main`, the Changesets action **creates a `changeset-release/main` branch and opens a PR titled "Version Packages"** that always contains an up-to-date `changeset version` run (updated `CHANGELOG.md` + `package.json` versions).
- The PR is **kept up to date on every subsequent merge to main**, and **a human merges it** to perform the release. It is never auto-merged and never pushed directly to main.
- The release commits and PRs are authored by **`shopify-github-actions-access[bot]`** — the `[bot]` suffix confirms this is a **GitHub App installation identity**, not a human PAT account. Published releases show commits "signed with GitHub's verified signature, GPG key ID B5690EEEBB952194," consistent with GitHub-App/GitHub-API signed commits.
- **Not publicly confirmable:** the exact token-minting step in the Polaris YAML (whether `actions/create-github-app-token`, `tibdex/github-app-token`, or a named secret). The workflow file body could not be retrieved. But the use of a `[bot]` GitHub App identity rather than `GITHUB_TOKEN` is confirmed, and it is precisely the mechanism that lets downstream CI run on the "Version Packages" PR.

**Chakra UI — same Changesets pattern, token choice documented by its author.**
Chakra's monorepo uses Changesets (`pnpm version` / `pnpm release` via changesets). Chakra author Segun Adebayo publishes the canonical release workflow, which uses `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` plus npm OIDC trusted publishing (`id-token: write`), with `concurrency: group: ${{ github.workflow }}-${{ github.ref }}` and `permissions: contents: write / id-token: write / pull-requests: write`. He explicitly notes that PRs created with `GITHUB_TOKEN` don't trigger other workflows and that you need a PAT (or App token) if you want CI to run on the version PR.

**IBM Carbon Design System.** Carbon is a Yarn 4 + Lerna monorepo. Its main CI is `.github/workflows/ci.yml`; it uses `github-merge-queue` for merges, a DCO-signing bot workflow (`dco.yml`), and an `add-review-labels.yml` workflow that uses `GITHUB_TOKEN`. **I could not locate a public workflow that auto-regenerates token/registry artifacts and opens a PR** — Carbon appears to rely on contributors regenerating artifacts locally plus CI verification, and on Lerna for release. Flag: Carbon's exact regeneration-bot mechanism (if any) is not publicly documented in a workflow file I could confirm.

**Adobe Spectrum.** `@adobe/spectrum-tokens` uses **semantic-release** with Conventional Commits and a GitHub Action to automate releases (commits to `main`/`next`/`next-major` publish to npm). React Spectrum uses Lerna + nightly publish scripts and Chromatic for visual regression. I could not retrieve the specific workflow YAML to confirm whether token regeneration is committed directly vs. via PR; the release model (semantic-release publishing from a branch) differs from the changesets "open a PR" model.

**Salesforce Lightning Design System.** SLDS uses `theo` (now largely deprecated) / Style Dictionary-style token transformation and Storybook. Its token-generation-in-CI mechanism is **not publicly documented in a confirmable workflow file**; the repo has moved token generation into separate `@salesforce-ux/*` packages.

**Atlassian Design System (Atlaskit).** Atlaskit is developed in Atlassian's internal `atlassian-frontend` monorepo and mirrored/published as `@atlaskit/*`; the changelog for `@atlaskit/tokens` is public but **the CI workflow YAML is not public**, so its regeneration mechanism cannot be confirmed.

**Material Web / MDC.** I could not confirm a public artifact-regeneration-opens-a-PR workflow.

**Bottom line for section 1:** The one design system whose pattern is fully confirmable and directly matches your Phase 1 — Polaris — validates every element of your spec: regenerate derived artifacts, open a PR (never push to main), keep it updated, human merges, and use a **GitHub App bot** rather than the default token.

### 2. The "bot commit with default `GITHUB_TOKEN` doesn't trigger downstream checks" problem

This is a documented, deliberate GitHub behavior, not a bug. Per GitHub Docs ("Triggering a workflow"): **"When you use the repository's GITHUB_TOKEN to perform tasks, events triggered by the GITHUB_TOKEN will not create a new workflow run, with the following exceptions: workflow_dispatch and repository_dispatch events always create workflow runs."** The one partial exception for `pull_request` opened/synchronize/reopened is that any resulting run is created in an **approval-required** state, requiring a human to click "Approve workflows to run."

Evidence this bites design-system-style pipelines specifically:
- **Changesets `action` issue #70:** a team reported "when we used `GITHUB_TOKEN` before the PR action is not being triggered, so we had to use PAT."
- **Changesets official docs** (changesets.dev/guide/automating), verbatim: **"To always automatically run workflows for version PRs, you need to use either a personal GitHub token or a GitHub App token, and pass it to the Changesets GitHub Action."** The docs show an `actions/create-github-app-token@v3` step with `permission-contents: write` and `permission-pull-requests: write` as the recommended path.
- **`peter-evans/create-pull-request` docs** (the most widely used generic PR-bot action) list the same limitation and workarounds: use a repo-scoped PAT, a GitHub App token, or push from a machine-account fork. Its issue #48 has hundreds of linked reports.
- Real-world confirmations of the App-token / PAT fix: PostHog and Inkeep (from your preliminary research), plus StacklokLabs PR #61 which created "a repo-scoped PAT (with only PR r/w permissions)" specifically so `on: pull_request` quality checks would run on bot PRs.

**The metadata-predicate alternative (NVIDIA-NeMo pattern).** Where a team does not want a PAT/App token, NeMo's model is to gate CI on a trusted signal: CI runs automatically only when a maintainer with write access adds a "Run CICD" label or clicks "Approve and run" for untrusted forks. This is the "trust the bot PR via a metadata predicate (author + branch prefix + marker), then let a normal trigger run" approach — viable but requires you to be present to approve, which partly defeats "self-healing."

### 3. AI coding agents fixing CI in production

- **The official capability exists.** `anthropics/claude-code-action` ships example workflows including `ci-failure-auto-fix.yml`, `test-failure-analysis.yml`, and `agent-approval-check.yml`. Its v1.0 release notes list, verbatim, **"CI Failure Fixes - Automatically diagnose and fix failing tests"** among the v1.0 example workflows.
- **The official example is tightly scoped.** `examples/ci-failure-auto-fix.yml` invokes `uses: anthropics/claude-code-action@v1` with `prompt: /fix-ci` and an explicit allow-list of tools: `claude_args: "--allowedTools 'Edit,MultiEdit,Write,Read,Glob,Grep,LS,Bash(git:*),Bash(bun:*),Bash(npm:*),Bash(npx:*),Bash(gh:*)'"`. This is the model to copy — an allow-list, not open-ended shell access.
- **Default behavior is PR-for-review, not auto-merge.** Per multiple write-ups of the action: "By default, Claude commits to a new branch and links to the PR creation page. A human must approve and merge. Automatic merging requires explicitly granting elevated permissions." This matches your Phase 2 "never auto-merge" requirement out of the box.
- **The recommended trigger for auto-fix is `workflow_run` on the failed CI workflow's completion**, checking in progress with `contents: write` / `pull-requests: write`, scoping the agent with the `allowedTools` allow-list and `max_turns` to control cost and blast radius.
- **No confirmed production use in a major design system.** I found extensive tutorial/marketing content (dev.to, Medium, vendor blogs) and Chakra UI ships a `CLAUDE.md`, but **no evidence that Carbon, Spectrum, Polaris, Atlaskit, Material, Radix, shadcn/ui, Ant Design, or Fluent UI runs an AI-agent-fixes-CI workflow in production.** The closest general-purpose production tooling is **CodeRabbit's "Fix CI failures"** feature: per its docs (docs.coderabbit.ai/finishing-touches/fix-ci), `@coderabbitai fix-ci` opens a stacked PR while `@coderabbitai fix-ci commit` makes a direct commit; it "clones the repository into a sandbox" and deliberately leaves out "CI and build config, lock files, and other dependency manifests," surfacing them separately. This confirms the "agent opens a PR to fix CI, human reviews, and it is walled off from config/dependency files" pattern is being productized — but not specifically inside a flagship design system.
- **Cautionary datapoint.** A documented Claude Code incident (anthropics/claude-code issue #35584) describes an agent taking destructive actions when given broad, ambiguous instructions — underscoring the need for tight tool scoping and read-only-by-default posture in CI.

### 4. Security & trust best practices for bot-authored PRs

- **Scope permissions minimally at the workflow/job level.** Use `permissions: contents: write` + `pull-requests: write` (the exact scopes `create-pull-request` and `changesets/action` require) rather than the broad default. A custom GitHub App scoped to only Contents + Pull Requests is narrower than the official multi-feature Claude GitHub App, which bundles Contents, Issues, and Pull Requests and cannot be partially accepted.
- **Avoid `pull_request_target` with untrusted-code checkout entirely.** This is the single most exploited GitHub Actions pattern: Orca Security, Sysdig, and GitHub Security Lab document RCEs in Microsoft, Google, MITRE, and Splunk repos, including the ability to "push code back into official branches (including main)." Per Orca Security's "pull_request_nightmare Part 2," Microsoft assigned **CVE-2025-61671 a critical CVSS score of 9.3** to the `Microsoft/symphony` repo's `pull_request_target`/`refs/pull/N/merge` checkout flaw. GitHub has since hardened defaults: per the GitHub Changelog (Nov 7, 2025), effective Dec 8, 2025 "the pull_request_target event now always uses the default branch for workflow source and reference," closing the outdated-workflow exploitation class; and `actions/checkout@v7` now blocks fork-PR head/merge checkouts under `pull_request_target` by default. For a solo maintainer, you never need `pull_request_target`; your Phase 1/2 bots operate on your own repo's code, so use plain `pull_request`/`push`/`workflow_run`.
- **Apply branch protection equally to bot and human PRs.** Require a PR before merging to `main`, require your `validate` check to pass, and require review. Do NOT add the bot to a "bypass required reviews" list — the whole point of Phase 1/2 is that a human reviews. Since you're solo, you are the required reviewer of your own bot's PRs (GitHub rulesets with a bypass list, or simply self-approval where allowed, cover the single-maintainer case).
- **Restrict bot PR scope to specific file globs.** Have the Phase 1 job commit only the known generated artifacts (`token-reference.json`, `component-registry.json`, doc twins, `llms.txt`, `changelog.json`, registry manifests). Use `create-pull-request`'s explicit `paths` input or an equivalent so the bot can never touch source. Enforce with CODEOWNERS if desired.
- **Prefer verified/signed bot commits.** GitHub App tokens produce commits signed with GitHub's GPG key attributed to the app (as Polaris's do); this gives you an auditable "who/what changed this" trail.
- **Pin third-party actions to a full commit SHA**, not a floating tag, to reduce supply-chain risk.

### 5. Race conditions between your existing checks and a new regeneration job

Yes, there is a real overlap risk: if a push to a branch triggers both your existing staleness/Chromatic check AND a new "auto-open regeneration PR" job, the regeneration job can push a commit that races the in-flight check, or two regeneration runs on rapid pushes can both try to create/update the same PR branch.

Standard mitigations, all confirmed:
- **Use a `concurrency` group** keyed to the workflow + ref so only one regeneration run per branch executes at a time:
  ```yaml
  concurrency:
    group: regenerate-${{ github.ref }}
    cancel-in-progress: true
  ```
  For PR-iteration workflows, `cancel-in-progress: true` cancels superseded runs. **Do NOT use `cancel-in-progress: true` on `main`/release runs** where every run must complete — scope cancellation to PR refs and let `main` runs finish.
- **Separate the concern**: don't run regeneration and the staleness check in the same job on the same trigger. A clean design is: the staleness *check* runs on `pull_request` (fails the build if artifacts are stale, per the Builder.io "treat staleness as a build failure" model); the *regeneration bot* runs on `push` to `main` (or on a schedule / `workflow_dispatch`) and opens a PR. That way the check and the fixer never contend for the same branch.
- **`create-pull-request` is idempotent by design**: re-running it updates the existing PR/branch rather than opening duplicates, and it deletes the branch if there's no diff — so a concurrency group plus this idempotency eliminates duplicate-PR races.
- Note the interaction with **merge queues**: `concurrency` + `cancel-in-progress` can break GitHub merge queues (cancelled queued builds fail the queue). If you later adopt a merge queue, exclude it from cancellation. For a solo repo this is unlikely to matter yet.

## Recommendations

**Stage 1 — Ship Phase 1 with a GitHub App token (do this first).**
1. Create a minimal **GitHub App** owned by you, scoped to only **Contents: write** and **Pull requests: write**, and install it on the repo. Mint its token in-workflow with `actions/create-github-app-token`, then pass that token to your PR-creation step (`peter-evans/create-pull-request` or `changesets/action`). This is the decisive fix that makes your existing `validate`/Chromatic checks actually run on the auto-generated PR — the default `GITHUB_TOKEN` will silently skip them. This is the exact pattern the Changesets docs recommend (`actions/create-github-app-token@v3` with `permission-contents: write` + `permission-pull-requests: write`).
   - *Why App over PAT:* App tokens are scoped, short-lived, produce signed/attributed commits, and don't consume a personal-account seat or expire like a classic PAT. PAT is an acceptable fallback if App setup is too heavy, but App is the industry-preferred choice.
2. Trigger the regeneration bot on `push` to `main` (and add `workflow_dispatch` for manual runs). Keep the staleness *check* on `pull_request` as a hard build failure.
3. Constrain the bot to commit only your generated-artifact globs; never source files.
4. Add a `concurrency: { group: regenerate-${{ github.ref }}, cancel-in-progress: true }` block to the regeneration workflow.
5. Keep branch protection on `main` requiring the `validate` check + your review. Confirm the bot **cannot** bypass it.

**Stage 2 — Pilot Phase 2 (AI-assisted) in a sandbox, gated hard.**
6. Adopt `anthropics/claude-code-action` starting from `examples/ci-failure-auto-fix.yml` (with its `prompt: /fix-ci` and explicit `--allowedTools` allow-list), triggered via `workflow_run` on your CI workflow's `completed`+`failure` conclusion.
7. Scope it: `permissions: contents: write, pull-requests: write` only; keep the `allowedTools` allow-list narrow; set `max_turns` and a token budget; prompt it to **fix source, not tests, and never regenerate Phase-1-owned artifacts** (mirror CodeRabbit's practice of walling the agent off from config/lock/dependency files).
8. Force PR-for-review (the default) — do not grant merge/auto-merge permissions.
9. Start it only on a narrow failure class (e.g., lint/type-check) and on non-`main` branches; expand only after you trust its diffs.

**Benchmarks that would change these recommendations:**
- If downstream checks *do* run on your bot PRs while using `GITHUB_TOKEN` (test this explicitly), you can skip the App — but current GitHub behavior says they won't.
- If Phase 2's agent produces a low-quality-fix rate or ever touches files outside its allowed scope, revert it to comment-only (`test-failure-analysis`) mode.
- If you adopt a merge queue later, remove `cancel-in-progress` from any workflow that feeds the queue.

## Caveats
- **Only Shopify Polaris and Chakra UI could be confirmed at the workflow level.** For Carbon, Spectrum, Salesforce, Atlaskit, and Material, I could not retrieve public workflow YAML confirming whether artifact regeneration commits directly to a branch or opens a PR, nor their exact auth mechanism. Atlassian and Salesforce develop in private/internal monorepos, so this may not be publicly knowable. Treat statements about those five as "not confirmed" rather than negative evidence.
- **The exact token step in Polaris's `release.yml` (App-token action vs. named secret) could not be retrieved** — only that the identity is a GitHub App bot (`shopify-github-actions-access[bot]`). The recommendation to use `actions/create-github-app-token` is drawn from GitHub's own guidance and the Changesets docs, not copied verbatim from Polaris's file.
- **No major design system is publicly confirmed to run an AI-agent-fixes-CI workflow in production.** Phase 2 rests on the vendor's official examples and general engineering write-ups, plus the productized CodeRabbit "fix-ci" feature — not on a flagship-design-system precedent. Proceed as an early adopter, not a follower.
- **Much of the AI-agent CI content online is vendor/marketing material** with forward-looking or promotional framing; I have relied on the official `anthropics/claude-code-action` repo and GitHub's own docs for the load-bearing claims and flagged the rest.
- Some sources referenced dated future events (e.g., `actions/checkout@v7` behavior, CVE-2025-61671, the Dec 8 2025 `pull_request_target` default change); these are presented as reported by GitHub/Microsoft advisories and security vendors, and should be re-verified against the current state before you rely on version-specific behavior.
