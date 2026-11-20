# Badge

> Small status indicator or numeric count overlay attached to another element; with `as="button"`, a status pill that does something

- Tier: primitives
- Storybook: `Components/Badge`
- Import: `import { Badge } from '@amezquita/design-system/components/primitives/Badge'`

## Props

| Prop | Type | Description |
|---|---|---|
| `variant?` | `'neutral' \| 'success' \| 'warning' \| 'error' \| 'info'` |  |
| `shape?` | `'dot' \| 'status' \| 'count'` |  |
| `aria-label?` | `string` |  |
| `children?` | `React.ReactNode` |  |
| `as?` | `'span' \| 'button'` | `span` (default) for a label, or `button` for a pill that does something: a real `<button type="button">`, in the tab order, with hover and focus states and a target grown to 24px. Use `button` when the Badge opens a Dialog or Drawer as its `trigger`. A dot can't be a button; its 8px target is too small. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-label' | 'role'>`

## Tokens

| Token | Type | Value |
|---|---|---|
| `--badge-count-size` | dimension | `20px` |
| `--badge-dot-size` | dimension | `8px` |
| `--badge-font-weight` | fontWeight | `500` |
| `--badge-padding-x` | dimension | `8px` |
| `--badge-padding-y` | dimension | `4px` |

## Usage example

```tsx
<Badge>Label</Badge>
```

## Accessibility

- A plain Badge is a `span`, outside the tab order; with `aria-label` it's `role="img"`. A Badge that does something must be `as="button"`, so the keyboard reaches it: a clickable span opens on click only
- `as="button"` is named by its text, or `aria-label` for a count. Its target is grown to 24px or more with an invisible margin (WCAG 2.5.8), so it keeps the size of the Badges around it
- Hover darkens the border to the text colour rather than fading the pill, so the text keeps its contrast
