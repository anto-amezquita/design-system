# InputGroup

> An Input joined to the text and buttons that belong to it: "https://", "kr.", an Apply button

- Tier: primitives
- Storybook: `Components/InputGroup`
- Import: `import { InputGroup } from '@amezquita/design-system/components/primitives/InputGroup'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | The visible label. It names the Input inside. |
| `hint?` | `string` |  |
| `error?` | `string` | Replaces the hint and marks the Input invalid. |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `id?` | `string` |  |
| `children` | `React.ReactNode` | An Input with no label of its own, plus InputAddons and Buttons before or after it. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'id'>`

## Usage example

```tsx
<InputGroup label="Website" hint="Your portfolio or company site.">
  <InputAddon>https://</InputAddon>
  <Input placeholder="example.dk" />
</InputGroup>
```

## Best practices

### Do

- Use addons for a fixed part of the value the person doesn't type: a protocol, a unit, a currency.
- Attach a button when it acts on this one value: Apply a code, Copy a link.
- Keep addon text short; one word or symbol.

### Don't

- Don't put the label in an addon; use `label`.
- Don't attach more than one button; move other actions out of the group.
- Don't use an addon for an icon that only decorates; that's Input's `prefix`.

## Accessibility

- The label names the Input; addon text and the hint describe it in reading order ("https:// Your site.")
- Inside a group (or a Field), an Input without a label takes its id, description, `aria-invalid`, `required` and `disabled` from `useField()`
- Addon text is 4.5:1 on its surface in every brand and mode (tested)
- Buttons in the group keep their own names and stay separate Tab stops
