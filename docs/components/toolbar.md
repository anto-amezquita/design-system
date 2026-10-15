# Toolbar

> A row of controls for one area: the formatting buttons over an editor, the actions over a table or canvas

- Tier: patterns
- Storybook: `Components/Toolbar`
- Import: `import { Toolbar } from '@amezquita/design-system/components/patterns/Toolbar'`

## Props

| Prop | Type | Description |
|---|---|---|
| `aria-label` | `string` | Names the toolbar: "Text formatting", "Board actions". Required when the page has more than one. |
| `orientation?` | `'horizontal' \| 'vertical'` |  |
| `children` | `React.ReactNode` | Buttons, ToggleButtons, IconButtons, Menu triggers, a Select or short input; ToolbarSeparator between groups. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label' | 'children'>`

## Usage example

```tsx
<Formatting />
```

## Best practices

### Do

- Use ToggleButtons for on/off formatting, so `aria-pressed` says the state.
- Group related controls with separators, and name the toolbar after what it acts on.
- Keep the main action at the end with a spacer before it.

### Don't

- Don't put a SegmentedControl or Tabs inside; they have their own arrow keys. Use ToggleButtons instead.
- Don't use a toolbar for page navigation; that's a nav with links.
- Don't hide controls a keyboard user can't reach another way when the toolbar wraps or shrinks.

## Accessibility

- The WAI-ARIA toolbar: `role="toolbar"` with a name; `aria-orientation="vertical"` when vertical
- One Tab stop for the whole toolbar (roving tabindex); Left and Right (Up and Down when vertical) move between controls, wrap at the ends and skip disabled ones; Home and End jump to the first and last
- Tab back in returns to the control last used; a click also makes that control the current one
- A text field keeps its arrow keys for the caret, and keys inside a Menu opened from the toolbar stay in the menu
- The separator is a real `role="separator"` across the toolbar's direction
