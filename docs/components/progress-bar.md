# ProgressBar

> Shows how far a task has got, or that it's running when the end isn't known

- Tier: primitives
- Storybook: `Components/ProgressBar`
- Import: `import { ProgressBar } from '@amezquita/design-system/components/primitives/ProgressBar'`

## Props

| Prop | Type | Description |
|---|---|---|
| `value?` | `number \| null` | Progress so far, from 0 to `max`. Leave it out when the end can't be known yet: the bar turns indeterminate. |
| `max?` | `number` | The value that means done. Default 100. |
| `label` | `string` | What is progressing, e.g. "Uploading photos". Always the accessible name; shown above the bar unless `hideLabel`. |
| `hideLabel?` | `boolean` | Keep the label for screen readers only, when the context already says it. |
| `showValue?` | `boolean` | Show the percentage next to the label. Ignored while indeterminate. |
| `valueText?` | `string` | Replaces the percentage, for screen readers and `showValue`, with words that fit better: "3 of 10 files". |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--progress-bar-height` | dimension | `8px` |

## Best practices

### Do

- Name the task in the label: "Uploading photos", not "Progress".
- Use `valueText` when a count says more than a percentage.
- Switch from indeterminate to a value as soon as you know the total.
- Say when it's done, with a message or by moving on; a full bar alone is easy to miss.

### Don't

- Don't show a bar for something that takes under a second; it flashes and is gone.
- Don't let the value go backwards. If a step restarts, say so in the label.
- Don't use ProgressBar for a score or a quota; that's a meter, not progress.

## Accessibility

- `role="progressbar"` named by the label (`aria-labelledby`), with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`; none of the three while indeterminate
- The visible percentage is `aria-hidden`; screen readers get the value from the bar itself
- The fill is 3:1 against the track and the page in every brand and mode (`progress-fill-on-track`, `progress-fill-on-page` pairs)
- Forced colors: the track gets an outline and the fill uses `Highlight`
- Not focusable; it reports, it isn't a control. For a value the user sets, use a Slider
