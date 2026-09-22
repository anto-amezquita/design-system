# 0015 — A core set of five navigation components

## Status

Accepted

## Context

This system is meant to power every project I build, not only amezquita.dk: Ajar, FinFam, the video reels project, the portfolio, and a songwriting profile site that doesn't exist yet. That is a mix of app-style products and content sites.

Navigation coverage today is the "inside a page" kind: Breadcrumb, Pagination and Tabs, plus Drawer as a container that can hold secondary navigation. There is nothing for getting between pages and sections: no standalone Link, no header navigation, no side navigation, no dropdown menu, no skip link. Button renders as `<a>` when needed, so it has been doing Link's job.

This sits against an earlier direction: cap component count and invest in the machine-facing layer instead (see `docs/ai-readiness.md`). This decision is meant to grow the catalog by the smallest set that every consumer actually needs, and no further.

### What other systems do

Researched 2026-09-22:

- **Material 3** pairs navigation with screen size: navigation bar on compact, rail on medium, drawer on large. The M3 Expressive update no longer recommends the navigation drawer; an expanded navigation rail replaces it, because it adapts better across breakpoints.
- **Carbon** splits navigation into a UI shell: a header plus a side nav. Header links move into the side nav on narrow screens (below 1056px in its implementations), and the hamburger only appears when a collapsible left nav exists.
- **Polaris, Atlassian, GOV.UK, shadcn/Radix** all ship some form of Link, top-level navigation, side navigation and dropdown menu; GOV.UK also ships a skip link. This part is from my knowledge of their catalogs, not re-checked on the date above.
- **The Component Gallery** lists skip links as a standard component for keyboard users.
- **Stepper and SegmentedControl are not navigation.** ServiceTitan's Anvil says to use a navigation component instead of a Stepper for navigation; Esri's Calcite says to avoid Segmented Control as page navigation.

## Decision

Add five components now:

| Component | Tier | Why |
|---|---|---|
| `Link` | primitive | The base primitive every system has. Takes the job off Button. |
| `SkipLink` | primitive | Small, and required for keyboard access on every consumer. |
| `NavigationMenu` | composition | Top-level header navigation with dropdowns. Radix has a primitive for it. |
| `Menu` (dropdown menu) | composition | Account menus, overflow actions, header submenus. |
| `SideNav` | pattern | Section navigation for the app-style consumers. |

**One `SideNav` with collapsed and expanded modes**, following Material 3, instead of a separate rail and a separate navigation drawer. On small screens it renders inside the existing `Drawer`, so there is no new mobile container.

**`NavigationMenu` and `SideNav` are designed as a responsive pair**, as Carbon's shell is: the same navigation data should be able to render in the header on wide screens and in the side nav on narrow ones.

**Structure stays generic; brand comes from tokens.** A songwriting site and FinFam look very different, and header and side nav are where that difference shows most. Their layout and behaviour stay shared; the multi-brand token layer does the differentiating.

**Deferred until a real consumer asks for them:** `Stepper`, `SegmentedControl`, `BottomNav`, `CommandPalette`, `Footer`.

This entry records the strategy only. Each component gets its own scope when it is built, worked out against the existing components and conventions in this repo.

## Alternatives considered

- **Everything the big systems ship.** Rejected: it goes against the component cap, and most of it has no consumer yet.
- **Separate `NavigationRail` and `NavigationDrawer`.** Rejected: Material 3 itself moved away from this, and it would duplicate what `Drawer` already does on mobile.
- **Keep using `Button` as `<a>` instead of a `Link`.** Rejected: links and buttons have different semantics and different visual defaults, and every system researched separates them.
- **Stepper and SegmentedControl in the first set.** Rejected: both are closer to selection/progress controls than navigation, and only some consumers would use them.
- **`Menubar`.** Rejected: it fits desktop-application UIs, which none of the consumers are.
- **Writing the full per-component scope into this entry.** Rejected: scope written before looking at the existing code tends to be wrong in small ways. Better worked out at build time.

## Consequences

### Positive
- Every current and planned consumer gets the navigation frame it needs from the system instead of building its own.
- Five components, not fifteen. Growth stays close to the cap.
- Mobile navigation reuses `Drawer` instead of adding a new overlay.

### Negative
- Five new components mean new tokens, stories, docs twins and registry entries, all of which `npm run validate` has to keep green.
- `Button` carries portfolio-specific expression by default (a GSAP hover wipe and a trailing arrow). If it's used as a trigger inside `Menu` or `NavigationMenu`, that expression leaks into every consumer's navigation too. Worth fixing Button's defaults before this work starts.
- Deferred components will be asked for eventually. When they are, each needs its own decision rather than slipping in.

## Related files

- `docs/ai-readiness.md` — the component-cap direction this decision works within
- `components/composition/Drawer` — the mobile container `SideNav` renders inside
- `components/primitives/Button` — the default hover wipe and arrow that should become opt-in
- `docs/components.md`, `AGENTS.md` — source-of-truth files to update as each component lands
