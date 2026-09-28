# Navigation components — specification

Implements [`decisions/0015`](../decisions/0015-navigation-components-core-set.md): `Link`, `SkipLink`, `Menu`, `NavigationMenu` and `SideNav`, plus the breakpoint tokens they switch on ([`decisions/0018`](../decisions/0018-breakpoint-tokens.md)). 0015 recorded the strategy and left each component's scope to build time; this file is that scope.

Built on `feat/navigation-components`, one commit per step, in the order below.

---

## Build order

1. This spec and ADR 0018.
2. Breakpoint tokens, `lib/breakpoints.ts` and its test, the `no-unknown-breakpoint` lint rule and its tests, `docs/quality.md`, the Dialog comment and the Card migration.
3. The shared navigation data type.
4. `Link` → 5. `SkipLink` → 6. `Menu` → 7. `NavigationMenu` → 8. `SideNav`.

Each component step ships its `.tsx`, `.css`, stories (every state, light and dark), tests, a `docs/components.md` entry and a regenerated docs twin, with `npm run validate` and `npm run tokens && node scripts/check-generated-sync.mjs` both clean before the commit.

---

## Breakpoints

Full reasoning in 0018. In short: `breakpoint.tablet` (768px) and `breakpoint.desktop` (1024px) in `tokens/global.json`; literal values in `@media`, `min-width` only; the `no-unknown-breakpoint` lint rule checks every `@media` width against the tokens; `lib/breakpoints.ts` mirrors them for JS, with a test that fails on drift.

---

## The header ↔ side-nav switch

- **One switch point: `breakpoint.desktop`.** At 1024px and up, `NavigationMenu` shows in the header and `SideNav` (if used) shows inline. Below it, `NavigationMenu` is hidden and `SideNav` renders inside the existing `Drawer`, from the left.
- **CSS decides visibility**, so there's no layout flash and it works before hydration. The drawer only mounts when opened. A small hook using `lib/breakpoints.ts` closes the drawer if the viewport crosses to 1024px or wider while it's open.
- **Same markup, rendered twice.** `SideNav` renders its own item list inline and inside the Drawer, as shadcn's Sidebar does. The consumer never mounts two components.
- **`SideNavProvider` owns the drawer's open state.** `SideNavTrigger` is the hamburger the consumer places in their header: an icon-only `Button` with its functional default, `aria-label="Open navigation"`, `aria-expanded` and `aria-controls`, hidden at 1024px and up. `SideNav` and `SideNavTrigger` throw a clear error outside the provider. Both are sub-components in the registry, like Card's parts, not new public components.
- **Header items on mobile**, as Carbon does it: `SideNav` takes an optional `headerItems`, rendered only in the drawer, above `items`, with a separator. The consumer passes the same array they give `NavigationMenu`.
- **Sites without a sidebar:** `layout?: 'sidebar' | 'drawer-only'`, default `'sidebar'`. `'drawer-only'` renders nothing inline at 1024px and up, so a site with only a header nav still gets a mobile drawer.
- **Focus in the drawer** uses Drawer's existing focus trap and restore. Focus goes to the first nav link on open and back to `SideNavTrigger` on close. This is the problem Carbon's open accessibility issue describes, so it's tested.

---

## Shared navigation data

One file, `lib/navigation.ts`:

```ts
type NavLink = { id: string; label: string; href: string; icon?: React.ReactNode }
type NavGroup = { id: string; label: string; icon?: React.ReactNode; items: NavLink[] }
type NavItem = NavLink | NavGroup
```

- Two levels at most: groups contain links, and groups don't nest. `NavigationMenu` renders a group as a dropdown; `SideNav` renders it as a collapsible section.
- **Active state:** both take `currentHref?: string`. An exact match sets `aria-current="page"`, and a group containing the current link renders open/active. The consumer passes their router's pathname.
- **Routing:** both take `LinkComponent`, the same shape as `Breadcrumb`'s, defaulting to `'a'`.

---

## Per component

### Link — primitive, no Radix

- Renders `<a>`. Native anchor attributes spread per 0006/0007, `forwardRef`, merged `className`, plus:
  - `variant?: 'inline' | 'standalone'`, default `'inline'`. Inline is underlined, for prose; standalone has no underline until hover and focus.
  - `external?: boolean`: `target="_blank"`, `rel="noopener noreferrer"`, a small icon and visually hidden "(opens in a new tab)". No auto-detection from `href`.
  - `asChild?: boolean` via Radix `Slot`, for router links (`<Link asChild><NextLink href=…/></Link>`).
