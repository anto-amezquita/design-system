# Heading

> Semantic heading element (H1–H6) with a visual size decoupled from its document-outline level

- Tier: primitives
- Storybook: `Components/Heading`
- Import: `import { Heading } from '@amezquita/design-system/components/primitives/Heading'`

## Props

| Prop | Type | Description |
|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | Visual size, H1 (largest) to H6 (smallest). Decoupled from `as` — see that prop. |
| `as?` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | Semantic tag to render. Defaults to matching `level` (`level={2}` renders an `&lt;h2&gt;`). Set explicitly when the visual size and the correct place in the document outline diverge — e.g. a visually small `H1` that must stay a real `&lt;h1&gt;` for SEO/screen-reader navigation, or a large `H2` nested under a page's actual `&lt;h1&gt;`. |
| `children` | `React.ReactNode` |  |

Also accepts all props of: `React.HTMLAttributes<HTMLHeadingElement>`

## Accessibility

- Renders a real `h1`–`h6` element — always reflects the document outline correctly via `as`, never rely on `level` alone for that
- No ARIA requirements beyond correct heading-level nesting in the surrounding page
