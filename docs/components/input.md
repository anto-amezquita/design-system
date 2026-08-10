# Input

> Labelled single-line text entry with hint and error states

- Tier: primitives
- Storybook: `Components/Input`
- Import: `import { Input } from '@amezquita/design-system/components/primitives/Input'`

## Props

| Prop | Type | Description |
|---|---|---|
| `type?` | `'text' \| 'email' \| 'password' \| 'url' \| 'search' \| 'tel'` |  |
| `label?` | `string` |  |
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onChange?` | `(value: string) => void` |  |
| `onClear?` | `() => void` |  |
| `error?` | `string` |  |
| `hint?` | `string` |  |
| `prefix?` | `React.ReactNode` |  |
| `suffix?` | `React.ReactNode` |  |
| `clearable?` | `boolean` |  |
| `search?` | `boolean` |  |
| `searchLabel?` | `string` |  |

Also accepts all props of: `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'prefix' | 'type'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--input-background` | color | `#FAFAF9` † |
| `--input-background-disabled` | color | `#F4F0EB` † |
| `--input-border` | color | `#E2DDD9` † |
| `--input-border-error` | color | `#c0392b` † |
| `--input-border-focus` | color | `#0A0A0A` † |
| `--input-border-hover` | color | `#A8A29E` † |
| `--input-border-radius` | dimension | `4px` † |
| `--input-border-width` | dimension | `1px` |
| `--input-clear-color` | color | `#57534E` † |
| `--input-error-color` | color | `#c0392b` † |
| `--input-font-size` | dimension | `16px` |
| `--input-foreground` | color | `#0A0A0A` † |
| `--input-hint-color` | color | `#57534E` † |
| `--input-hint-size` | dimension | `12px` |
| `--input-label-color` | color | `#0A0A0A` † |
| `--input-label-size` | dimension | `14px` |
| `--input-label-weight` | other | `500` |
| `--input-padding-x` | dimension | `16px` |
| `--input-padding-y` | dimension | `12px` |
| `--input-placeholder-color` | color | `#57534E` † |
| `--input-prefix-color` | color | `#57534E` † |
| `--input-suffix-color` | color | `#57534E` † |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Input
  id="default"
  label="Email address"
  placeholder="you@example.com"
  type="email"
/>
```

## Accessibility

- `<label>` is auto-linked via `useId()` — never use placeholder as the only label
- When no `label` prop: `aria-label` must be passed instead
- `aria-invalid="true"` set automatically when `error` prop is present
- `aria-describedby` links the input to the hint/error element by id
- Focus: outline uses `--input-border-focus` (maps to `--color-border-focus`); error state uses `--input-border-error` instead
- `'use client'` — uses `useId()`, cannot render as a server component
