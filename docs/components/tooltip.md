# Tooltip

> Contextual label revealed on hover or focus — supplements an icon or truncated text

- Tier: composition
- Storybook: `Components/Tooltip`
- Import: `import { Tooltip } from '@amezquita/design-system/components/composition/Tooltip'`

## Props

| Prop | Type | Description |
|---|---|---|
| `content` | `React.ReactNode` |  |
| `children` | `React.ReactElement` |  |
| `side?` | `'top' \| 'right' \| 'bottom' \| 'left'` |  |
| `delayDuration?` | `number` |  |
| `open?` | `boolean` |  |
| `defaultOpen?` | `boolean` |  |
| `onOpenChange?` | `(open: boolean) => void` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--tooltip-arrow-size` | dimension | `8px` |
| `--tooltip-border-radius` | dimension | `4px` |
| `--tooltip-delay-duration` | number | `400` |
| `--tooltip-font-size` | dimension | `12px` |
| `--tooltip-font-weight` | fontWeight | `500` |
| `--tooltip-max-width` | dimension | `260px` |
| `--tooltip-side-offset` | number | `6` |

## Usage example

```tsx
<Tooltip content="Copy to clipboard">
  <Button variant="ghost" icon={<CopyIcon size={16} aria-hidden="true" />} aria-label="Copy to clipboard">
    Copy
  </Button>
</Tooltip>
```
