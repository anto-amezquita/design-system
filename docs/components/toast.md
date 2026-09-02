# Toast

> Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout

- Tier: composition
- Storybook: `Components/Toast`
- Import: `import { Toast } from '@amezquita/design-system/components/composition/Toast'`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--toast-accent-width` | dimension | `4px` |
| `--toast-background` | color | `#FAFAF9` † |
| `--toast-border` | color | `#E2DDD9` † |
| `--toast-border-radius` | dimension | `8px` † |
| `--toast-border-width` | dimension | `1px` |
| `--toast-close-offset` | dimension | `8px` |
| `--toast-content-gap` | dimension | `4px` |
| `--toast-error-border` | color | `#c0392b` † |
| `--toast-font-size` | dimension | `14px` |
| `--toast-foreground` | color | `#0A0A0A` † |
| `--toast-gap` | dimension | `12px` |
| `--toast-icon-size` | dimension | `20px` |
| `--toast-info-border` | color | `#2563EB` † |
| `--toast-max-width` | dimension | `380px` |
| `--toast-padding-x` | dimension | `24px` |
| `--toast-padding-y` | dimension | `16px` |
| `--toast-shadow` | shadow | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)` |
| `--toast-success-border` | color | `#16A34A` † |
| `--toast-title-weight` | other | `600` |
| `--toast-viewport-inset` | dimension | `24px` |
| `--toast-warning-border` | color | `#D97706` † |
| `--toast-z-index` | other | `500` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
() => {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() => toast({ title: 'Changes saved', description: 'Your settings have been updated.', variant: 'neutral' })}
      style={{
        padding: '8px 16px',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--border-radius-component)',
        background: 'var(--color-surface-secondary)',
        color: 'var(--color-text-primary)',
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      Show toast
    </button>
  )
}
```
