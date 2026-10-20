# ResizablePanels

> Two panes sharing the space, with a separator people drag, or move with the keyboard (the WAI-ARIA window splitter pattern)

- Tier: patterns
- Storybook: `Components/ResizablePanels`
- Import: `import { ResizablePanels } from '@amezquita/design-system/components/patterns/ResizablePanels'`

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | `[React.ReactNode, React.ReactNode]` | Exactly two panes: the first is the one being sized (a sidebar, a list), the second takes the rest. |
| `orientation?` | `'horizontal' \| 'vertical'` | `horizontal` (default): side by side, the separator is a vertical bar. `vertical`: stacked. |
| `size?` | `number` | Controlled size of the first pane, in percent. Pair with `onSizeChange`. |
| `defaultSize?` | `number` | Uncontrolled starting size of the first pane, in percent. Default 30. Double-clicking the separator returns to it. |
| `onSizeChange?` | `(size: number) => void` | Called with the new size, in percent, while dragging and on each key press. |
| `minSize?` | `number` | Smallest the first pane gets, in percent. Default 10. |
| `maxSize?` | `number` | Largest the first pane gets, in percent. Default 90. |
| `step?` | `number` | How far one arrow-key press moves the separator, in percent. Default 5. |
| `collapsible?` | `boolean` | Enter collapses the first pane to nothing, and Enter again restores it. Default `false`. |
| `label` | `string` | Names the separator for screen readers: what it resizes, like "Resize file list". Required: the separator is a focusable control. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

## Usage example

```tsx
args => (
  <div style={frame}>
    <ResizablePanels {...args} style={{ flex: 1 }}>
      <Files />
      <Editor />
    </ResizablePanels>
  </div>
)
```

## Best practices

### Do

- Use it where people need to trade space between two views: a file list and an editor, a list and a preview.
- Name the separator by what it resizes.
- Keep `minSize` large enough that the first pane is still usable.

### Don't

- Don't use it on small screens; stack the views or use a Drawer instead.
- Don't put more than two panes in one; nest a second ResizablePanels inside a pane.
- Don't use it for page layout that never changes; that's AppShell or Grid.

## Accessibility

- The separator is `role="separator"`, focusable, named by `label`, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` ("30%", or "Collapsed") and `aria-controls` pointing at the first pane
- Keyboard: arrows move it by `step` (Left/Right side by side, Up/Down stacked), Home and End go to the limits, Enter collapses and restores the first pane when `collapsible`
- Dragging uses pointer capture, so it keeps following the pointer over iframes or off the window; in right-to-left layouts the first pane is on the right and dragging follows
- Double-click resets to `defaultSize`
- The line is the default border colour; hovered, focused or dragged it thickens in `accent-text`, tested at 3:1 against the page in all five brands, light and dark. The hit area is wider than the line: narrow for a mouse, so it doesn't cover a pane's scrollbar, and a full touch target on touch screens
- **Known limit (WCAG 2.5.7, dragging):** a single pointer can reset the size (double-click) but can't set any other size without dragging; the keyboard can. Where pointer users need specific sizes, offer presets and pass `size` in (see the `WithPresets` story)
