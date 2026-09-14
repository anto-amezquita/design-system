---
"@amezquita/design-system": patch
---

Every primitive now forwards a ref, spreads unrecognised props onto its rendered element, and merges a consumer's `className` instead of discarding it. Fixes `Select`'s dropdown rendering behind its own containing `Dialog`.

- **Button**, **Textarea**, **Badge**, **Checkbox**, **Input** all extend the real native element's (or, for `Checkbox`, the real Radix primitive's) own props type and spread `...rest` onto the rendered element — `onKeyDown`, `onBlur`, arbitrary `data-*`/`aria-*` attributes, and third-party libraries that spread their own props onto a rendered node (e.g. `@dnd-kit/sortable`'s `attributes`/`listeners`) now all reach the real DOM node. Previously only `Button` had this (`decisions/0006`); this extends the same pattern to every other primitive with a single rendered element.
- **`className` is now merged, not silently overwritten**, on all five of the above — including `Button`, which `decisions/0006`'s fix didn't close: it spread `...rest` (which carries `className`) but then wrote its own computed `className` after it, unconditionally overwriting whatever a consumer passed.
- **`Button` now forwards Radix's `asChild`-injected ARIA contract *and* an external `className`** — both needed for `Button`/`Badge` to work correctly as a `Dialog`/`AlertDialog` trigger with consumer-supplied styling.
- **`Select`'s dropdown no longer renders behind a `Dialog` it's nested inside.** `Select.css`'s `.select__content` and `Dialog.css`'s `.dialog__overlay`/`.dialog__content` no longer set an explicit `z-index` — both portalled parts now layer by DOM mount order instead of a fixed `dropdown < overlay < modal` rank, the same fix Radix's own maintainers shipped for the identical bug. `--z-dropdown` and `--z-overlay` are now unreferenced (not removed from the token files in this release).
- **`AlertDialog`'s `cancel`/`action` slots can now safely use `Button`** instead of a plain `<button>` — the guidance recommending a raw element there is retired; `Button`'s own `asChild`-composition contract test (`Button.slot.test.tsx`) now covers this.

No breaking changes. No component removed or renamed. Every prop type widened, none narrowed — existing usage of any affected component continues to work identically.
