# SkipLink

> First Tab stop on the page that lets keyboard users jump past the header to the main content

- Tier: primitives
- Storybook: `Primitives/SkipLink`
- Import: `import { SkipLink } from '@amezquita/design-system/components/primitives/SkipLink'`

## Props

| Prop | Type | Description |
|---|---|---|
| `targetId?` | `string` | The `id` of the element to jump to, without `#`. Put the matching `id` on your `&lt;main&gt;`. |
| `children?` | `React.ReactNode` | Defaults to "Skip to main content". |

Also accepts all props of: `Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>`

## Usage example

```tsx
<>
  <SkipLink />
  <main id="main-content">
    <p>Press Tab: the skip link appears in the top-left corner.</p>
  </main>
</>
```

## Accessibility

- Semantic element: `<a href="#main-content">`
- On activation it moves focus to the target, adding `tabindex="-1"` if the target isn't focusable, so the next Tab continues from the main content instead of the top of the page
- Visible whenever focused (`:focus`, not only `:focus-visible`)
- The only component with an explicit z-index after decisions/0007: it isn't portalled, so mount order can't lift it
