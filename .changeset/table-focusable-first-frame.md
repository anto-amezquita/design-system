---
"@amezquita/design-system": patch
---

Table: an overflowing table is a keyboard-reachable scroll region from its first frame. The wrapper measured its overflow in `useEffect`, so it was painted once as a scrolling box without `tabIndex`, `role="region"` or a name. Under React 19.3 the axe check (`scrollable-region-focusable`) landed in that frame. It now measures in `useLayoutEffect`, before paint. No API or token changes.
