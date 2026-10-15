---
"@amezquita/design-system": minor
---

New `DatePicker` primitive: a date typed in the reader's own format (order and separators from `locale`; ISO and two-digit years accepted) or picked from Calendar in a Popover. Unreadable, out-of-range and unavailable dates get a reason in words; the format is the default hint; Alt + Arrow Down opens the calendar; `name` submits `yyyy-mm-dd`. Also fixes Calendar's unavailable days, which weren't struck through (the line-through didn't reach the number). No new tokens.
