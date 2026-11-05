# Platform readiness — spec

Status: Proposed
Date: 2026-11-05
Scope: how the package is shipped, versioned and contributed to, so other teams can depend on it. Separate from `specs/ecommerce-coverage.md`; only P0 below is a prerequisite for the commerce layer.

## What I checked (2026-11-05)

Everything below was read from the repo and its consumers on this date, not assumed:

- `package.json` (v1.6.7) has no `exports`, `main` or `types` field. `files` ships raw source: `components`, `lib`, `hooks`, plus tokens, styles, registry and agent docs.
- Components import their own CSS (`import './Button.css'`), and 72 files start with `'use client'`.
- All four consumers deep-import by folder path:
  - **Ajar:** `components/primitives/Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `components/composition/Dialog`, `AlertDialog`, and `styles/brands/*.css`.
  - **FinFam:** `Button`, `Select`, `Input`, `Checkbox`, `Badge`, `components/patterns/Table`, `components/composition/Card`, `styles/brands/base-light.css`, **and `components/primitives/Input/Input.css` directly**.
  - **portfolio:** `Button`, `Textarea`, `Tag`, `Switch`, `components/patterns/DataTable`, `components/composition/BaseSheet` (internal), `styles/brands/*.css`, `tokens/token-reference.json`, `tokens/component-registry.json`.
  - **design-system-site:** `Link`, `Heading`, `Button`, `Text`, `Input`, `Badge`, `Avatar`, `components/patterns/Table`, `Tabs`, `SideNav`, `styles/brands/*.css`, and more.
- `README.md` documents the deep-path imports, so other consumers are likely to use them too.
- `scripts/check-consumer-types.mjs` exists because shipping raw source already broke a consumer: FinFam failed on 1.6.3 when components used `process.env.NODE_ENV` and FinFam's TypeScript had no Node types.
- No bundle-size check in any workflow, no `CONTRIBUTING.md`, no written deprecation policy. ADR 0022 sets weekly releases.
- An MCP server exists (`scripts/mcp-server.mjs`).
- Six CSS files use physical `left`/`right`: Tabs, NavigationMenu, Drawer, Toast, Dialog, SkipLink.

---

## P0 — Public API and compiled build (prerequisite for commerce)

### Problem

Without an exports map, every file in the package is public. Any refactor can break an app that imports it directly, and the portfolio already reaches into an internal component (BaseSheet) and FinFam into a component's CSS file. Shipping raw source means every app compiles the system with its own settings, which caused the 1.6.3 FinFam break and is why the portfolio needs `transpilePackages`. And the commerce decision (`@amezquita/design-system/commerce`) is an exports entry, so it needs an exports map to exist.

### What it should do

1. **Compiled output.** Ship ESM JavaScript plus `.d.ts` type declarations, built by the package, so apps don't compile its source. Keep the `'use client'` directives in the compiled files so server-component apps keep working.
2. **An explicit `exports` map** listing what is public:
   - one entry per public component (the shape is an open question below);
   - `./styles/*` for brand CSS and the reset;
   - `./tokens/*` for the token and registry JSON files that apps already read;
   - `./commerce`, reserved for the commerce layer;
   - the agent-facing files (llms.txt, registry, skills) wherever they're consumed today.
   Internal components (BaseSheet and any other internal-only ones in the registry) are not exported.
3. **CSS that works without special bundler setup.** Components import their own CSS today. The ADR chooses how the compiled build ships it: kept as per-component CSS imports, or one stylesheet plus per-component files. Either way `sideEffects` in `package.json` must list CSS, so bundlers don't drop styles while tree-shaking.
4. **Existing import paths keep working for one major cycle.** Every path the four consumers use today (listed above) stays in the exports map as a compatibility entry, marked deprecated in the docs. FinFam's `Input/Input.css` import is the one exception to decide on explicitly: keep it, or replace it with a supported path.
5. **A codemod** that rewrites the old deep paths to the new entries, so moving each app is one command.
6. **Agent artifacts follow.** `llms.txt`, `llms-full.txt`, the component `.md` twins, the shadcn registry, the agent skill, `AGENTS.md` and `README.md` all show the new import paths, generated from the same source.

### How to verify it

- `npm pack` the build, and install the tarball into a throwaway copy of each consumer (Ajar, FinFam, portfolio, design-system-site). Each must type-check and build with no code changes, using the compatibility entries. Never commit to the consumer repos.
- Then run the codemod on each throwaway copy, and it must still type-check and build.
- The portfolio must build **without** `transpilePackages` for the package.
- `typecheck:consumer` keeps passing, and is extended to test the compiled output the way an app consumes it.
- Chromatic shows no visual change.

### Semantics

Adding an exports map blocks every path that isn't listed, so this is a **major** release even though the four known apps keep working. It needs its own ADR, Proposed until I approve it, and a migration note in the changeset.

### Open questions for the ADR

- One root entry (`import { Button } from '@amezquita/design-system'`), per-component entries, or both. Per-component entries are kinder to bundle size; a root entry is easier to use. If both, the root must not pull in the whole library.
- The build tool. Prefer something already in the repo, or the smallest addition that does ESM plus declarations plus `'use client'` preservation.
- The CSS strategy in point 3.

---

## P1 — Needed once other people depend on it

1. **Deprecation and versioning policy.** A decision record that says what counts as a breaking change (props, tokens, CSS class names, DOM structure that tests rely on, exported paths), how something gets deprecated (a docs label, a dev-only console warning, a changelog entry), how long it lives after deprecation (at least one major version), and how that fits the weekly release cadence in ADR 0022.
2. **Codemods for every breaking change.** A `codemods/` folder with one script per major version, starting with the P0 import-path codemod. Each major's changeset links to its codemod.
3. **Bundle-size checks in CI** for the whole package, not just commerce: a budget per public entry, failing the PR when it's exceeded and showing the size change in the PR.
4. **`CONTRIBUTING.md`.** How to propose a component (an issue plus a spec), the done bar (pointing to the existing process: WAI-ARIA research, tests across five brands, stories, docs, changeset, validate), how ADRs are proposed and accepted, and who approves.
5. **Usage tracking.** A script that scans the known consumer repos and reports which components, props and import paths they use. Run it before any deprecation, so changes rest on evidence instead of guesses. It reads only; it never edits a consumer.

## P2 — Wider reach, not urgent

1. **Density modes.** A compact and a comfortable density set through tokens, so one system serves both back-office tools and the shop. Needs its own ADR on whether density is a brand-level or page-level choice.
2. **Logical CSS properties.** Switch the six files above from `left`/`right` to logical properties (`inset-inline-start`, `margin-inline` and so on), and add a lint rule so new ones don't appear. This makes right-to-left languages possible later. Cheap, but low priority: none of the current markets need it.
3. **Other frameworks.** The tokens already work in any framework. Write a short, documented option for a Web Components layer that would let Vue and Nuxt apps use the components. Don't build it until a real non-React consumer asks.

---

## Order

1. **P0** before the commerce layer starts.
2. **P1** points 1 and 2 (deprecation policy and codemods) together with P0, since P0 is the first breaking change they govern.
3. **P1** points 3 to 5 alongside commerce wave C1.
4. **P2** when a real need appears.

## Rejected

- **Keeping raw-source shipping.** It already broke a consumer (FinFam, 1.6.3), forces `transpilePackages`, and makes every file public.
- **Adding an exports map without compatibility entries.** It would break all four known apps on upgrade.
- **Building a Web Components layer now.** Large, with no current consumer asking for it.
