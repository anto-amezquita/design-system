I want you to build wave C1 ("find") of the commerce layer from `specs/ecommerce-coverage.md`, working as autonomously as you can. It starts with a platform prerequisite from `specs/platform-readiness.md`. Read both specs in full first, including Parts B to B4 of the commerce spec. If either isn't in `specs/` yet, stop and ask me for it.

I care more about this being robust than fast. Don't cut corners to finish sooner. If doing something properly takes longer, take longer.

## Decisions already made (don't reopen them)

- Commerce ships as a subpath export, `@amezquita/design-system/commerce`. Same package, one version, one token set, one release.
- Commerce components take plain props, with no Shopify, commercetools or other backend types. Money is `{ amount, currency }` in minor units. Mapping backend data to props is the consuming app's job.
- Page templates are docs-site demos only, never package exports. They are not part of C1.
- The demo store reuses the demo-warm brand and has a fictional name. Never use a real retailer's name or branding.

## What C1 covers

Price, ProductCard, Swatch/SwatchGroup, ProductBadge, StockStatus, FilterPanel, AppliedFilters, SortSelect, ProductGrid, SearchAutocomplete, MegaMenu, MobileCategoryNav.

Before C1, two core prerequisites from the spec's Part B2a: an overlay coordinator and a shared announcer. The demo stories wire state the way Part B4 describes.

Acceptance criteria for every component:
- the UX rules for it in the spec's Part A;
- the cross-cutting patterns in Part B, including the legal rules;
- all eight engineering requirements in Part B2: dual-mode state, a commerce-specific filter shape, URL-friendly, server rendering, crawlable links, no built-in English text, performance, and failure states.

Two of those are easy to get wrong, so to be explicit:
- For FilterPanel, AppliedFilters, SortSelect and ProductGrid pagination, the docs and the first story show controlled mode wired to URL state as the main example. Uncontrolled mode is labelled as for prototypes and demos.
- Commerce filters reuse DataTable's pattern (dual mode, `filters`/`onFiltersChange` naming, `useUncontrolledValue`), not its data shape. Define a commerce filter shape that supports several values per filter and ranges. FilterPanel never filters data itself; it reports changes and shows counts passed in by the app. Don't change DataTable's shape for commerce.

## The system's rules come first

Before building, read `AGENTS.md`, the `decisions/` folder and the token architecture docs. Follow them as written. They decide how things are done here, ahead of your defaults or general best practice. In particular:

- `component-registry.json` is the source of truth for what exists, not the spec or your memory. Check every "builds on" name in the spec against it, and adjust where a name differs.
- Read a core component's source before you rely on it or claim it has a gap.
- Components consume semantic tokens only. No chain-skips to primitives, no hardcoded values, no new tokens where an existing role fits.
- Props use literal unions, not loose strings or booleans, matching the existing components.

## No one-off solutions

Everything you build should be reusable across all five brands and any shop, not shaped around this one demo.

- Compose from core components. Don't copy or re-implement their behaviour inside a commerce component.
- If a core component can't do what a commerce component needs, fix it in core properly: general enough that any consumer benefits, with its own tests, stories, docs and changeset. Never work around it locally, and never add a commerce-specific prop to a core component.
- New token roles must be general semantic roles that pass the closed-vocabulary rules in `decisions/`, not one-component tokens.
- If you catch yourself special-casing a brand, a component or a piece of demo content, stop and find the general version.

## Suggest changes instead of quietly diverging

When you think a DS rule, an existing decision or the spec itself should change, don't break the rule and don't sit on it.

- Write a decision entry in `decisions/` with status **Proposed**. Include the problem, your recommendation, the rejected alternatives and why.
- Keep building under the current rule where you can. Where the proposal blocks the work, build the parts that don't depend on it first.
- List every proposal in your report.

## Order of work

1. **Branch** from current `main`.
2. **Platform P0, then stop.** Read `specs/platform-readiness.md` in full and do its P0 (public API and compiled build) plus P1 points 1 and 2 (deprecation policy and codemods) first, since the commerce subpath export depends on an exports map existing.
   - Write the ADRs with status **Proposed**.
   - Verify exactly as the spec's "How to verify it" says: pack the build, install it into throwaway copies of Ajar, FinFam, portfolio and design-system-site in `~/Documents/github`, and show each one type-checks and builds unchanged, then again after the codemod. Never commit to those repos.
   - Run the independent review below on it, open the PR, and stop for my review. This is a major release that every app depends on, so I approve it before anything is built on top.
