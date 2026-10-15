---
"@amezquita/design-system": minor
---

New `TableOfContents` pattern: the sections of a long page as links, with the one being read marked. It's a `nav` named "On this page" with a nested list. The current link gets `aria-current="location"` and an accent bar, so it doesn't rely on colour. It follows the scroll of the page or a container, marks a clicked link at once, and counts a short last section at the end of the page. `headingsToItems` builds the items from the page's headings.
