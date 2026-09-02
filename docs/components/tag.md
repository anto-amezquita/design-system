# Tag

> Inline label for categorising or annotating content — non-interactive

- Tier: primitives
- Storybook: `Components/Tag`
- Import: `import { Tag } from '@amezquita/design-system/components/primitives/Tag'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'default' \| 'accent' \| 'muted'` |  |
| `children` | `React.ReactNode` |  |
| `label?` | `string` | Accessible label for the outer clickable element. Required when onClick is set and children is not a plain string. |
| `icon?` | `React.ReactNode` |  |
| `removable?` | `boolean` |  |
| `onRemove?` | `() => void` |  |
| `onClick?` | `() => void` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--tag-accent-background` | color | `#292524` † |
| `--tag-accent-border` | color | `#292524` † |
| `--tag-accent-foreground` | color | `#FFFFFF` † |
| `--tag-background` | color | `#F4F0EB` † |
| `--tag-border` | color | `#E2DDD9` † |
| `--tag-border-radius` | dimension | `9999px` |
| `--tag-border-width` | dimension | `1px` |
| `--tag-font-size` | dimension | `12px` |
| `--tag-font-weight` | fontWeight | `500` |
| `--tag-foreground` | color | `#57534E` † |
| `--tag-muted-background` | color | `transparent` |
| `--tag-muted-border` | color | `#E2DDD9` † |
| `--tag-muted-foreground` | color | `#57534E` † |
| `--tag-padding-x` | dimension | `12px` |
| `--tag-padding-y` | dimension | `4px` |

† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Tag
  variant="default"
>Default</Tag>
```

## Accessibility

- Renders `<span>` — purely presentational; no ARIA requirements
- Never use Tag as an interactive element; wrap in `<button>` or `<a>` if the tag must be clickable
