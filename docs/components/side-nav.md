# SideNav

> Section navigation: inline beside the content from desktop width up, in a left Drawer opened from a header hamburger below it

- Tier: patterns
- Storybook: `Patterns/SideNav`
- Import: `import { SideNav } from '@amezquita/design-system/components/patterns/SideNav'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `NavItem[]` | The section's navigation. Each item is a link `{ id, label, href, icon? }` or a group `{ id, label, icon?, items: NavLink[] }`, which renders as a collapsible section. Two levels at most. |
| `headerItems?` | `NavItem[]` | The same array you pass NavigationMenu. Shown only in the mobile drawer, above `items` with a separator, so header links stay reachable below 1024px. |
| `currentHref?` | `string` | Your router's current pathname. An exact match sets `aria-current="page"`; a group holding the current link starts open. |
| `LinkComponent?` | `NavLinkComponent` | Component to render links with — pass your router's Link (e.g. next/link). It must pass `aria-current`, `className` and `onClick` through to the `&lt;a&gt;`, and forward its ref for the collapsed rail's tooltips. Defaults to a plain `&lt;a&gt;`. |
| `layout?` | `'sidebar' \| 'drawer-only'` | `'sidebar'` (default) shows the nav inline from 1024px up and in a drawer below. `'drawer-only'` renders nothing inline — for a site whose only desktop navigation is the header (NavigationMenu). |
| `collapsed?` | `boolean` | Icon rail: icons only, each label in a tooltip. Inline only; the drawer is always expanded. SideNav has no toggle of its own — drive this from your own control (e.g. a Button in the sidebar's header). Needs an `icon` on every item; without one, SideNav warns in development and renders expanded. |
| `aria-label?` | `string` | Names the inline `&lt;nav&gt;` landmark. Defaults to "Section". |
| `drawerTitle?` | `string` | Heading of the mobile drawer. Defaults to "Navigation". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--side-nav-width` | dimension | `240px` |

## Usage example

```tsx
<SideNavProvider>
  <header>
    <SideNavTrigger />
  </header>
  <SideNav
    currentHref="/docs/tokens"
    items={[
      { id: 'start', label: 'Getting started', href: '/docs/start' },
      {
        id: 'foundations',
        label: 'Foundations',
        items: [
          { id: 'tokens', label: 'Tokens', href: '/docs/tokens' },
          { id: 'type', label: 'Typography', href: '/docs/type' },
        ],
      },
      { id: 'components', label: 'Components', href: '/docs/components' },
    ]}
  />
</SideNavProvider>
```

## Accessibility

- Semantic elements: `<nav>` landmarks (inline and in the drawer), links, native `<button aria-expanded aria-controls>` for groups
- The trigger has `aria-expanded` and `aria-controls` pointing at the drawer's `<nav>`
- Opening the drawer moves focus to its first link; Escape or the close button closes it and returns focus to the trigger (`SideNav.drawer.test.tsx`)
- Choosing a link in the drawer closes it
- Every link and toggle is at least 44px tall; in the collapsed rail each label stays in the DOM as the accessible name
