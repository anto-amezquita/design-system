# CodeBlock

> A block of code in the monospace face, with a filename or language, a Copy button, line numbers and highlighted lines

- Tier: primitives
- Storybook: `Components/CodeBlock`
- Import: `import { CodeBlock } from '@amezquita/design-system/components/primitives/CodeBlock'`

## Props

| Prop | Type | Description |
|---|---|---|
| `code` | `string` | The code, as plain text. Leading and trailing blank lines are trimmed. |
| `language?` | `string` | Shown in the header and used to name the block: "tsx", "css", "bash". |
| `filename?` | `string` | Shown in the header instead of the language, and used to name the block: "Button.tsx". |
| `copyable?` | `boolean` | A Copy button in the header. Default `true`. |
| `lineNumbers?` | `boolean` | Numbers in the margin. They're not selectable and not read out. |
| `highlight?` | `number[]` | Lines to mark, 1-based: `[3, 4]`. Marked with a bar as well as a tint, and announced. |
| `wrap?` | `boolean` | Wrap long lines instead of scrolling sideways. Default `false`, so indentation stays readable. |
| `maxHeight?` | `string \| number` | Height limit before it scrolls vertically too: a CSS length or pixels. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children'>`

## Best practices

### Do

- Give a `filename` when the code is a file someone will create; otherwise the `language`.
- Highlight the lines the text talks about.
- Keep examples short enough to read without scrolling vertically; split long ones.

### Don't

- Don't use CodeBlock for a single word or short command in a sentence; that's inline `code`.
- Don't wrap code where indentation carries meaning (Python, YAML); scroll instead.
- Don't put secrets or real tokens in examples; they get copied.

## Accessibility

- A `figure` named by its filename or language, with the code in `pre > code`
- Long lines scroll sideways inside a ScrollArea, which is a named, focusable region, so keyboard users can scroll it; `wrap` wraps them instead
- Copy is an IconButton named "Copy Save.tsx"; after copying it reads "Copied" and a polite status message says "Copied to clipboard". If the clipboard is blocked the button stays as it was
- Line numbers are `aria-hidden` and not selectable, so they're neither read out nor copied by hand
- Highlighted lines are a `<mark>` (which some screen readers announce) with a bar as well as a tint, so colour isn't the only signal; unlike hidden text, the mark adds nothing to a manual copy
- Code, line numbers, header and highlighted lines are tested at 4.5:1 in all five brands, light and dark
- **No syntax colouring.** The system has no highlighter dependency (ADR 0002); whether to add one is decided with Markdown
