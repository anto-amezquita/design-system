import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion'

const meta: Meta<typeof Accordion> = {
  title: 'Patterns/Accordion',
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  render: () => (
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
  ),
}

export const Multiple: Story = {
  name: 'Multiple open (type="multiple")',
  render: () => (
    <Accordion type="multiple" defaultValue={['item1', 'item3']} style={{ maxWidth: '560px' }}>
      <AccordionItem value="item1">
        <AccordionTrigger>Research</AccordionTrigger>
        <AccordionContent>
          Interviews, contextual inquiry, and desk research form the foundation of every project.
          The goal is to understand the real constraint before proposing a solution.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item2">
        <AccordionTrigger>Design</AccordionTrigger>
        <AccordionContent>
          From rough sketches to high-fidelity components, design decisions are made iteratively
          and validated against the token system at every step.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item3">
        <AccordionTrigger>Build</AccordionTrigger>
        <AccordionContent>
          Components are built with BEM and CSS custom properties, always referencing semantic tokens.
          Radix UI handles behaviour; visual design is entirely custom.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const WithDisabledItem: Story = {
  name: 'With disabled item',
  render: () => (
    <Accordion type="single" collapsible style={{ maxWidth: '560px' }}>
      <AccordionItem value="item1">
        <AccordionTrigger>Available feature</AccordionTrigger>
        <AccordionContent>This item is enabled and can be expanded.</AccordionContent>
      </AccordionItem>

      <AccordionItem value="item2" disabled>
        <AccordionTrigger>Unavailable feature</AccordionTrigger>
        <AccordionContent>This content cannot be reached.</AccordionContent>
      </AccordionItem>

      <AccordionItem value="item3">
        <AccordionTrigger>Another available feature</AccordionTrigger>
        <AccordionContent>This item is also enabled and can be expanded.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const DefaultOpen: Story = {
  name: 'Default open',
  render: () => (
    <Accordion type="single" defaultValue="item2" style={{ maxWidth: '560px' }}>
      <AccordionItem value="item1">
        <AccordionTrigger>First item</AccordionTrigger>
        <AccordionContent>The first item starts closed.</AccordionContent>
      </AccordionItem>

      <AccordionItem value="item2">
        <AccordionTrigger>Second item — starts open</AccordionTrigger>
        <AccordionContent>
          This item is open by default via the <code>defaultValue</code> prop.
          The chevron is rotated and the content is fully expanded.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item3">
        <AccordionTrigger>Third item</AccordionTrigger>
        <AccordionContent>The third item starts closed.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Accordion type="single" collapsible defaultValue="item1" style={{ maxWidth: '560px' }}>
      <AccordionItem value="item1">
        <AccordionTrigger>What is a design token?</AccordionTrigger>
        <AccordionContent>
          A design token is a named value that stores a design decision — a color, a size, a duration.
          Tokens decouple the decision from the implementation.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item2">
        <AccordionTrigger>How does dark mode work here?</AccordionTrigger>
        <AccordionContent>
          Dark mode is implemented as a CSS cascade layer. Adding <code>data-mode="dark"</code> to any
          ancestor element triggers the dark token overrides — no JavaScript theme switching required.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item3">
        <AccordionTrigger>How do I add a new theme?</AccordionTrigger>
        <AccordionContent>
          Add a new brand folder under <code>tokens/brands/</code>, define your overrides,
          and add the output to <code>sd.config.mjs</code>. The cascade handles the rest.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
