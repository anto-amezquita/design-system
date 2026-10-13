# 0017 — A standalone docs site, in its own repo, in the base theme

## Status

Accepted

## Context

The design system is only shown today as a page inside the portfolio. There it wears the portfolio skin, so a visitor never sees what a new consumer actually gets: the brand-agnostic `base` theme that 0001 split out. It also reads as one page of a personal site rather than as a product of its own.

The system now serves more than the portfolio (see 0015: Ajar, FinFam, the video reels project, the songwriting profile site). It needs a home that someone landing cold can understand, whether that is me starting a new project or someone reviewing my work.

### What Astryx does

I used one reference, Meta's Astryx (`astryx.atmeta.com`), read page by page on 2026-09-22:

- **Site frame:** one top bar (Docs, Components, Templates, Themes, Playground, plus Get started). Docs pages add a left sidebar and an on-page contents list. The site is built with Astryx's own components.
- **Landing page:** shows the system in use before showing parts: a product card, a chat, a checkout form, an inventory table and a revenue panel, all built from the library.
- **Docs:** Getting started (leads with a prompt to paste into an AI tool, then manual install), Guides, Foundations and Libraries. Each foundation page has a full token table with light and dark values, a code sample and a do/don't table.
- **Components:** an overview grouped by purpose, each card a small live render.
- **Templates:** 40+ full pages, each described by its shape rather than its name.
- **Themes:** the same sample screens re-rendered in each theme, with the model stated plainly: a default theme is built in, copy any theme into a file you own.
- **Changelog:** per-package notes split into breaking changes, features and fixes, with a codemod command for each breaking upgrade.
- **Playground, Community, Blog:** an in-browser editor, a contribution pipeline, and news.

Individual component pages and the playground render in the browser and did not come through when read, so their structure is not recorded here.

## Decision

**Extract the design-system docs from the portfolio completely.** The docs pages are removed from the portfolio repo, not kept as a second home.

**The docs site gets its own repo, and a subdomain (e.g. `design.amezquita.dk`) points to its deployment.** It renders the `base` theme unskinned.

**The site is a consumer, not part of the library.** It installs `@amezquita/design-system` from npm like any other project, so it shows exactly what a new consumer gets, and it is the first place a broken or awkward release shows up. It documents only what is published.

**Built with the system's own components.** That is what makes it proof rather than description, and it is why this comes **after 0015**: the site frame needs `Link`, `SkipLink`, `NavigationMenu` and `SideNav`.

**First wave:**

| Section | What it does |
|---|---|
| Landing | One composite screen built from the existing components, before any list of parts. |
| Getting started | Install and first component, with a paste-into-your-AI-tool prompt first, as Astryx does. |
| Foundations | Token tables generated from `tokens/token-reference.json`, so they cannot drift from the code. Light/dark values where they apply, plus do/don't guidance. |
| Components | Grouped by our three tiers (primitives, composition, patterns), each with a live render. |
| Themes | `base` and `portfolio` side by side on the same sample screen. This is where 0001's split is easiest to see. |
| Changelog | Built from the package's changelog, including the releases before it. The 0016 major is the first release the site announces. |
| Working with AI | Built on `llms.txt`, `llms-full.txt` and `AGENTS.md`. |

**Later:**

- **Templates:** three or four, matched to real consumers (app shell, login, settings, content-site hero). Not a catalog.
- **Decisions:** the ADRs in this folder, published. Astryx's site has no equivalent.

**Skipped:** Playground (link to the published Storybook instead), Community and Blog (no contributors or news to support them).

**The new repo starts from the `ai-product-starter-kit` template**, like my other projects, so it has the same `docs/`, `decisions/`, `specs/`, `skills/` and `AGENTS.md` structure. The kit's kickoff stages that this entry already answers (idea, product direction, brand: the unskinned `base` theme) are recorded as answered, not reopened. Framework and hosting are decided in the kit's technical-direction stage and recorded in the new repo's own `decisions/`, not here.

## Alternatives considered

- **Keep the page inside the portfolio.** Rejected: it can only show the portfolio skin, which is the opposite of what a new consumer gets, and it ties the system's home to a personal site.
- **A folder in this repo.** Rejected: it would import components from source and hide problems a real consumer hits after `npm install`. It would also pull a site's framework, content and deploy setup into `validate`, Chromatic and `AGENTS.md`.
- **Use Storybook as the public docs site.** Rejected as the front door: it documents components one at a time and can't show the system in use or the theme split. It stays as the component workbench the site links to.
- **Research several systems' sites before deciding.** Rejected: one well-made reference was enough to set the structure. Astryx covers the sections that matter.
- **Match Astryx's full scope (40+ templates, playground, community).** Rejected: sized for a large team and many contributors, not one maintainer.
- **Build the site before 0015.** Rejected: it would need its own navigation, which is exactly the component set 0015 adds. It would either be hand-built or be rebuilt later.

