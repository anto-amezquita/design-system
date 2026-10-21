---
"@amezquita/design-system": patch
---

Overlays open above sticky headers. Dialog, Drawer, AlertDialog, Select, Popover, HoverCard, Menu, ContextMenu, CommandPalette and Lightbox had no z-index (decisions/0007), so anything on the page with one, such as TopNav's or MobileNav's `--z-sticky`, or a site's own sticky header, painted over them: a Drawer's title and Close button sat under the header. They now share one layer, `--z-overlay` (300), above the page's sticky layer; equal values tie, so the overlay opened last still paints on top, as before (decisions/0027). `z-overlay` is no longer deprecated.
