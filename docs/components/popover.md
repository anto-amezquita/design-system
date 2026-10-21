# Popover

> Content shown next to its trigger without blocking the page: a filter panel, a date picker, a short form

- Tier: composition
- Storybook: `Components/Popover`
- Import: `import { Popover } from '@amezquita/design-system/components/composition/Popover'`

## Usage example

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary" icon={<FunnelIcon />}>Filters</Button>
  </PopoverTrigger>
  <PopoverContent title="Filters" showClose align="start">{filters}</PopoverContent>
</Popover>
```

## Best practices

### Do

- Use a Popover for something short that belongs to its trigger and can be dismissed without losing work.
- Give it a `title` when it holds a form or several controls.
- Put the confirming action in a `PopoverClose`, so applying also closes it.

### Don't

- Don't use a Popover for a plain text hint; that's Tooltip.
- Don't use it for a list of actions; that's Menu.
- Don't put a long or important task in it; use Dialog or a page.

## Accessibility

- Radix Popover: a non-modal `role="dialog"`, named by `title` or `aria-label`
- The trigger gets `aria-expanded` and `aria-controls`
- Focus moves into the panel on open and back to the trigger on close; Escape and a click outside close it
- The shared overlay layer, `--z-overlay`, like Select and Dialog (decisions/0027): above a page's sticky header, and since all overlays tie, the one opened last (this Popover inside a Dialog, say) paints on top
