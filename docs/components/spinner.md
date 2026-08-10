# Spinner

> Indeterminate loading indicator for in-progress operations

- Tier: primitives
- Storybook: `Components/Spinner`
- Import: `import { Spinner } from '@amezquita/design-system/components/primitives/Spinner'`

## Props

| Prop | Type | Description |
|---|---|---|
| `size?` | `'sm' \| 'md' \| 'lg'` |  |
| `label?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--spinner-duration` | duration | `700ms` |
| `--spinner-size-lg` | other | `24px` |
| `--spinner-size-md` | other | `20px` |
| `--spinner-size-sm` | other | `16px` |
| `--spinner-stroke-width` | dimension | `2px` |

## Usage example

```tsx
<Spinner
  size="md"
/>
```
