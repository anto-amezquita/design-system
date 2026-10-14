# IconButton

> An action shown only as an icon, for toolbars, cards and dense rows

- Tier: primitives
- Storybook: `Components/IconButton`
- Import: `import { IconButton } from '@amezquita/design-system/components/primitives/IconButton'`

## Props

| Prop | Type | Description |
|---|---|---|
| `icon` | `React.ReactNode` | The icon. It's hidden from screen readers; `label` names the action. |
| `label` | `string` | The action's name, e.g. "Close" or "Search". Required: it is the only name a screen reader gets. |
| `variant?` | `'primary' \| 'secondary' \| 'ghost'` | Emphasis, as on Button. Defaults to `ghost`, the usual weight for a toolbar or card action. |
| `size?` | `'md' \| 'sm'` | `md` (default) is a 44px square. `sm` draws a smaller square for dense rows; its hit area still reaches 44px. |
| `onClick?` | `(event: React.MouseEvent<HTMLButtonElement \| HTMLAnchorElement>) => void` |  |
| `disabled?` | `boolean` |  |
| `loading?` | `boolean` | Shows a spinner in place of the icon and blocks the action, as on Button. |
| `type?` | `'button' \| 'submit' \| 'reset'` |  |
| `href?` | `string` | Renders an `<a>`, for an action that navigates. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'type' | 'children' | 'aria-label'>`

## Best practices

### Do

- Use an icon people already know for the action: a cross to close, a magnifier to search, a bin to delete.
- Write the `label` as the action ("Delete row"), not the icon ("Bin").
- Add a Tooltip showing the label when the icon alone may not be clear.
- Use `ghost` for repeated actions in a list, so the row isn't a wall of filled circles.

### Don't

- Don't use an IconButton for the main action of a view; give that a Button with a visible label.
- Don't put two different actions behind the same icon on one screen.
- Don't use `sm` where people tap a lot on touch screens; the square looks small even though the target isn't.

## Accessibility

- Semantic element: `<button>`, or `<a>` with `href` (Button's rules)
- The `label` is the only accessible name, so it's required; the icon is `aria-hidden`
- Hit area is 44×44px at both sizes; `sm` extends it past the visible square
- Keyboard: `Enter` and `Space`, as Button
