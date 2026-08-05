import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from './Switch'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Enable notifications',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: { id: 'default', label: 'Enable notifications' },
}

export const Checked: Story = {
  args: { id: 'checked', label: 'Email updates', defaultChecked: true },
}

export const Disabled: Story = {
  args: { id: 'disabled', label: 'Disabled (off)', disabled: true },
}

export const DisabledChecked: Story = {
  name: 'Disabled (on)',
  args: { id: 'disabled-on', label: 'Disabled (on)', defaultChecked: true, disabled: true },
}

export const NoLabel: Story = {
  name: 'Without label (aria-label)',
  args: { id: 'no-label', 'aria-label': 'Toggle dark mode' },
}

export const Controlled: Story = {
  name: 'Controlled (toggle)',
  render: () => {
    const [on, setOn] = useState(false)
    return (
      <Switch
        id="controlled"
        label={on ? 'Dark mode on' : 'Dark mode off'}
        checked={on}
        onCheckedChange={setOn}
      />
    )
  },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch id="s-off" label="Off (default)" />
      <Switch id="s-on" label="On" defaultChecked />
      <Switch id="s-disabled-off" label="Disabled (off)" disabled />
      <Switch id="s-disabled-on" label="Disabled (on)" defaultChecked disabled />
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
