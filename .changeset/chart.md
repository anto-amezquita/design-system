---
"@amezquita/design-system": minor
---

New `Chart` pattern: line (with an optional area) and grouped bar charts drawn as SVG from tokens. Series take six new semantic tokens, `color-chart-1` to `color-chart-6`, in a fixed order, each tested at 3:1 on both surfaces in every brand and mode, and each series also has its own line style and marker shape. The plot is a focusable chart group with a summary; arrow keys move between points and series and read each one aloud, and "Show as table" shows the same data as a Table. Adds `d3-scale` 4.0.2 and `d3-shape` 3.2.0 for scales and paths (ADR 0026).
