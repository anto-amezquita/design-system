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

Also accepts all props of: `Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'defaultValue' | 'children'>`

## Usage example

```tsx
<Textarea
  id="default"
  label="Message"
  placeholder="Write your message…"
/>
```
