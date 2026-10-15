# Tag

> A short label on content: a category, a status word, a chosen value; optionally removable or clickable

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
| `--tag-font-weight` | fontWeight | `500` |
| `--tag-muted-background` | color | `transparent` |
| `--tag-padding-x` | dimension | `12px` |
| `--tag-padding-y` | dimension | `4px` |

## Usage example

```tsx
<Tag
  variant="default"
>Default</Tag>
```

## Best practices

### Do

- Keep tag text to a word or two.
- Use removable tags for values people chose (MultiSelect, TagInput), so each can be taken back.

### Don't

- Don't use a tag as the only way to reach something; tags are small targets in a row.
- Don't use colour alone to tell tags apart; say it in the text.

## Accessibility

- A plain tag is a `<span>` with no role
- The Remove button is named after the tag, draws in the tag's own text colour at full strength (4.5:1, so over the 3:1 an icon needs) and has a 24px target (WCAG 2.5.8)
- A clickable and removable tag is a `span role="button"` so the Remove `<button>` inside stays valid HTML; Enter and Space activate it