- Button keeps its `href` path. `docs/components.md` says: Link for navigation, Button for actions.
- Breadcrumb, Pagination and the rest are not migrated onto Link here; that's a backlog item.

### SkipLink — primitive, no Radix

- `targetId?: string`, default `'main-content'`; `children`, default "Skip to main content". The consumer puts the matching `id` on `<main>`.
- Visually hidden until focused, then fixed to the top-left. On activation it moves focus to the target, adding `tabindex="-1"` if the target isn't focusable.
- Stacks with a new semantic token, `z-skip-link`, one step above the highest `--z-*`. The one justified explicit z-index: it isn't portalled and has to beat everything.

### Menu — composition, `@radix-ui/react-dropdown-menu`

- Items, separators, group labels, disabled items, and `variant?: 'default' | 'destructive'` per item. No checkbox or radio items, no submenus (deferred).
- `trigger` prop taking a single element, following Drawer's `trigger`. Stories use `Button` with its functional default.
- No explicit z-index (0007). `Menu.nesting.test.tsx`, modelled on `Select.nesting.test.tsx`: a Menu opened inside a Dialog, with a real `page` click landing.

### NavigationMenu — composition, `@radix-ui/react-navigation-menu`

- `items: NavItem[]`, `currentHref`, `LinkComponent`, `aria-label` (default "Main"), plus the usual passthrough.
- A link renders as a top-level link; a group renders as a Radix trigger with a chevron and a simple list of links. No mega-menu.
- Per-item content, no shared Radix `Viewport`. Triggers are Radix triggers styled here, not `Button`.
- Hidden below 1024px via CSS. Keyboard behaviour comes from Radix.

### SideNav — pattern, no new Radix dependency

- `SideNavProvider`, `SideNav`, `SideNavTrigger`, as above.
- `SideNav` props: `items`, `headerItems?`, `currentHref`, `LinkComponent`, `layout`, `collapsed?` / `defaultCollapsed?` / `onCollapsedChange?` (via `useUncontrolledValue`), `aria-label` (default "Section").
- **Expanded** shows icons and labels. **Collapsed** is a rail of icons, each label in the existing `Tooltip`. Collapsed applies only inline (1024px and up); the drawer is always expanded.
- If a top-level item has no `icon` while `collapsed` is true: a dev-only `console.warn`, and it renders expanded. No invented icons or letter chips.
- Groups are collapsible sections: a native button with `aria-expanded`, not Accordion. A group containing the current link starts open.
- No built-in collapse toggle. The consumer drives `collapsed` from their own control; a story shows it with a Button.

---

## Tokens, brands, dependencies

- Component tokens only where one isn't a pass-through; `tokens:lint-architecture` enforces it.
- Every component checked in light and dark, and through `tokens:contrast` for all four brand/mode combinations.
- New dependencies: `@radix-ui/react-dropdown-menu` and `@radix-ui/react-navigation-menu`. Neither has a release on `@radix-ui/react-dialog`'s 1.1 line, so both take their latest version.

---

## Tests

At minimum, all with real `page` interactions from `vitest/browser`, not `user-event`:

- Link and SkipLink: `className` and ref passthrough.
- SkipLink moves focus to its target.
- Menu nested in a Dialog: a real click lands.
- NavigationMenu: keyboard open and close.
- SideNav: the drawer opens from the trigger, focus goes to the first link, Escape closes and restores focus to the trigger, `aria-current` follows `currentHref`, and `headerItems` render only in the drawer.

---

## Deviations

Where the code contradicted a decision above, or a question came up this spec didn't answer. Each entry: what I found, what I chose, and why. The rule for choosing: change the least existing public API and add the least new surface.

1. **No package entry to export the nav types from.** The handoff asked for the types "exported from the package entry". `package.json` has no `main`, `module` or `exports`; consumers import each component from its own folder (`@amezquita/design-system/components/patterns/Breadcrumb`). Chose: the types live in `lib/navigation.ts` (already shipped under `files: ["lib"]`) and are re-exported from `NavigationMenu`'s and `SideNav`'s `index.ts`, so a consumer gets them from the component they're already importing. Adding a root entry would be new package structure, which needs its own ADR.
