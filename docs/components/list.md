# List

> A list, announced as one: rows of Items in an interface, or bullets and numbers in running text

- Tier: primitives
- Storybook: `Components/List`
- Import: `import { List } from '@amezquita/design-system/components/primitives/List'`

## Props

| Prop | Type | Description |
|---|---|---|
| `marker?` | `'none' \| 'bullet' \| 'number'` | `none` (default): a list of things in an interface (files, people, settings), no markers. `bullet` and `number`: a list in running text. `number` renders an `ol`. |
| `divided?` | `boolean` | A line between items, in the default border colour. |
| `gap?` | `'none' \| 'tight' \| 'inline' \| 'element'` | Space between items, by the brand's spacing roles. Default `none` (Items bring their own padding). |
| `ordered?` | `boolean` | Force an ordered list without numbers shown: steps, a ranking. Implied by `marker="number"`. |

Also accepts all props of: `React.HTMLAttributes<HTMLUListElement | HTMLOListElement>`

## Usage example

```tsx
args => (
  <List {...args} aria-label="Files">
    <Item title="brand-brief.pdf" description="2 MB" />
    <Item title="tokens.json" description="12 KB" />
    <Item title="case-study.md" description="8 KB" />
  </List>
)
```

## Best practices

### Do

- Use List with Items for rows: files, people, settings, search results.
- Use `marker="bullet"` or `number` for lists inside prose.
- Give a list of rows an `aria-label` when nothing else on screen names it.

### Don't

- Don't use a List for tabular data with columns; that's Table.
- Don't nest interactive lists inside each other; use a Tree View (wave 5) for hierarchies.
- Don't put a single item in a List.

## Accessibility

- Screen readers announce a list and its item count, so people know how much is there before they go through it
- With `marker="none"` it sets `role="list"`, because Safari drops list semantics once `list-style` is `none`; text lists keep their markers and need no role
- Text is tested at 4.5:1 and dividers are the default border colour in all five brands, light and dark
