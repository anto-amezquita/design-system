import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from './Stack'
import { Button } from '../Button'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  args: {
    direction: 'vertical',
    gap: 'element',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: ['none', 'tight', 'inline', 'element', 'component', 'section'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    wrap: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Stack>

const box: React.CSSProperties = {
  padding: 'var(--space-element-gap)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-component)',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-base)',
}

export const Default: Story = {
  render: args => (
    <Stack {...args} style={{ maxWidth: '24rem' }}>
      <div style={box}>Profile</div>
      <div style={box}>Notifications</div>
      <div style={box}>Billing</div>
    </Stack>
  ),
}

export const Horizontal: Story = {
  args: { direction: 'horizontal', gap: 'inline', align: 'center' },
  render: args => (
    <Stack {...args}>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
    </Stack>
  ),
}

export const Gaps: Story = {
  render: () => (
    <Stack gap="component">
      {(['tight', 'inline', 'element', 'component', 'section'] as const).map(gap => (
        <Stack key={gap} direction="horizontal" gap={gap} align="center">
          <span style={{ ...box, minWidth: '7rem' }}>{gap}</span>
          <span style={box}>B</span>
          <span style={box}>C</span>
        </Stack>
      ))}
    </Stack>
  ),
}

export const AsList: Story = {
  name: 'As a list',
  render: () => (
    <Stack as="ul" gap="inline" aria-label="Recent files" style={{ maxWidth: '24rem' }}>
      <li style={box}>brand-brief.pdf</li>
      <li style={box}>tokens.json</li>
      <li style={box}>case-study.md</li>
    </Stack>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <Stack gap="component" style={{ maxWidth: '24rem' }}>
      <Stack gap="element">
        <div style={box}>Profile</div>
        <div style={box}>Notifications</div>
      </Stack>
      <Stack direction="horizontal" gap="inline" justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </Stack>
    </Stack>
  ),
  decorators: [darkModeDecorator],
}
