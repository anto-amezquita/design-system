---
"@amezquita/design-system": minor
---

Five navigation components (`decisions/0015`) and breakpoint tokens (`decisions/0018`).

**`Link`** (primitive): use it for navigation, and Button for actions. `variant="inline"` (underlined, for running text) or `"standalone"` (underline on hover and focus). `external` opens a new tab and says so to screen readers. `asChild` renders your router's link: `<Link asChild><NextLink href="/about">About</NextLink></Link>`.

**`SkipLink`** (primitive): put it first in `<body>` and `id="main-content"` on your `<main>`. It shows on the first Tab and moves focus into the main content. Stacks with the new `--z-skip-link` token.

**`Menu`** (composition): a dropdown of actions from a `trigger`, in groups, with disabled and destructive items. Opens correctly inside a Dialog or Drawer.

**`NavigationMenu`** (composition): the header navigation, from 1024px up. Links and groups that open a dropdown of links. Takes `currentHref` for `aria-current="page"` and `LinkComponent` for your router.

**`SideNav`** (pattern), with **`SideNavProvider`** and **`SideNavTrigger`**: section navigation inline beside the content from 1024px up, and in a left Drawer opened from `SideNavTrigger` below it. `headerItems` puts NavigationMenu's links in that drawer too, so a site with a header nav gets a mobile menu with `layout="drawer-only"`. `collapsed` turns the inline nav into an icon rail. The `NavItem` type both components take is exported from each of their folders.

**Breakpoint tokens:** `breakpoint.tablet` (768px) and `breakpoint.desktop` (1024px), emitted as `--breakpoint-tablet` and `--breakpoint-desktop`. Custom properties can't be read in `@media`, so write the literal value, mobile-first: `@media (min-width: 1024px)`. For JS, `lib/breakpoints.ts` exports `BREAKPOINTS` and `mediaQuery('desktop')`.

**One visible change to an existing component:** Card's description used to hide below 1200px and now hides below 1024px, the nearest breakpoint token. Between 1024px and 1199px it now shows.

New dependencies: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-navigation-menu`, and `@radix-ui/react-slot` (already installed with the other Radix packages, now declared directly).
