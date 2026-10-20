---
"@amezquita/design-system": minor
---

New `Stack` primitive: lays its children out in a column or a row with a gap from the brand's spacing roles (`tight`, `inline`, `element`, `component`, `section`), so spacing lives in one place instead of in margins. It takes `align`, `justify` and `wrap`, and an `as` prop for semantic elements; as a `ul` or `ol` it drops the markers and keeps `role="list"` so Safari still announces it as a list.
