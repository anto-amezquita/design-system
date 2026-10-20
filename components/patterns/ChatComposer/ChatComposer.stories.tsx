import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PaperclipIcon } from '@phosphor-icons/react'
import { ChatComposer } from './ChatComposer'
import { ChatMessage } from '../ChatMessage'
import { IconButton } from '../../primitives/IconButton'
import { Tag } from '../../primitives/Tag'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ChatComposer> = {
  title: 'Components/ChatComposer',
  component: ChatComposer,
  args: {
    placeholder: 'Ask about tokens, components or themes',
    onSubmit: () => {},
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'streaming'] },
  },
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ChatComposer>

export const Default: Story = {}

export const WithText: Story = {
  name: 'With a long draft (grows, then scrolls)',
  args: {
    maxRows: 4,
    defaultValue: 'Line one\nLine two\nLine three\nLine four\nLine five: past maxRows, so the field scrolls',
  },
}

export const WithAttachments: Story = {
  name: 'With attachments and an action',
  args: {
    actions: <IconButton icon={<PaperclipIcon />} label="Attach a file" size="sm" />,
    attachments: (
      <>
        <Tag removable onRemove={() => {}}>tokens.json</Tag>
        <Tag removable onRemove={() => {}}>button.png</Tag>
      </>
    ),
  },
}

export const Streaming: Story = {
  name: 'While a reply streams (Stop)',
  args: { status: 'streaming', defaultValue: 'A draft for the next question' },
}

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'This conversation is closed' },
}

function Conversation() {
  const [messages, setMessages] = useState<string[]>(['Why does a brand only override some tokens?'])
  return (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      {messages.map((m, i) => <ChatMessage key={i} role="user" author="Antonio" continued={i > 0}>{m}</ChatMessage>)}
      <ChatComposer placeholder="Write a message" onSubmit={m => setMessages(list => [...list, m])} />
    </div>
  )
}

export const InConversation: Story = {
  name: 'In a conversation (sends)',
  render: () => <Conversation />,
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { actions: <IconButton icon={<PaperclipIcon />} label="Attach a file" size="sm" /> },
  decorators: [darkModeDecorator],
}
