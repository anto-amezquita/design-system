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

## Navigation follow-ups (backlog)

Opened 2026-09-28, deferred on purpose while building the `decisions/0015` components.

**1. Move Breadcrumb and Pagination onto Link.** Both render their own `<a>` with their own link styles. Moving them onto `Link` (`variant="standalone"`) would give one link look and one focus ring, but it changes both components' visuals and classes, so it wasn't part of adding Link.

**2. Menu: checkbox items, radio items and submenus.** Radix DropdownMenu supports all three. Left out until a consumer needs one; each adds state and keyboard behaviour worth its own tests.

**3. Built-in English strings that can't be changed.** Link's "(opens in a new tab)" and Drawer's "Close drawer" (and so the close button in SideNav's drawer) are hardcoded. Everything else the new components say is a prop with an English default. The consumers include Danish and Spanish sites, so these need a prop or a small strings object. Worth deciding once, for the whole system, rather than per component.

**4. Tests for the other nine `tokens:lint` rules.** `scripts/lint-tokens.test.mjs` covers only `no-unknown-breakpoint`. The file and the exported `lintFile`/`RULES` now make the rest cheap to add.

**5. `--z-dropdown` is referenced again, by NavigationMenu.** `decisions/0007`'s dead-token note listed it as unreferenced; it isn't any more (spec Deviation 6). `--z-overlay` and `--z-modal` are still candidates for the dead-token round.

Status: not started.

## Gaps found by the docs site's first build (backlog)

Opened 2026-10-01. `design-system-site` is the first consumer on the Next.js App Router that installs the package cold, and its first build (its `specs/2026-09-30-first-build.md`, §9) turned up the things below that are this repo's to fix. The missing `'use client'` on Link, SkipLink and Tag shipped in `1.1.2`; brand scope, base values in the doc twins, the generated MCP tool list, token descriptions and the font links are on `feat/docs-site-gaps` for `1.2.0` (`specs/2026-10-01-docs-site-gaps.md`).

**1. `tokens/changelog.json` is always one release behind in the package.** The `1.1.2` package ends at `v1.1.1`, with 1.1.2's own commit under `unreleased`; the portfolio's `1.1.0` ends at `v1.0.0`. The cause: `build-changelog.mjs` groups commits by git tag, and the tag for a release is created by `changeset publish` in `release.yml`, after the Version Packages merge has fixed what goes in the tarball. So package X can never contain X. On `main`, X appears only after the next push, since pushing the tag doesn't trigger `update-changelog`. A fix needs two parts: the builder labels untagged commits with `package.json`'s version when that version has no tag yet, and `release.yml` rebuilds the changelog before publishing. The second touches `decisions/0019`'s "main owns it" split, so it wants a decision, not a quick patch. The site reads `CHANGELOG.md`, so it isn't blocked; the portfolio's changelog page reads the JSON.

