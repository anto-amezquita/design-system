---
"@amezquita/design-system": patch
---

A disabled Button no longer reacts to hover. The variants' `:hover` rules had the same specificity as `.button:disabled` and came later in the file, so a disabled secondary button turned the accent colour under the pointer, as if it could be pressed. Every hover rule now skips `:disabled` and `.button--disabled`, which also covers a loading Button (natively disabled).
