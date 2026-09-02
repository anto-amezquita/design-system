# DataTable

> Sortable, filterable, paginated table for structured datasets

- Tier: patterns
- Storybook: `Components/DataTable`
- Import: `import { DataTable } from '@amezquita/design-system/components/patterns/DataTable'`

## Props

| Prop | Type | Description |
|---|---|---|
| `columns` | `{ key: keyof T & string; label: string; sortable?: boolean; width?: string; render?: (value: T[keyof T & string], row: T) => React.ReactNode; // Narrow, per-field filter, rendered in a second header row when at least one column; // sets this. Generic and data-driven — for app-specific global filters (date range,; // category) use DataTable's own `renderToolbar` slot instead, not this.; filterable?: boolean; filterType?: 'text' \| 'select'; // Required when filterType is 'select' — DataTable warns in development if missing.; filterOptions?: { value: string; label: string }[] }[]` |  |
| `data` | `T[]` |  |
| `dataKey?` | `string` | Explicit key controlling when data resets (sort/selection/page cleared). Pass a stable string (e.g. a query ID or ISO timestamp) to avoid resets when the data array reference changes but the content has not. When omitted, resets on reference inequality — callers should memoize their data array to avoid spurious resets. |
| `getRowKey?` | `(row: T) => string` | Row identity function. Drives two separate things: the React key for each row, and (independently) the identity DataTable's selection state tracks across filtering — without it, a selected row can only survive a filter round-trip via its `id` field. Required when rows have no .id field and the table is sortable, to avoid full row remounts on sort. Falls back to row.id, then to position index (which causes remounts on sort and should be avoided). |
| `selectable?` | `boolean` |  |
| `onSelectionChange?` | `(selectedRows: T[]) => void` |  |
| `filters?` | `Record<string, string>` | Column filter values, keyed by column key. Uncontrolled by default (DataTable owns the state driving its own filter row); pass both to lift the state out — e.g. for saved views. |
| `onFiltersChange?` | `(filters: Record<string, string>) => void` |  |
| `renderToolbar?` | `(filteredCount: number, totalCount: number) => React.ReactNode` | Slot for app-level global filters (date range, category, market) DataTable has no generic concept of. Rendered above the table exactly as returned — DataTable applies no logic of its own to whatever's inside. Receives the row counts so the app doesn't have to re-derive "12 of 340" itself. |
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
| `--datatable-filter-cell-padding-y` | dimension | `8px` |
| `--datatable-footer-gap` | dimension | `16px` |
| `--datatable-gap` | dimension | `16px` |

## Usage example

```tsx
<DataTable<Person>
  columns={columns}
  data={data}
/>
```
