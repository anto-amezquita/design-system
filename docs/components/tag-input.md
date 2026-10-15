# TagInput

> Free-text values as tags: keywords, email addresses, ingredients

- Tier: primitives
- Storybook: `Components/TagInput`
- Import: `import { TagInput } from '@amezquita/design-system/components/primitives/TagInput'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` | Shown under the field, before "Separate with commas or press Enter." |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `value?` | `string[]` | The tags, in the order they were added. |
| `defaultValue?` | `string[]` |  |
| `onValueChange?` | `(tags: string[]) => void` |  |
| `suggestions?` | `string[]` | Offered as people type. Anything else can still be added. |
| `validate?` | `(tag: string) => string \| undefined` | Return a reason to refuse a tag, e.g. "Enter an email address like name@example.com." |
| `max?` | `number` | The most tags allowed. |
| `placeholder?` | `string` |  |
| `name?` | `string` | Submits each tag under this name. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Best practices

### Do

- Pass `validate` when tags have a format, like email addresses, and say the format in the reason.
- Offer `suggestions` when people should reuse existing tags.

### Don't

- Don't use it when the values come from a fixed list; use MultiSelect.
- Don't drop refused text; TagInput keeps it in the field so people can fix it.

## Accessibility

- A labelled textbox, or a combobox with list autocomplete when there are suggestions
- The hint says how to add ("Separate with commas or press Enter."); Enter, comma or semicolon add; Backspace in the empty field removes the last tag
- A pasted list is split on commas, semicolons and new lines; what can't be added stays in the field with the first reason as the error
- Leaving the field adds what's typed, so nothing is lost on submit
- The field is described by its tags ("2 tags: CSS, React."), and each change is announced ("React added, 3 tags")
- Duplicates are matched without case or accents
