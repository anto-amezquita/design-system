# Breadcrumb

> Hierarchical page location trail; the last item is the current page (non-linked)

- Tier: patterns
- Storybook: `Components/Breadcrumb`
- Import: `import { Breadcrumb } from '@amezquita/design-system/components/patterns/Breadcrumb'`

## Props

| Prop | Type | Description |
|---|---|---|
| `items` | `BreadcrumbItem[]` |  |
| `separator?` | `React.ReactNode` |  |
| `className?` | `string` |  |
| `LinkComponent?` | `React.ElementType<{ href: string; className?: string; children?: React.ReactNode }>` | Component to render internal links with — pass your router's Link (e.g. next/link) to get client-side navigation. Defaults to a plain &lt;a&gt;, which works anywhere with a full navigation. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--breadcrumb-current-color` | color | `#0A0A0A` † |
| `--breadcrumb-current-max-width` | dimension | `240px` |
| `--breadcrumb-font-size` | dimension | `14px` |
| `--breadcrumb-gap` | dimension | `8px` |
| `--breadcrumb-item-max-width` | dimension | `200px` |
| `--breadcrumb-link-color` | color | `#57534E` † |
| `--breadcrumb-link-color-hover` | color | `#0A0A0A` † |
| `--breadcrumb-separator-color` | color | `#57534E` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Design System' },
  ]}
/>
```
