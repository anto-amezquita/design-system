# 0009 — Harvest session transcripts into proposed ADR drafts, and keep drafting out of it

## Status

Accepted — implemented 2026-09-16. `scripts/propose-decision.mjs` plus a `SessionEnd`/`SessionStart` hook pair in `.claude/settings.json`, a `scripts` Vitest project, and [`contributor-skills/decision-proposal`](../contributor-skills/decision-proposal/SKILL.md) for the human half.

## Context

The decisions log was static. Writing an ADR depended on someone remembering to write one, and the reasoning most worth keeping was the reasoning least likely to survive: a *rejected* alternative leaves no trace in the code at all. `docs/backlog.md` opened this on 2026-09-16 out of a context-engineering discussion, naming memory architecture as one of two open gaps, and set a priority order for what to capture (that entry was removed when this shipped, per that file's own session protocol — the 2026-09-16 row in [`docs/roadmap.md`](../docs/roadmap.md)'s session log is where it lives now) — rejected alternatives first, then component decisions with their reasoning, then AI-readiness and agent-safety reasoning, with plain implementation detail explicitly excluded because code and stories already cover it.

Two constraints came with it. The draft must never auto-commit; it is written for human review, on the same propose-then-approve model the repo's existing guardrails use. And the mechanism had to be concrete — a hook or a script — not a convention that depends on the same memory that failed in the first place.

## Decision

**Split noticing from writing.** A `SessionEnd` hook runs `scripts/propose-decision.mjs`, which parses the session transcript, harvests quoted evidence into the backlog's three categories in priority order, and writes `decisions/proposed/session-<date>-<id>.draft.md` — but only when the session shows real signal. Turning that evidence into prose is a separate, deliberate act, documented in `contributor-skills/decision-proposal/SKILL.md`.

The seam is there because the two halves have opposite requirements. Noticing has to be automatic and free, or it does not solve the remembering problem. Writing benefits from judgement and context, and produces something a person has to stand behind. The expensive thing to reconstruct a week later is the evidence — who said what, in which turn — not the prose.

**The safety contract is enforced in code and pinned by tests,** not left to convention, because this writes into the folder holding the repo's decision record:

1. No mutating git command — the only git it runs is `branch --show-current` and `diff --stat`.
2. It writes only inside `decisions/proposed/`; the path is constructed rather than accepted, and re-checked before the write.
3. Drafts are named `session-*.draft.md`, which cannot be confused with an ADR's `NNNN-slug.md`.
4. `.gitignore` excludes `decisions/proposed/*.draft.md`, so even `git add -A` cannot sweep an unreviewed draft into a commit.

**Suppression is a feature.** No draft is written when signal is below threshold, or when the session already produced a real ADR. A folder that fills with a draft per session gets ignored within a week — the same end state as having no drafts at all.

**`SessionStart` reads the folder back out.** `SessionEnd` output is never shown, since the session is already over. Without a counterpart, drafts accumulate where nobody looks. `scripts/pending-decisions.mjs` prints one line at session start when drafts are waiting, and is silent otherwise.

## Alternatives considered

- **Have the `SessionEnd` hook call `claude -p` to write finished ADR prose.** Rejected. It would produce a real draft immediately, but costs tokens on every qualifying session end, spawns Claude from inside a Claude hook, can hang, and — worst — produces unreviewed prose that reads as finished. A scaffold that obviously needs work invites the review it needs; a polished draft invites a rubber stamp. The evidence was the hard part anyway.
- **Use the `Stop` hook instead of `SessionEnd`.** Rejected: `Stop` fires at the end of every agent turn, dozens of times per session.
- **Put the hook config in the repo's existing `hooks/` folder.** Rejected — that folder is React hooks (`useButtonWipe.ts`, `useSheetFocusRestore.ts`). Claude Code hooks belong in `.claude/settings.json`; colocating two unrelated things under one name would be actively misleading to the next reader.
- **Auto-number accepted drafts into `decisions/NNNN-*.md`.** Rejected. Numbering is the act of acceptance. Automating it removes the only step that forces a person to read the thing.
- **Fold the script's tests into the existing `unit` Vitest project.** Rejected: `unit` runs in real Chromium because the components it covers touch browser APIs at mount. This is plain Node that reads the filesystem and parses transcripts — it needs no browser, should not pay browser startup, and a failure in it should read as a tooling failure rather than a component one. Added as a third project instead.
- **Write no tests and rely on the documented contract.** Rejected: the whole point is that this runs unattended, next to the decision record. "It does not commit" is a property worth failing a build over, not a comment someone can quietly edit away.

## Consequences

### Positive
- The reasoning behind a rejected alternative now has somewhere to land without anyone remembering to put it there.
- Drafts are evidence with turn numbers, so an ambiguous quote can be traced back to the transcript instead of reconstructed from memory.
- The propose-then-approve shape matches the repo's existing guardrails: the automated half proposes, a person accepts.
- Tuning is a contained, testable change — three phrase lists at the top of one script, with a `--check` mode that reports without writing.

