# Proposed decisions

**Nothing in this folder is a decision.**

Files here are `*.draft.md` drafts written automatically by [`scripts/propose-decision.mjs`](../../scripts/propose-decision.mjs), which runs at `SessionEnd` and harvests a session transcript for signs that a real call was made. A draft holds quoted evidence with turn numbers, grouped into the three things worth logging — rejected alternatives, component decisions, AI-readiness reasoning — in that priority order. It holds no reasoning, because reasoning is not something a script can write.

Drafts are gitignored. The script runs no mutating git command, and only ever writes inside this folder under a name no ADR could have. So a draft cannot reach the repo's history on its own, and deleting one costs nothing.

## What to do with one

Read it, cut what does not meet the bar, and then either:

- **Accept it** — rewrite what survives as `decisions/NNNN-<slug>.md` using the template in [`../README.md`](../README.md), run [`governance-audit`](../../contributor-skills/governance-audit/SKILL.md), commit that file by hand, and delete the draft.
- **Reject it** — delete the draft. Most sessions contain no decision worth logging, so this is the common outcome and the expected one.

Full workflow, including the accept/reject bar and how to tune the harvester when it misses or over-fires: [`contributor-skills/decision-proposal/SKILL.md`](../../contributor-skills/decision-proposal/SKILL.md). Why the mechanism is shaped this way: [`../0009-living-memory-adr-proposals.md`](../0009-living-memory-adr-proposals.md).
