---
"@amezquita/design-system": minor
---

New `Markdown` pattern: renders a Markdown string with the system's own components (Heading, Text, Link, List, Blockquote, CodeBlock, Table, Image, Divider). Headings shift down a level by default (`headingOffset`); raw HTML in the source is shown as text and never rendered, and `javascript:` URLs are dropped. Adds `markdown-to-jsx` 9.10.3 as a dependency (ADR 0025); code blocks have no syntax colouring yet.