### Negative
- **The harvester is a heuristic and will be wrong in both directions.** Tuned against real transcripts from this repo, but phrase matching cannot tell a decision from a sentence shaped like one. Expect to cut most of a draft; expect it to occasionally miss something. `SKILL.md` documents the tuning loop, and `--check` exists so tuning does not require generating files.
- **Two collisions were real, not hypothetical, and both were caught late.** A same-turn requirement linking prose to component edits found *zero* component decisions in a session that made 34 component edits — reasoning rarely shares a turn with the `Edit` call it explains, hence the ±2-turn window. And the backlog's own example of a component decision ("a prop is a literal union *instead of* a boolean") is phrased with the same words that mark a rejected alternative, so priority order alone left the component section permanently empty; `COMPONENT_API` is the exception that resolves it. Both are load-bearing and easy to undo by accident.
- **Nothing captures subagent reasoning.** Sidechain turns are skipped deliberately — a subagent's internal deliberation is not the session's decision record — but a decision made largely inside one will not be harvested.
- **The draft's diffstat is the working tree at harvest time, not a diff of the session's own edits.** At `SessionEnd` those coincide; run by hand against an older transcript they do not. Labelled in the draft rather than silently misleading, but it is a real limitation.
- One more moving part in `.claude/settings.json`, and the first Claude Code hook this repo has had. Both hooks fail silently and exit `0` by design — a broken harvester must never make session exit noisy or slow — which also means a broken harvester is quiet about being broken.

### Code review found six issues, all fixed the same day (2026-09-16)

A review of the branch before commit found six real defects — four of them in the harvester's own signal path, where being wrong is silent by construction. Each was reproduced before being fixed and is now pinned by a test.

- **A line break was not a sentence boundary.** Splitting only on `.!?` followed by a capital merged a bullet list into one run-on quote, and past the 600-character ceiling dropped it entirely. Reasoning is routinely written as bullets, and bullets routinely have no terminal punctuation — so a session full of decisions could harvest to nothing. Reproduced: three separate rejected alternatives written as three bullets came back as one 200-character quote. This was the worst of the six, because the failure mode is an empty draft that looks like a quiet session.
- **Only `Edit`/`Write` counted as edits.** A shell is a first-class way to edit files here, and this repo's own agent instructions prefer `sed`/heredocs in some modes. The priority-2 component section could therefore never fire, and the "session already wrote an ADR" suppression could be defeated by writing that ADR through a heredoc. Now also reads `NotebookEdit`/`MultiEdit`, and extracts path-like tokens from Bash commands that look like writes — a documented heuristic, with the filter on the command rather than the path so that reading an ADR does not register as authoring one.
- **`isComponentFile` matched `docs/components/`**, the generated doc twins, so a docs-only turn counted as component-adjacent and the draft listed generated files under "Components touched". Narrowed to the three real tiers.
- **`--harvest` was documented but never parsed** — anything that was not exactly `--check` fell through to writing, so a typo during the tuning loop (`--chek`) silently wrote a draft instead of reporting. An explicit mode is now required.
- **`.claude/` became tracked for the first time without ignoring `settings.local.json`**, which holds per-machine permission allowlists. `git add -A` would have swept them in.
- **This ADR and the roadmap row both pointed at a `docs/backlog.md` entry that no longer exists** — it was removed on completion, per that file's own protocol of holding only what is still open. Both now point at the roadmap session log, where the closed entry actually lives.

A seventh surfaced while verifying those fixes, and was not in the review: the new `scripts` Vitest project inherited the default Vite `cacheDir` instead of being given its own. `vitest.config.ts` already documents why each project needs a separate one — two projects writing a dep pre-bundle to the same `node_modules/.vite` corrupt each other's reads on a cold cache, which is what CI always starts from. The symptom was exactly the one that comment describes: one run with four unrelated test files failing to load, the next run clean. Fixed by giving it `node_modules/.vite/scripts`, then confirmed with two consecutive cold-cache runs. Worth noting as a governance point rather than a bug: the convention was written down, in the file being edited, and still got missed by adding a project that looked like it needed nothing special.

The first four share a shape worth naming: a harvester that under-collects fails silently, since an empty draft is indistinguishable from a session with nothing in it. That is an argument for the `--check` mode and for testing against real transcripts, not just synthetic turns — both of which were already in place, and neither of which caught these. Reading the code did.

## Related files

- `scripts/propose-decision.mjs` — the harvester, with the safety contract at the top
- `scripts/pending-decisions.mjs` — the `SessionStart` counterpart
- `scripts/propose-decision.test.mjs` — behaviour tests plus the safety-contract tests
- `.claude/settings.json` — the hook pair
- `vitest.config.ts` — the `scripts` project
- `decisions/proposed/README.md` — what the folder is and is not
- `contributor-skills/decision-proposal/SKILL.md` — the accept/reject bar, the rewrite, the tuning loop
- [`docs/roadmap.md`](../docs/roadmap.md) 2026-09-16 session log — where the closed backlog entry now lives, per `backlog.md`'s protocol of holding only what's still open
