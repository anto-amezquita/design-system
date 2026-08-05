import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox } from './Checkbox'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Accept terms and conditions',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { id: 'default', label: 'Accept terms and conditions' },
}

export const Checked: Story = {
  args: { id: 'checked', label: 'Remember me', defaultChecked: true },
}

export const Indeterminate: Story = {
  args: { id: 'indeterminate', label: 'Select all', defaultChecked: 'indeterminate' },
}

export const Disabled: Story = {
  args: { id: 'disabled', label: 'Disabled (unchecked)', disabled: true },
}

export const DisabledChecked: Story = {
  name: 'Disabled (checked)',
  args: { id: 'disabled-checked', label: 'Disabled (checked)', defaultChecked: true, disabled: true },
}

export const Controlled: Story = {
  name: 'Controlled (toggle)',
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox
        id="controlled"
        label={checked ? 'Subscribed' : 'Subscribe to newsletter'}
        checked={checked}
        onCheckedChange={(v) => setChecked(v === true)}
      />
    )
  },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Checkbox id="s-unchecked" label="Unchecked" />
      <Checkbox id="s-checked" label="Checked" defaultChecked />
      <Checkbox id="s-indeterminate" label="Indeterminate" defaultChecked="indeterminate" />
      <Checkbox id="s-disabled" label="Disabled (unchecked)" disabled />
      <Checkbox id="s-disabled-checked" label="Disabled (checked)" defaultChecked disabled />
    </div>
  ),
}

export const NoLabel: Story = {
  name: 'Without label (aria-label)',
  args: {
    id: 'no-label',
    'aria-label': 'Select row',
  },
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
