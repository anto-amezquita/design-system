# Textarea

> Multi-line text entry with label, hint, and error states — mirrors Input API

- Tier: primitives
- Storybook: `Components/Textarea`
- Import: `import { Textarea } from '@amezquita/design-system/components/primitives/Textarea'`

## Props

| Prop | Type | Description |
|---|---|---|
| `id?` | `string` |  |
| `label?` | `string` |  |
| `placeholder?` | `string` |  |
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onChange?` | `(value: string) => void` |  |
| `disabled?` | `boolean` |  |
| `error?` | `string` |  |
| `hint?` | `string` |  |
| `rows?` | `number` |  |
| `maxLength?` | `number` |  |
| `characterCount?` | `boolean` |  |
| `required?` | `boolean` |  |
| `aria-label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--textarea-hint-size` | dimension | `12px` |

## Usage example

```tsx
<Textarea
  id="default"
  label="Message"
  placeholder="Write your message…"
/>
```
