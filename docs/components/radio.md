# Radio

> Single-selection control within a mutually exclusive group

- Tier: primitives
- Storybook: `Components/Radio`
- Import: `import { RadioGroup } from '@amezquita/design-system/components/primitives/Radio'`

## Props

| Prop | Type | Description |
|---|---|---|
| `id?` | `string` |  |
| `name?` | `string` |  |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` |  |
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onValueChange?` | `(value: string) => void` |  |
| `disabled?` | `boolean` |  |
| `orientation?` | `'vertical' \| 'horizontal'` |  |
| `aria-label?` | `string` |  |
| `aria-labelledby?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--radio-border` | color | `#A8A29E` † |
| `--radio-border-width` | dimension | `1px` |
| `--radio-group-gap` | dimension | `12px` |
| `--radio-indicator-size` | dimension | `12px` |
| `--radio-label-gap` | dimension | `12px` |
| `--radio-size` | dimension | `24px` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<RadioGroup
  id="default"
  aria-label="Notification method"
  options={OPTIONS}
/>
```
