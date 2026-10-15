# TopNav

> The bar across the top of a site or app: brand, main navigation, actions

- Tier: patterns
- Storybook: `Components/TopNav`
- Import: `import { TopNav } from '@amezquita/design-system/components/patterns/TopNav'`

## Props

| Prop | Type | Description |
|---|---|---|
| `brand` | `React.ReactNode` | The logo or product name, usually a link home. Give an image logo its alt text. |
| `items` | `NavItem[]` | The main navigation, the same shape as NavigationMenu's: links, and groups of links. |
| `currentHref?` | `string` | Your router's current pathname; that link gets aria-current="page". |
| `LinkComponent?` | `NavLinkComponent` | Component to render links with, as for NavigationMenu. Defaults to a plain `<a>`. |
| `actions?` | `React.ReactNode` | What sits at the end: search, a Command Palette button, the account menu. |
| `sticky?` | `boolean` | Stays at the top while the page scrolls. |
| `navLabel?` | `string` | Name of both navigations and the drawer's heading. Default "Main". |
| `menuLabel?` | `string` | Name of the button that opens the drawer on small screens. Default "Menu". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children'>`

## Best practices

### Do

- Keep the main navigation to about five items; put the rest in groups or the footer.
- Put the same `actions` in reach on small screens; they stay in the bar.
- Use `sticky` on long pages where people need the navigation often.

### Don't

- Don't use TopNav and SideNav's header items for the same links; pick one place.
- Don't hide primary actions behind the Menu button on small screens.

## Accessibility

- A `<header>` (the banner landmark when it's the page's top header)
- From 1024px up, NavigationMenu is the "Main" navigation; below it, a Menu button opens a Drawer with the same links, so there's one list of items and one "Main" navigation on the page at a time
- The current link has `aria-current="page"` in both; groups become labelled lists in the drawer
- Following a link in the drawer closes it, so the new page isn't covered
- CSS decides which shows, so there's no flash before the page is interactive
