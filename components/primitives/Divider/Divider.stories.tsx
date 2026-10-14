import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from './Divider'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Divider>

const text = { margin: 0, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }

export const Default: Story = {
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '24rem' }}>
      <p style={text}>Account details</p>
      <Divider {...args} />
      <p style={text}>Notification settings</p>
    </div>
  ),
}

export const Vertical: Story = {
  args: { orientation: 'vertical', decorative: true },
  render: args => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={text}>Docs</span>
      <Divider {...args} />
      <span style={text}>Changelog</span>
      <Divider {...args} />
      <span style={text}>GitHub</span>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '24rem' }}>
      <p style={text}>Account details</p>
      <Divider />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={text}>Docs</span>
        <Divider orientation="vertical" decorative />
        <span style={text}>Changelog</span>
      </div>
    </div>
  ),
  decorators: [darkModeDecorator],
}
