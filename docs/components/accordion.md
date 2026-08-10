# Accordion

> Collapsible content sections with animated expand/collapse; supports single or multi-open modes

- Tier: patterns
- Storybook: `Components/Accordion`
- Import: `import { Accordion } from '@amezquita/design-system/components/patterns/Accordion'`

## Props

| Prop | Type | Description |
|---|---|---|
| `type` | `'single' \| 'multiple'` |  |
| `defaultValue?` | `string \| string[]` |  |
| `value?` | `string \| string[]` |  |
| `onValueChange?` | `(value: string) => void \| (value: string[]) => void` |  |
| `collapsible?` | `boolean` |  |
| `children` | `React.ReactNode` |  |
| `className?` | `string` |  |
| `style?` | `React.CSSProperties` |  |

## Tokens

| Token | Type | Value |
|---|---|---|
| `--accordion-border-color` | color | `#E2DDD9` † |
| `--accordion-border-width` | dimension | `1px` |
| `--accordion-content-color` | color | `#57534E` † |
| `--accordion-content-padding-bottom` | dimension | `24px` |
| `--accordion-content-padding-x` | dimension | `24px` |
| `--accordion-duration-collapse` | other | `200ms` |
| `--accordion-duration-expand` | other | `650ms` |
| `--accordion-icon-color` | color | `#57534E` † |
| `--accordion-icon-size` | dimension | `20px` |
| `--accordion-trigger-color` | color | `#0A0A0A` † |
| `--accordion-trigger-font-size` | dimension | `16px` |
| `--accordion-trigger-font-weight` | fontWeight | `500` |
| `--accordion-trigger-hover-background` | color | `#F4F0EB` † |
| `--accordion-trigger-padding-x` | dimension | `24px` |
| `--accordion-trigger-padding-y` | dimension | `16px` |

† resolves differently across light/dark and default/bold themes — see `tokens.json` for all four values.

## Usage example

```tsx
<Accordion type="single" collapsible style={{ maxWidth: '560px' }}>
  <AccordionItem value="item1">
    <AccordionTrigger>What is a design system?</AccordionTrigger>
    <AccordionContent>
      A design system is a collection of reusable components, guided by clear standards,
      that can be assembled to build any number of applications.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item2">
    <AccordionTrigger>How do tokens work?</AccordionTrigger>
    <AccordionContent>
      Design tokens are the smallest named units of a design system — colors, spacing, typography.
      They are defined once and referenced everywhere, so a single change propagates consistently.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item3">
    <AccordionTrigger>When should I use Radix UI?</AccordionTrigger>
    <AccordionContent>
      Use Radix UI for components that require complex accessibility behaviour: keyboard navigation,
      focus management, aria attributes, and WCAG-compliant interactions. Strip all default styles
      and apply BEM classes yourself.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```
