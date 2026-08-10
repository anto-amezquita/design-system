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
| `--tooltip-background` | color | `#1C1917` † |
| `--tooltip-border-radius` | dimension | `4px` |
| `--tooltip-delay-duration` | other | `400` |
| `--tooltip-font-size` | dimension | `12px` |
| `--tooltip-font-weight` | fontWeight | `500` |
| `--tooltip-foreground` | color | `#FAFAF9` † |
| `--tooltip-max-width` | dimension | `260px` |
| `--tooltip-padding-x` | dimension | `12px` |
| `--tooltip-padding-y` | dimension | `8px` |
| `--tooltip-shadow` | shadow | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)` |
| `--tooltip-side-offset` | other | `6` |
| `--tooltip-z-index` | other | `600` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Tooltip content="Copy to clipboard">
  <Button variant="ghost" icon={<CopyIcon size={16} aria-hidden="true" />} aria-label="Copy to clipboard">
    Copy
  </Button>
</Tooltip>
```
