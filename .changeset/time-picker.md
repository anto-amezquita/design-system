---
"@amezquita/design-system": minor
---

New `TimePicker` primitive: an input with a list of time slots, built on Field, InputGroup and Popover. The input is a combobox over a listbox, so focus stays in the input while arrow keys, Page Up / Down, Home / End, Enter and Escape move through the slots. People can also type a time in common forms ("1430", "14.30", "2pm"). The display follows the locale (24-hour or 12-hour), and the value is always "HH:mm". `min`, `max` and `step` limit the slots, and a time outside them gets its own error. Adds `lib/time` helpers.
