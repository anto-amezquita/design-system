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

## Human-facing docs site (backlog)

Opened 2026-09-01, outside the six roadmap phases. Not a priority, not scheduled — recorded so the idea isn't lost. Spec'd in [`specs/docs-site-spec.md`](../specs/docs-site-spec.md).

Full rationale (why Storybook and the MCP server don't cover this audience) lives in the spec itself, not repeated here. Portfolio already has a single `/design-system` overview page (case-study style, see the Aug 12 entry in `roadmap.md`'s session log for its known staleness issue) — the sketch is a proper four-section site built on the same generated artifacts the MCP server and Storybook already read, so it can't drift out of sync with them.

Status: spec only, not started.

## Token architecture backlog

Opened 2026-08-10, outside the six roadmap phases. **Substantially reworked since by [`decisions/0004`](../decisions/0004-add-semantic-roles-collapse-component-tokens.md) — read that ADR before treating the numbers below as current.**

Original `npm run tokens:audit` figures (2026-08-10), of 405 component tokens:

| Class | Count | Verdict |
|---|---|---|
| Pass-through to a semantic token, identical in all 4 modes | 196 | Collapse candidate |
| Chain-skip to a primitive, identical in all 4 modes | 164 | Collapse candidate + tier violation |
| Literal (no reference) | 37 | Keep — component-specific geometry and motion |
| Resolves differently from its referent somewhere | 8 | Keep — the only theming work in the tier |

Status of each item, in the original priority order:

1. ~~**Bold-brand visual coverage.**~~ Resolved 2026-09-02 — the bold expression axis was removed outright as part of the base/portfolio token-architecture split. Moot. The new `base-light`/`base-dark` theme is unvisited by Chromatic the same way bold was — worth a follow-up if base ships somewhere real, but that's a coverage question, not a token-collapse one.
2. ~~**The four dark-bold divergences.**~~ Moot as of the same 2026-09-02 bold removal — no bold variant is left for a component token to diverge against. No longer tracked here.
3. **Stop the growth, which is free — still open.** A `tokens:lint` rule enforcing "new component token must be literal, or resolve differently from its referent in at least one mode" was recommended here but never shipped, and `decisions/0004` doesn't add one either. Still the cheapest item on this list, and it prevents the next 360-token situation from accruing the same way this one did.
4. **Collapse opportunistically — chain-skips mostly done, pass-throughs not started.** `decisions/0004` ran five rounds against the 164 chain-skip candidates: 74 remain (90 collapsed into 9 new semantic roles, deliberately gated by a 3-or-more-shared-function bar — read the ADR before assuming the remaining 74 are an oversight; most were checked and correctly left as literals). It also fixed two real bugs found along the way (`font-weight-label` pointing at the wrong value; Checkbox/Radio/Input/Select skipping the semantic border-width layer that Button/Textarea already used). **The 196 pass-through candidates are untouched** — 0004's scope is chain-skips specifically; nothing in it addresses pass-throughs. Run `npm run tokens:audit` for a current split before picking this back up — the 196/164 numbers above are stale (2026-08-10).
