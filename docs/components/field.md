# Field

> Label, hint and error for any control, wired the way Input wires its own

- Tier: primitives
- Storybook: `Components/Field`
- Import: `import { Field } from '@amezquita/design-system/components/primitives/Field'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | The visible label. It names the control. |
| `hint?` | `string` | Help text under the control, linked with `aria-describedby`. |
| `error?` | `string` | An error message. Replaces the hint, sets `aria-invalid`, and is linked the same way. |
| `required?` | `boolean` | Marks the control required (`aria-required` / `required`) and shows "Required" beside the label. |
| `disabled?` | `boolean` |  |
| `group?` | `boolean` | For a set of controls answered together (radio buttons, checkboxes, a SegmentedControl): renders a &lt;fieldset&gt; with the label as its &lt;legend&gt;. The children are left as they are. |
| `id?` | `string` | The control id. Generated when left out. |
| `children` | `React.ReactNode` | One control: an Input-like element, a native element, or a Select. It gets `id`, `aria-describedby`, `aria-invalid`, `required` and `disabled` unless it already sets them. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'id'>`

## Best practices

### Do

- Use Field for every control that has no label of its own, so forms read the same throughout.
- Write errors that say how to fix it: "Choose the country the invoice goes to", not "Invalid".
- Show errors after the person has tried, not while they are still typing.

### Don't

- Don't use a placeholder instead of a label; it disappears as soon as someone types.
- Don't wrap Input, Textarea or Slider in a Field; they label themselves.
- Don't put more than one control in a Field without `group`; only the first could be labelled.

## Accessibility

- The label names the control; the hint or error is its description; an error sets `aria-invalid`
- Errors carry an icon as well as colour; label, hint and error are 4.5:1 in every brand and mode (tested)
- `group` uses a real `<fieldset>` / `<legend>`, so a set of radios is announced with its question
- Inputs with a built-in label (Input, Textarea, Slider) don't need a Field; wrapping them would label them twice
