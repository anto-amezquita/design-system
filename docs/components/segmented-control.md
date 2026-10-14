# SegmentedControl

> One choice from a few, shown side by side: a view switch, a time range

- Tier: primitives
- Storybook: `Components/SegmentedControl`
- Import: `import { SegmentedControl } from '@amezquita/design-system/components/primitives/SegmentedControl'`

## Props

| Prop | Type | Description |
|---|---|---|
| `options` | `{ value: string; label: string; icon?: React.ReactNode; disabled?: boolean }[]` | Two to five choices; more than that belongs in a Select. |
| `label` | `string` | The group's accessible name, e.g. "View". Required: the segments alone don't say what they choose. |
| `value?` | `string` | Controlled value. Pair with `onValueChange`. |
| `defaultValue?` | `string` | Starting value when uncontrolled. Defaults to the first option, so one is always chosen. |
| `onValueChange?` | `(value: string) => void` |  |
| `hideLabels?` | `boolean` | Show only icons; each option's `label` becomes its accessible name. Every option needs an `icon`. |
| `fullWidth?` | `boolean` | Stretch to the container's width, segments sharing it equally. |
| `disabled?` | `boolean` |  |
| `name?` | `string` | Submits the value with a form under this name. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'dir' | 'onChange'>`

## Best practices

### Do

- Use it when the choice changes what's shown right away: a chart's range, list or grid.
- Keep labels to one or two short words, about the same length.
- Name the group with `label` ("Time range"), even when the context makes it obvious to sighted users.

### Don't

- Don't use more than five segments; use a Select.
- Don't use it for actions; each segment is a choice, not a command. That's ButtonGroup.
- Don't use it for navigation between pages; that's Tabs or NavigationMenu.
- Don't mix icon-only and labelled segments in one control.

## Accessibility

- A radio group (Radix): `role="radiogroup"` named by `label`, segments are `role="radio"` with `aria-checked`
- Keyboard: one Tab stop (the chosen segment); arrow keys move and choose, wrap at the ends and skip disabled segments
- Chosen text 4.5:1 on the fill and the outline 3:1 on the page in every brand and mode (tested); the chosen segment is filled, so the state doesn't rely on colour alone
- 44px tall; forced colors: the chosen segment uses `Highlight`
