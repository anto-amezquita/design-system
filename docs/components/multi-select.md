# MultiSelect

> Several values from a long list, found by typing: skills, reviewers, languages

- Tier: primitives
- Storybook: `Components/MultiSelect`
- Import: `import { MultiSelect } from '@amezquita/design-system/components/primitives/MultiSelect'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` |  |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `options` | `Array<string \| MultiSelectOption>` |  |
| `value?` | `string[]` | The chosen options' values, in the order they were chosen. |
| `defaultValue?` | `string[]` |  |
| `onValueChange?` | `(values: string[]) => void` |  |
| `max?` | `number` | The most that can be chosen. Other options become unavailable once it's reached. |
| `emptyMessage?` | `(text: string) => string` | Shown when nothing matches. Gets the typed text. |
| `placeholder?` | `string` |  |
| `name?` | `string` | Submits each value under this name, like a `<select multiple>`. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Usage example

```tsx
<MultiSelect
  hint={'Type to filter}
/>
```

## Best practices

### Do

- Use it when the list is long and people pick a few; for up to about seven options, use Checkboxes.
- Set `max` when there's a real limit, so people learn it before they hit it.
- Keep the chosen items visible; don't collapse them into "3 selected" only.

### Don't

- Don't use it for free text; Tag Input is for values people type.
- Don't reorder the chosen items; they stay in the order people picked them.

## Accessibility

- A combobox over a listbox with `aria-multiselectable="true"`; each option's `aria-selected` says whether it's chosen, and a checkbox mark shows it without colour
- The list stays open while picking: Enter or a click adds or removes; Escape closes, then clears the search
- The field is described by what's chosen ("2 chosen: Danish, Spanish."), and every change is announced ("Spanish added, 3 chosen")
- Backspace in the empty field removes the last item; a tag's Remove button moves focus to the next tag, and "Remove all" returns it to the field
- Picking from a search clears it and keeps the place in the full list
