# Alert

> Contextual inline feedback message with semantic severity levels (info, success, warning, error)

- Tier: composition
- Storybook: `Components/Alert`
- Import: `import { Alert } from '@amezquita/design-system/components/composition/Alert'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'success' \| 'warning' \| 'error' \| 'info'` |  |
| `title?` | `string` |  |
| `children` | `React.ReactNode` |  |
| `dismissible?` | `boolean` |  |
| `onDismiss?` | `() => void` |  |
| `icon?` | `React.ReactNode` |  |
| `live?` | `boolean` | Set to false only for alerts that are present at initial server-render time, where content is already parsed by screen readers via normal document reading. For alerts mounted dynamically in response to user actions, always leave this as true — setting live=false on a dynamically-mounted alert makes it invisible to screen readers entirely. Defaults to true. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--alert-border-radius` | dimension | `8px` † |
| `--alert-border-width` | dimension | `1px` |
| `--alert-close-offset` | dimension | `8px` |
| `--alert-content-gap` | dimension | `4px` |
| `--alert-error-background` | color | `#FEF2F2` † |
| `--alert-error-border` | color | `#c0392b` † |
| `--alert-error-foreground` | color | `#a93226` † |
| `--alert-exit-distance` | other | `4px` |
| `--alert-font-size` | dimension | `16px` |
| `--alert-gap` | dimension | `12px` |
| `--alert-icon-size` | dimension | `20px` |
| `--alert-info-background` | color | `#EFF6FF` † |
| `--alert-info-border` | color | `#2563EB` † |
| `--alert-info-foreground` | color | `#1D4ED8` † |
| `--alert-padding-x` | dimension | `24px` |
| `--alert-padding-y` | dimension | `16px` |
| `--alert-success-background` | color | `#F0FDF4` † |
| `--alert-success-border` | color | `#16A34A` † |
| `--alert-success-foreground` | color | `#15803D` † |
| `--alert-title-weight` | other | `600` |
| `--alert-warning-background` | color | `#FFFBEB` † |
| `--alert-warning-border` | color | `#D97706` † |
| `--alert-warning-foreground` | color | `#B45309` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Alert variant="info" title="New update available">
  A new version is ready. Refresh to get the latest changes.
</Alert>
```
