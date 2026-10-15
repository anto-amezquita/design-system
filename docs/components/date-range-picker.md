# DateRangePicker

> A start and an end date: a stay, a report period, leave

- Tier: primitives
- Storybook: `Components/DateRangePicker`
- Import: `import { DateRangePicker } from '@amezquita/design-system/components/primitives/DateRangePicker'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | The question, e.g. "Stay" or "Report period". It's the group's legend. |
| `startLabel?` | `string` | Names of the two fields, read with the label. |
| `endLabel?` | `string` |  |
| `hint?` | `string` | Shown under the fields. Defaults to the format to type. |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `value?` | `{ start: Date; end: Date } \| null` |  |
| `defaultValue?` | `{ start: Date; end: Date } \| null` |  |
| `onValueChange?` | `(range: { start: Date; end: Date } \| null) => void` | Called with a complete, valid range, or `null` when both fields are cleared. |
| `min?` | `Date` |  |
| `max?` | `Date` |  |
| `isDateDisabled?` | `(date: Date) => boolean` | Unavailable days. A range that crosses one is refused, with the day named. |
| `locale?` | `string` |  |
| `showWeekNumbers?` | `boolean` |  |
| `name?` | `string` | Submits `<name>-start` and `<name>-end` as yyyy-mm-dd. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange' | 'id'>`

## Usage example

```tsx
<DateRangePicker
  defaultValue={{ start: oct(12), end: oct(16) }}
/>
```

## Best practices

### Do

- Name the ends in the reader's terms: "Check-in" and "Check-out", "From" and "To".
- Pass `isDateDisabled` for booked days, so a range across one is caught before submit.
- Show the number of nights or days next to the picker once both ends are in.

### Don't

- Don't use two separate DatePickers for one range; they can't check the range as a whole.
- Don't report half a range as a value; DateRangePicker waits for both ends.
- Don't clear the fields on an error; let people change one end.

## Accessibility

- A `<fieldset>` with the label as `<legend>`; each field has its own name ("Check-in", "Check-out"), its own id, and the hint or error as its description, so the reason is heard on the field itself
- Typing in the reader's format, as in DatePicker; Alt + Arrow Down opens the calendar from either field
- The calendar button says what's chosen ("Choose Stay, 12 October 2026 to 16 October 2026 chosen")
- A picked range that can't be used keeps the calendar open with the reason, so it can be changed straight away
