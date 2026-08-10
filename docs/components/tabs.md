# Tabs

> Segmented view switcher with full keyboard navigation; built on Radix Tabs

- Tier: patterns
- Storybook: `Components/Tabs`
- Import: `import { Tabs } from '@amezquita/design-system/components/patterns/Tabs'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'line' \| 'pill'` |  |
| `size?` | `'sm' \| 'md'` |  |

Also accepts all props of: `React.ComponentPropsWithoutRef<typeof RadixTabs.Root>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--tabs-content-padding-top` | dimension | `16px` |
| `--tabs-duration` | duration | `200ms` |
| `--tabs-indicator-color` | color | `#292524` † |
| `--tabs-indicator-height` | color | `2px` |
| `--tabs-list-border-bottom` | color | `#E2DDD9` † |
| `--tabs-list-border-width` | dimension | `1px` |
| `--tabs-pill-background-active` | color | `#F4F0EB` † |
| `--tabs-pill-border-radius` | dimension | `4px` |
| `--tabs-pill-gap` | dimension | `4px` |
| `--tabs-sm-trigger-padding-x` | dimension | `12px` |
| `--tabs-sm-trigger-padding-y` | dimension | `8px` |
| `--tabs-trigger-background-hover` | color | `#F4F0EB` † |
| `--tabs-trigger-color` | color | `#57534E` † |
| `--tabs-trigger-color-active` | color | `#0A0A0A` † |
| `--tabs-trigger-color-hover` | color | `#0A0A0A` † |
| `--tabs-trigger-font-size` | dimension | `16px` |
| `--tabs-trigger-font-weight` | fontWeight | `500` |
| `--tabs-trigger-gap` | dimension | `4px` |
| `--tabs-trigger-padding-x` | dimension | `16px` |
| `--tabs-trigger-padding-y` | dimension | `12px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Tabs defaultValue="overview" style={{ maxWidth: '480px' }}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
      An overview of the selected item appears here. This is the default active tab.
    </p>
  </TabsContent>
  <TabsContent value="details">
    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
      Detailed information about the item, including all metadata and configuration.
    </p>
  </TabsContent>
  <TabsContent value="history">
    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
      A log of all changes made to this item over time.
    </p>
  </TabsContent>
</Tabs>
```
