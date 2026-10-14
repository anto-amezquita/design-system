import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ListIcon, SquaresFourIcon, CalendarBlankIcon } from '@phosphor-icons/react'
import { SegmentedControl } from './SegmentedControl'
import { darkModeDecorator } from '@/lib/storybook'

const range = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const views = [
  { value: 'list', label: 'List view', icon: <ListIcon /> },
  { value: 'grid', label: 'Grid view', icon: <SquaresFourIcon /> },
  { value: 'calendar', label: 'Calendar view', icon: <CalendarBlankIcon /> },
]

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: { options: range, label: 'Time range', defaultValue: 'week' },
}

export default meta
type Story = StoryObj<typeof SegmentedControl>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const week = canvas.getByRole('radio', { name: 'Week' })
    await expect(week).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(canvas.getByRole('radio', { name: 'Month' }))
    await expect(canvas.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true')
    // Radix moves focus on the next tick and checks while the arrow is down, so hold it.
    await userEvent.keyboard('{ArrowRight>}')
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Year' })).toHaveAttribute('aria-checked', 'true'))
    await userEvent.keyboard('{/ArrowRight}')
  },
}

export const WithIcons: Story = {
  name: 'Icons and labels',
  args: { options: views, label: 'View', defaultValue: 'grid' },
}

export const IconsOnly: Story = {
  args: { options: views, label: 'View', defaultValue: 'list', hideLabels: true },
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [Story => <div style={{ maxWidth: '28rem' }}><Story /></div>],
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)', justifyItems: 'start' }}>
      <SegmentedControl label="Time range" options={range.map(o => (o.value === 'year' ? { ...o, disabled: true } : o))} defaultValue="day" />
      <SegmentedControl label="Time range (disabled)" options={range} defaultValue="week" disabled />
    </div>
  ),
}

function ControlledExample() {
  const [value, setValue] = useState('month')
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', justifyItems: 'start', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <SegmentedControl label="Time range" options={range} value={value} onValueChange={setValue} />
      <span>Showing: {value}</span>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledExample /> }

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)', justifyItems: 'start' }}>
      <SegmentedControl label="Time range" options={range} defaultValue="week" />
      <SegmentedControl label="View" options={views} defaultValue="grid" hideLabels />
      <SegmentedControl label="Time range (disabled)" options={range} defaultValue="week" disabled />
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
