---
"@amezquita/design-system": minor
---

New `ResizablePanels` pattern: two panes with a separator people drag or move with the keyboard, following the WAI-ARIA window splitter pattern. The separator is focusable and announces its size and range; arrows, Home and End move it, Enter collapses the first pane when `collapsible`, and double-click resets. Dragging uses pointer capture and follows right-to-left layouts. Controlled or uncontrolled, horizontal or vertical. No new dependency.
