# Combobox

> One value from a long list, found by typing: a country, a town, a person

- Tier: primitives
- Storybook: `Components/Combobox`
- Import: `import { Combobox } from '@amezquita/design-system/components/primitives/Combobox'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` |  |
| `hint?` | `string` |  |
| `error?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `options` | `Array<string \| { value: string; label?: string; description?: string; disabled?: boolean }>` | Strings, or objects with a label and description. |
| `value?` | `string \| null` | The chosen option's `value`, or the typed text when `allowCustom`. |
| `defaultValue?` | `string \| null` |  |
| `onValueChange?` | `(value: string \| null) => void` |  |
| `onInputChange?` | `(text: string) => void` | Called as people type. Use it to fetch options; pair with `loading` and `filter={false}`. |
| `allowCustom?` | `boolean` | Accept typed text that isn't in the list ("Other: …"). Off by default. |
| `filter?` | `boolean` | `false` when the options are already filtered, for example by a server. |
| `loading?` | `boolean` | Shows "Loading…" in the list and tells screen readers. |
| `emptyMessage?` | `(text: string) => string` | Shown when nothing matches. Gets the typed text. |
| `placeholder?` | `string` |  |
| `name?` | `string` | Submits the value. |
| `id?` | `string` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'>`

## Usage example

```tsx
<Combobox
  hint={'Start typing}
/>
```

## Best practices

### Do

- Use it when the list is too long to scan: about 15 options or more.
- Add a description when labels repeat or need context: an email under a name.
- Translate `emptyMessage` with the rest of the form.

### Don't

- Don't use it for a handful of options; use Select or Radio, where everything is visible.
- Don't pick the first match on Tab or blur; people only get what they chose or typed exactly.
- Don't turn on `allowCustom` when the value must be one of the options.

## Accessibility

- The WAI-ARIA combobox with list autocomplete: `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, so focus never leaves the field
- Arrow Down / Up open the list and move, skipping unavailable options; Alt + Arrow Down opens without moving; Enter picks; Escape closes, and a second Escape clears
- The number of results ("4 results", "No matches for “oslo”", "Loading…") is announced in a polite live region
- Matching ignores case and accents ("peru" finds "Perú"); starts of words rank first
- "Clear" is a labelled button that returns focus to the field; the list button is out of the tab order, as in the WAI-ARIA example
- Each option is at least 44px tall
