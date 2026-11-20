---
'@amezquita/design-system': minor
---

`Badge` takes `as="button"` for a status pill that does something: it renders a real `<button type="button">`, so the keyboard reaches it and a Dialog or Drawer can use it as its `trigger`, with Radix's trigger attributes and ref landing on the button. On hover its border turns the text colour, keyboard focus shows the focus ring, and an invisible margin grows its target past 24px without changing its size. A Badge without `as` is the same `span` as before. A dot can't be a button. Badge's `ref` is now typed `HTMLElement`; a `RefObject<HTMLSpanElement>` still type-checks.
