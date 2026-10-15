# Stepper

> Where someone is in a process with a fixed order: checkout, sign-up, an application

- Tier: patterns
- Storybook: `Components/Stepper`
- Import: `import { Stepper } from '@amezquita/design-system/components/patterns/Stepper'`

## Props

| Prop | Type | Description |
|---|---|---|
| `steps` | `{ id: string; label: string; description?: string; error?: boolean; href?: string }[]` |  |
| `current` | `number` | Index of the current step, from 0. Steps before it are done; steps after it are still to come. Use `steps.length` when everything is done. |
| `onStepClick?` | `(index: number) => void` | Makes finished steps buttons that go back to them. Upcoming steps are never clickable. |
| `orientation?` | `'horizontal' \| 'vertical'` |  |
| `aria-label?` | `string` | Names the list. Defaults to "Progress". |
| `statusLabels?` | `Partial<Record<'complete' \| 'current' \| 'upcoming' \| 'error', string>>` | Visually hidden words for each state, for other languages. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--stepper-connector-width` | dimension | `4px` |
| `--stepper-indicator-size` | dimension | `32px` |

## Best practices

### Do

- Keep labels to one or two words, and the number of steps small (three to six).
- Mark a finished step with `error` and say what's missing in its description.
- Let people go back to finished steps, and keep what they entered.

### Don't

- Don't use a Stepper for steps people can do in any order; use Tabs or a checklist.
- Don't make upcoming steps clickable to skip ahead.

## Accessibility

- An ordered list named "Progress" (or your `aria-label`); the current step has `aria-current="step"`
- Each step's state is in words, hidden visually: "Address (Completed)", "Payment (Current step)", so nothing relies on colour, ticks or numbers; the circles are `aria-hidden`
- Only reached steps can be revisited; upcoming steps are plain text, never disabled buttons
- When narrow, the other labels are hidden visually but stay in the accessibility tree
- Not a navigation landmark: it shows progress, and going back is a convenience
