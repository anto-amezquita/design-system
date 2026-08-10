# Pagination

> Page navigation controls for multi-page data sets; exposes current page and total page count

- Tier: patterns
- Storybook: `Components/Pagination`
- Import: `import { Pagination } from '@amezquita/design-system/components/patterns/Pagination'`

## Props

| Prop | Type | Description |
|---|---|---|
| `currentPage` | `number` |  |
| `totalPages` | `number` |  |
| `onPageChange` | `(page: number) => void` |  |
| `compact?` | `boolean` |  |
| `className?` | `string` |  |
| `label?` | `string` | Accessible name for the nav landmark — override when a page renders more than one pagination. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--pagination-border` | color | `#E2DDD9` † |
| `--pagination-border-radius` | dimension | `4px` |
| `--pagination-border-width` | dimension | `1px` |
| `--pagination-button-background` | color | `transparent` |
| `--pagination-button-background-active` | color | `#292524` † |
| `--pagination-button-background-hover` | color | `#F4F0EB` † |
| `--pagination-button-color` | color | `#57534E` † |
| `--pagination-button-color-active` | color | `#FFFFFF` † |
| `--pagination-button-font-size` | dimension | `14px` |
| `--pagination-button-font-weight` | fontWeight | `500` |
| `--pagination-button-size` | dimension | `48px` |
| `--pagination-gap` | dimension | `8px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<PaginationDemo totalPages={10} initialPage={5} />
```
