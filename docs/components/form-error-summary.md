# FormErrorSummary

> Sub-component of FormLayout.

- Tier: patterns
- Storybook: `Components/FormLayout`
- Import: `import { FormErrorSummary } from '@amezquita/design-system/components/patterns/FormLayout'`

## Props

| Prop | Type | Description |
|---|---|---|
| `errors` | `{ id: string; message: string }[]` |  |
| `title?` | `string` | Default: "There is a problem" or "There are 3 problems". |
| `focusOnChange?` | `boolean` | Take focus when it appears or the errors change, so it's read straight after a failed submit. Default `true`. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>`

## Usage example

See `FormLayout`'s own usage example — FormErrorSummary is one of its sub-components, not used standalone.
