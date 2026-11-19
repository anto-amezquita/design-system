---
'@amezquita/design-system': minor
---

`Item` takes `onClick` for a row that does something rather than going somewhere, like opening a Dialog: the title becomes a `<button type="button">`, named by the title and stretched over the row the way `href`'s link is, with the same hover and focus ring. Buttons in `trailing` stay their own targets and Tab stops. With `href` too, the row stays a link and `onClick` runs on it. `onClick` used to land on the `<li>`, where a keyboard couldn't reach it.

A controlled `Dialog` or `Drawer` with no `trigger` now gives focus back to whatever opened it when it closes, modal or not. Focus used to fall to `<body>`, because Radix only returns focus to a trigger.
