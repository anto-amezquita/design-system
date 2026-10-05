# ThemeScope, Breadcrumb's label and the docs site URLs — specification

Closes the gaps found when `design-system-site` put both brands on one page (its `specs/2026-09-30-first-build.md` §9, items 9 and 10, logged in [`docs/backlog.md`](../docs/backlog.md) on 2026-10-01), and points the agent-facing files at the docs site, live at `https://design.amezquita.dk` since 2026-10-05. Target release: `1.3.0`, minor. Nothing here is breaking.

Built on `feat/theme-scope`, one commit per item.

---

## The items

| # | Backlog item | What ships |
|---|---|---|
| 1 | Switch the agent files' URLs to the docs site | `llms.txt`, `llms-full.txt`, the skill and the registry point at `https://design.amezquita.dk`, with doc twins at `/components/<slug>.md`. |
| 2 | Breadcrumb's `<nav>` label can't be changed | Breadcrumb takes `aria-label` (default `"Breadcrumb"`) and passes native attributes through, per [`0007`](../decisions/0007-universal-prop-passthrough-and-nesting-safe-z-index.md). |
| 3 | Overlays leave a brand scope | A new public component, `ThemeScope`, and an internal portal wrapper the five portalled overlays use. New ADR `0021`. |

---

## Item 1 — docs site URLs

**Today.** `build-llms-txt.mjs`, `build-skill.mjs` and `build-registry-manifests.mjs` read two links from `README.md`: `[amezquita.dk](…)` as the root (`/r/`, `tokens.json`, `llms-full.txt`), and `[Live component docs →](…)` as the base for doc twins (`<base>/<slug>.md`). Both point at the portfolio. The portfolio has redirected all of these paths to the docs site since 2026-10-05 (its `specs/2026-10-05-move-docs-to-design-site.md`), so they work, through two hops.

**Change.** The `Live component docs` link becomes `https://design.amezquita.dk`, and it is the root for everything agent-facing. Doc twins are `<root>/components/<slug>.md`, where the docs site serves them. The `[amezquita.dk](https://amezquita.dk)` link stays: it's the sentence saying the portfolio runs on this system, which is still true, and `llms.txt` repeats that sentence with the portfolio's URL, not the docs site's. The README's hand-written examples (`npx shadcn add …`, the registry link, the component list link) move to the docs site too.

Every manifest's `registryDependencies` then names `https://design.amezquita.dk/r/<slug>.json`. Installs no longer pass through the portfolio; the old URLs keep working through its redirects.

## Item 2 — Breadcrumb's label

Breadcrumb hardcodes `aria-label="Breadcrumb"` and takes only `className`. Two on one page are two landmarks with the same name (axe `landmark-unique`). NavigationMenu, SideNav and Pagination already take a label; Breadcrumb is the one left.

**Change**, following 0007: props become `Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> & BreadcrumbOwnProps`, `aria-label` defaults to `"Breadcrumb"`, the rest spread onto the `<nav>`, a ref reaches it, and `className` merges as it does now. A test renders two with different labels and checks axe passes `landmark-unique`, and that a ref and an `onKeyDown` reach the `<nav>`.

## Item 3 — ThemeScope

**The bug.** AlertDialog, BaseSheet (and so Dialog and Drawer), Menu, Tooltip and Select render through Radix's portal at the end of `<body>`. Opened inside `<div data-brand="portfolio">`, their content lands outside it and comes out in `base`. Mode has the same problem with no brand involved: content opened inside a `data-mode="dark"` region on a light page comes out light. The docs site's Themes page shows both.

**Why not portal into the region.** [`0007`](../decisions/0007-universal-prop-passthrough-and-nesting-safe-z-index.md) relies on every overlay mounting at the end of `<body>`, so mount order decides which is on top. Content portalled into a region would be caught in that region's stacking context and `overflow`. A `container` prop on each overlay has the same problem, and puts the fix at every call site.

**Change.**

- **`ThemeScope`**, a composition component. It renders an element with `data-brand` and `data-mode` when given (`brand?: 'portfolio'`, `mode?: 'light' | 'dark'`), passes native attributes through, and puts `{ brand, mode }` in a React context. A nested scope takes what it doesn't set from the one around it. A scope with neither prop is allowed and changes nothing.
- **An internal `ScopedPortal`** that the five overlays use in place of calling their Radix `Portal` directly. Inside a `ThemeScope`, it wraps the content in `<div data-brand data-mode style="display: contents">`. The content still mounts at the end of `<body>`, so 0007's layering is unchanged, and `display: contents` adds no box and no stacking context. Custom properties inherit through it, so `portfolio-scoped.css` and the base files apply as they do in the region. Outside a scope it adds nothing.
- **Toast stays page-level.** Its viewport renders where `ToastProvider` sits. A toast is about the app, not a panel, so it doesn't follow a scope.
- **What `ThemeScope` doesn't fix:** a region marked with a hand-written `data-brand` or `data-mode` still has the bug. The README's scoped-brand section presents `ThemeScope` as the way to scope, with the attribute as what it renders.

**Name.** `ThemeScope`, not `BrandScope`, because it scopes mode as well as brand, and a mode-only scope is a real case.

**Tests** (browser project, real cascade, as `lib/brand-scope.test.ts` does): for each of the five overlays, opened inside `<ThemeScope brand="portfolio" mode="dark">` on a light page, the content resolves the portfolio's dark `--color-accent-default`; opened outside any scope, base light. A nested scope inherits what it doesn't set. The existing nesting tests (`Select.nesting`, `Dialog.nesting` and the rest) pass unchanged, which is the check that 0007 still holds.

**Also:** stories (default, dark, nested, with a Menu open), the `docs/components.md` entry, and the count of public components going from 34 to 35 (composition 9 to 10) wherever it's stated. ADR `0021` records the decision.

---

## Done when

- `npm run validate` exits 0, and `npm run tokens && node scripts/check-generated-sync.mjs` passes.
- The governance audit is clean for the spec, the ADR and every count changed.
- A minor changeset describes all three items for consumers.
- Checked against the docs site before release: its Themes page on a packed tarball, with `ThemeScope` in place of the hand-written attributes, `check:themes` reporting the popover gap fixed, and its Breadcrumb workaround check firing.
