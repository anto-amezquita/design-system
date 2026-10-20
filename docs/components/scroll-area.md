# ScrollArea

> A box that scrolls its content, with thin scrollbars in the brand's colours, reachable and scrollable with the keyboard

- Tier: primitives
- Storybook: `Components/ScrollArea`
- Import: `import { ScrollArea } from '@amezquita/design-system/components/primitives/ScrollArea'`

## Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Names the area for screen readers ("Release notes", "Message history"). Required: a scrolling box has to be reachable with the keyboard, so it takes focus, and a focusable region needs a name to be announced. |
| `orientation?` | `'vertical' \| 'horizontal' \| 'both'` | Which way it scrolls. Default `vertical`. |
| `maxHeight?` | `string \| number` | Height limit before it scrolls: a CSS length (`'20rem'`) or pixels (`320`). |
| `children` | `React.ReactNode` |  |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'tabIndex'>`

## Usage example

```tsx
args => (
  <div style={frame}>
    <ScrollArea {...args}>
      {notes.map(n => <p key={n} style={text}>New: {n}</p>)}
    </ScrollArea>
  </div>
)
```

## Best practices

### Do

- Use it for a bounded list inside a panel or dialog: release notes, a message history, a long menu of options.
- Give it a label that says what's inside.
- Show that there's more, with the cut-off content or a count; scrollbars can be hidden by the OS until you scroll.

### Don't

- Don't make the main page content scroll in a box; let the page scroll.
- Don't nest ScrollAreas that scroll the same way; the inner one traps the wheel.
- Don't put essential actions at the bottom of a scrolling box where they can be missed.

## Accessibility

- It takes focus (`tabIndex={0}`), so keyboard users can scroll it with the arrow keys even when nothing inside is focusable (WCAG 2.1.1; axe `scrollable-region-focusable`). That's why `label` is required: a focusable region needs a name, and it's announced as one
- The focus ring sits inside the edge, so a parent that also clips can't cut it off
- These are the browser's own scrollbars, styled with `scrollbar-color` and `scrollbar-width`, not a JavaScript replacement: touch, trackpad momentum and assistive tech work as normal, and it costs no script. The thumb is the strong border colour, tested at 3:1 on the primary and secondary surfaces in all five brands, light and dark
- `overscroll-behavior: contain` stops the page from scrolling when the area reaches its end
