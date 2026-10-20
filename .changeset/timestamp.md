---
"@amezquita/design-system": minor
---

New `Timestamp` primitive: a `time` element that says a moment the way people do ("now", "5 minutes ago", "yesterday", in the given locale) and switches to a date after `relativeLimitDays` (default 7), or shows a `date`, `datetime` or `time`. The exact moment is in `dateTime` and the full date is the tooltip. Relative text stays current while the page is open, updating less often as the moment gets older.
