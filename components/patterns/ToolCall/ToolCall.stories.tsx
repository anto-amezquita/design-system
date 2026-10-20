import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ToolCall, type ToolCallStatus } from './ToolCall'
import { ChatMessage } from '../ChatMessage'
import { Avatar } from '../../primitives/Avatar'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ToolCall> = {
  title: 'Components/ToolCall',
  component: ToolCall,
  args: {
    name: 'search_tokens',
    title: 'Search the tokens for “radius”',
    status: 'success',
    durationMs: 820,
    input: { query: 'radius', category: 'semantic' },
    output: { results: ['--border-radius-component', '--border-radius-interactive', '--border-radius-pill'] },
  },
  argTypes: {
    status: { control: 'select', options: ['pending', 'running', 'success', 'error', 'awaiting-approval', 'denied'] },
  },
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ToolCall>

export const Default: Story = {}

export const Open: Story = {
  name: 'Open (input and output)',
  args: { defaultOpen: true },
}

export const AllStatuses: Story = {
  name: 'Every status',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)' }}>
      <ToolCall name="list_components" status="pending" />
      <ToolCall name="get_component" title="Read the Button docs" status="running" input={{ slug: 'button' }} />
      <ToolCall name="search_tokens" title="Search the tokens for “radius”" status="success" durationMs={820} input={{ query: 'radius' }} output={{ results: 3 }} />
      <ToolCall name="run_tests" title="Run the test suite" status="error" durationMs={14200} input="npm test" error="3 tests failed in Button.test.tsx" />
      <ToolCall name="write_file" title="Write tokens/brands/acme.json" status="awaiting-approval" input={{ path: 'tokens/brands/acme.json' }} />
      <ToolCall name="delete_branch" title="Delete the branch feat/old" status="denied" />
    </div>
  ),
}

function Approval() {
  const [status, setStatus] = useState<ToolCallStatus>('awaiting-approval')
  return (
    <ChatMessage role="assistant" author="Assistant" avatar={<Avatar alt="Assistant" fallback="AI" size="sm" />}>
      <div style={{ display: 'grid', gap: 'var(--space-inline-gap)' }}>
        <p style={{ margin: 0 }}>I'll add the brand file for Acme.</p>
        <ToolCall
          name="write_file"
          title="Write tokens/brands/acme.json"
          status={status}
          durationMs={status === 'success' ? 140 : undefined}
          input={{ path: 'tokens/brands/acme.json', bytes: 812 }}
          output={status === 'success' ? 'Written.' : undefined}
          onApprove={() => setStatus('success')}
          onDeny={() => setStatus('denied')}
        />
      </div>
    </ChatMessage>
  )
}

export const AskForApproval: Story = {
  name: 'Asks for approval (in a message)',
  render: () => <Approval />,
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: AllStatuses.render,
  decorators: [darkModeDecorator],
}
