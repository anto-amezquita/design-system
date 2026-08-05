import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Input } from './Input'
import { AtIcon, LockIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Label',
    placeholder: 'Placeholder text',
    disabled: false,
    type: 'text',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'url', 'search', 'tel'],
    },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
    search: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    id: 'default',
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
  },
}

export const WithHint: Story = {
  name: 'With hint',
  args: {
    id: 'with-hint',
    label: 'Username',
    placeholder: 'your-username',
    hint: 'Must be 3–20 characters, letters and numbers only.',
  },
}

export const WithError: Story = {
  name: 'With error',
  args: {
    id: 'with-error',
    label: 'Email address',
    placeholder: 'you@example.com',
    defaultValue: 'not-an-email',
    error: 'Please enter a valid email address.',
    type: 'email',
  },
}

export const Disabled: Story = {
  args: {
    id: 'disabled',
    label: 'Read-only field',
    defaultValue: 'Cannot be edited',
    disabled: true,
  },
}

export const NoLabel: Story = {
  name: 'No label (aria-label)',
  args: {
    id: 'no-label',
    'aria-label': 'Search',
    placeholder: 'Search…',
    type: 'search',
  },
}

export const WithPrefix: Story = {
  name: 'With prefix',
  render: () => (
    <div style={{ maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        id="prefix-email"
        label="Email address"
        placeholder="you@example.com"
        prefix={<AtIcon size={16} />}
      />
      <Input
        id="prefix-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        prefix={<LockIcon size={16} />}
      />
    </div>
  ),
}

export const WithSuffix: Story = {
  name: 'With suffix',
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Input
        id="suffix-domain"
        label="Subdomain"
        placeholder="yourname"
        suffix={<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>.amezquita.dk</span>}
      />
    </div>
  ),
}

export const Clearable: Story = {
  name: 'Clearable (controlled)',
  render: () => {
    const [val, setVal] = useState('Hello world')
    return (
      <div style={{ maxWidth: '360px' }}>
        <Input
          id="clearable"
          label="Clearable input"
          value={val}
          onChange={setVal}
          onClear={() => setVal('')}
          clearable
        />
      </div>
    )
  },
}

export const Search: Story = {
  name: 'Search',
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Input
        id="search"
        aria-label="Search"
        placeholder="Search…"
        search
        clearable
        defaultValue=""
      />
    </div>
  ),
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '360px' }}>
      <Input id="state-default" label="Default" placeholder="Placeholder" />
      <Input id="state-hint" label="With hint" placeholder="Placeholder" hint="Helpful context for the user." />
      <Input id="state-error" label="With error" defaultValue="bad input" error="This field is required." />
      <Input id="state-disabled" label="Disabled" defaultValue="Cannot edit" disabled />
      <Input id="state-prefix" label="With prefix" placeholder="you@example.com" prefix={<AtIcon size={16} />} />
      <Input id="state-search" aria-label="Search" placeholder="Search…" search />
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
