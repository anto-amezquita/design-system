import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './ProgressBar'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: {
    label: 'Uploading photos',
    value: 40,
    max: 100,
    showValue: true,
    hideLabel: false,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  decorators: [Story => <div style={{ maxWidth: '24rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      <ProgressBar label="Not started" value={0} showValue />
      <ProgressBar label="Uploading photos" value={40} showValue />
      <ProgressBar label="Complete" value={100} showValue />
      <ProgressBar label="Preparing export" />
    </div>
  ),
}

export const ValueText: Story = {
  name: 'Value in words',
  args: { label: 'Uploading files', value: 3, max: 10, valueText: '3 of 10 files' },
}

export const Indeterminate: Story = {
  args: { label: 'Preparing export', value: undefined },
}

export const HiddenLabel: Story = {
  name: 'Label for screen readers only',
  args: { hideLabel: true, showValue: false },
}

export const DarkMode: Story = {
  ...States,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
