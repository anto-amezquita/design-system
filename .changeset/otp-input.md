---
"@amezquita/design-system": minor
---

New `OtpInput` primitive: a short code shown one box per character. It's one real input with `autocomplete="one-time-code"` drawn over the boxes, so paste, SMS autofill, password managers and screen readers work as with any field. Numeric or alphanumeric, any length, `onComplete` when full. It has no `maxlength`, so a pasted "482 913" keeps its last digit. Label, hint and error come from Field. No new tokens.
