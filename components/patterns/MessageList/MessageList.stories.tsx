import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import { MessageList } from './MessageList'
import { ChatMessage } from '../ChatMessage'
import { ChatComposer } from '../ChatComposer'
import { Markdown } from '../Markdown'
import { Avatar } from '../../primitives/Avatar'
import { darkModeDecorator } from '@/lib/storybook'

type Msg = { id: number; role: 'user' | 'assistant'; text: string; streaming?: boolean }

const me = <Avatar alt="Antonio Amézquita" size="sm" />
const ai = <Avatar alt="Assistant" fallback="AI" size="sm" />

const history: Msg[] = [
  { id: 1, role: 'user', text: 'Why does a brand only override some tokens?' },
  { id: 2, role: 'assistant', text: 'Because a brand is a **thin skin** on base: base defines every role, and a brand changes only the few that make it look like itself.' },
  { id: 3, role: 'user', text: 'And a component token?' },
  { id: 4, role: 'assistant', text: 'A component token names a decision one component makes, like `--button-padding-x`. It points at a semantic role, so a brand can still reach it.' },
  { id: 5, role: 'user', text: 'When should I add one?' },
  { id: 6, role: 'assistant', text: 'When a component needs a value no semantic role gives it. If it would only pass a role through unchanged, use the role directly.' },
]

function Messages({ list }: { list: Msg[] }) {
  return list.map((m, i) => (
    <ChatMessage
      key={m.id}
      role={m.role}
      author={m.role === 'user' ? 'Antonio' : 'Assistant'}
      avatar={m.role === 'user' ? me : ai}
      status={m.streaming ? 'streaming' : 'complete'}
      continued={i > 0 && list[i - 1].role === m.role}
    >
      {m.role === 'assistant' && m.text ? <Markdown>{m.text}</Markdown> : m.text || undefined}
    </ChatMessage>
  ))
}

const frame: React.CSSProperties = { blockSize: '420px', maxInlineSize: '44rem', display: 'grid', border: '1px solid var(--color-border-default)', borderRadius: 'var(--border-radius-component)' }

const meta: Meta<typeof MessageList> = {
  title: 'Components/MessageList',
  component: MessageList,
  args: { label: 'Conversation with Assistant' },
}

export default meta
type Story = StoryObj<typeof MessageList>

export const Default: Story = {
  render: args => (
    <div style={frame}>
      <MessageList {...args}><Messages list={history} /></MessageList>
    </div>
  ),
}

const reply = 'Here is how I would do it: start from **base**, list the roles your brand needs to change, and override only those. Everything else, spacing, motion, type scale, comes through unchanged, so a new component works in your brand the day it ships.'

/** Sends a message, then streams a canned reply word by word. */
function Live(args: { label: string }) {
  const [list, setList] = useState(history)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  useEffect(() => () => clearInterval(timer.current), [])
  const streaming = list.some(m => m.streaming)

  const send = (text: string) => {
    const id = Date.now()
    setList(l => [...l, { id: id - 1, role: 'user', text }, { id, role: 'assistant', text: '', streaming: true }])
    const words = reply.split(' ')
    let n = 0
    timer.current = setInterval(() => {
      n++
      const done = n >= words.length
      setList(l => l.map(m => (m.id === id ? { ...m, text: words.slice(0, n).join(' '), streaming: !done } : m)))
      if (done) clearInterval(timer.current)
    }, 60)
  }

  const stop = () => {
    clearInterval(timer.current)
    setList(l => l.map(m => (m.streaming ? { ...m, streaming: false } : m)))
  }

  return (
    <div style={{ ...frame, gridTemplateRows: 'minmax(0, 1fr) auto', blockSize: '520px' }}>
      <MessageList label={args.label}><Messages list={list} /></MessageList>
      <div style={{ padding: 'var(--space-element-gap)' }}>
        <ChatComposer placeholder="Ask a follow-up" onSubmit={send} status={streaming ? 'streaming' : 'idle'} onStop={stop} />
      </div>
    </div>
  )
}

export const LiveConversation: Story = {
  name: 'Live (send a message, watch the reply stream)',
  render: args => <Live label={args.label} />,
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: args => (
    <div style={frame}>
      <MessageList {...args}><Messages list={history} /></MessageList>
    </div>
  ),
  decorators: [darkModeDecorator],
}
