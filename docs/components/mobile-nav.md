# MobileNav

> The bar at the bottom of a small screen with an app's main places

- Tier: patterns
- Storybook: `Components/MobileNav`
- Import: `import { MobileNav } from '@amezquita/design-system/components/patterns/MobileNav'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `{ id: string; label: string; href: string; icon: React.ReactNode; badge?: number; badgeLabel?: (count: number) => string }[]` | Three to five destinations. |
| `currentHref?` | `string` | Your router's current pathname; that item gets aria-current="page". |
| `LinkComponent?` | `NavLinkComponent` |  |
| `aria-label?` | `string` | Names the navigation. Default "Main". |
| `alwaysVisible?` | `boolean` | Keep it on wide screens too. By default it hides from 1024px, where TopNav or SideNav takes over. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-label'>`

## Best practices

### Do

- Keep it to three to five places people go often; put the rest in a "More" or profile page.
- Use short labels, one word where possible.
- Leave room at the bottom of the page so the bar doesn't cover the last content.

### Don't

- Don't hide the labels; icons alone are ambiguous.
- Don't put actions in it (like "New post"); it's for places.

## Accessibility

- A `nav` named "Main" with a list of links; each is named by its label, and a badge adds its count in brackets: "Messages (3 unread)"
- The current link has `aria-current="page"`, and a filled pill and heavier label, so it doesn't rely on colour
- Icons and the visible count are hidden; labels are always shown
- Every link is at least 44px tall; the bar clears the phone's home indicator (`safe-area-inset-bottom`)
- Hidden from 1024px up by CSS, so there's one "Main" navigation at a time with TopNav or SideNav