**3. Dark-only tokens are missing from `token-reference.json`.** Found building `portfolio-scoped.css`: `base/dark.json` and `portfolio/dark.json` define 28 `checkbox-*`, `radio-*` and `textarea-*` tokens with no light value. `build-token-reference.mjs` builds its token list from the light layers only (its comment says dark never adds a name, which isn't true), so these don't appear in the reference, `tokens.json` or the MCP tools. No component references any of them. Either they're dead and should go in the dead-token round, or they need light values and a place in the reference.

**4. Eight tokens with no description, because nothing says what they're for.** `shadow-card`, `z-sticky`, `z-overlay`, `z-modal`, `opacity-overlay`, `size-dialog-default`, `font-size-display` and `letter-spacing-body` aren't used by any component here or by the portfolio, and their names don't settle their purpose. Describe them if they're kept, or remove them in the dead-token round (`--z-overlay` and `--z-modal` are already candidates, see Navigation follow-ups item 5).

Status: not started. (Item 2, switching the agent files' URLs to the docs site, shipped in `1.3.0`.)

## ThemeScope follow-ups (backlog)

Opened 2026-10-05, from building `ThemeScope` for `1.3.0` (`decisions/0021`, `specs/2026-10-05-theme-scope.md`). None blocks a consumer.

**1. Replace `bodyDarkModeDecorator` with `ThemeScope`.** `lib/storybook.tsx` sets `data-mode="dark"` on `<body>` so Menu's and SideNav's dark stories render their portalled content dark. Wrapping those stories in `<ThemeScope mode="dark">` does the same through the component consumers use, and the decorator can go.

**2. Nothing checks that a portalling component follows the scope.** A new overlay that renders through a Radix `Portal` has to spread `useThemeScopeAttributes()` onto what it portals, or it comes out in the page's brand and mode. A check alongside `check-client-directives.mjs` could flag a `.Portal` in a component file without the hook.

**3. `ThemeScope`'s `brand` type is written by hand.** It's `'portfolio'`, the one brand with a scoped file. A third brand would need it widened; generating it from the scoped files in `styles/brands/` would keep it in step.

Status: not started.

## Baseline grid: sizes `decisions/0012`'s table doesn't cover (backlog)

Opened 2026-09-16, surfaced while implementing `decisions/0012` (originally on `baseline-grid-vertical-rhythm`, landed via `feat/baseline-grid-line-height`) (see `roadmap.md`'s session log). The ADR maps line-height roles to the semantic font-size tokens, but real text sizes in the system weren't in its table. 12px text now has its own `caption` role (0012's 2026-09-17 amendment). The two below got the nearest sensible on-grid value so nothing is left off-grid, and each needs a call. A fourth item covers the portfolio site's upgrade, and a fifth covers controls that use `line-height: 1`.

**2. Hero's lead is 20px, not the 24px `font-size-h4` that replaced `font-size-lead` (decisions/0013).** `hero-lead-size` resolves to `font-size.emphasis`, so `.hero__lead` still uses `line-height-body`, now 28px (was 30px). On grid, and it reads fine, but it's a body role on non-body text.

**3. `<body>` has no font-size.** `reset.css` sets `line-height-body` (28px) on `<body>` but leaves font-size at the browser default of 16px, so any consumer text that inherits both gets 16/28 instead of the ADR's 18/28. Components are unaffected now: every component rule that sets a font-size also gets its line-height from its own component CSS, except Avatar's fallback and Pagination's ellipsis, which sit in fixed-size flex boxes. Setting `font-size: var(--font-size-body)` on `<body>` would fix the pairing but changes the default size for every consumer, so it's a release-notes-level change, not a quiet one.

**4. Check whether the portfolio's migration pass happened.** `~/Documents/github/portfolio` imports this package's CSS. It has since moved to `^0.6.0` (PR #3, 2026-09-17) and then `1.0.0` (PR #4, 2026-09-24), so the upgrade this item waited on has happened, but nothing in either PR's record says the re-pointing below was done. If it wasn't, its 71 `var(--line-height-body)` uses become a fixed 28px whatever the text size, and its 34 `var(--line-height-heading)` uses stay at 1.25, including next to static `--font-size-h1`–`h3` (17 uses) where `--line-height-h1`–`h3` now exist. Each needs re-pointing to the role that matches its font size, the same sweep this repo's components got. Its 134 `var(--font-size-label)` uses are 12px eyebrows and metadata, not form labels, so they move to `font-size-caption`/`line-height-caption`. `decisions/0013` also removes tokens it uses: `font-size-micro` (18 uses, move to `caption`, 10px → 12px), `font-size-lead` (11 uses, move to `h4`) and `font-size-label` itself; its `font-size-h2-fluid` uses (14) get up to 4px larger below ~1280px wide.

**5. Controls that set `line-height: 1` on 14px text get a 14px line box, which isn't a multiple of 4.** `decisions/0003` allows bare `1` for single-line controls, and 0012 didn't revisit it. Two cases left: `.pagination__button` (fixed `--pagination-button-size` box) and `.tabs--sm .tabs__trigger` (inherits `line-height: 1` from `.tabs__trigger`, which has a touch-target `min-height`). In both, the control's box sets the height, so the rhythm holds at the component level; only the text's own line box is off-grid. Worth deciding whether 0012's rule should reach inside fixed-size controls, or whether `line-height: 1` inside a sized box is an accepted exception to write into the ADR. The Input/Textarea field labels had the same issue and were moved to `line-height-label` (16px) to match the standalone Label. 12px and 16px controls with `line-height: 1` (Badge, Tag, Button, Textarea count) already land on the grid.

Status: 2, 3 and 5 need the user's call; 4 needs a check of the portfolio's current token usage.

## Container width scale follow-ups (backlog)

Opened 2026-09-17 with `decisions/0014`, which added the `size-container-text/media/wide/page/site` tokens and deliberately stopped at tokens. Item 1, breakpoint tokens, shipped as `decisions/0018` (2026-09-28). Two things left:

**2. A layout component.** A CSS grid with named lines (text / media / wide / full), as in Ryan Mulligan's layout breakouts, so a page opts children into a tier instead of repeating `min(var(--size-container-*), 100%)` and `margin-inline: auto`. Wait until the portfolio has used the tokens for real.

**3. Retire `space-layout-max-width`.** Deprecated at 1200px, sitting between `size-container-wide` (1280px) and `-media` (960px). Consumers need to pick a tier per use before it can go. `dialog.json`'s use of `size.layout-md` and Hero's `hero-max-width` (800px) / `hero-lead-max-width` (60ch) are worth checking against the scale at the same time.

Status: not started.

## `contributor-skills/design-system` may have diverged from the kit's copy (backlog)

Opened 2026-09-28. `contributor-skills/design-system/SKILL.md` was adopted from the ai-product-starter-kit's `/skills` convention (see `contributor-skills/README.md`). The kit still ships its own `design-system` skill, and the portfolio carries a third copy in `portfolio/skills/design-system`. Three copies of the same-named skill, none of them generated, so nothing keeps them in step.

Diff the three and decide: either this repo's copy is deliberately specialised for developing the system rather than building with it, in which case rename it so the divergence is obvious, or it's a stale fork and should be re-synced from the kit. The kit and the portfolio also differ by one skill already (`architecture-review` is in the portfolio, not the kit), so the sync question is wider than this one file.

Status: not started.

## No documented voice for the package's own copy (backlog)

Opened 2026-09-28, surfaced while building the `ux-writing` skill. This repo has no `docs/brand.md` or `docs/content.md`, so `content-review` has nothing to review against and falls back to flagging both as blockers.

The argument for leaving it that way: the package is consumed by other people's products, so it shouldn't carry a voice at all — the consumer's voice wins, and any string the system hardcodes is a decision taken away from them. That reasoning is the same one that keeps voice-bearing skills out of `skills/`. If it holds, the absence is a decision worth writing into an ADR rather than a gap worth filling.

Either way it's the same call as item 3 of the Navigation follow-ups above (Link's "(opens in a new tab)", Drawer's "Close drawer"): decide once, for the whole system, whether built-in strings are props, a strings object, or not there at all. Do that first, then decide whether anything needs documenting.

Status: needs the user's call.

## Build the `design-system-site` (backlog)

Opened 2026-09-29. `decisions/0017` is accepted and its prerequisites are met: the `decisions/0015` navigation components shipped in `1.1.0`, the `decisions/0016` major in `1.0.0`, and `package.json`'s `files` already ships `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CHANGELOG.md` and `decisions/*.md`. The `design-system-site` repo exists (started from the ai-product-starter-kit) and stages 1-5 of its kickoff are answered: Next.js App Router, static, Vercel, tracks the latest release, no Chromatic. It has no app code yet. Stage 6, the first build, is next, and its detail lives in the site repo's own `docs/backlog.md`. The three questions left before building (page structure, where the agent-facing files are served from, how a release lands) were settled on 2026-09-30 in the site repo's `decisions/0001-page-structure-agent-surface-release-sync.md`. Once the move is complete, the portfolio's old design-system docs and agent files get deleted (its `app/design-system-playbook/` stays) and the old URLs redirect to the subdomain.

Status: not started (Stage 6).

**Moving the agent-facing URLs to the subdomain is one edit, deliberately not made yet.** Since `1.1.1` the package ships `tokens.json`, `skills/`, `registry/` and `docs/components/`, so the site can generate them. `build-llms-txt.mjs`, `build-skill.mjs` and `build-registry-manifests.mjs` all derive their URLs from two links in `README.md` (the `[amezquita.dk](...)` root and the `[Live component docs](...)` base). Switching means editing those two links and running `npm run tokens`, in a patch release. Do it once the subdomain serves `/r/`, since registry dependencies are absolute URLs and would 404 before that.

## Chromatic: PR #37 result and snapshot budget (backlog)

Opened 2026-09-29. The `1.1.0` row in `roadmap.md`'s session log says Chromatic's result for PR #37 (the navigation components, 28 new stories) isn't recorded. Separately, the account used 4,794 of 5,000 snapshots in the Aug 23 - Sep 23 period (per the `design-system-site` kickoff) and has hit the monthly limit before (2026-09-15, 2026-09-17), so the next batch of visual changes may not get a real check. Confirm the #37 build by hand, and decide whether the limit needs handling first.

Status: not started.

## Self-healing CI (backlog)

Opened 2026-09-08, unblocked by [`decisions/0006`](../decisions/0006-add-layered-automated-testing.md) (real tests now exist for CI to react to). Spec'd in [`specs/self-healing-ci-spec.md`](../specs/self-healing-ci-spec.md), validated against industry precedent in [`self-healing-ci-research.md`](./self-healing-ci-research.md).

Two phases, deliberately different mechanisms: Phase 1 (stale generated artifacts) is a plain deterministic script — the fix is the diff, no judgment needed. Phase 2 (lint/contrast/type/test failures) is named but not built — Claude Code in a GitHub Action, for when a real code fix is required. Both phases open a PR; neither pushes directly or merges anything.

**Phase 1 works and is fully verified.** `amez-ds-self-heal` is live, and all five acceptance criteria pass against real runs — a drifting branch gets one correctly-scoped PR, `chromatic` goes green on it unattended, a second push updates that same PR, a clean branch produces nothing, and merging leaves both staleness checks clean with the bot's branch deleted. Detail in the spec's Acceptance table and session log.

Merged to `main` 2026-09-10 (PR #13). The PR-rate question was settled by `decisions/0019`. The one open item is branch protection, which matters more now that `update-changelog` is the only thing keeping the changelog current on `main`.

**Branch protection on `main`.** Required check **`chromatic`** (there is no check named `validate` — it's an npm script inside that job), approvals **0** (GitHub blocks self-approval, so requiring 1 makes your own PRs unmergeable on a solo repo), no bypass entry for the App. **Decide first:** `chromatic.yml`'s `update-changelog` job pushes directly to `main`, so a require-a-PR ruleset rejects that push — silently, on every merge from then on. Either add a bypass actor for the Actions bot, or rework that job to open a PR like everything else. **Recommend the rework:** `main` currently has one bot pushing straight to it while Phase 1's bot is forbidden from doing exactly that, and a bypass entry makes that inconsistency permanent.

Worth knowing when you get to it: `chromatic` used to fail the changelog step on component branches, which would have made requiring it unmergeable. `decisions/0019` removed that step, so it no longer blocks branch protection. Enabling it after the bot has earned trust still beats enabling it alongside.

**Phase 2 stays parked** until Phase 1 has been boring for a while. Its open questions are in the spec, not here.

Status: Phase 1 shipped and verified; the changelog noise is fixed (`decisions/0019`). Branch protection open, gated on the `update-changelog` push decision.
