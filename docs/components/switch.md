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
| `checked?` | `boolean` |  |
| `defaultChecked?` | `boolean` |  |
| `onCheckedChange?` | `(checked: boolean) => void` |  |
| `disabled?` | `boolean` |  |
| `required?` | `boolean` |  |
| `name?` | `string` |  |
| `value?` | `string` |  |
| `aria-label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--switch-duration` | duration | `200ms` |
| `--switch-label-color` | color | `#0A0A0A` † |
| `--switch-label-color-disabled` | color | `#57534E` † |
| `--switch-label-gap` | dimension | `12px` |
| `--switch-label-size` | dimension | `16px` |
| `--switch-thumb-background` | color | `#FFFFFF` † |
| `--switch-thumb-border-radius` | dimension | `9999px` |
| `--switch-thumb-size` | dimension | `16px` |
| `--switch-track-background` | color | `#A8A29E` † |
| `--switch-track-background-checked` | color | `#292524` † |
| `--switch-track-background-disabled` | color | `#E2DDD9` † |
| `--switch-track-border-radius` | dimension | `9999px` |
| `--switch-track-height` | dimension | `24px` |
| `--switch-track-width` | dimension | `44px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Switch
  id="default"
  label="Enable notifications"
/>
```
