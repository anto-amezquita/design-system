---
"@amezquita/design-system": minor
---

New `Field` primitive: a label, hint and error for any control, wired the way Input wires its own. It passes `id`, `aria-describedby`, `aria-invalid`, `required` and `disabled` to a single control without overriding what the control sets, and `group` renders a `<fieldset>` with a `<legend>` for radios or a SegmentedControl. `Select` now reads the Field it sits in through `useField()`: inside a Field it takes its name from the label, so `aria-label` becomes optional, and an error gives its trigger `aria-invalid` and the same red edge as Input. No new tokens.
