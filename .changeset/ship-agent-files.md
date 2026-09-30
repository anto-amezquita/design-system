---
"@amezquita/design-system": patch
---

Ship the agent-facing files in the package: `tokens.json`, `skills/` (the agent skill and its `index.json`), `registry/` (the shadcn-spec registry manifests) and `docs/components/` (the per-component Markdown docs). The docs site (`design-system-site`) generates its `/.well-known/skills/`, registry and doc pages from the installed package at build time, instead of from hand-copied files. The URLs inside these files still point at amezquita.dk and move when the docs site's subdomain is live.

Fix: the shadcn registry's `cssVars` now carry the `base` theme. They were resolved from the portfolio brand, so `npx shadcn add` installed the portfolio's colours instead of the brand-neutral default every consumer is meant to start from. Anyone who installed components through the registry and relied on those colours should import the portfolio brand CSS or set their own values. Consumers who install the npm package and import the brand CSS are unaffected.
