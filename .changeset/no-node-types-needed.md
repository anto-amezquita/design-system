---
"@amezquita/design-system": patch
---

Projects on TypeScript 6 or later no longer need `@types/node` to compile the components. Thirteen files used `process.env.NODE_ENV` for development-only warnings, which TypeScript 6 can't type without Node's types, because it no longer includes every `@types` package by default. Each file now declares the one field it reads, scoped to that file, so it never clashes with `@types/node` where a project has it. Bundlers still replace `process.env.NODE_ENV`, so the warnings stay out of production builds.
