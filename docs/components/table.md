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
| `--table-border-radius` | dimension | `8px` |
| `--table-cell-padding-x` | dimension | `16px` |
| `--table-cell-padding-y` | dimension | `12px` |
| `--table-header-font-size` | dimension | `12px` |
| `--table-header-font-weight` | fontWeight | `600` |
| `--table-selected-row-background` | color | `#E2DDD9` † |
| `--table-sort-icon-gap` | dimension | `4px` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

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
