---
name: governance-audit
description: Use before committing any change to AGENTS.md, docs/architecture.md, docs/quality.md, or a new/edited ADR or spec — checks the repo's governance docs for cross-file contradictions, dead pointers, and stale counts that npm run validate can't catch because they're inconsistencies between documents, not code.
---

# Governance audit

`npm run validate` checks code against docs (lint, contrast, types, story coverage). It cannot check docs against *other docs* — a claim in `AGENTS.md` that contradicts `docs/architecture.md`, or a "see X" pointer to a file that doesn't say what it's cited for, passes every existing check and still misleads the next agent that reads it.

**Origin:** the 2026-09-02 governance pass that created `/decisions`, `/specs`, `docs/architecture.md`, and `docs/quality.md` shipped 5 real self-contradictions in one sitting — a "four-tier" claim contradicting the same file's own "three-tier" claim two sections later, a repo-structure map pointing at a folder that doesn't exist, two files undercounting the lint rules by one against their own rule table, a stale file count carried from an old transcript without re-verifying, and a misdirected cross-reference. None of these were caught by `npm run validate`; all were caught by a manual read-through afterward. This skill is that read-through, made repeatable.

## When to use this

- Before committing any edit to `AGENTS.md` (or its symlink `CLAUDE.md`), `docs/architecture.md`, or `docs/quality.md`.
- Before committing a new ADR (`/decisions`) or a new/edited spec (`/specs`).
- Before committing a new `contributor-skills/*/SKILL.md`.
- After any of the above touches a number that's also stated elsewhere (component count, lint rule count, token count, tier count) — the exact failure mode that caused today's bugs.

## Workflow

1. **Read every governance file fresh, not from memory of having just written it.** `AGENTS.md`, `docs/architecture.md`, `docs/quality.md`, and any touched ADR/spec/skill. Writing and auditing in the same mental pass is how self-contradictions survive — the writer's own framing masks them on re-read. If possible, re-read after a context switch (a different task, or a fresh read tool call) rather than immediately after writing.

2. **Cross-check every count claim against its real source, not against another doc's claim.** Component counts, lint rule counts, token counts, tier counts. The source is code or a generated artifact (`tokens/component-registry.json`, `scripts/lint-tokens.mjs`'s own rule list, a live `search_files`/`list_directory` call) — never another markdown file, since that's exactly how a wrong number propagates. If two docs state the same count, verify both against the source independently rather than assuming agreement means correctness.

3. **Verify every relative link resolves from where the file actually sits.** A link written as `./foo.md` is only correct if `foo.md` is in the same directory as the file containing the link — moving either file breaks it silently (no build step checks markdown links in this repo). Check path depth explicitly: count directory levels between the linking file and its target, don't eyeball it.

4. **Verify every "see X" / "explained in X" pointer actually contains what it's cited for.** Don't just check the file exists — open it and confirm the specific claim is actually there. A pointer to a real file that doesn't discuss the cited thing is as misleading as a dead link, and easier to miss.

5. **Check for the specific contradiction shape that's bitten this repo before:** the same fact stated in two places with a different number, name, or path. Search for the term being changed (a count, a folder name, a rule name) across all governance files, not just the file being edited — a fix in one place that doesn't propagate is a new inconsistency, not a completed fix.

6. **Verify new folder/file structure claims against the live filesystem**, not against intent. If a doc says "workflow skills live in X," confirm X is where they actually are right now — plans change mid-session and the doc can lag the actual decision by one edit.

7. **Re-run `npm run validate` after any fix** — governance-doc edits are usually docs-only and shouldn't change validate's output, so a changed result means something else broke.

## What this skill does NOT replace

- `npm run validate` — still required, still the code-level gate (`docs/quality.md`).
- Code review of the substance of a decision — this skill catches *inconsistency*, not *wrongness*. A cleanly cross-referenced ADR can still be a bad decision.
- The [`token-audit`](../token-audit/SKILL.md) skill, which is scoped to component CSS against the token system, not governance docs.

## Final review checklist

- Does every count in the changed file(s) match its real source, independently verified?
- Does every relative link resolve from the file's actual location?
- Does every "see X" pointer's target actually contain the cited claim?
- Was the same fact (count, path, rule name) checked everywhere else it's stated, not just where it was changed?
- Does the changed file's structural claims (folder locations, what generates what) match the live filesystem right now?
- Does `npm run validate` still pass after any fixes?
