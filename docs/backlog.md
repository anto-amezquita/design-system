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

## `0.6.0` → next release blocked on Chromatic's monthly snapshot limit (backlog)

Opened 2026-09-22. `feat/functional-button-default` is code-complete and unpushed: decisions/0015 and 0016 recorded, Button made functional by default with the expressive hover opt-in, contract tests, a major changeset, and 0016 amended with the GSAP packaging outcome. `npm run validate` exits 0 (44 files, 273 tests) and `check-generated-sync.mjs` passes.

**What's blocking the push:** the account's Chromatic monthly snapshot limit is reached again (banner confirmed by the user on 2026-09-22; expected to renew 2026-09-23). This change alters the hover on *every* Button story plus two new ones, so the snapshot batch is the review — 0016 says those diffs "need reviewing and accepting as a batch, against a committed build." Pushing while capped means the run fails or skips and the Button diffs land unexamined, which is the one thing this change shouldn't do.

**When it's time:** confirm the limit actually reset on Chromatic's build page, not just the calendar. Then push the branch, open the PR, let `chromatic.yml` run, review and accept the Button batch, merge, release the major.

**After that, in order:** bump `~/Documents/github/portfolio` to the new major — its Button wrapper (`components/primitives/Button/Button.tsx`, sets `motion="expressive"` and `arrow`) and ~13 converted `noArrow` call sites are sitting uncommitted on `main` and cannot typecheck until then. While there, re-sync the hand-copied `BUTTON_DOC` string in `app/two-things-i-use-everyday/ButtonDuality.tsx` from the regenerated `docs/components/button.md`; it snapshots the *published* package, so it is correct today and stale the moment the major lands. Only then start 0015.

Status: waiting on Chromatic's limit, not on any code or decision.

## `hooks/useButtonWipe.ts` contradicts 0016 and is dead (backlog)

Opened 2026-09-22, noticed while implementing 0016. Nothing in this repo imports it. It statically imports GSAP, so any consumer importing from `hooks/` pulls GSAP in regardless of Button's `motion` prop — the exact coupling 0016 removed. It also defaults `fillColor` to `var(--button-primary-background-hover)`, a token decisions/0005 collapsed, so it references a name that no longer exists.

It ships in the published package (`files: ["hooks"]`), so deleting it is a public API change and wants a line in a changeset, not a quiet removal. Decide whether anything outside this repo ever imported it — the portfolio has its own copy of the wipe — then delete or keep deliberately.

## Baseline grid: sizes `decisions/0012`'s table doesn't cover (backlog)

Opened 2026-09-16, surfaced while implementing `decisions/0012` (originally on `baseline-grid-vertical-rhythm`, landed via `feat/baseline-grid-line-height`) (see `roadmap.md`'s session log). The ADR maps line-height roles to the semantic font-size tokens, but real text sizes in the system weren't in its table. 12px text now has its own `caption` role (0012's 2026-09-17 amendment). The two below got the nearest sensible on-grid value so nothing is left off-grid, and each needs a call. A fourth item covers the portfolio site's upgrade, and a fifth covers controls that use `line-height: 1`.

**2. Hero's lead is 20px, not the 24px `font-size-h4` that replaced `font-size-lead` (decisions/0013).** `hero-lead-size` resolves to `font-size.emphasis`, so `.hero__lead` still uses `line-height-body`, now 28px (was 30px). On grid, and it reads fine, but it's a body role on non-body text.

**3. `<body>` has no font-size.** `reset.css` sets `line-height-body` (28px) on `<body>` but leaves font-size at the browser default of 16px, so any consumer text that inherits both gets 16/28 instead of the ADR's 18/28. Components are unaffected now: every component rule that sets a font-size also gets its line-height from its own component CSS, except Avatar's fallback and Pagination's ellipsis, which sit in fixed-size flex boxes. Setting `font-size: var(--font-size-body)` on `<body>` would fix the pairing but changes the default size for every consumer, so it's a release-notes-level change, not a quiet one.

**4. The portfolio site needs a migration pass when it upgrades past `0.3.x`.** `~/Documents/github/portfolio` imports this package's CSS and is pinned to `^0.3.1`, so nothing changes for it until it bumps. Then its 71 `var(--line-height-body)` uses become a fixed 28px whatever the text size, and its 34 `var(--line-height-heading)` uses stay at 1.25, including next to static `--font-size-h1`–`h3` (17 uses) where `--line-height-h1`–`h3` now exist. Each needs re-pointing to the role that matches its font size, the same sweep this repo's components got. Its 134 `var(--font-size-label)` uses are 12px eyebrows and metadata, not form labels, so they move to `font-size-caption`/`line-height-caption`. `decisions/0013` also removes tokens it uses: `font-size-micro` (18 uses, move to `caption`, 10px → 12px), `font-size-lead` (11 uses, move to `h4`) and `font-size-label` itself; its `font-size-h2-fluid` uses (14) get up to 4px larger below ~1280px wide.

**5. Controls that set `line-height: 1` on 14px text get a 14px line box, which isn't a multiple of 4.** `decisions/0003` allows bare `1` for single-line controls, and 0012 didn't revisit it. Two cases left: `.pagination__button` (fixed `--pagination-button-size` box) and `.tabs--sm .tabs__trigger` (inherits `line-height: 1` from `.tabs__trigger`, which has a touch-target `min-height`). In both, the control's box sets the height, so the rhythm holds at the component level; only the text's own line box is off-grid. Worth deciding whether 0012's rule should reach inside fixed-size controls, or whether `line-height: 1` inside a sized box is an accepted exception to write into the ADR. The Input/Textarea field labels had the same issue and were moved to `line-height-label` (16px) to match the standalone Label. 12px and 16px controls with `line-height: 1` (Badge, Tag, Button, Textarea count) already land on the grid.

Status: 2 and 3 need the user's call; 4 waits on the portfolio's upgrade; 5 needs the user's call.

## Container width scale follow-ups (backlog)

Opened 2026-09-17 with `decisions/0014`, which added the `size-container-text/media/wide/page/site` tokens and deliberately stopped at tokens. Three things left:

**1. Breakpoint tokens.** The site tier switches at 1024px, and component CSS already hardcodes 768px and 1024px (`Dialog.css`). CSS custom properties can't be used inside `@media`, so breakpoints need build-time output: Style Dictionary emitting `@custom-media` (consumers would need PostCSS), SCSS/JS constants, or documented values only. Needs a call on which.

**2. A layout component.** A CSS grid with named lines (text / media / wide / full), as in Ryan Mulligan's layout breakouts, so a page opts children into a tier instead of repeating `min(var(--size-container-*), 100%)` and `margin-inline: auto`. Wait until the portfolio has used the tokens for real.

**3. Retire `space-layout-max-width`.** Deprecated at 1200px, sitting between `size-container-wide` (1280px) and `-media` (960px). Consumers need to pick a tier per use before it can go. `dialog.json`'s use of `size.layout-md` and Hero's `hero-max-width` (800px) / `hero-lead-max-width` (60ch) are worth checking against the scale at the same time.

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
