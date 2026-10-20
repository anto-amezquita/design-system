import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Collapsible } from './Collapsible'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  args: {
    title: 'Shipping options',
    variant: 'block',
    defaultOpen: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['block', 'inline'] },
    headingLevel: { control: 'select', options: [undefined, 2, 3, 4, 5, 6] },
  },
  decorators: [Story => <div style={{ maxWidth: '32rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Collapsible>

const text: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-primary)',
}

export const Default: Story = {
  render: args => (
    <Collapsible {...args}>
      <p style={text}>Standard delivery in 2–4 working days. Express next working day if ordered before 14:00.</p>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Shipping options' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(button)
  },
}

export const Open: Story = {
  args: { defaultOpen: true, headingLevel: 3 },
  render: Default.render,
}

export const Inline: Story = {
  args: { variant: 'inline', title: 'Show the full changelog' },
  render: args => (
    <div>
      <p style={text}>1.5.0 adds 34 components and fixes disabled states across the library.</p>
      <Collapsible {...args} defaultOpen>
        <p style={text}>Divider, Kbd, Progress Bar, Icon Button, Toggle Button, Segmented Control, Button Group, Slider, Carousel, and more.</p>
      </Collapsible>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)' }}>
      <Collapsible title="Shipping options" defaultOpen>
        <p style={text}>Standard delivery in 2–4 working days.</p>
      </Collapsible>
      <Collapsible title="Show more" variant="inline">
        <p style={text}>Hidden until opened.</p>
      </Collapsible>
    </div>
  ),
  decorators: [darkModeDecorator],
}
