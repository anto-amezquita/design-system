---
"@amezquita/design-system": minor
---

New `DateRangePicker` primitive: a start and an end date, typed in the reader's format or picked with Calendar's range mode in a Popover. It reports a range only when both ends are valid, and refuses an end before the start, dates outside `min` / `max`, and ranges that cross an unavailable day, naming the day. A fieldset with the label as legend; each field has its own name and hears the reason itself. `name` submits both ends as `yyyy-mm-dd`. No new tokens.
