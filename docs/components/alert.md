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
| `--alert-close-offset` | dimension | `8px` |
| `--alert-content-gap` | dimension | `4px` |
| `--alert-exit-distance` | dimension | `4px` |
| `--alert-title-weight` | fontWeight | `600` |

## Usage example

```tsx
<Alert variant="info" title="New update available">
  A new version is ready. Refresh to get the latest changes.
</Alert>
```
