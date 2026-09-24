---
"@amezquita/design-system": patch
---

The package now ships its agent and reference docs alongside the code: `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CHANGELOG.md`, and the ADRs in `decisions/*.md` (`decisions/0017`). An agent working in a consumer project can read them from `node_modules/@amezquita/design-system/`, and the docs site builds its Changelog, Working with AI and Decisions pages from the published package instead of from this repo. No code or token changes.
