import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusDot } from './StatusDot'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  args: {
    status: 'success',
    pulse: false,
    children: 'Online',
  },
  argTypes: {
    status: { control: 'select', options: ['neutral', 'info', 'success', 'warning', 'error'] },
    pulse: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof StatusDot>

const column: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-inline-gap)' }

export const Default: Story = {}

export const Statuses: Story = {
  render: () => (
    <div style={column}>
      <StatusDot status="neutral">Offline</StatusDot>
      <StatusDot status="info">Scheduled</StatusDot>
      <StatusDot status="success">Online</StatusDot>
      <StatusDot status="warning">Degraded</StatusDot>
      <StatusDot status="error">Down</StatusDot>
    </div>
  ),
}

export const Pulse: Story = {
  args: { status: 'success', pulse: true, children: 'Live' },
}

export const LabelOnly: Story = {
  name: 'Label only (presence)',
  render: () => (
    <ul style={{ ...column, margin: 0, padding: 0, listStyle: 'none', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
      {([['Antonio', 'success', 'Online'], ['Maja', 'warning', 'Away'], ['Lars', 'neutral', 'Offline']] as const).map(([name, status, label]) => (
        <li key={name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-inline-gap)' }}>
          <StatusDot status={status} label={label} />
          {name}
        </li>
      ))}
    </ul>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={column}>
      <StatusDot status="neutral">Offline</StatusDot>
      <StatusDot status="info">Scheduled</StatusDot>
      <StatusDot status="success" pulse>Live</StatusDot>
      <StatusDot status="warning">Degraded</StatusDot>
      <StatusDot status="error">Down</StatusDot>
    </div>
  ),
  decorators: [darkModeDecorator],
}
