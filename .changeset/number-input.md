---
"@amezquita/design-system": minor
---

New `NumberInput` primitive: a number typed or stepped, on the WAI-ARIA spinbutton pattern rather than `<input type="number">`, so it doesn't change on scroll and accepts either decimal mark ("1,5" or "1.5"). Arrows step, Page Up / Down take big steps, Home / End jump to the limits; − / + buttons are named after the field and disable at the limits. `unit` is read with the value, `locale` and `formatOptions` format it after editing, and text that isn't a number is kept with "Enter a number." Built from InputGroup, whose error edge now covers buttons as well. No new tokens.
