---
"@amezquita/design-system": minor
---

New `HoverCard` composition: a preview of what a link leads to. It's built on Popover rather than Radix HoverCard, so it isn't mouse-only. It opens after a delay on hover or keyboard focus, and Tab moves into the card and on past it. Escape closes it, and it stays open while the pointer is over it (WCAG 1.4.13). A touch doesn't open it. Adds three component tokens: `hover-card-open-delay`, `hover-card-close-delay` and `hover-card-width`.
