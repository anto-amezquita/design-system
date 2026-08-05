import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './Label'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  args: {
    children: 'Email address',
    required: false,
    disabled: false,
  },
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: { htmlFor: 'demo', children: 'Email address' },
}

export const Required: Story = {
  args: { htmlFor: 'demo', children: 'Email address', required: true },
}

export const Disabled: Story = {
  args: { htmlFor: 'demo', children: 'Email address', disabled: true },
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Label htmlFor="v1">Default label</Label>
      <Label htmlFor="v2" required>Required label</Label>
      <Label htmlFor="v3" disabled>Disabled label</Label>
      <Label htmlFor="v4" required disabled>Required and disabled</Label>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllVariants,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
