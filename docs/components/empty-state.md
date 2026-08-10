# EmptyState

> Placeholder for zero-content states — icon, heading, supporting text, and an optional action

- Tier: patterns
- Storybook: `Components/EmptyState`
- Import: `import { EmptyState } from '@amezquita/design-system/components/patterns/EmptyState'`

## Props

| Prop | Type | Description |
|---|---|---|
| `icon?` | `React.ReactNode` |  |
| `title` | `string` |  |
| `description?` | `string` |  |
| `action?` | `{ label: string; onClick: () => void; variant?: 'primary' \| 'secondary' \| 'ghost' }` |  |
| `level?` | `2 \| 3 \| 4 \| 5 \| 6` |  |
| `compact?` | `boolean` |  |
| `className?` | `string` |  |

## Usage example

```tsx
<EmptyState
  icon={<SearchIcon />}
  title="No results found"
  description="Try adjusting your search or filters to find what you're looking for."
  action={{ label: 'Clear filters', onClick: () => {} }}
/>
```
