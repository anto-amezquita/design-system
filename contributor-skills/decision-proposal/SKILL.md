---
name: decision-proposal
description: Use when a session ends with a real decision in it, or when decisions/proposed/ has a draft waiting — turns harvested session evidence into a real ADR, or rejects it. Covers the accept/reject bar, the rewrite, and the governance-audit step that has to happen before the ADR is committed.
---

# Decision proposal

The `/decisions` log used to be static: someone had to remember to write an ADR, and the reasoning behind a call — especially a call to *not* do something — evaporated between sessions. `scripts/propose-decision.mjs` fixes the remembering half. It runs at `SessionEnd` and, when a session shows signs of a real decision, writes an evidence draft to `decisions/proposed/`.

**It deliberately does not write the reasoning.** Harvesting is mechanical and can be automated; judging whether something was a decision, and explaining why, is not. That half is this skill.

A draft is raw material. It is gitignored, it is never committed by anything automatic, and deleting it costs nothing. See [`decisions/0009-living-memory-adr-proposals.md`](../../decisions/0009-living-memory-adr-proposals.md) for why the mechanism is split this way.

## When to use this

- `SessionStart` reported drafts waiting in `decisions/proposed/`.
- A session just made a real call — particularly one to rule something *out* — and no ADR exists for it.
- The harvester missed a decision, or filled a draft with noise, and its phrase lists need tuning.

## The bar: what actually deserves an ADR

`docs/backlog.md` set the priority order, and it is the order the draft's sections use:

1. **Rejected alternatives and why.** The most urgent and most perishable. A chosen path leaves evidence in the code; a rejected one leaves nothing at all. Recent AI-readiness calls in this repo — skipping Code Connect, the original decision to skip the MCP server — have real reasoning behind them that only survives if written down.
2. **Component decisions with their reasoning.** Why a prop is a literal union instead of a boolean. The type signature records the choice; only an ADR records why the alternative lost.
3. **AI-readiness and agent-safety reasoning.** Distinct from ordinary design taste. Why a guardrail exists, why an agent-facing surface is shaped the way it is.

**Explicitly below the bar:** plain implementation detail with no real tradeoff behind it. The code and the stories already cover that. A draft full of it should be deleted, not rewritten — and that is a success, not a failed run.

The bar in one question: *if someone proposes the opposite of this in six months, does this file answer them?* If not, it is not an ADR.

## Workflow

1. **Read the draft.** Every quote carries a turn number. If a quote is ambiguous, open the transcript at that turn rather than guessing at what was meant.

2. **Delete what does not meet the bar**, section by section. Most quotes in most drafts will not. Cutting is the main activity here.

3. **Decide whether anything survives.** If nothing does, delete the draft file and stop. Nothing tracks it and nothing needs to be recorded — a session with no decision in it is the normal case.

4. **Rewrite what survives as a real ADR.** Take the next free number in `/decisions`, use the template in [`decisions/README.md`](../../decisions/README.md) — Status, Context, Decision, Alternatives considered, Consequences, Related files — and write real prose. The draft's sections are evidence, not an outline; do not ship harvested quotes as the ADR's body.

   Keep the rejected alternatives. They are the reason this whole mechanism exists, and the template has a section for them.

5. **Run [`governance-audit`](../governance-audit/SKILL.md).** Required, not optional: the repo's own `CLAUDE.md` forbids adding an ADR without it, and `npm run validate` cannot catch a contradiction between two documents.

6. **Commit the ADR by hand, and delete the draft.** The draft is gitignored, so it will not follow the ADR into the commit — but leaving it behind means the next `SessionStart` reports a draft that has already been dealt with.

7. **Run `npm run validate`.** Docs-only changes should not move it. A changed result means something else broke.

## Tuning the harvester

Both failure directions are edited in the same place — the `CATEGORIES`, `NOISE`, and `CONVERSATIONAL` lists at the top of [`scripts/propose-decision.mjs`](../../scripts/propose-decision.mjs).

- **It missed a decision.** Find how the reasoning was actually phrased in the transcript and add that phrasing to the right category's `patterns`. Note that under-collecting is the failure mode you will not notice: an empty draft looks exactly like a session with nothing in it. When a session clearly contained a decision and produced no draft, treat that as a bug to chase, not as a quiet session.
- **It captured noise.** Add the shape to `CONVERSATIONAL` (talk *about* the work — asking what to do next, restating instructions) or `NOISE` (the agent narrating its own plan). This list is not speculative: on a real transcript from this repo, three of five priority-1 hits were process talk like "since you asked to leave this on the branch rather than merge," which is why the filter exists.
- **Check the change against real sessions before keeping it.** `node scripts/propose-decision.mjs --check --transcript <path>` reports what it would harvest and writes nothing. A mode flag is required — `--check` to report, `--harvest` to write — so a slip like `--chek` refuses to run rather than quietly writing a draft. Run it over several transcripts in `~/.claude/projects/<slug>/`, not just the one that prompted the change.
- **Add a test.** `scripts/propose-decision.test.mjs` runs in the `scripts` Vitest project (Node, no browser). Every tuning change is a behaviour change and should be pinned by one.

**Do not loosen the safety tests** in that file to make something pass. They assert that the script runs no mutating git command and can only write inside `decisions/proposed/` under a name no ADR could have. Those properties are what make it safe to run unattended at session exit.

## What this skill does NOT do

- **Decide for you.** The harvester proposes; a person accepts. Nothing here should end with an ADR committed that nobody read.
- **Replace writing an ADR in the moment.** If a session makes a significant architectural call, write the ADR then — `CLAUDE.md` requires it. This mechanism is a safety net for what would otherwise be lost, not permission to defer.
- **Replace [`governance-audit`](../governance-audit/SKILL.md)**, which still has to run before the ADR is committed.
