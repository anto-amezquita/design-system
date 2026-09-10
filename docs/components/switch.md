# Switch

> Binary toggle for on/off settings; renders as a styled checkbox under the hood

- Tier: primitives
- Storybook: `Components/Switch`
- Import: `import { Switch } from '@amezquita/design-system/components/primitives/Switch'`

## Props

| Prop | Type | Description |
|---|---|---|
| `id?` | `string` |  |
| `label?` | `string` |  |
| `checked?` | `boolean` | Controlled checked state. Pair with onCheckedChange; use defaultChecked instead for uncontrolled. |
| `defaultChecked?` | `boolean` |  |
| `onCheckedChange?` | `(checked: boolean) => void` |  |
| `disabled?` | `boolean` | Blocks interaction and removes the control from the tab order. |
| `required?` | `boolean` |  |
| `name?` | `string` |  |
| `value?` | `string` |  |
| `aria-label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--switch-thumb-size` | dimension | `16px` |
| `--switch-track-height` | dimension | `24px` |
| `--switch-track-width` | dimension | `44px` |

## Usage example

```tsx
<Switch
  id="default"
  label="Enable notifications"
/>
```
