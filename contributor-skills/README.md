# Contributor skills

Workflows for whoever (human or AI agent) is *developing* this design system — different from `skills/amezquita-design-system/`, which is the generated, consumer-facing skill for people *building with* the package. `npm run tokens` regenerates that one; nothing here is generated, and nothing here is touched by the build.

Adopted from the ai-product-starter-kit's `/skills` convention, renamed to `/contributor-skills` here specifically to avoid collision with the generated `skills/` folder (see `AGENTS.md`'s "Repeatable workflows" line, and the 2026-09-02 entry in `docs/ai-readiness-plan.md`'s session log for the full reasoning).

## Available skills

- `design-system/SKILL.md` — deciding whether something is a token, component, pattern, or one-off; reviewing tokens/components/patterns for consistency
- `token-audit/SKILL.md` — the repeatable technique for auditing component CSS against the token system (used for the 2026-09-02 duration and line-height audits)

Use the relevant skill when the task matches. Read `AGENTS.md` first regardless — it's the router.
