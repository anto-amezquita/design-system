# ButtonGroup

> Related actions kept together: Undo / Redo, zoom out / in, Cancel / Save

- Tier: primitives
- Storybook: `Components/ButtonGroup`
- Import: `import { ButtonGroup } from '@amezquita/design-system/components/primitives/ButtonGroup'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` | Buttons or IconButtons that act on the same thing. |
| `label?` | `string` | Names the group for screen readers, e.g. "Text alignment". Recommended when the buttons alone don't say what they act on. |
| `attached?` | `boolean` | Join the buttons into one shape: shared edges, round corners only at the ends. Default `false`: separate buttons with a gap. |
| `orientation?` | `'horizontal' \| 'vertical'` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'>`

## Usage example

```tsx
<ButtonGroup label="Form actions">
  <Button variant="secondary">Cancel</Button>
  <Button>Save changes</Button>
</ButtonGroup>
```

## Best practices

### Do

- Group actions that act on the same thing, in a fixed order people learn: Undo before Redo.
- Use `attached` with `secondary` buttons for tool-like sets.
- Put the main action last in a spaced group, as in dialogs.

### Don't

- Don't use ButtonGroup to pick one option; that's SegmentedControl.
- Don't attach buttons of different variants; a filled button in an outlined row looks chosen.
- Don't group more than five or so actions; move the rest into a Menu.

## Accessibility

- `role="group"`, named by `label`
- Every button stays its own Tab stop: each is a separate action. (A single choice with arrow keys is SegmentedControl.)
- No `aria-orientation`: `role="group"` doesn't take it; the layout is visual
