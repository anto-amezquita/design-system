# Timestamp

> A moment in time as people say it ("5 minutes ago", "yesterday") or as a date, in a `time` element

- Tier: primitives
- Storybook: `Components/Timestamp`
- Import: `import { Timestamp } from '@amezquita/design-system/components/primitives/Timestamp'`

## Props

| Prop | Type | Description |
|---|---|---|
| `date` | `Date \| string \| number` | The moment: a Date, an ISO string or epoch milliseconds. |
| `format?` | `'relative' \| 'date' \| 'datetime' \| 'time'` | `relative` (default): "5 minutes ago", "yesterday", switching to a date after `relativeLimitDays`. `date`: "20 Oct 2026". `datetime`: "20 Oct 2026, 11:30". `time`: "11:30". |
| `locale?` | `string` | Locale for the words and the date order. Default: the browser's. |
| `relativeLimitDays?` | `number` | With `relative`: past this many calendar days, show the date instead. Default 7. |
| `live?` | `boolean` | With `relative`: keep the text current while the page is open. Default `true`. |

Also accepts all props of: `Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'>`

## Usage example

```tsx
args => <p style={text}>Edited <Timestamp {...args} /></p>
```

## Best practices

### Do

- Use `relative` for recent activity: comments, edits, messages.
- Use `date` or `datetime` where the exact moment matters, and in tables people scan or sort.
- Pass `locale` from the user's settings, so the words match the rest of the page.

### Don't

- Don't use relative time for future deadlines people plan around; "in 3 days" hides which day.
- Don't build the string yourself; the date order and the words differ by locale.
- Don't wrap a Timestamp in a live region; it would announce every minute.

## Accessibility

- A `time` element with the exact moment in `dateTime`, so machines and assistive tech that read it get the precise value
- The words come from `Intl.RelativeTimeFormat` with `numeric: "auto"`: "yesterday" rather than "1 day ago", and "i går" in Danish
- Days count calendar days: something from 23:50 reads as "yesterday" at 00:10, not "20 minutes ago" rounded into hours
- The full date and time is the `title`, which only mouse users see. Where the exact moment matters (a contract, a transaction), use an absolute `format` instead
- Live updates change the text quietly, with no live region, so screen readers aren't interrupted every minute; the timer slows from 15 seconds to hourly as the moment gets older, and nothing runs for absolute formats
- Tabular figures, so a live value doesn't shift as its digits change
- Server rendering: the relative text depends on the clock, so the server and first client render can differ by seconds; the hydration warning is suppressed on purpose and the client's text wins
