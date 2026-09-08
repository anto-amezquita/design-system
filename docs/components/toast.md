# Toast

> Ephemeral notification pushed to a corner of the viewport; auto-dismisses after a timeout

- Tier: composition
- Storybook: `Components/Toast`
- Import: `import { Toast } from '@amezquita/design-system/components/composition/Toast'`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--toast-accent-width` | dimension | `4px` |
| `--toast-close-offset` | dimension | `8px` |
| `--toast-font-size` | dimension | `14px` |
| `--toast-max-width` | dimension | `380px` |
| `--toast-title-weight` | fontWeight | `600` |
| `--toast-viewport-inset` | dimension | `24px` |

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
