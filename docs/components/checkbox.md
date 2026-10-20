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

## Accessibility

- The box's corner is the brand's interactive radius, capped at a quarter of the box, so a checkbox never turns into a circle and reads as a radio in a round brand (demo-soft, demo-cool). SelectableCard's `multiple` indicator and MultiSelect's option mark follow the same cap; radios stay round. Tested in all five brands
