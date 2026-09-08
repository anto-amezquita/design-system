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
| `--table-header-font-size` | dimension | `12px` |
| `--table-header-font-weight` | fontWeight | `600` |

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
