# Item

> One row in a List: leading media, a title and description, trailing metadata or actions; optionally the whole row is a link

- Tier: primitives
- Storybook: `Components/Item`
- Import: `import { Item } from '@amezquita/design-system/components/primitives/Item'`

## Props

| Prop | Type | Description |
|---|---|---|
| `title` | `React.ReactNode` | The row's main text. With `href`, it's also the link's name. |
| `description?` | `React.ReactNode` | A line under the title: a file size, a role, a last message. |
| `leading?` | `React.ReactNode` | Before the text: an Avatar, an Icon, a thumbnail. |
| `trailing?` | `React.ReactNode` | After the text: metadata (a Timestamp, a Badge) or actions (an IconButton, a Switch). |
| `href?` | `string` | Make the whole row a link. The title becomes the link, stretched over the row so the whole row is clickable, while buttons in `trailing` stay their own targets, one Tab stop each. |
| `current?` | `boolean` | With `href`: this row is the page you're on (`aria-current="page"`). |
| `size?` | `'default' \| 'compact'` | `default` padding, or `compact` for dense lists. |
| `as?` | `'li' \| 'div'` | `li` (default, inside a List) or `div`. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'>`

## Usage example

```tsx
args => <List aria-label="Files"><Item {...args} /></List>
```

## Best practices

### Do

- Keep the title short and unique within the list; it's the link's name.
- Put actions in `trailing` and give icon-only ones a label that names the row ("Share tokens.json").
- Use `compact` for navigation and dense lists.

### Don't

- Don't put a link or button inside `title` or `description` of a linked row; it would sit under the stretched link.
- Don't make a row both a link and selectable; for choosing rows, use Selectable Card or a Checkbox in `leading`.
- Don't rely on hover to reveal actions; touch and keyboard users won't see them.

## Accessibility

- A linked row is one link, named by its title, stretched over the row; the description doesn't get read as part of the link name. Trailing buttons sit above the stretch, so they're their own targets and their own Tab stops
- The focus ring goes around the whole row, where the click target is
- `current` sets `aria-current="page"` and draws a bar on the leading edge, so the current row isn't marked by colour alone. The bar uses `accent-text`, tested at 3:1 against the row in every brand and mode (`accent-default` was too pale in demo-soft)
- Title and description are tested at 4.5:1 at rest, hovered and current, in all five brands, light and dark
- Long titles wrap rather than overflow
