# Link

> Navigation to another page or resource; use Link for navigation and Button for actions

- Tier: primitives
- Storybook: `Primitives/Link`
- Import: `import { Link } from '@amezquita/design-system/components/primitives/Link'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'inline' \| 'standalone'` | `'inline'` is underlined, for links inside running text. `'standalone'` has no underline until hover or focus, for links that stand on their own (a list of links, a "Read more"). |
| `external?` | `boolean` | Opens in a new tab: sets `target="_blank"` and `rel="noopener noreferrer"`, and adds an icon plus visually hidden "(opens in a new tab)". Not detected from `href` — set it where you mean it. |
| `asChild?` | `boolean` | Render your router's link instead of `<a>`, keeping Link's styling: `<Link asChild><NextLink href="/about">About</NextLink></Link>`. The child must be a single element that renders an `<a>`. |
| `children` | `React.ReactNode` |  |

Also accepts all props of: `Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>`

## Usage example

```tsx
<p>
  Tokens are documented in the <Link href="/docs/tokens">token reference</Link>, generated from source on every build.
</p>
```

## Accessibility

- Semantic element: `<a>` (or the `asChild` element, which must render an `<a>`)
- Link text should make sense out of context; avoid "click here"
- `external` adds "(opens in a new tab)" to the accessible name, so the new tab isn't a surprise
- Text colour is checked at 4.5:1 against the primary surface in all four modes (`tokens/contrast-pairs.json`, `link-text`)
