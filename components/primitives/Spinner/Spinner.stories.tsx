import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  args: {
    size: 'md',
    label: 'Loading',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: { size: 'md' },
}

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner size="sm" label="Loading small" />
      <Spinner size="md" label="Loading medium" />
      <Spinner size="lg" label="Loading large" />
    </div>
  ),
}

export const OnColoredBackground: Story = {
  name: 'Inherits currentColor',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ color: '#15616D' }}>
        <Spinner size="md" label="Loading (teal)" />
      </div>
      <div style={{ background: '#292524', padding: '12px', borderRadius: '8px', color: '#FFFFFF' }}>
        <Spinner size="md" label="Loading (on dark)" />
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllSizes,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
