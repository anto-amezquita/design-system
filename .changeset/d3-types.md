---
"@amezquita/design-system": patch
---

Chart's types reach consumers: `@types/d3-scale` and `@types/d3-shape` move from devDependencies to dependencies. The package ships Chart's TypeScript source, which imports `d3-scale` and `d3-shape`, so a consumer's strict typecheck (`noImplicitAny`) failed on Chart in 1.6.0 unless it installed the types itself. Checked by installing the packed package into the docs site without its own copies: `tsc --noEmit` passes.
