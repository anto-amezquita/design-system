---
"@amezquita/design-system": minor
---

Line-heights for static text now sit on the same 4px grid as the spacing scale (`decisions/0012`). `--line-height-body` changes from `1.5` to `28px`, and six new semantic roles pair with the other static font sizes: `--line-height-control` (24px), `--line-height-small` (20px), `--line-height-lead` (32px) and `--line-height-h4` through `--line-height-h6` (32/24/24px). `--line-height-display`, `--line-height-heading` and `--line-height-label` are unchanged, and fluid H1–H3 headings keep their unitless ratios.

Most components move by 1–2px at most: Heading H4–H6, Dialog's title, Toast, Tooltip, form hints, table headers, Breadcrumb and DataTable text now resolve to exact grid values. 16px control text stays at 24px.

If your own CSS relies on `--line-height-body`: it is now a fixed pixel value, so it no longer scales with the element's font size. Text inheriting it from `<body>` gets 28px whatever its size. Use the role that matches your font size instead.

**Removed, because no component used them:** `--font-size-micro` and the `--font-size-2xs` primitive behind it (10px), and the unitless `--line-height-normal` (1.5) and `--line-height-loose` (1.75) primitives. If your own CSS uses any of them, set the value in your own CSS instead.
