# Card

> Compound container for grouped content — composed from named sub-components

- Tier: composition
- Storybook: `Components/Card`
- Import: `import { Card } from '@amezquita/design-system/components/composition/Card'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'default' \| 'ghost'` |  |
| `interactive?` | `boolean` |  |
| `horizontal?` | `boolean` |  |
| `compact?` | `boolean` |  |
| `featured?` | `boolean` |  |
| `children` | `React.ReactNode` |  |
| `onClick?` | `() => void` |  |
| `aria-label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--card-background` | color | `#FAFAF9` † |
| `--card-background-ghost` | color | `#F4F0EB` † |
| `--card-border` | color | `#E2DDD9` † |
| `--card-border-radius` | dimension | `8px` |
| `--card-border-width` | dimension | `1px` |
| `--card-description-color` | color | `#57534E` † |
| `--card-description-size` | dimension | `16px` |
| `--card-gap` | dimension | `16px` |
| `--card-horizontal-media-width` | dimension | `200px` |
| `--card-padding` | dimension | `32px` |
| `--card-shadow` | shadow | `0 1px 2px 0 rgba(0,0,0,0.05)` |
| `--card-shadow-hover` | shadow | `0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)` |
| `--card-title-size` | dimension | `24px` |
| `--card-title-weight` | other | `700` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<div style={{ maxWidth: '360px' }}>
  <Card {...args}>
    <CardHeader>
      <CardTitle>Card title</CardTitle>
      <CardDescription>Supporting text that describes the card content in one or two sentences.</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button variant="primary">Action</Button>
      <Button variant="ghost">Cancel</Button>
    </CardFooter>
  </Card>
</div>
```

## Accessibility

- Card root is a `<div>` — apply `<article>` at the page level when card content is standalone
- No interactive wrapper on the card itself; interactive elements live in `CardFooter`
- `CardTitle` heading level must be correct for document outline — use the `as` prop
