# Drawer

> Side-anchored slide-in panel for supplemental content or secondary navigation

- Tier: composition
- Storybook: `Components/Drawer`
- Import: `import { Drawer } from '@amezquita/design-system/components/composition/Drawer'`

## Props

| Prop | Type | Description |
|---|---|---|
| `open?` | `boolean` |  |
| `onOpenChange?` | `(open: boolean) => void` |  |
| `defaultOpen?` | `boolean` |  |
| `trigger?` | `React.ReactElement` | Must be a single DOM element — React.Fragment is not supported (Radix asChild). |
| `title` | `string` |  |
| `description?` | `string` |  |
| `children` | `React.ReactNode` |  |
| `footer?` | `React.ReactNode` |  |
| `side?` | `'right' \| 'left' \| 'bottom'` |  |
| `size?` | `'sm' \| 'md' \| 'lg' \| 'full'` |  |
| `modal?` | `boolean` |  |
| `onPointerDownOutside?` | `(e: Event) => void` | Call e.preventDefault() to prevent the drawer from closing on outside click. |
| `onEscapeKeyDown?` | `(e: KeyboardEvent) => void` | Call e.preventDefault() to prevent the drawer from closing on Escape key. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--drawer-background` | color | `#FAFAF9` † |
| `--drawer-border` | color | `#E2DDD9` † |
| `--drawer-border-width` | dimension | `1px` |
| `--drawer-close-align-offset` | dimension | `2px` |
| `--drawer-close-color` | color | `#57534E` † |
| `--drawer-close-hover` | other | `#0A0A0A` † |
| `--drawer-close-size` | dimension | `28px` |
| `--drawer-gap` | dimension | `24px` |
| `--drawer-max-height-full` | dimension | `100vh` |
| `--drawer-max-height-lg` | dimension | `75vh` |
| `--drawer-max-height-md` | dimension | `90vh` |
| `--drawer-max-height-sm` | dimension | `40vh` |
| `--drawer-max-width-lg` | dimension | `640px` |
| `--drawer-max-width-md` | dimension | `480px` |
| `--drawer-max-width-sm` | dimension | `320px` |
| `--drawer-overlay-color` | color | `#E2DDD9` † |
| `--drawer-padding` | dimension | `48px` |
| `--drawer-shadow` | shadow | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` |
| `--drawer-title-size` | dimension | `24px` |
| `--drawer-title-weight` | other | `700` |
| `--drawer-z-index` | other | `400` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
() => {
  const [open, setOpen] = useState(false)
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      trigger={<Button onClick={() => setOpen(true)}>Open drawer</Button>}
      title="Settings"
      description="Configure your preferences below."
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Save changes</Button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        Drawer body content goes here.
      </p>
    </Drawer>
  )
}
```
