# Textarea

> Multi-line text entry with label, hint, and error states — mirrors Input API

- Tier: primitives
- Storybook: `Components/Textarea`
- Import: `import { Textarea } from '@amezquita/design-system/components/primitives/Textarea'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label?` | `string` |  |
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onChange?` | `(value: string) => void` |  |
| `error?` | `string` |  |
| `hint?` | `string` |  |
| `characterCount?` | `boolean` |  |
| `aria-label?` | `string` |  |
| `autoResize?` | `boolean` | Grow with the text instead of scrolling: the field starts at `rows` lines and gets taller as the text wraps, up to `maxRows`. The manual resize handle goes, since the field sizes itself. |
| `maxRows?` | `number` | With `autoResize`: grow up to this many lines, then scroll. Left out, the field grows without a cap. |

Also accepts all props of: `Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue' | 'children'>`

## Usage example

```tsx
<Textarea
  id="default"
  label="Message"
  placeholder="Write your message…"
/>
```
