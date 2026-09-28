# Menu

> Dropdown list of actions opened from a trigger: account menus, overflow ("more") menus, row actions

- Tier: composition
- Storybook: `Composition/Menu`
- Import: `import { Menu } from '@amezquita/design-system/components/composition/Menu'`

## Props

| Prop | Type | Description |
|---|---|---|
| `trigger` | `React.ReactElement` | The element that opens the menu. Must be a single element that forwards its ref — `Button` does. React.Fragment is not supported (Radix asChild). |
| `groups` | `{ /** Optional heading shown above the group's items. */; label?: string; items: { /** Stable React key. */; id: string; label: string; /** Runs when the item is chosen by click, Enter or Space. The menu closes afterwards. */; onSelect?: () => void; disabled?: boolean; /** `'destructive'` colours the item as a warning, for deletes and other actions that can't be undone. */; variant?: 'default' \| 'destructive'; /** Decorative leading icon; the label stays the accessible name. */; icon?: React.ReactNode }[] }[]` | Items in groups; a separator is drawn between groups. One group with no label is a plain list. |
| `align?` | `'start' \| 'center' \| 'end'` |  |
| `side?` | `'top' \| 'right' \| 'bottom' \| 'left'` |  |
| `open?` | `boolean` |  |
| `defaultOpen?` | `boolean` |  |
| `onOpenChange?` | `(open: boolean) => void` |  |
| `aria-label?` | `string` | Accessible name for the menu itself, when the trigger's label isn't enough context. |
| `className?` | `string` |  |

## Usage example

```tsx
<Menu
  trigger={<Button variant="secondary">Actions</Button>}
  groups={[
    {
      items: [
        { id: 'edit', label: 'Edit', onSelect: () => {} },
        { id: 'duplicate', label: 'Duplicate', onSelect: () => {} },
        { id: 'archive', label: 'Archive', disabled: true },
      ],
    },
    {
      items: [{ id: 'delete', label: 'Delete', variant: 'destructive', onSelect: () => {} }],
    },
  ]}
/>
```

## Accessibility

- Built on Radix DropdownMenu: `role="menu"` / `menuitem`, the trigger gets `aria-haspopup` and `aria-expanded`
- Keyboard: `Enter`, `Space` or `ArrowDown` opens and focuses the first item; arrow keys move; typing jumps to a matching item; `Escape` closes and returns focus to the trigger
- An icon-only trigger needs an `aria-label` on the trigger itself
- No z-index (decisions/0007): the panel is portalled, so it layers correctly inside a Dialog or Drawer (`Menu.nesting.test.tsx`)
