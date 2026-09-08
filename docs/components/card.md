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
| `--card-horizontal-media-width` | dimension | `200px` |

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
