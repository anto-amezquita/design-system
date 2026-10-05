# 0022 — Release at most once a week

## Status

Accepted

## Context

Since 2026-10-05 every release reaches both sites on its own: `release.yml` notifies the portfolio and `design-system-site`, and each opens a bump PR. That made releasing cheap to do, and on that day it happened four times, `1.3.0` to `1.3.3`.

It used up the Chromatic account's monthly snapshot limit the same day. The portfolio's run logs show where it went. A bump changes `package-lock.json`, which turns TurboSnap off ("TurboSnap disabled due to file change"), so the bump PR snapshots all 198 portfolio stories in both modes: 396 snapshots. Merging it does the same again on `main`. Every other PR and its `main` build found "0 story files affected" and cost a fraction of that. Four releases came to roughly 3,200 snapshots in the portfolio alone, on top of this repo's own builds on the same account.

## Decision

**Merge the "Version Packages" PR at most once a week.** Changesets keeps collecting changes in that PR until it's merged, so library PRs merge whenever they're ready; only the release waits for a batch worth shipping.

**The exception is a fix someone is waiting on:** a broken install, a crash, an accessibility regression in a published component. `1.2.1`, which fixed `npx shadcn add` failing for every component, is the kind of release that shouldn't wait for the week.

## Alternatives considered

- **Stop running Chromatic on `main` in the portfolio.** Saves the second full build per bump. Rejected: the `main` builds are where `autoAcceptChanges: main` turns visual changes into the next baseline. Without them every visual change would have to be accepted by hand in Chromatic before merging, or later PRs keep flagging it.
- **Tell TurboSnap to ignore lockfile changes on `main` only.** Stops the second full build too, but a bump's visual changes would never become the baseline. The same problem, quieter.
- **A bigger Chromatic plan.** Possible, but four releases a day weren't needed: the changes were small and could have shipped together.

## Consequences

### Positive

- One bump PR per site per week instead of one per release, and roughly a quarter of the snapshots on a day like 2026-10-05.
- Fewer bump PRs to review and merge in the sites.

### Negative

- A finished change can wait up to a week to reach npm and the sites. The exception covers anything that can't.
- It's a habit, not a check: nothing stops the PR being merged twice in a day. AGENTS.md tells agents not to suggest it.

## Related files

- `.changeset/README.md` — the release flow, now with the cadence
- `.github/workflows/release.yml` — publishes when "Version Packages" merges, then notifies both sites
- The portfolio's `.github/workflows/chromatic.yml` — `onlyChanged` (TurboSnap) and `autoAcceptChanges: main`