3. **Legal check.** Read Article 6a of Directive 98/6/EC on EUR-Lex (the link is in the spec's sources) and look for Denmark's implementation. Compare both with the spec's summary in Part B. If they differ, update the spec in your PR and tell me. Don't give legal advice in the docs; describe what the component supports.
4. **Fixtures.** Build the shared fixture set from Part B3 before any component, in a place every commerce test and story can use. Every component's tests and stories must use it, including the hostile cases.
5. **Decision records.** Write one entry for the commerce subpath export and the plain-props data contract, with status **Accepted** (I've already decided these). Write entries for any new token roles with status **Proposed**. Propose each component's bundle-size budget in its first PR, and wire the check into CI.
6. **Core prerequisites.** Build the overlay coordinator and the shared announcer described in the spec's Part B2a, in core, each with its own decision record (status **Proposed**), tests, stories, docs and changeset. For the coordinator:
   - read how Radix's dismissable layers already behave before designing anything, and build on that rather than against it;
   - register every core overlay listed in the spec, after checking the list against the registry;
   - test the hard cases: an overlay opened by code while a hover menu is open, a Select inside a Drawer, Escape with three layers open, and closing everything at once.

   If existing consumers can't get the new behaviour without changing their code, stop and ask me; that's a breaking change. For the announcer, audit the existing live regions and list them in a Proposed migration plan, but don't migrate them in C1.
7. **Price, then stop.** Build Price fully, using the shared announcer. Run the independent review below on the prerequisites and Price, open the PRs, and stop for my review. The prerequisites change every overlay and Price sets the pattern for every commerce component, so I want to approve both before the rest is built.
8. **After I approve,** build the rest of C1 without stopping, in whatever order the dependencies suggest. Every component that opens an overlay registers with the coordinator, and every announcement goes through the shared announcer.

## For every component, my usual process

- Research the relevant WAI-ARIA pattern first.
- Use brand-token CSS only (the token linter must pass).
- Write Vitest browser tests using the shared fixtures, including:
  - the cross-brand contrast check across all five brands (base, portfolio, demo-cool, demo-warm, demo-soft) in light and dark;
  - a server-render test that renders the component to a string and hydrates it without mismatch warnings;
  - state tests for both modes: uncontrolled by default, and controlled through `value`/`onChange`, matching how `Input` and `Select` use `useUncontrolledValue`;
  - for the URL-state components, a test that restores the full state from a controlled value, standing in for back, refresh or a shared link.
- Write Storybook stories with dark-mode variants and axe checks, covering the hostile fixtures as well as the happy path. Stories are agent exemplars, so make them show correct usage.
- Add a docs `.md` entry with Do/Don't guidance that cites the spec's UX rules. Where it matters, add a short note on what the app must supply, such as URL state, structured data or a prior price.
- Add a changeset.
- Take screenshots across all five brands in light and dark, plus a narrow mobile width, and check them yourself.
- Run `npm run tokens && npm run validate` and show it fully green.

## Independent review

You can't grade your own work. Before opening each PR, start a separate reviewer subagent that hasn't seen your build. Give it only:
- the spec;
- the DS rules files;
- the diff.

Ask it to check the diff against every applicable UX rule, Part B2 requirement and DS rule, and to list anything that fails or is missing. Fix what it finds, or explain in the PR why you disagree. Put its findings and your responses in the PR description.

## Accessibility rules that apply across C1

- Never use colour alone for meaning: swatches have text names, and stock status has an icon or text.
- Price is announced as "was X, now Y" to screen readers, never as two bare numbers.
- Filter changes and result counts are announced through the shared announcer.
- Format money with `Intl.NumberFormat` per locale, inside Price only. No other component formats money.
- Under the European Accessibility Act this bar has legal weight, so no component ships with a known accessibility gap.

## How to run on your own

- Commit in small, reviewable steps and open pull requests. Group them however keeps each one reviewable.
- Never commit `tokens/changelog.json`; it's bot-owned.
- Quote generated artifacts for any counts or stats, never memory.
- Verify before you call anything done: green validate, passing tests, a completed independent review, and screenshots you've looked at.

## Only stop and ask for these

- A spec is missing.
- After platform P0, for my review.
- After the core prerequisites and Price, for my review.
- Anything that can't be undone or reaches outside the repo: publishing to npm, merging to `main`, deleting files you didn't create.
- A breaking change to a core component's public API.
- Something in the spec conflicts with the code or the DS rules in a way you can't resolve with a Proposed decision.

## When you finish C1

Also do platform-readiness P1 points 3 to 5 (whole-package bundle-size checks, `CONTRIBUTING.md`, usage tracking) alongside C1, each in its own PR.

Give me a short report with:
- what shipped, with links to the PRs;
- every change you made to core, and why;
- every Proposed decision, one line each;
- what the legal check found;
- the bundle-size budgets and current sizes;
- anything the reviewer subagent raised that you didn't fix, and why;
- anything you skipped or left open, and why.

Leave the five-person usability check from Part B3 to me. List the tasks you'd suggest testing on the demo stories.
