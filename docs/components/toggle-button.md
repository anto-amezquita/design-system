# ToggleButton

> A button that stays on or off, like bold in an editor or a grid overlay

- Tier: primitives
- Storybook: `Components/ToggleButton`
- Import: `import { ToggleButton } from '@amezquita/design-system/components/primitives/ToggleButton'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | What the toggle turns on, e.g. "Bold" or "Show grid". It stays the same in both states; `aria-pressed` carries the state. |
| `icon?` | `React.ReactNode` | An icon beside the label, or on its own with `hideLabel`. |
| `hideLabel?` | `boolean` | Show only the icon, as a square; `label` becomes the accessible name. Needs `icon`. |
| `pressed?` | `boolean` | Controlled pressed state. Pair with `onPressedChange`. |
| `defaultPressed?` | `boolean` | Starting state when uncontrolled. Default `false`. |
| `onPressedChange?` | `(pressed: boolean) => void` | Called with the new state on every press. |
| `size?` | `'md' \| 'sm'` | Icon-only size, as on IconButton. Ignored with a visible label. |
| `disabled?` | `boolean` |  |
| `onClick?` | `(event: React.MouseEvent<HTMLButtonElement \| HTMLAnchorElement>) => void` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-pressed' | 'onClick'>`

## Best practices

### Do

- Use it for a setting that takes effect right away and stays: formatting, a view option, mute.
- Keep the label the same in both states: "Bold", not "Make bold" / "Remove bold".
- Group related toggles in an element with `role="group"` and an `aria-label`.

### Don't

- Don't use a ToggleButton to pick one option from several; that's SegmentedControl.
- Don't use it for an action that happens once, like "Save"; that's Button.
- Don't use it for a setting in a form that's saved later; that's Switch or Checkbox.

## Accessibility

- Native `<button>` with `aria-pressed`; screen readers announce "toggle button, pressed / not pressed"
- The name never changes with the state; changing it would announce a different control
- On is a fill and off an outline, so the state doesn't rely on colour alone
- Keyboard: `Space` and `Enter` toggle
