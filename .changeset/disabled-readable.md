---
"@amezquita/design-system": patch
---

`IconButton` and `SegmentedControl` no longer fade when disabled. The shared disabled opacity (0.1) left their icons and labels close to invisible. A disabled IconButton now has a quiet surface and border with the icon in secondary text (4.5:1), and a ghost IconButton stays without the surface. A disabled segment keeps its label in secondary text. A fully disabled SegmentedControl keeps its chosen segment visible. Tests check 4.5:1 in every brand and mode.
