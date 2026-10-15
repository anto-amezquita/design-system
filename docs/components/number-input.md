# NumberInput

> A number typed or stepped: a quantity, an amount, a percentage

- Tier: primitives
- Storybook: `Components/NumberInput`
- Import: `import { NumberInput } from '@amezquita/design-system/components/primitives/NumberInput'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` |  |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `value?` | `number \| null` | Controlled value; `null` is empty. Pair with `onValueChange`. |
| `defaultValue?` | `number \| null` | Starting value when uncontrolled. Empty by default. |
| `onValueChange?` | `(value: number \| null) => void` | Called with the number (or `null` when cleared) on each valid change. |
| `min?` | `number` |  |
| `max?` | `number` |  |
| `step?` | `number` | Arrow keys and the − / + buttons move by this. Default 1. |
| `largeStep?` | `number` | Page Up / Page Down move by this. Default `step * 10`. |
| `formatOptions?` | `Intl.NumberFormatOptions` | Number formatting on blur, e.g. `{ maximumFractionDigits: 2 }`. |
| `locale?` | `string` | Locale for formatting, e.g. "da-DK" shows 1,5. Defaults to the browser's. Typing accepts either decimal mark. |
| `unit?` | `string` | Text joined after the field and read with it: "kr.", "kg", "%". |
| `hideSteppers?` | `boolean` | Hide the − / + buttons; the keyboard still steps. |
| `name?` | `string` |  |
| `placeholder?` | `string` |  |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Best practices

### Do

- Set `min` and `max` whenever there are limits, so the buttons and End / Home can use them.
- Use `unit` instead of putting the unit in the label.
- Accept the person's own decimal mark: "1,5" and "1.5" both work.

### Don't

- Don't use NumberInput for numbers that aren't amounts, like a phone number, a card or a postcode; use Input.
- Don't use it for a rough value on a wide range; that's Slider.
- Don't format with thousand separators while someone types; it happens after.

## Accessibility

- WAI-ARIA spinbutton pattern on a text input: `role="spinbutton"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` including the unit ("50 kr.")
- Keyboard: arrows step, Page Up / Down take big steps, Home / End jump to the limits
- The − / + buttons are named after the field ("Increase Guests") and kept out of the Tab order, as the pattern suggests; the keys do the same
- `inputMode="decimal"` brings up a number keyboard on phones
- Not `<input type="number">`: that changes value on scroll and rejects a decimal comma
