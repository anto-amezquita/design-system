# TableOfContents

> The sections of a long page as links, with the one being read marked: docs, articles, policies

- Tier: patterns
- Storybook: `Components/TableOfContents`
- Import: `import { TableOfContents } from '@amezquita/design-system/components/patterns/TableOfContents'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `{ id: string; label: string; children?: { id: string; label: string; children?: TableOfContentsItem[] }[] }[]` |  |
| `aria-label?` | `string` | Names the navigation. Defaults to "On this page". |
| `title?` | `string \| null` | Shown above the list. Defaults to the aria-label; pass `null` for none. |
| `offset?` | `number` | How far below the top of the view a heading counts as reached, in px. Default 96, under a typical sticky header. |
| `root?` | `HTMLElement \| null` | The scrolling element, if the page doesn't scroll as a whole. |
| `activeId?` | `string \| null` | Set it yourself instead of following the scroll. |
| `onActiveChange?` | `(id: string \| null) => void` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'aria-label' | 'title'>`

## Usage example

```tsx
<Page toc={root => <TableOfContents items={items} root={root} offset={24} />} />
```

## Best practices

### Do

- Give every heading it lists an id, and keep labels the same as the headings.
- Set `offset` to the height of a sticky header, so the right section is marked.
- Use it for pages long enough to need it: four sections or more.

### Don't

- Don't nest deeper than two levels.
- Don't use it for site navigation; that's SideNav or NavigationMenu.

## Accessibility

- A `nav` landmark named "On this page", with a nested list of ordinary in-page links
- The current link has `aria-current="location"`; it's also darker, heavier and has a bar, so it doesn't rely on colour
- The visible title is hidden from screen readers, which hear the nav's name instead of hearing it twice
- A click marks the link straight away; native in-page links move focus to the target