## Consequences

### Positive
- A visitor sees the actual default, not my brand on top of it.
- The site tests every release the way a consumer would.
- This repo stays a library: no site code, content or deploy config in it.
- The site is the first real consumer of the 0015 navigation components and will surface problems with them early.
- Foundations and changelog come from files the package ships, so they stay current without separate upkeep.

### Negative
- A third repo to maintain, alongside this one and the portfolio, with its own hosting and deploys.
- The site can't show unreleased work. If a preview is ever needed, a prerelease tag covers it.
- `package.json` `files` must grow to ship what the site builds from and doesn't get today: `llms.txt`, `llms-full.txt`, `AGENTS.md`, `CHANGELOG.md` and `decisions/`. `token-reference.json` and `tokens/changelog.json` already ship.
- The portfolio's existing design-system URL needs a redirect to the subdomain, or links to it break.
- The agent skill served at `/.well-known/skills/` (`docs/architecture.md` §8) is deployed from the portfolio today and moves to the subdomain with the rest.
- Blocked on 0015 and, for the first release the changelog announces, on 0016.
- Templates are deferred, so for now the landing composite is the only place the system is shown working as a whole.

## Amendment (2026-10-07): the site gets its own brand; the previews stay in base

Shipped as decided, the site looks like what it is: the unskinned `base` theme, top to bottom. That proves the default, but it reads as a template rather than a product, and nothing on the page belongs only to this system. Astryx, Stripe and Material all carry a strong identity of their own while documenting something themeable.

**Decision:** the site frame (top bar, side nav, landing hero, headings and prose) wears a third brand, defined in this repo under `tokens/brands/` like `base` and `portfolio`. Its name and values come out of the redesign (Claude Design for direction, Figma for the docs templates), not out of this entry. Everything that shows a component (the Components cards, the landing composite, the Foundations samples) stays in `base`, so the original promise holds: what you see in a preview is what `npm install` gives you.

The tokens stay the single source. The site defines no colours, type or spacing of its own; Figma variables are generated from the same files.

**What this needs from the library:**

- A scoped CSS file for the new brand, as `portfolio-scoped.css` does for portfolio ([`0001`](0001-white-label-base-portfolio-brand-split.md), 2026-10-01 amendment). `npm run tokens` then adds it to `ThemeBrand`, so `ThemeScope` accepts it with no hand edit.
- No `base` scope. The page stays `base` on `:root`, and the brand goes only on the frame's parts with `ThemeScope`: top bar, side nav, hero, headings, prose, section backgrounds, and the frames and labels around each preview. The previews sit outside those scopes, so they render in `base` with nothing to undo. The 0001 amendment's rejection of a `[data-brand="base"]` scope stands.

  Considered: brand the whole page and add a `[data-brand="base"]` scope to switch previews back. More layout freedom, but it is a library change for a case this approach avoids. Also considered: letting the previews take the site brand, for cohesion. Rejected: it breaks the promise above. Cohesion comes from the setting around each component, the way Material's site keeps its demos neutral and brands the page around them.

  The constraint this accepts: a preview can't sit inside a branded element. Where a preview's card is branded, the card's frame and the preview area are siblings, not parent and child. The Day 4 templates are drawn to that rule.
- The new brand ships in one minor release under [`0022`](0022-release-at-most-weekly.md).

**Update (2026-10-13):** the site brand became `demo-cool`, one of three demo brands ([`0023`](0023-demo-brands-and-n-brand-build.md)). One exception to "everything that shows a component stays in `base`": the landing hero shows one real Card under a brand switch (`demo-cool`, `demo-warm`, `demo-soft`), labelled with each brand's name, because its job is to show the same components in different brands. Component previews elsewhere stay in `base`.

**Unchanged:** the site is still a consumer installing from npm, still built with the system's own components, and the Themes page still shows `base` and `portfolio` side by side, now with the site brand as a third, real example of the split.

## Related files

- `decisions/0001-white-label-base-portfolio-brand-split.md` — the base/portfolio split the Themes page demonstrates
- `decisions/0015-navigation-components-core-set.md` — the components the site frame is built from
- `decisions/0016-functional-button-default-expressive-opt-in.md` — the major release that opens the changelog
- `ai-product-starter-kit` (separate repo) — the template the docs-site repo starts from
- `package.json` — the `files` list that decides what the site can read from the package
- `tokens/token-reference.json` — source for the Foundations tables
- `tokens/brands/base`, `tokens/brands/portfolio` — the two themes shown side by side
- `CHANGELOG.md` — source for the Changelog page
- `llms.txt`, `llms-full.txt`, `AGENTS.md` — source for Working with AI
