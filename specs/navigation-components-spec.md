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
2. **`asChild` needs `@radix-ui/react-slot` as a direct dependency.** The handoff said Link gets `asChild` "via Radix `Slot`, as Button does". Button doesn't use `Slot`; it's the other way round: Button is the thing a Radix `Slot` composes (`Dialog.Trigger asChild`). `@radix-ui/react-slot` 1.3.3 was already in the tree as a transitive dependency of every Radix package here. Chose: declare it directly at `^1.3.3`, the version already installed, so Link doesn't depend on a transitive package being hoisted. No new code enters any consumer's install. Link uses `Slottable` so the external icon and hint still render inside a router link.
3. **Link's colour gets its own contrast pair.** `accent-on-surface` is only enforced at 3:1 (large text and UI boundaries), and Link is body-size text. Checked first that `color-accent-default` and `color-accent-hover` clear 4.5:1 on `color-surface-primary` in all four modes, then added `link-text` and `link-text-hover` to `tokens/contrast-pairs.json` at 4.5 so that stays true.
4. **Menu is non-modal.** Radix DropdownMenu defaults to `modal`, which sets `aria-hidden` on everything outside the open menu, the trigger included. The first open-state stories failed the axe audit on exactly that (`aria-hidden-focus`: a focusable element inside an `aria-hidden` region). Chose: `modal={false}` inside Menu, with no prop to change it. Outside clicks and Escape still close the menu, focus still moves in and back to the trigger, and `Menu.nesting.test.tsx` still passes inside a modal Dialog. A menu is a transient popup, so hiding the whole page from assistive tech was more than it needed. Adding a `modal` prop would be new surface nobody has asked for.
5. **Open overlays in the dark-mode story.** Menu's panel is portalled to `<body>`, outside `darkModeDecorator`'s wrapper, so on its own the dark story would audit a light panel. No existing overlay story shows its open state, so there was no precedent. Chose: a story-local decorator that sets `data-mode="dark"` on `<body>` while the story is mounted, next to `darkModeDecorator` (which `check-stories.mjs` looks for). NavigationMenu isn't portalled and doesn't need it.
6. **NavigationMenu's dropdown keeps an explicit z-index (`--z-dropdown`).** Without Radix's shared Viewport, each group's content renders inside its own list item, not in a portal. 0007's "no z-index, let mount order decide" only works for portalled content: this dropdown sits in the header, earlier in the DOM than the page it opens over, so any positioned element in the page (a sticky table header, a Card with `position: relative`) would paint on top of it. Chose: `z-index: var(--z-dropdown)` on `.navigation-menu__content`, the existing token 0007 left unreferenced. It's the same argument SkipLink's `z-skip-link` rests on. The one layering case it gets wrong in theory, an open nav dropdown under a later Dialog, can't happen in practice: opening a modal moves focus out, and Radix closes the dropdown on focus-outside.
7. **NavigationMenu's stories are snapshotted at 1280px, and the open-state play function only opens at desktop width.** The component is `display: none` below 1024px. Chromatic gets `parameters.chromatic.viewports: [1280]` so its snapshots show the real thing, whatever its default width. The play function returns early below 1024px rather than failing on a hidden trigger, for anyone viewing the story in a narrow Storybook viewport. Storybook's own Vitest run is wide enough to open it, so the open state does get the axe audit. Keyboard behaviour, `aria-current` and the 1023/1280px switch are covered in `NavigationMenu.keyboard.test.tsx`, which sets its own viewport.
8. **One scoped axe suppression, in `NavigationMenu.stories.tsx`.** While a group is open, Radix renders a visually hidden `<span aria-hidden tabindex="0">` after the trigger: a focus sentinel whose `onFocus` moves focus straight into the content, so nobody ever rests on it. axe's `aria-hidden-focus` flags it. Chose: narrow that one rule's selector to skip only `.navigation-menu__item > span[tabindex="0"]`; every other `aria-hidden` element is still checked. The alternatives were forking Radix's trigger or rewriting the span's `tabindex` after render, both of which would break the Tab-into-content behaviour the sentinel exists for.
9. **SideNav's `collapsed` is controlled only: no `defaultCollapsed` or `onCollapsedChange`.** The handoff listed the controlled/uncontrolled trio via `useUncontrolledValue` and also said SideNav has no built-in collapse toggle. Together those can't work: with nothing inside SideNav that ever changes `collapsed`, `onCollapsedChange` would never fire and an uncontrolled value could never move from its default. Chose: `collapsed?: boolean` alone, driven by the consumer's own control (the `Collapsed` story does it with a Button). If a built-in toggle is ever added, the other two props come with it.
10. **Focus return goes through SideNavProvider, and first-link focus through a child effect, without changing Drawer.** Two things in Radix Dialog got in the way. On open, it focuses the first focusable element, which is Drawer's close button, not the first link. On close, a modal Dialog cancels the default focus restore and focuses only its own `Dialog.Trigger`, and SideNavTrigger lives in the header, outside Drawer, so focus fell to `<body>`. The first test run caught the second one. Chose: `DrawerNav` focuses the first link in its own effect, which runs before the dialog's focus scope mounts, so the scope finds focus already inside and leaves it. `SideNavProvider` keeps a ref to `SideNavTrigger` and focuses it when the drawer goes from open to closed. Both are pinned in `SideNav.drawer.test.tsx`. Drawer, BaseSheet and Dialog are untouched.
11. **`drawerTitle` prop, default "Navigation".** Drawer requires a `title`, and it's visible text. Hardcoding it in English would put an English heading on every Danish or Spanish consumer's mobile nav with no way to change it. Chose: one optional string prop. The drawer's `<nav>` uses the same string as its `aria-label`. The other built-in English strings (SideNavTrigger's `aria-label`, SkipLink's text) were already overridable; Link's "(opens in a new tab)" and Drawer's own "Close drawer" aren't, logged in `backlog.md`.
12. **The collapsed rail's icon rule covers links inside groups too.** The handoff said to fall back to expanded if a *top-level* item lacks an icon. An open group shows its links in the rail too, and a link without an icon there would be a blank button. Chose: every item the rail could show needs an icon, top-level and inside groups; otherwise the same dev warning and expanded fallback.
13. **SideNavTrigger's `aria-controls` points at the `<nav>` inside the drawer, not the drawer itself.** Drawer takes no `id`. The `<nav>` is the thing the trigger reveals, and it only exists while the drawer is open, which `aria-controls` allows while `aria-expanded="false"`.
14. **The drawer closes when a link in it is chosen, and when `currentHref` changes.** Not in the handoff, but without it a client-side route change leaves a modal open over the new page. The link's `onClick` closes it; the `currentHref` change covers a router Link that doesn't pass `onClick` through.
15. **Component counts were one off in the handoff.** It said public components go from 28 to 33 and directories from 29 to 34. `main` already had 29 public components and 30 directories (`tokens/component-registry.json`, `check-components-doc.mjs`), so the real numbers are 34 public and 35 directories, and 33 CSS files. `AGENTS.md`, `docs/architecture.md`, `README.md`, `docs/ai-readiness.md` and `contributor-skills/design-system/SKILL.md` were updated from the scripts' output, not from the handoff.
16. **"Both brands in local Storybook" isn't possible as the repo stands.** `.storybook/preview.tsx` loads all four brand files at `:root`, portfolio last, so every story renders the portfolio brand in light and dark; there's no brand switcher. `docs/quality.md` §4 already records this gap. Chose: checked every new component in portfolio light and dark in Storybook, and base light and dark through `tokens:contrast`, with six new pairs covering the colours these components introduce (`link-text`, `link-text-hover`, `menu-destructive-item`, `menu-destructive-item-highlighted`, plus the existing pairs for everything else).
17. **There were no lint-rule tests to follow.** The handoff said to test `no-unknown-breakpoint` "the same way the existing rules are tested"; none of the nine existing rules had tests. Chose: `scripts/lint-tokens.test.mjs` in the existing `scripts` Vitest project (Node, no browser), testing the new rule against the real `tokens/global.json`. `lintFile`, `RULES` and a `loadBreakpointValues` helper are now exported from `lint-tokens.mjs` for it. Tests for the other nine rules would be a reasonable follow-up, not part of this work.
