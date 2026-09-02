# Table

> Static data table with semantic header, body, and row structure

- Tier: patterns
- Storybook: `Components/Table`
- Import: `import { Table } from '@amezquita/design-system/components/patterns/Table'`

## Props

| Prop | Type | Description |
|---|---|---|
| `striped?` | `boolean` |  |
| `bordered?` | `boolean` |  |
| `compact?` | `boolean` |  |
| `className?` | `string` |  |
| `scrollLabel?` | `string` | Accessible name for the scroll region — override when a page has more than one table. |
| `children` | `React.ReactNode` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--table-body-color` | color | `#0A0A0A` † |
| `--table-body-font-size` | dimension | `16px` |
| `--table-border-radius` | dimension | `8px` † |
| `--table-cell-padding-x` | dimension | `16px` |
| `--table-cell-padding-y` | dimension | `12px` |
| `--table-header-background` | color | `#F4F0EB` † |
| `--table-header-color` | color | `#57534E` † |
| `--table-header-font-size` | dimension | `12px` |
| `--table-header-font-weight` | fontWeight | `600` |
| `--table-row-border` | color | `#E2DDD9` † |
| `--table-row-border-width` | dimension | `1px` |
| `--table-row-hover-background` | color | `#F4F0EB` † |
| `--table-selected-row-background` | color | `#E2DDD9` † |
| `--table-sort-icon-color` | color | `#57534E` † |
| `--table-sort-icon-color-active` | color | `#292524` † |
| `--table-sort-icon-gap` | dimension | `4px` |
| `--table-stripe-background` | color | `#F4F0EB` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Table>
  <TableHead>
    <TableRow>
      {sampleHeaders.map(h => <TableHeader key={h}>{h}</TableHeader>)}
    </TableRow>
  </TableHead>
  <TableBody>
    {sampleRows.map(row => (
      <TableRow key={row[0]}>
        {row.map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
      </TableRow>
    ))}
  </TableBody>
</Table>
```
