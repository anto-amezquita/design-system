# Stack

> Lays children out in one direction with a consistent gap from the brand's spacing roles

- Tier: primitives
- Storybook: `Components/Stack`
- Import: `import { Stack } from '@amezquita/design-system/components/primitives/Stack'`

## Props

| Prop | Type | Description |
|---|---|---|
| `direction?` | `'vertical' \| 'horizontal'` | `vertical` (default) lays children in a column; `horizontal` in a row. |
| `gap?` | `'none' \| 'tight' \| 'inline' \| 'element' \| 'component' \| 'section'` | Space between children, by role rather than pixels, so each brand sets the real size: `tight` (a label and its hint), `inline` (an icon and its text, buttons in a row), `element` (default: items in a group), `component` (form fields, cards), `section` (page sections; grows with the viewport). |
| `align?` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | Cross-axis alignment. Default `stretch`. |
| `justify?` | `'start' \| 'center' \| 'end' \| 'between'` | Main-axis distribution. Default `start`. |
| `wrap?` | `boolean` | Let a horizontal Stack wrap onto more lines when it runs out of room. |
| `as?` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer' \| 'nav' \| 'main' \| 'ul' \| 'ol' \| 'span'` | The element to render. `div` (default), or a semantic one when the stack is that thing: `ul`/`ol` for a list (gets `role="list"` back, since Safari drops list semantics once markers are removed), `section`, `nav`, etc. |

Also accepts all props of: `React.HTMLAttributes<HTMLElement>`

## Usage example

```tsx
args => (
  <Stack {...args} style={{ maxWidth: '24rem' }}>
    <div style={box}>Profile</div>
    <div style={box}>Notifications</div>
    <div style={box}>Billing</div>
  </Stack>
)
```

## Best practices

### Do

- Use Stack instead of margins on children, so the spacing lives in one place and follows the brand.
- Pick the gap by role: `inline` between buttons, `element` between items in a group, `component` between form fields or cards.
- Use `as="ul"` when the items are a list a reader should hear counted.

### Don't

- Don't nest Stacks just to add one extra space; choose a larger gap role.
- Don't use Stack for two-dimensional layouts; that's Grid.
- Don't reorder children with CSS on a Stack; change the source order so keyboard and screen-reader order match.

## Accessibility

- No role of its own: it renders the element in `as`, so pick the one that matches what the group is
- As `ul` or `ol` it removes markers and indent and sets `role="list"`, because Safari drops list semantics once `list-style` is `none`. A `role` you pass wins
- Visual order follows source order (no `reverse` prop), so reading and tab order match what's on screen
