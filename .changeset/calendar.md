---
"@amezquita/design-system": minor
---

New `Calendar` primitive: a month of days to choose one date or a range (`mode="range"`), on the WAI-ARIA date grid. One Tab stop; arrows, Home / End and Page Up / Down (Shift for years) move; Enter or Space chooses. `min`, `max` and `isDateDisabled` mark unavailable days, which stay reachable and are announced. Names and the first weekday come from `locale` (Monday in Danish), with optional ISO week numbers. Days take the brand's button shape. Adds dependency-free date helpers in `lib/date`. No new tokens.
