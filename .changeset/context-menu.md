---
"@amezquita/design-system": minor
---

New `ContextMenu` composition on Radix ContextMenu (adds `@radix-ui/react-context-menu` 2.3.7, the release that shares Menu's own Radix menu version, so nothing else is added). It opens on right-click, a long press, or Shift+F10 and the Menu key on the focused area, which it makes focusable. It takes Menu's `groups` and look, plus keyboard shortcuts shown as keycaps and set as `aria-keyshortcuts`. `Menu`'s disabled items now keep readable text (secondary colour, 4.5:1) instead of fading to the disabled opacity.
