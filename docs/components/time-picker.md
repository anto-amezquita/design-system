# TimePicker

> One time of day: an appointment, a delivery slot, opening hours

- Tier: primitives
- Storybook: `Components/TimePicker`
- Import: `import { TimePicker } from '@amezquita/design-system/components/primitives/TimePicker'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` | Shown under the field. Defaults to an example, e.g. "For example 14.30". |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `value?` | `string \| null` | "HH:mm", 24-hour, the same as a native time input. |
| `defaultValue?` | `string \| null` |  |
| `onValueChange?` | `(time: string \| null) => void` |  |
| `min?` | `string` | Earliest time, "HH:mm". |
| `max?` | `string` | Latest time, "HH:mm". |
| `step?` | `number` | Minutes between the suggested times in the list. Default 15. Typed times can fall between them. |
| `locale?` | `string` | 12- or 24-hour clock and separators. Defaults to the browser's locale. |
| `name?` | `string` | Submits the time as "HH:mm". |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Usage example

```tsx
<TimePicker
  defaultValue="14:30"
/>
```

## Best practices

### Do

- Set `step` to the slots you really offer, and `min` / `max` to the opening hours.
- Let the hint show the format people should type.

### Don't

- Don't use TimePicker for a duration; use NumberInput with a unit.
- Don't force 24-hour or 12-hour; let `locale` decide.

## Accessibility

- The input is a `combobox` controlling a `listbox`; the active option is followed with `aria-activedescendant`, so focus stays in the input
- Arrow Up / Down open the list at the nearest slot and move; Page Up / Down move an hour; Home / End; Enter picks; Escape closes
- Typing works in any common form ("1430", "14.30", "2pm", "9"); the time is read on Enter or blur
- Each list row is 44px tall
