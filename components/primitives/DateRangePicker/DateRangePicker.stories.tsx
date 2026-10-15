import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { DateRangePicker } from './DateRangePicker'
import { ThemeScope } from '../../composition/ThemeScope'

const oct = (d: number) => new Date(2026, 9, d)

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  args: { label: 'Stay', startLabel: 'Check-in', endLabel: 'Check-out', locale: 'en-GB' },
  decorators: [Story => <div style={{ maxWidth: '26rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Default: Story = {
  args: { defaultValue: { start: oct(12), end: oct(16) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Stay' })).toBeInTheDocument()
    await expect(canvas.getByRole('textbox', { name: 'Check-in' })).toHaveValue('12/10/2026')
    await expect(canvas.getByRole('textbox', { name: 'Check-out' })).toHaveValue('16/10/2026')
  },
}

export const Booked: Story = {
  name: 'With booked days',
  args: {
    hint: 'Some nights are already booked.',
    min: oct(15),
    isDateDisabled: (d: Date) => [20, 21, 27].includes(d.getDate()) && d.getMonth() === 9,
  },
}

export const Danish: Story = {
  args: { label: 'Ferie', startLabel: 'Fra', endLabel: 'Til', locale: 'da-DK', showWeekNumbers: true },
}

export const Error: Story = {
  args: { defaultValue: { start: oct(12), end: oct(16) }, error: 'These dates are no longer available.' },
}

export const Disabled: Story = { args: { defaultValue: { start: oct(12), end: oct(16) }, disabled: true } }

function OpenExample(args: React.ComponentProps<typeof DateRangePicker>) {
  const [done, setDone] = useState(false)
  return (
    <div style={{ minBlockSize: '30rem' }} ref={node => {
      if (node && !done) { setDone(true); requestAnimationFrame(() => node.querySelector<HTMLButtonElement>('button')?.click()) }
    }}>
      <DateRangePicker {...args} defaultValue={{ start: oct(12), end: oct(16) }} />
    </div>
  )
}

export const Open: Story = {
  tags: ['!autodocs'],
  render: args => <OpenExample {...args} />,
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('grid')).toBeVisible())
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '32rem' }}>
      <OpenExample {...args} />
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toHaveAttribute('data-mode', 'dark'))
  },
}
