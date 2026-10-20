# SelectableCardGroup

> Sub-component of SelectableCard.

- Tier: primitives
- Storybook: `Components/SelectableCard`
- Import: `import { SelectableCardGroup } from '@amezquita/design-system/components/primitives/SelectableCard'`

## Props

| Prop | Type | Description |
|---|---|---|
| `legend` | `React.ReactNode` | The question the cards answer: "Plan", "Where should we ship it?". Rendered as the fieldset's legend. |
| `type?` | `'single' \| 'multiple'` | `single` (default): pick one, radios underneath. `multiple`: pick any, checkboxes underneath. |
| `name?` | `string` | Form field name. Generated when left out. |
| `value?` | `string[]` | Controlled selection: the chosen values. Pair with `onValueChange`. |
| `defaultValue?` | `string[]` | Uncontrolled starting selection. |
| `onValueChange?` | `(value: string[]) => void` | Called with the new selection. |
| `columns?` | `boolean` | Side by side: as many as fit with each at least 256px wide (Grid's `md`). Default `false`: one per row. |
| `required?` | `boolean` | With `single`, a choice is required to submit the form. |
| `children` | `React.ReactNode` |  |

Also accepts all props of: `Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'>`

## Usage example

See `SelectableCard`'s own usage example — SelectableCardGroup is one of its sub-components, not used standalone.
