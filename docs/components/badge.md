# Badge

> Small status indicator or numeric count overlay attached to another element

- Tier: primitives
- Storybook: `Components/Badge`
- Import: `import { Badge } from '@amezquita/design-system/components/primitives/Badge'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'neutral' \| 'success' \| 'warning' \| 'error' \| 'info'` |  |
| `shape?` | `'dot' \| 'status' \| 'count'` |  |
| `aria-label?` | `string` |  |
| `children?` | `never \| React.ReactNode` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--badge-border-radius` | dimension | `9999px` |
| `--badge-border-width` | dimension | `1px` |
| `--badge-count-size` | dimension | `20px` |
| `--badge-dot-size` | dimension | `8px` |
| `--badge-error-background` | color | `#FEF2F2` † |
| `--badge-error-border` | color | `#c0392b` † |
| `--badge-error-foreground` | color | `#a93226` † |
| `--badge-font-size` | dimension | `12px` |
| `--badge-font-weight` | fontWeight | `500` |
| `--badge-gap` | dimension | `4px` |
| `--badge-info-background` | color | `#EFF6FF` † |
| `--badge-info-border` | color | `#2563EB` † |
| `--badge-info-foreground` | color | `#1D4ED8` † |
| `--badge-neutral-background` | color | `#F4F0EB` † |
| `--badge-neutral-border` | color | `#E2DDD9` † |
| `--badge-neutral-foreground` | color | `#57534E` † |
| `--badge-padding-x` | dimension | `8px` |
| `--badge-padding-y` | dimension | `4px` |
| `--badge-success-background` | color | `#F0FDF4` † |
| `--badge-success-border` | color | `#16A34A` † |
| `--badge-success-foreground` | color | `#15803D` † |
| `--badge-warning-background` | color | `#FFFBEB` † |
| `--badge-warning-border` | color | `#D97706` † |
| `--badge-warning-foreground` | color | `#B45309` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Badge>Label</Badge>
```
