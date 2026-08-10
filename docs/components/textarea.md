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
| `--textarea-background` | color | `#FAFAF9` † |
| `--textarea-background-disabled` | color | `#F4F0EB` † |
| `--textarea-border` | color | `#E2DDD9` † |
| `--textarea-border-error` | color | `#c0392b` † |
| `--textarea-border-focus` | color | `#0A0A0A` † |
| `--textarea-border-hover` | color | `#A8A29E` † |
| `--textarea-border-radius` | dimension | `4px` † |
| `--textarea-border-width` | dimension | `1px` |
| `--textarea-error-color` | color | `#c0392b` † |
| `--textarea-font-size` | dimension | `16px` |
| `--textarea-foreground` | color | `#0A0A0A` † |
| `--textarea-hint-color` | color | `#57534E` † |
| `--textarea-hint-size` | dimension | `12px` |
| `--textarea-label-color` | color | `#0A0A0A` † |
| `--textarea-label-size` | dimension | `14px` |
| `--textarea-label-weight` | other | `500` |
| `--textarea-padding-x` | dimension | `16px` |
| `--textarea-padding-y` | dimension | `12px` |
| `--textarea-placeholder-color` | color | `#57534E` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Textarea
  id="default"
  label="Message"
  placeholder="Write your message…"
/>
```
