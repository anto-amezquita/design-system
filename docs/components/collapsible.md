# Collapsible

> One section that shows and hides behind a button (the WAI-ARIA disclosure pattern)

- Tier: primitives
- Storybook: `Components/Collapsible`
- Import: `import { Collapsible } from '@amezquita/design-system/components/primitives/Collapsible'`

## Props

| Prop | Type | Description |
|---|---|---|
| `title` | `React.ReactNode` | The button's text: what opens. "Show details", "Shipping options". |
| `children` | `React.ReactNode` | What shows and hides. |
| `open?` | `boolean` | Controlled open state. Pair with `onOpenChange`. |
| `defaultOpen?` | `boolean` | Open on first render when uncontrolled. Default `false`. |
| `onOpenChange?` | `(open: boolean) => void` | Called with the new state when the button is pressed. |
| `variant?` | `'block' \| 'inline'` | `block` (default): a full-width row with the chevron at the end, for a section of a page or a panel. `inline`: a text button in the accent colour, for "Show more" under a paragraph. |
| `headingLevel?` | `2 \| 3 \| 4 \| 5 \| 6` | With `block`, wrap the button in a heading of this level, so the section shows up in the page outline. Leave out when it isn't a section. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'>`

## Usage example

```tsx
args => (
  <Collapsible {...args}>
    <p style={text}>Standard delivery in 2–4 working days. Express next working day if ordered before 14:00.</p>
  </Collapsible>
)
```

## Best practices

### Do

- Use it for one optional section: details, advanced settings, the rest of a long text.
- Write the title as what's inside ("Shipping options"), not as an instruction ("Click to expand").
- Use `headingLevel` when the section is part of the page's structure.

### Don't

- Don't stack several Collapsibles for related sections; that's Accordion.
- Don't hide content everyone needs, like an error or a price; show it.
- Don't put the only way to finish a task inside a closed Collapsible.

## Accessibility

- A native `button` with `aria-expanded` and `aria-controls` pointing at the panel; Enter and Space toggle it
- Closed content is `visibility: hidden`, so it's out of the tab order and the accessibility tree, not just clipped; on close the hiding waits for the collapse to finish, so nothing vanishes mid-animation
- The height animates by growing a grid row, with no measuring; with `prefers-reduced-motion` it opens and closes instantly
- The chevron is decoration (`aria-hidden`); the button's name is the title
- Triggers are tested at 4.5:1 at rest and hovered, and content at 4.5:1, in all five brands, light and dark
