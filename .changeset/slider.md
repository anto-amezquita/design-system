---
"@amezquita/design-system": minor
---

New `Slider` primitive: one value from a range on a native `<input type="range">`, so arrow keys, Page Up / Down and Home / End work and screen readers announce it as a slider. The track fills to the thumb in `color-accent-text` (3:1 on the track and the page in every brand and mode), `formatValue` sets `aria-valuetext`, and the whole 44px row is the target. When disabled, only the track fades and the label stays readable. Adds one component token, `slider-track-height`.
