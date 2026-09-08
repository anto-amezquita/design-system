# Checkbox

> Single boolean selection with an associated label; supports indeterminate state

- Tier: primitives
- Storybook: `Components/Checkbox`
- Import: `import { Checkbox } from '@amezquita/design-system/components/primitives/Checkbox'`

## Props

| Prop | Type | Description |
|---|---|---|
| `id?` | `string` |  |
| `label?` | `string` |  |
| `checked?` | `CheckedState` |  |
| `defaultChecked?` | `CheckedState` |  |
| `onCheckedChange?` | `(checked: CheckedState) => void` |  |
| `disabled?` | `boolean` |  |
| `required?` | `boolean` |  |
| `name?` | `string` |  |
| `value?` | `string` |  |
| `aria-label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--checkbox-border` | color | `#A8A29E` † |
| `--checkbox-border-radius` | dimension | `4px` |
| `--checkbox-border-width` | dimension | `1px` |
| `--checkbox-foreground-checked` | color | `#FFFFFF` † |
| `--checkbox-foreground-indeterminate` | color | `#FFFFFF` † |
| `--checkbox-label-gap` | dimension | `12px` |
| `--checkbox-size` | dimension | `24px` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Checkbox
  id="default"
  label="Accept terms and conditions"
/>
```
