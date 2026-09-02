# TableHeader

> Sub-component of Table.

- Tier: patterns
- Storybook: `Components/Table`
- Import: `import { TableHeader } from '@amezquita/design-system/components/patterns/Table'`

## Props

| Prop | Type | Description |
|---|---|---|
| `sortable?` | `boolean` |  |
| `sortDirection?` | `'asc' \| 'desc' \| null` |  |
| `onSort?` | `() => void` |  |
| `sortLabel?` | `string` | Accessible column name for the sort button. Defaults to children when it is a string. |

Also accepts all props of: `React.ComponentPropsWithoutRef<'th'>`

## Usage example

See `Table`'s own usage example — TableHeader is one of its sub-components, not used standalone.
