# GridItem

> Sub-component of Grid.

- Tier: primitives
- Storybook: `Components/Grid`
- Import: `import { GridItem } from '@amezquita/design-system/components/primitives/Grid'`

## Props

| Prop | Type | Description |
|---|---|---|
| `span?` | `Responsive<Span>` | Columns this item takes: a number, `'full'` for the whole row, or one per breakpoint: `{ base: 'full', desktop: 2 }`. Leave it out for one column. |
| `as?` | `'div' \| 'li' \| 'article' \| 'section'` | `div` (default), or `li` inside a Grid rendered as a list. |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Usage example

See `Grid`'s own usage example — GridItem is one of its sub-components, not used standalone.
