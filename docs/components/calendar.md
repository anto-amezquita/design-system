# Calendar

> A month of days to choose one date or a range; the base for DatePicker and DateRangePicker

- Tier: primitives
- Storybook: `Components/Calendar`
- Import: `import { Calendar } from '@amezquita/design-system/components/primitives/Calendar'`

Also accepts all props of: `SingleProps | RangeProps`, `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>`

## Best practices

### Do

- Set `locale` to the reader's, so the week starts on the right day.
- Use `min`, `max` and `isDateDisabled` for days that can't be booked, so they're explained by the calendar, not by an error afterwards.
- Show the chosen date or range in words next to the calendar.

### Don't

- Don't use a Calendar for a date far from today, like a birthday; typing it is quicker (DatePicker allows both).
- Don't hide unavailable days; strike them through so the pattern is visible.
- Don't make a range from two separate Calendars; use `mode="range"`.

## Accessibility

- WAI-ARIA date grid: a `grid` named by the month (and `label`), `gridcell`s named with the full localised date, `aria-selected`, `aria-current="date"` on today, `aria-disabled` on unavailable days, `aria-multiselectable` for ranges
- One Tab stop. Arrows move by day and week, Home / End to the ends of the week, Page Up / Down by month, Shift + Page Up / Down by year, Enter or Space chooses; left and right swap in right-to-left layouts
- The month heading is a polite live region, so moving into a new month is announced
- Chosen days are 4.5:1, and plain days and weekday names 4.5:1 on the page, in every brand and mode (tested). Chosen, today and range are shown by shape (fill, ring, band), not colour alone
