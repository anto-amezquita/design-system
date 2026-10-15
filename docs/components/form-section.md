# FormSection

> Sub-component of FormLayout.

- Tier: patterns
- Storybook: `Components/FormLayout`
- Import: `import { FormSection } from '@amezquita/design-system/components/patterns/FormLayout'`

## Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | The section's heading. Names the section, so screen-reader users can jump to it. |
| `description?` | `string` | A line under the heading: what this part is for. |
| `headingLevel?` | `2 \| 3 \| 4` | Heading element. Default `h2`; pick the level that fits the page outline. |

Also accepts all props of: `Omit<React.HTMLAttributes<HTMLElement>, 'title'>`

## Usage example

See `FormLayout`'s own usage example — FormSection is one of its sub-components, not used standalone.
