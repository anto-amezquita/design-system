# NavigationMenu

> The site's header navigation from desktop width up: top-level links, plus groups that open a dropdown of links

- Tier: composition
- Storybook: `Composition/NavigationMenu`
- Import: `import { NavigationMenu } from '@amezquita/design-system/components/composition/NavigationMenu'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `NavItem[]` | The header's navigation. Each item is a link `{ id, label, href, icon? }` or a group `{ id, label, icon?, items: NavLink[] }`, which renders as a dropdown of links. Two levels at most. Pass the same array to SideNav's `headerItems` so it shows in the mobile drawer. |
| `currentHref?` | `string` | Your router's current pathname. An exact match sets `aria-current="page"` on that link and marks its group active. |
| `LinkComponent?` | `NavLinkComponent` | Component to render links with — pass your router's Link (e.g. next/link) for client-side navigation. It must forward its ref and pass `aria-current`, `className` and `onClick` through to the `&lt;a&gt;`. Defaults to a plain `&lt;a&gt;`. |
| `aria-label?` | `string` | Names the `&lt;nav&gt;` landmark. Defaults to "Main"; give each `&lt;nav&gt;` on a page a different name. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'defaultValue' | 'dir'>`

## Usage example

```tsx
<NavigationMenu
  currentHref="/work"
  items={[
    { id: 'work', label: 'Work', href: '/work' },
    {
      id: 'writing',
      label: 'Writing',
      items: [
        { id: 'essays', label: 'Essays', href: '/writing/essays' },
        { id: 'notes', label: 'Notes', href: '/writing/notes' },
        { id: 'talks', label: 'Talks', href: '/writing/talks' },
      ],
    },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ]}
/>
```

## Accessibility

- Built on Radix NavigationMenu: a `<nav>` landmark, groups open from a real `<button>` with `aria-expanded`
- Keyboard: Tab moves between top-level items; `Enter`/`Space` opens a group and Tab moves into its links; `Escape` closes and returns focus to the trigger; arrow keys move between top-level items
- Hover also opens a group, after Radix's short delay
- Every top-level item is at least 44px tall (`--size-touch-target`)
- The dropdown renders inside its own item rather than in a portal, so it carries `--z-dropdown` to stay above later page content
