# ContextMenu

> The actions for one thing, opened where the pointer is: a file row, a card, a canvas

- Tier: composition
- Storybook: `Components/ContextMenu`
- Import: `import { ContextMenu } from '@amezquita/design-system/components/composition/ContextMenu'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactElement` | The area that has the menu: a file row, a card, a canvas. One element; it's made focusable if it isn't already, so the keyboard can open the menu too. |
| `groups` | `{ label?: string; items: { id: string; label: string; onSelect?: () => void; disabled?: boolean; variant?: 'default' \| 'destructive'; icon?: React.ReactNode; shortcut?: string[] }[] }[]` | Items in groups; a separator is drawn between groups, as in Menu. |
| `onOpenChange?` | `(open: boolean) => void` |  |
| `disabled?` | `boolean` | Turns the menu off; right-click then gives the browser's own menu. |
| `aria-label?` | `string` | Names the menu, e.g. "Actions for report.pdf". |
| `className?` | `string` |  |

## Best practices

### Do

- Put the same actions on a visible control too, like a "More" button with Menu and the same `groups`; right-click and long press aren't discoverable.
- Name the menu after its target: "Actions for report.pdf".
- Show the shortcut when the action has one, so the menu teaches it.

### Don't

- Don't make a context menu the only way to reach an action.
- Don't replace the browser's menu on text people may want to copy, or on links.

## Accessibility

- Built on Radix ContextMenu: `role="menu"` / `menuitem`, opened by right-click, a long press on touch, or Shift+F10 or the Menu key on the focused area
- From the keyboard, focus lands on the first item; after a right-click, on the menu, and the first arrow press moves to the first item
- Arrows move and skip disabled items, typing jumps to a label, Enter chooses, Escape closes; focus returns to the area
- Shortcuts are set as `aria-keyshortcuts` (`Control+C`); the keycaps are hidden from screen readers so they aren't read twice
- Non-modal, as Menu, so the rest of the page isn't hidden with `aria-hidden` while focusable
