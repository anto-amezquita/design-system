# Slider

> One value from a range, by dragging or with the keyboard: volume, a price limit, opacity

- Tier: primitives
- Storybook: `Components/Slider`
- Import: `import { Slider } from '@amezquita/design-system/components/primitives/Slider'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | What the value is, e.g. "Volume". Required: it's the input's accessible name. Shown above the track unless `hideLabel`. |
| `hideLabel?` | `boolean` | Keep the label for screen readers only, when the context already says it. |
| `hint?` | `string` | Help text under the track, linked with `aria-describedby`. |
| `value?` | `number` | Controlled value. Pair with `onValueChange`. |
| `defaultValue?` | `number` | Starting value when uncontrolled. Defaults to `min`. |
| `onValueChange?` | `(value: number) => void` | Called on every change, while dragging and on each key press. |
| `min?` | `number` |  |
| `max?` | `number` |  |
| `step?` | `number` |  |
| `showValue?` | `boolean` | Show the current value beside the label. |
| `formatValue?` | `(value: number) => string` | Turns the number into words, for the visible value and for screen readers (`aria-valuetext`): `v => \`${v}%\``. |
| `disabled?` | `boolean` |  |
| `name?` | `string` | Submits the value with a form under this name. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'children'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--slider-track-height` | dimension | `4px` |

## Best practices

### Do

- Use a Slider when the exact number matters less than the feel: volume, brightness, a rough limit.
- Show the value (`showValue`) when people need to know it, and format it with its unit.
- Pick a `step` that matches what people can tell apart.

### Don't

- Don't use a Slider for a precise number, like an age or a quantity; that's a number input.
- Don't use it for a choice from a few named options; that's SegmentedControl.
- Don't apply each change to something slow while dragging; wait until the value settles.

## Accessibility

- Native `<input type="range">` with a `<label>`: announced as a slider with its value
- Keyboard: arrows step, Page Up / Down take bigger steps, Home / End jump to the ends
- Fill and thumb edge 3:1 on the track and the page in every brand and mode (the progress-fill pairs, tested)
- The whole 44px row is the target; the fill runs the other way in right-to-left layouts
- Forced colors: the thumb uses `Highlight`
