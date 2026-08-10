# Select

> Dropdown for choosing a single value from a list; supports grouped options

- Tier: primitives
- Storybook: `Components/Select`
- Import: `import { Select } from '@amezquita/design-system/components/primitives/Select'`

## Props

| Prop | Type | Description |
|---|---|---|
| `value?` | `string` |  |
| `defaultValue?` | `string` |  |
| `onValueChange?` | `(value: string) => void` |  |
| `placeholder?` | `string` |  |
| `disabled?` | `boolean` |  |
| `required?` | `boolean` |  |
| `name?` | `string` |  |
| `groups` | `SelectGroup[]` |  |
| `aria-label` | `string` | Required: the trigger is a combobox, which gets no accessible name from its content — without this, screen readers announce an unnamed control. |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--select-background` | color | `#FAFAF9` † |
| `--select-background-item-hover` | color | `#F4F0EB` † |
| `--select-border` | color | `#E2DDD9` † |
| `--select-border-focus` | color | `#0A0A0A` † |
| `--select-border-hover` | color | `#A8A29E` † |
| `--select-border-radius` | dimension | `4px` † |
| `--select-border-width` | dimension | `1px` |
| `--select-content-border-radius` | dimension | `8px` † |
| `--select-content-shadow` | shadow | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` |
| `--select-font-size` | dimension | `16px` |
| `--select-foreground` | color | `#0A0A0A` † |
| `--select-item-padding-x` | dimension | `16px` |
| `--select-item-padding-y` | dimension | `8px` |
| `--select-label-size` | dimension | `12px` |
| `--select-label-weight` | other | `500` |
| `--select-padding-x` | dimension | `16px` |
| `--select-padding-y` | dimension | `12px` |
| `--select-placeholder-color` | color | `#57534E` † |
| `--select-separator-color` | color | `#E2DDD9` † |
| `--select-separator-height` | dimension | `1px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<div style={{ maxWidth: '280px' }}>
  <Select {...args} />
</div>
```

## Accessibility

- Trigger is a `<button>` via Radix — do not wrap it in another button
- `aria-label` is a required prop — the trigger is a `combobox`, which gets no accessible name from its content, so an unnamed control is unshippable by type
- Keyboard: `Space` / `Enter` / `ArrowDown` opens; arrow keys navigate; `Enter` selects; `Escape` closes
- Focus returns to trigger on close (Radix default)
