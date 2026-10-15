# DatePicker

> A date typed or picked from a calendar: delivery dates, bookings, deadlines

- Tier: primitives
- Storybook: `Components/DatePicker`
- Import: `import { DatePicker } from '@amezquita/design-system/components/primitives/DatePicker'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` | Shown under the field. When left out, it shows the format to type, e.g. "dd.mm.åååå". |
| `error?` | `string` | An error from your own validation. Typed dates that can't be read, or fall outside the limits, get their own message. |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `value?` | `Date \| null` |  |
| `defaultValue?` | `Date \| null` |  |
| `onValueChange?` | `(date: Date \| null) => void` | Called with a valid, allowed date, or `null` when cleared. |
| `min?` | `Date` |  |
| `max?` | `Date` |  |
| `isDateDisabled?` | `(date: Date) => boolean` |  |
| `locale?` | `string` | Format, order and calendar names. Defaults to the browser's locale. |
| `showWeekNumbers?` | `boolean` |  |
| `name?` | `string` | Submits the date as yyyy-mm-dd under this name. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Usage example

```tsx
<DatePicker
  defaultValue={oct(22)}
/>
```

## Best practices

### Do

- Leave typing on: it's the quickest way to enter a birthday or a date years away.
- Set `min`, `max` and `isDateDisabled`, so the calendar and the typed check agree.
- Set `locale` to the reader's, so the format they type is the format they see.

### Don't

- Don't use three Selects for day, month and year; type it.
- Don't validate while someone is still typing; DatePicker waits for blur or Enter.
- Don't use a DatePicker for a range of dates; that's DateRangePicker.

## Accessibility

- A text field named by the label, described by the format or the error; typing in the reader's own format works ("15/10/26", "15 10 2026", "2026-10-15")
- The calendar button says what's chosen ("Choose Delivery date, 22 October 2026 chosen"); Alt + Arrow Down in the field opens it, as on a native date field
- The calendar opens on the chosen date with focus on it, and picking closes it and returns focus (Popover); all of Calendar's keyboard support applies
- Reasons are in words, never just "invalid"
