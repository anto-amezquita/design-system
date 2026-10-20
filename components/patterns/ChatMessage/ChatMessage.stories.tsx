import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowClockwiseIcon, CopyIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { ChatMessage } from './ChatMessage'
import { Avatar } from '../../primitives/Avatar'
import { IconButton } from '../../primitives/IconButton'
import { Markdown } from '../Markdown'
import { darkModeDecorator } from '@/lib/storybook'

const at = (h: number, m: number) => new Date(2026, 9, 20, h, m)

const meta: Meta<typeof ChatMessage> = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  args: {
    role: 'assistant',
    author: 'Assistant',
    timestamp: at(14, 2),
    children: 'Tokens first: every colour comes from a semantic role, so a brand only overrides the roles it needs.',
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'assistant', 'system'] },
    status: { control: 'inline-radio', options: ['complete', 'streaming'] },
  },
  decorators: [Story => <div style={{ maxWidth: '48rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ChatMessage>

export const Default: Story = {}

const conversation = (
  <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
    <ChatMessage role="system" author="Conversation">Antonio started a conversation</ChatMessage>
    <ChatMessage role="user" author="Antonio" avatar={<Avatar alt="Antonio Amézquita" size="sm" />} timestamp={at(14, 1)}>
      Why does a brand only override some tokens?
    </ChatMessage>
    <ChatMessage
      role="assistant"
      author="Assistant"
      avatar={<Avatar alt="Assistant" fallback="AI" size="sm" />}
      timestamp={at(14, 2)}
      actions={(
        <>
          <IconButton icon={<CopyIcon />} label="Copy" variant="ghost" size="sm" />
          <IconButton icon={<ThumbsUpIcon />} label="Good answer" variant="ghost" size="sm" />
        </>
      )}
    >
      <Markdown>{'Because a brand is a **thin skin** on base:\n\n- base defines every role\n- a brand changes the few that make it look like itself\n\nEverything else comes through unchanged.'}</Markdown>
    </ChatMessage>
    <ChatMessage role="user" author="Antonio" avatar={<Avatar alt="Antonio Amézquita" size="sm" />} timestamp={at(14, 3)}>
      Makes sense.
    </ChatMessage>
    <ChatMessage role="user" author="Antonio" avatar={<Avatar alt="Antonio Amézquita" size="sm" />} timestamp={at(14, 3)} continued>
      And a component token?
    </ChatMessage>
  </div>
)

export const Conversation: Story = {
  render: () => conversation,
}

export const Streaming: Story = {
  name: 'Streaming (no content yet)',
  args: { status: 'streaming', children: undefined, avatar: <Avatar alt="Assistant" fallback="AI" size="sm" /> },
}

export const StreamingWithText: Story = {
  name: 'Streaming (text arriving)',
  args: { status: 'streaming', children: 'Tokens first: every colour comes from', avatar: <Avatar alt="Assistant" fallback="AI" size="sm" /> },
}

export const Failed: Story = {
  args: {
    role: 'user',
    author: 'Antonio',
    avatar: <Avatar alt="Antonio Amézquita" size="sm" />,
    children: 'Can you show me the spacing scale?',
    error: 'Not sent. Check your connection and try again.',
    actions: <IconButton icon={<ArrowClockwiseIcon />} label="Retry sending" variant="ghost" size="sm" />,
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => conversation,
  decorators: [darkModeDecorator],
}
