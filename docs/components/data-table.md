# DataTable

> Sortable, filterable, paginated table for structured datasets

- Tier: patterns
- Storybook: `Components/DataTable`
- Import: `import { DataTable } from '@amezquita/design-system/components/patterns/DataTable'`

## Props

| Prop | Type | Description |
|---|---|---|
| `columns` | `Column<T>[]` |  |
| `data` | `T[]` |  |
| `dataKey?` | `string` | Explicit key controlling when data resets (sort/selection/page cleared). Pass a stable string (e.g. a query ID or ISO timestamp) to avoid resets when the data array reference changes but the content has not. When omitted, resets on reference inequality — callers should memoize their data array to avoid spurious resets. |
| `getRowKey?` | `(row: T) => string` | Row identity function — used as the React key. Required when rows have no .id field and the table is sortable, to avoid full row remounts on sort. Falls back to row.id, then to position index (which causes remounts on sort and should be avoided). |
| `selectable?` | `boolean` |  |
| `onSelectionChange?` | `(selectedRows: T[]) => void` |  |
| `pageSize?` | `number` |  |
| `striped?` | `boolean` |  |
| `bordered?` | `boolean` |  |
| `compact?` | `boolean` |  |
| `className?` | `string` |  |
| `scrollLabel?` | `string` | Override when a page renders more than one DataTable — both default to a literal string, and two unlabeled instances on one page collide as duplicate landmarks under axe's landmark-unique rule. |
| `paginationLabel?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--datatable-empty-padding` | dimension | `32px` |
| `--datatable-footer-gap` | dimension | `16px` |
| `--datatable-gap` | dimension | `16px` |

## Usage example

```tsx
<DataTable<Person>
  columns={columns}
  data={data}
/>
```
