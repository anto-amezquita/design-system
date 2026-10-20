# Grid

> Lays items out in rows and columns: fixed columns per breakpoint, or as many as fit

- Tier: primitives
- Storybook: `Components/Grid`
- Import: `import { Grid } from '@amezquita/design-system/components/primitives/Grid'`

## Props

| Prop | Type | Description |
|---|---|---|
| `columns?` | `Responsive<number>` | Fixed number of equal columns (1–12), or one per breakpoint: `{ base: 1, tablet: 2, desktop: 4 }`. A breakpoint you leave out takes the one below it. Default 1. Ignored when `minItemWidth` is set. |
| `minItemWidth?` | `'sm' \| 'md' \| 'lg'` | Let the content decide the columns instead: as many as fit with every item at least this wide (`sm` 192px, `md` 256px, `lg` 320px in the base theme). Works in any container, with no breakpoints. |
| `gap?` | `'none' \| 'tight' \| 'inline' \| 'element' \| 'component' \| 'section'` | Space between items, by role, so each brand sets the size. Default `element`. |
| `rowGap?` | `'none' \| 'tight' \| 'inline' \| 'element' \| 'component' \| 'section'` | Space between rows when it should differ from `gap`. |
| `align?` | `'start' \| 'center' \| 'end' \| 'stretch'` | How items sit in their row. Default `stretch`: items in a row are the same height. |
| `as?` | `'div' \| 'section' \| 'ul' \| 'ol'` | `div` (default), `section`, or `ul`/`ol` for a list of items (gets `role="list"` back, since Safari drops list semantics once markers are removed). |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--grid-min-item-lg` | dimension | `320px` |
| `--grid-min-item-md` | dimension | `256px` |
| `--grid-min-item-sm` | dimension | `192px` |

## Usage example

```tsx
args => (
  <Grid {...args}>
    {names.map(n => <div key={n} style={box}>{n}</div>)}
  </Grid>
)
```

## Best practices

### Do

- Use `minItemWidth` for collections of like items (cards, swatches) so the grid works in any container, sidebar included.
- Use per-breakpoint `columns` for page layouts where the column count is a design decision.
- Render a collection as `as="ul"` with `li` items so screen readers announce how many there are.

### Don't

- Don't use Grid for a single row or column; that's Stack.
- Don't span more columns than the grid has: the browser adds extra columns and squeezes the rest. Use `span="full"` for the whole row.
- Don't use a Grid to lay out tabular data; that's Table, which keeps row and column headers.
- Don't reorder items with CSS to change their visual position; change the source order so keyboard and screen-reader order match.

## Accessibility

- No role of its own: it renders the element in `as`, so pick the one that matches what the items are
- As `ul` or `ol` it removes markers and indent and sets `role="list"`, because Safari drops list semantics once `list-style` is `none`. A `role` you pass wins
- Items fill in source order (no `dense` packing, no reordering), so reading and tab order match what's on screen
- With `minItemWidth`, an item shrinks below the minimum in a container narrower than it, so content reflows at 320px instead of scrolling sideways (WCAG 1.4.10)
