---
'@amezquita/design-system': minor
---

`Textarea` takes `autoResize`: the field starts at `rows` lines and grows with the text instead of scrolling, up to `maxRows` if you set it, then scrolls. It shrinks back when text goes, re-measures when its width changes, and has no resize handle while it sizes itself. `ChatComposer` uses the same code (`hooks/useAutoResize`), and now also re-measures when its width changes. A Textarea without `autoResize` is unchanged.
