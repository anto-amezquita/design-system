import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RadioGroup } from './Radio'
import { darkModeDecorator } from '@/lib/storybook'

const OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push notification' },
]

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    options: OPTIONS,
    disabled: false,
    orientation: 'vertical',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  args: {
    id: 'default',
    'aria-label': 'Notification method',
    options: OPTIONS,
  },
}

export const WithDefault: Story = {
  name: 'With default value',
  args: {
    id: 'with-default',
    'aria-label': 'Notification method',
    options: OPTIONS,
    defaultValue: 'email',
  },
}

export const Horizontal: Story = {
  args: {
    id: 'horizontal',
    'aria-label': 'Notification method',
    options: OPTIONS,
    orientation: 'horizontal',
  },
}

export const Disabled: Story = {
  args: {
    id: 'disabled',
    'aria-label': 'Notification method',
    options: OPTIONS,
    defaultValue: 'sms',
    disabled: true,
  },
}

export const WithDisabledOption: Story = {
  name: 'With disabled option',
  args: {
    id: 'partial-disabled',
    'aria-label': 'Notification method',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS (unavailable)', disabled: true },
      { value: 'push', label: 'Push notification' },
    ],
  },
}

export const Controlled: Story = {
  name: 'Controlled',
  render: () => {
    const [val, setVal] = useState('email')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RadioGroup
          id="controlled"
          aria-label="Notification method"
          options={OPTIONS}
          value={val}
          onValueChange={setVal}
        />
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Selected: {val}
        </p>
      </div>
    )
  },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '12px', marginTop: 0 }}>Vertical (default)</p>
        <RadioGroup id="all-vertical" aria-label="Vertical" options={OPTIONS} defaultValue="sms" />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '12px', marginTop: 0 }}>Horizontal</p>
        <RadioGroup id="all-horizontal" aria-label="Horizontal" options={OPTIONS} defaultValue="push" orientation="horizontal" />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '12px', marginTop: 0 }}>Disabled</p>
        <RadioGroup id="all-disabled" aria-label="Disabled" options={OPTIONS} defaultValue="email" disabled />
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
