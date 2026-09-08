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
| `--input-hint-size` | dimension | `12px` |

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
