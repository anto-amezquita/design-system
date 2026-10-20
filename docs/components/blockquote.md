# Blockquote

> A quotation set apart from the text around it, with who said it and where

- Tier: primitives
- Storybook: `Components/Blockquote`
- Import: `import { Blockquote } from '@amezquita/design-system/components/primitives/Blockquote'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` | The quoted words. Plain text, or paragraphs for a longer quote. |
| `attribution?` | `React.ReactNode` | Who said or wrote it: "Dieter Rams". |
| `source?` | `React.ReactNode` | The work it comes from: a book, talk or article title. Rendered in a `cite`. |
| `cite?` | `string` | URL of the source, for the `cite` attribute (read by tools, not shown). |
| `size?` | `'default' \| 'pull'` | `default` for a quote in running text; `pull` for a large quote that breaks up a long page. |

Also accepts all props of: `Omit<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, 'children'>`

## Best practices

### Do

- Quote real words from a real person or work, and say whose.
- Use `pull` once or twice on a long page, to surface a line already in the text.
- Use `cite` to keep the link to the source in the markup.

### Don't

- Don't use Blockquote to indent or highlight text that isn't a quote; that's a Card or an Alert.
- Don't put quotation marks inside it; the layout already says it's a quote.
- Don't use a pull quote for a line that isn't also in the body; screen-reader users get it either way, so it shouldn't carry anything new.

## Accessibility

- The attribution sits outside the `blockquote`, in a `figcaption`, as HTML intends, so screen readers don't read the name as part of the quote
- The work's title is a `cite`; the person's name isn't (HTML reserves `cite` for titles of works)
- Quote and caption are tested at 4.5:1 on the primary and secondary surfaces in all five brands, light and dark
- The rule is decoration; the `blockquote` element is what tells assistive tech it's a quote
