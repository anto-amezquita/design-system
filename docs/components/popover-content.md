# PopoverContent

> Sub-component of Popover.

- Tier: composition
- Storybook: `Components/Popover`
- Import: `import { PopoverContent } from '@amezquita/design-system/components/composition/Popover'`

## Props

| Prop | Type | Description |
|---|---|---|
| `title?` | `string` | A heading that names the Popover. Without it, pass `aria-label`. |
| `showClose?` | `boolean` | A close button in the corner. Escape and clicking outside close it either way. |
| `showArrow?` | `boolean` | A small arrow pointing at the trigger. |

Also accepts all props of: `Omit<React.ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'title'>`

## Usage example

See `Popover`'s own usage example — PopoverContent is one of its sub-components, not used standalone.
