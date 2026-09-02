# Label

> Standalone form label element — used when a label must be decoupled from its input

- Tier: primitives
- Storybook: `Components/Label`
- Import: `import { Label } from '@amezquita/design-system/components/primitives/Label'`

## Props

| Prop | Type | Description |
|---|---|---|
| `htmlFor?` | `string` |  |
| `required?` | `boolean` |  |
| `disabled?` | `boolean` |  |
| `children` | `React.ReactNode` |  |
| `className?` | `string` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--label-color` | color | `#0A0A0A` † |
| `--label-color-disabled` | color | `#57534E` † |
| `--label-font-size` | dimension | `14px` |
| `--label-font-weight` | fontWeight | `500` |
| `--label-gap` | dimension | `8px` |
| `--label-required-color` | color | `#c0392b` † |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Label
  htmlFor="demo"
>Email address</Label>
```
