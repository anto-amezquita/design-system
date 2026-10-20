# Markdown

> Renders a Markdown string with the system's own components, so release notes, READMEs and model answers look like the rest of the product

- Tier: patterns
- Storybook: `Components/Markdown`
- Import: `import { Markdown } from '@amezquita/design-system/components/patterns/Markdown'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `string` | The Markdown source. |
| `headingOffset?` | `0 \| 1 \| 2 \| 3` | How many levels to shift headings down. Default 1: `#` renders an `h2`, because the page already has its `h1`. Use 0 when the Markdown is the whole page and its `#` is the page title. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

## Best practices

### Do

- Use it for content written in Markdown: release notes, docs, a model's answer.
- Set `headingOffset` so the Markdown's headings fit under the page's own.
- Keep using Text, Heading and List directly for interface copy you write in code.

### Don't

- Don't pass HTML expecting it to render; it's shown as text on purpose.
- Don't use Markdown for interface strings like button labels; it adds a parser for no reason.
- Don't skip levels in the source (`#` then `###`); the outline keeps the gap.

## Accessibility

- Each element is the system component, with that component's semantics and tests: headings in the outline (with `id`s for linking), lists announced with their count, tables with header cells, code in a named, keyboard-scrollable CodeBlock, images with their alt text
- Headings shift down one level by default, so a document's `#` doesn't create a second `h1`; levels beyond six stop at `h6`
- Raw HTML in the source is shown as text and never rendered, and `javascript:` URLs are dropped: Markdown often comes from people or models. Tests cover both
- Body text, links and inline code are tested at 4.5:1 in all five brands, light and dark
- Built on `markdown-to-jsx` (ADR 0025). Fenced code has no syntax colouring yet
