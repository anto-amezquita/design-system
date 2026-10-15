# Select

> Dropdown for choosing a single value from a list; supports grouped options

- Tier: primitives
- Storybook: `Components/Select`
- Import: `import { Select } from '@amezquita/design-system/components/primitives/Select'`

## Props

| Prop | Type | Description |
|---|---|---|
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onValueChange?` | `(value: string) => void` |  |
| `placeholder?` | `string` |  |
| `disabled?` | `boolean` |  |
| `required?` | `boolean` |  |
| `name?` | `string` |  |
| `groups` | `{ label?: string; options: { value: string; label: string; disabled?: boolean }[] }[]` |  |
| `aria-label?` | `string` | The trigger is a combobox, which gets no accessible name from its content. Required on its own; inside a Field, the Field's label names it and this can be left out. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--select-item-padding-x` | dimension | `16px` |
| `--select-item-padding-y` | dimension | `8px` |

## Usage example

```tsx
<div style={{ maxWidth: '280px' }}>
  <Select {...args} />
</div>
```

## Accessibility

- Trigger is a `<button>` via Radix — do not wrap it in another button
- The trigger is a `combobox`, which gets no accessible name from its content: give it an `aria-label`, or put it in a `Field` (a dev warning fires when it has neither). In a Field with an `error`, the trigger gets `aria-invalid` and the red edge Input uses
- Keyboard: `Space` / `Enter` / `ArrowDown` opens; arrow keys navigate; `Enter` selects; `Escape` closes
- Focus returns to trigger on close (Radix default)
