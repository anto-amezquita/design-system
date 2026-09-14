# Checkbox

> Single boolean selection with an associated label; supports indeterminate state

- Tier: primitives
- Storybook: `Components/Checkbox`
- Import: `import { Checkbox } from '@amezquita/design-system/components/primitives/Checkbox'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label?` | `string` |  |
| `checked?` | `CheckedState` |  |
| `defaultChecked?` | `CheckedState` |  |
| `onCheckedChange?` | `(checked: CheckedState) => void` |  |
| `aria-label?` | `string` |  |

Also accepts all props of: `Omit<React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'onCheckedChange' | 'checked' | 'defaultChecked' | 'children' | 'asChild'>`

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
