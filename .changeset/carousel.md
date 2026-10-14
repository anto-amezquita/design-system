---
"@amezquita/design-system": minor
---

New `Carousel` pattern (with `CarouselSlide`): slides shown one to three at a time on a CSS scroll-snap track, so swipe and trackpads work natively. Follows the WAI-ARIA carousel pattern: a named region, "n of N" slides, out-of-view slides `inert`, Previous / Next and position dots, arrow keys on the track, and a polite "Slide n of N" status after a user move. Optional `autoplay` puts a pause button first, waits while hovered or focused, and never rotates under reduced motion. Adds two component tokens: `carousel-dot-size` and `carousel-autoplay-interval`.
