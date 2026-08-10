---
"@amezquita/design-system": patch
---

Ship the token artifacts with the package.

`tokens/` is now included in `files`, so consumers and coding agents get the DTCG token source (`$value` / `$type`), the resolved token reference, and the component registry on install — previously these existed only in the repo and reached nobody who installed the package.

First step of the AI-readiness roadmap (`docs/ai-readiness-plan.md`, Task 1.0).
