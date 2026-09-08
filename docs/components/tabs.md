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
| `--tabs-indicator-height` | dimension | `2px` |
| `--tabs-pill-border-radius` | dimension | `4px` |
| `--tabs-pill-gap` | dimension | `4px` |
| `--tabs-sm-trigger-padding-x` | dimension | `12px` |
| `--tabs-sm-trigger-padding-y` | dimension | `8px` |
| `--tabs-trigger-font-weight` | fontWeight | `500` |
| `--tabs-trigger-gap` | dimension | `4px` |
| `--tabs-trigger-padding-x` | dimension | `16px` |
| `--tabs-trigger-padding-y` | dimension | `12px` |

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
