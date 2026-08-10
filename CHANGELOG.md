# @amezquita/design-system

## 0.1.4

### Patch Changes

- 531f6bd: Ship the token artifacts with the package.

  `tokens/` is now included in `files`, so consumers and coding agents get the DTCG token source (`$value` / `$type`), the resolved token reference, and the component registry on install — previously these existed only in the repo and reached nobody who installed the package.

  First step of the AI-readiness roadmap (`docs/ai-readiness-plan.md`, Task 1.0).

## 0.1.3

### Patch Changes

- 82a353c: fix: convert remaining internal @/ imports to relative paths

## 0.1.2

### Patch Changes

- 475e59a: fix: resolve internal @/ imports to relative paths in Button, EmptyState

## 0.1.1

### Patch Changes

- 1e89f3e: Verify npm trusted publishing pipeline end-to-end
