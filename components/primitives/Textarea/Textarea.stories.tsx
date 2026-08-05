import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Textarea } from './Textarea'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Message',
    placeholder: 'Write your message…',
    disabled: false,
    rows: 3,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    characterCount: { control: 'boolean' },
    rows: { control: 'number' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
    maxLength: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    id: 'default',
    label: 'Message',
    placeholder: 'Write your message…',
  },
}

export const WithHint: Story = {
  name: 'With hint',
  args: {
    id: 'with-hint',
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    hint: 'Shown publicly on your profile.',
  },
}

export const WithError: Story = {
  name: 'With error',
  args: {
    id: 'with-error',
    label: 'Message',
    defaultValue: 'Hi',
    error: 'Message must be at least 20 characters.',
  },
}

export const Disabled: Story = {
  args: {
    id: 'disabled',
    label: 'Notes',
    defaultValue: 'This field is read-only.',
    disabled: true,
  },
}

export const WithCharacterCount: Story = {
  name: 'With character count',
  render: () => {
    const [val, setVal] = useState('')
    return (
      <div style={{ maxWidth: '480px' }}>
        <Textarea
          id="char-count"
          label="Bio"
          placeholder="Tell us about yourself"
          value={val}
          onChange={setVal}
          characterCount
          maxLength={200}
          hint="Shown publicly on your profile."
        />
      </div>
    )
  },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '480px' }}>
      <Textarea id="s-default" label="Default" placeholder="Placeholder…" />
      <Textarea id="s-hint" label="With hint" placeholder="Placeholder…" hint="Helpful context here." />
      <Textarea id="s-error" label="With error" defaultValue="too short" error="Must be at least 20 characters." />
      <Textarea id="s-disabled" label="Disabled" defaultValue="Cannot be edited." disabled />
      <Textarea id="s-count" label="With count" placeholder="Write something…" characterCount maxLength={140} />
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllStates,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
