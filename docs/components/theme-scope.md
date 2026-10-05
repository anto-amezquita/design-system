# ThemeScope

> Gives one part of a page its own brand, mode, or both; overlays opened inside it (Dialog, Drawer, AlertDialog, Menu, Select, Tooltip) take the same, although they render at the end of the page

- Tier: composition
- Storybook: `Composition/ThemeScope`
- Import: `import { ThemeScope } from '@amezquita/design-system/components/composition/ThemeScope'`

## Props

| Prop | Type | Description |
|---|---|---|
| `brand?` | `'portfolio'` | A brand for this part of the page. Needs that brand's scoped CSS loaded (`styles/brands/portfolio-scoped.css`). Left out, the part keeps the brand around it. |
| `mode?` | `'light' \| 'dark'` | `light` or `dark` for this part of the page. Left out, the part follows the mode around it. |

Also accepts all props of: `React.ComponentPropsWithoutRef<'div'>`

## Usage example

```tsx
<ThemeScope brand="portfolio" mode="dark" style={{ padding: 'var(--space-container-padding)', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
  <p>This part of the page is dark. The page around it isn’t.</p>
  <Menu
    aria-label="Project actions"
    trigger={<Button variant="secondary">More</Button>}
    groups={[{ items: [{ id: 'export', label: 'Export tokens', onSelect: () => {} }] }]}
  />
</ThemeScope>
```

## Accessibility

- A plain `<div>` with no role; it adds nothing to the accessibility tree
- Overlays keep their own focus, keyboard and layering behaviour: the scope's attributes go on the elements they already portal, so no wrapper is added (decisions/0021)
