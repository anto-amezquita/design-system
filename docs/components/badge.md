# Badge

> Small status indicator or numeric count overlay attached to another element

- Tier: primitives
- Storybook: `Components/Badge`
- Import: `import { Badge } from '@amezquita/design-system/components/primitives/Badge'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'neutral' \| 'success' \| 'warning' \| 'error' \| 'info'` |  |
| `shape?` | `'dot' \| 'status' \| 'count'` | Visual treatment. `status` is the default pill; `count` is the compact numeric form. Use `dot` (see DotBadgeProps) when there is no visible text, which requires an aria-label. |
| `aria-label?` | `string` |  |
| `children?` | `never \| React.ReactNode` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--badge-count-size` | dimension | `20px` |
| `--badge-dot-size` | dimension | `8px` |
| `--badge-font-size` | dimension | `12px` |
| `--badge-font-weight` | fontWeight | `500` |
| `--badge-padding-x` | dimension | `8px` |
| `--badge-padding-y` | dimension | `4px` |

## Usage example

```tsx
<Badge>Label</Badge>
```
