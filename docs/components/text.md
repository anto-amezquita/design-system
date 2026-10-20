# Text

> Body text in the brand's type roles (body, small, caption), with a tone and a weight

- Tier: primitives
- Storybook: `Components/Text`
- Import: `import { Text } from '@amezquita/design-system/components/primitives/Text'`

## Props

| Prop | Type | Description |
|---|---|---|
| `size?` | `'body' \| 'small' \| 'caption'` | Type role: `body` (default) for running text, `small` for supporting text (hints, metadata), `caption` for the smallest labels (figure captions, timestamps). Each is the brand's own size and line height. |
| `tone?` | `'primary' \| 'secondary' \| 'inherit'` | `primary` (default), `secondary` for less important text (still 4.5:1 on the page surfaces), or `inherit` to take the colour of the parent, like text inside a Button or Alert. |
| `weight?` | `'body' \| 'label'` | Weight role: `body` (default) or `label`, a little heavier, for a term or a value that should stand out. |
| `truncate?` | `boolean \| number` | Cut the text off with an ellipsis after this many lines (`true` = 1). The full text stays in the page for screen readers and copying; show it somewhere else too (a tooltip, a detail page) if sighted users need it. |
| `as?` | `'p' \| 'span' \| 'div' \| 'strong' \| 'em' \| 'small' \| 'figcaption' \| 'li' \| 'dd' \| 'dt'` | Element to render. `p` (default); `span` inside a line; `strong`/`em` when the emphasis is meaning, not style. |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Usage example

```tsx
args => <div style={{ maxWidth: '36rem' }}><Text {...args} /></div>
```

## Best practices

### Do

- Use `body` for running text, `small` for supporting text, `caption` for the smallest labels.
- Use `tone="secondary"` to step text back; it still meets 4.5:1.
- Use `as="span"` inside a line, and `as="strong"` when the emphasis changes the meaning.

### Don't

- Don't use Text for headings; that's Heading, which puts the text in the page outline.
- Don't truncate content people need to read in full, like an error or a price.
- Don't set colours on Text by hand; if a tone is missing, it's a token to add, not a one-off.

## Accessibility

- Primary and secondary text at every size are tested at 4.5:1 or more on the primary, secondary and tertiary surfaces, in all five brands, light and dark
- The size and the element are separate: pick `as` for meaning (`strong`, `em`) and `size`/`weight` for looks. `em` keeps its italics
- Truncated text stays whole in the page, so screen readers read all of it; sighted users only see the start, so show the full text somewhere too (a `title`, a Tooltip, a detail page)
- Sizes come from tokens in px/rem, so text scales with browser zoom (WCAG 1.4.4)
