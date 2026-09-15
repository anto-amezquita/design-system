---
"@amezquita/design-system": minor
---

Expanded the primitive `space` scale from 10 to 13 steps (4/8/12/16/20/24/28/32/40/48/64/96/128, `space.1`–`space.13`), filling gaps the old scale had past 16px (no 20px, no 28px step). Every existing token reference was repointed to the new step holding the same pixel value — this is non-breaking, no resolved value changes for existing usages.

Added three new semantic tokens — `space-dialog-padding-mobile`, `space-dialog-padding-tablet`, `space-dialog-padding-desktop` (16px/24px/32px) — and made `Dialog`'s content padding responsive via a real `@media` query (768px/1024px breakpoints) switching between them, replacing the previous single static padding value.
