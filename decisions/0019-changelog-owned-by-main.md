# 0019 — The changelog is main's job, not every branch's

## Status

Accepted. Amended 2026-10-05: `tokens/changelog.json` is removed in 2.0. Nothing reads it any more (the docs site uses `CHANGELOG.md`, the portfolio retired its own copy), and the copy inside each package is always a release behind, since the tag it groups by is created at publish. Until 2.0 the lag is accepted, not fixed. See `docs/backlog.md`, "Remove in 2.0".

## Context

`tokens/changelog.json` is built from git history: every `feat`, `fix`, `refactor`, `perf`, `style` or `docs` commit that touches `tokens/`, `components/`, `sd.config.mjs` or `styles/brands/` becomes an entry with its SHA. That means the commit that changes a component can never be in its own changelog. You build the file, then commit, and the commit you just made isn't in it.

Until now `chromatic.yml` gated every pull request on the committed changelog matching a fresh build (`changelog-sync.mjs --check`). So nearly every component branch failed that step after its last real commit, however carefully the work was done. Two ways out existed, and both cost something:

- A follow-up `chore(changelog): regenerate` commit by hand (`chore` is excluded from the changelog, so that one doesn't make it stale again). One more push, so one more Chromatic run.
- The self-heal bot (`self-heal-stale-artifacts.yml`), which had the changelog in its `SELF_HEAL_PATHS` for exactly this reason and so opened a PR on nearly every component branch. `backlog.md` had parked this as "watch the PR rate, then judge".

The navigation components PR (#37) hit it again on 2026-09-28: `validate` green, generated artifacts in sync, and `chromatic` red on the changelog step because of one `fix(menu)` commit. Its fix was one more commit and one more push, on a branch that was being careful about Chromatic's snapshot budget.

Meanwhile `main` already has the thing that keeps the changelog honest: `chromatic.yml`'s `update-changelog` job regenerates it after every push to `main` and commits the result with `[skip ci]`.

## Decision

**Branches don't gate on the changelog.** The "Check changelog is in sync" step is removed from the `chromatic` job. A branch may commit whatever `npm run tokens` produced, current or one entry behind; neither fails anything.

**The self-heal bot stops touching the changelog.** `SELF_HEAL_PATHS` is now the same list as `GENERATED_PATHS`, and the workflow's `--restore-if-unchanged` step is gone. The bot opens a PR only when a real generated artifact (docs twins, registry, token reference, CSS) is stale, which is what Phase 1 was built for.

**`main` owns it.** `update-changelog` stays the only thing that makes the changelog current, after each merge. It now runs `changelog-sync.mjs --restore-if-unchanged` before committing, so a push where only `meta.generatedAt` moved doesn't produce a bot commit on `main`.

`changelog-sync.mjs --check` stays, for local use.

## Alternatives considered

- **Keep the gate and always add a `chore(changelog)` commit.** What was happening by hand. Rejected: it's a rule that exists only to satisfy a check, it costs a push (and a Chromatic run) per branch, and forgetting it turns a finished PR red.
- **Keep the gate and let the self-heal bot fix it.** What Phase 1 was doing. Rejected for the same reason `backlog.md` suspected: a bot PR on nearly every component branch is noise, and merging it is another push.
- **Write `meta.generatedAt` only on real change**, the lever `backlog.md` named. Rejected as the fix for this: it would stop timestamp-only diffs, but the content itself is still one commit behind on every component branch, so the gate would still fail. It's still a nice-to-have for quieter diffs, not needed now that `--restore-if-unchanged` covers `main`.
- **Leave SHAs out of the changelog**, so an entry doesn't depend on the commit that adds it. Rejected: the SHA is how an entry points back at its change, and the entry would still only exist after its commit.
- **Build the changelog only at release time.** Closer to how Changesets' `CHANGELOG.md` works. Rejected for now: `tokens/changelog.json` has an "unreleased" section, which only means something if `main` keeps it current between releases.

## Consequences

### Positive
- A component branch goes green on its last real commit. No chore commit, no bot PR, no extra Chromatic run just for the changelog.
- The self-heal bot fires only on real drift, which settles `backlog.md`'s "watch the PR rate" item.
- `main` stops getting a bot commit on pushes where only the timestamp moved.

### Negative
- Between a merge and `update-changelog` finishing, `main`'s changelog can be a few entries behind. Minutes, not a release: `release.yml` publishes from the Version Packages merge, by which time the earlier feature merges have been caught up.
- More rests on `update-changelog`, which pushes straight to `main`. That was already the open question in `backlog.md`'s branch-protection item (a require-a-PR ruleset would reject it); this decision makes answering it more important, not less.
- The portfolio repo has the same gate and the same problem (`backlog.md`), and isn't changed here. The same change applies there.

## Related files

- `.github/workflows/chromatic.yml` — gate removed; `update-changelog` restores timestamp-only rebuilds
- `.github/workflows/self-heal-stale-artifacts.yml` — changelog step removed
- `scripts/generated-artifacts.mjs` — `SELF_HEAL_PATHS` equals `GENERATED_PATHS`
- `scripts/changelog-sync.mjs` — `--check` local only; `--restore-if-unchanged` used on `main`
- `specs/self-healing-ci-spec.md` — § "The path list", which this amends
- `docs/architecture.md` §9
