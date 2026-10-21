# 0027 — Overlays share one layer, above the page's sticky layer

## Status

Accepted (2026-10-21). Amends [`0007`](./0007-universal-prop-passthrough-and-nesting-safe-z-index.md).

## Context

0007 fixed a Select that opened behind its own Dialog by taking the z-index off every portalled overlay. With none set, overlays paint in the order they're appended to `<body>`, so the one opened last is on top. That part works and is tested (`Select.nesting.test.tsx`, `Dialog.nesting.test.tsx`, `Menu.nesting.test.tsx`).

What it missed: anything on the page with a positive z-index now paints above every overlay. A sticky header is the usual case. This system's own TopNav and MobileNav set `--z-sticky` (100), and so does the docs site's header. On design.amezquita.dk on 2026-10-21, the Filters Drawer opened under the site header: its title and Close button were cut off at the top, and the backdrop didn't dim the header. A Dialog or Drawer opened from a page with TopNav or AppShell would do the same.

## Decision

**Every portalled overlay layer sets `z-index: var(--z-overlay)` (300), the same value for all of them:** Dialog's and Drawer's backdrop and panel (AlertDialog and the internal BaseSheet use those classes), Select's list, Popover (and HoverCard, which uses its class), Menu (and ContextMenu), CommandPalette and Lightbox.

- **Above the page:** 300 is above `--z-sticky` (100) and NavigationMenu's in-page dropdown (`--z-dropdown`, 200).
- **Among overlays:** equal z-index values tie, and ties paint in DOM order. So the one mounted last is still on top, which is what 0007 wanted. A Select inside a Dialog, or an AlertDialog over a Drawer, behaves as before.
- **Toast (`--z-toast`, 500), Tooltip (`--z-tooltip`, 600) and SkipLink (`--z-skip-link`, 700)** keep their higher tiers. They should sit above overlays.
- **`--z-overlay` is no longer deprecated.** `1.3.3` had marked it for removal in 2.0 as unused, and its description now says what it's for. `--z-modal` stays deprecated.

## Alternatives considered

- **Lower the page's sticky layer (z-index 0 or auto).** That can't be done here: the sticky header is the consumer's, and any positive z-index on it beats an overlay with none. The overlays have to sit above the page; the page can't be asked to sit below them.
- **Bring back a z-index per kind (dropdown < overlay < modal).** That's the scale 0007 removed, because a nested dropdown then loses to its parent. One shared value keeps 0007's mount-order behaviour and only adds the floor.
- **Portal overlays into a dedicated top-level container with its own z-index.** It works too, but Radix portals each overlay separately; one container would mean passing it to every Portal, and a consumer's own Radix overlays wouldn't be in it.

## Consequences

### Positive

- Dialogs, Drawers, menus and lists open above sticky headers and bottom bars, in this system's own TopNav and AppShell and in consumers' pages.
- Nested overlays keep working as in 0007. The three nesting tests still pass unchanged.
- `Overlay.sticky.test.tsx` checks the new floor with real hit-testing: a Drawer's Close button under a sticky header is clickable, and a Dialog's backdrop covers the header. Both fail without this change.

### Negative

- A consumer's own element with a z-index above 300 (a cookie banner at 9999, say) still paints above overlays. That's the consumer's choice to make, and the token values are documented.
- Ties resolve by DOM order only while every overlay is portalled to `<body>`. An overlay rendered in place (not portalled) at the same z-index would paint by its own position in the page. All ten listed here are portalled.

## Related files

- `components/composition/Dialog/Dialog.css`, `Drawer/Drawer.css`, `Popover/Popover.css`, `Menu/Menu.css`, `CommandPalette/CommandPalette.css`, `Lightbox/Lightbox.css`, `components/primitives/Select/Select.css`: the shared layer
- `components/composition/Dialog/Overlay.sticky.test.tsx`: the new test
- `tokens/brands/base/light.json`: `z-overlay`, no longer deprecated
- `docs/backlog.md`: the 2.0 removal list now has three tokens
