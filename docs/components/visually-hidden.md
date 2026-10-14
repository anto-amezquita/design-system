# VisuallyHidden

> Text screen readers announce but sighted users don't see

- Tier: primitives
- Storybook: `Components/VisuallyHidden`
- Import: `import { VisuallyHidden } from '@amezquita/design-system/components/primitives/VisuallyHidden'`

## Props

| Prop | Type | Description |
|---|---|---|
| `as?` | `'span' \| 'div'` | `span` (default) for text inside a line; `div` for a block, like a hidden heading's wrapper. |
| `children` | `React.ReactNode` |  |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Best practices

### Do

- Name an icon-only control with it when there's no visible label.
- Add context a sighted user gets from the layout, like "(opens in a new tab)" or which row a "Delete" button belongs to.
- Keep the hidden text short; it's read every time.

### Don't

- Don't hide something sighted users need too; if it matters, show it.
- Don't put focusable content inside it: a keyboard user would land on something they can't see.
- Don't use it to hide text from screen readers; that's `aria-hidden`.

## Accessibility

- Clipped to a 1px box with `clip-path: inset(50%)`, so it stays in the accessibility tree; `display: none` and `hidden` would remove it
- `white-space: nowrap` keeps screen readers from reading the clipped text one word at a time
- Not focusable. For a link that appears on focus, use `SkipLink`
