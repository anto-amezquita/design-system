---
"@amezquita/design-system": minor
---

New `Image` primitive: an `img` with a required `alt`, lazy loading and async decoding by default, and the space held before it loads (from `width`/`height`, or a `ratio` through AspectRatio). If the file fails, it shows a quiet fallback at the same size that keeps the image's name for screen readers. `caption` renders it as a named `figure`.
