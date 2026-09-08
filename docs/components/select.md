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
| `aria-label` | `string` | Required: the trigger is a combobox, which gets no accessible name from its content — without this, screen readers announce an unnamed control. |

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
- `aria-label` is a required prop — the trigger is a `combobox`, which gets no accessible name from its content, so an unnamed control is unshippable by type
- Keyboard: `Space` / `Enter` / `ArrowDown` opens; arrow keys navigate; `Enter` selects; `Escape` closes
- Focus returns to trigger on close (Radix default)
