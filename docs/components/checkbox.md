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
| `--checkbox-size` | dimension | `24px` |

## Usage example

```tsx
<Checkbox
  id="default"
  label="Accept terms and conditions"
/>
```
