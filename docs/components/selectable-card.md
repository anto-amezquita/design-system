# SelectableCard

> Choices shown as cards: pick one (radios) or several (checkboxes), with a title, a detail and a description on each

- Tier: primitives
- Storybook: `Components/SelectableCard`
- Import: `import { SelectableCard } from '@amezquita/design-system/components/primitives/SelectableCard'`

## Props

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | The value this card stands for, unique in its group. |
| `title` | `React.ReactNode` | The choice's name: "Pro". It's the radio's or checkbox's label. |
| `description?` | `React.ReactNode` | A line or two under the title, read as the control's description. |
| `meta?` | `React.ReactNode` | A short detail at the end of the title row: a price, a delivery time. |
| `disabled?` | `boolean` | This card can't be chosen. |

Also accepts all props of: `Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'title'>`

## Usage example

```tsx
args => <SelectableCardGroup {...args}><Plans /></SelectableCardGroup>
```

## Best practices

### Do

- Use cards when each choice needs a description or a price to decide; otherwise use Radio or Checkbox.
- Write the legend as the question the cards answer.
- Say why a disabled choice isn't available, in its description.

### Don't

- Don't put links or buttons inside a card; the whole card is a label, and a nested control would be hard to hit and confusing to hear.
- Don't use SelectableCard to navigate; a card that takes you somewhere is a linked Card.
- Don't offer one card on its own; that's a Checkbox.

## Accessibility

- A `fieldset` whose `legend` is the question, so screen readers say "Plan, group" before the choices
- Native radios (`single`) or checkboxes (`multiple`) underneath, visually hidden but focusable: arrow keys move between radios and skip disabled ones, the values reach the form, and `required` blocks an empty submit
- Each input is named by its card's title and meta ("Pro, 90 kr/mo") and described by the description, rather than by everything in the card
- The whole card is the input's `label`, so a click anywhere on it chooses it
- `multiple` shows a square indicator (its corner capped at a quarter of its size, so it stays square in round brands) and `single` a round one, as checkboxes and radios look elsewhere
- Checked shows twice: the edge doubles in the accent and the indicator fills with a tick. It uses `accent-text` because `accent-default` is too pale in demo-soft
- Edges and indicators are tested at 3:1, the checked edge, indicator and tick at 3:1, and all text at 4.5:1, disabled cards included, in all five brands, light and dark. Disabled cards don't fade (the rule since #118); they get a dashed edge, because in demo-warm the colours alone barely set them apart
