import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Calendar, type DateRange } from './Calendar'
import { darkModeDecorator } from '@/lib/storybook'

const oct = (d: number) => new Date(2026, 9, d)

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  args: { defaultValue: oct(15), locale: 'en-GB' },
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByRole('grid')
    await expect(grid).toHaveAccessibleName('October 2026')
    await expect(within(grid).getByRole('gridcell', { name: 'Thursday 15 October 2026' })).toHaveAttribute('aria-selected', 'true')
  },
}

export const Danish: Story = {
  name: 'Danish, with week numbers',
  args: { locale: 'da-DK', showWeekNumbers: true, label: 'Leveringsdato' },
}

export const Limits: Story = {
  name: 'Min, max and closed days',
  args: {
    label: 'Delivery date',
    min: oct(6),
    max: oct(28),
    isDateDisabled: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
    defaultValue: oct(16),
  },
}

function RangeExample() {
  const [range, setRange] = useState<DateRange | null>({ start: oct(12), end: oct(16) })
  const f = (d?: Date | null) => d?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) ?? '…'
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <Calendar mode="range" label="Stay" locale="en-GB" value={range} onValueChange={setRange} />
      <p role="status" style={{ margin: 0 }}>{range ? `${f(range.start)} – ${f(range.end)}` : 'Choose a check-in day'}</p>
    </div>
  )
}

export const Range: Story = { render: () => <RangeExample /> }

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-component-gap)', flexWrap: 'wrap' }}>
      <Calendar locale="en-GB" label="Single" defaultValue={oct(15)} min={oct(6)} isDateDisabled={d => d.getDay() === 0} />
      <Calendar locale="en-GB" label="Range" mode="range" defaultValue={{ start: oct(12), end: oct(16) }} showWeekNumbers />
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
