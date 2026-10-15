import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { DatePicker } from './DatePicker'
import { ThemeScope } from '../../composition/ThemeScope'

const oct = (d: number) => new Date(2026, 9, d)

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: { label: 'Delivery date', locale: 'da-DK' },
  decorators: [Story => <div style={{ maxWidth: '20rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: { defaultValue: oct(22) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('textbox', { name: 'Delivery date' })).toHaveValue('22.10.2026')
    await expect(canvas.getByRole('button', { name: 'Choose Delivery date, 22. oktober 2026 chosen' })).toBeInTheDocument()
  },
}

export const Limits: Story = {
  name: 'Weekdays from today, within 6 weeks',
  args: {
    label: 'Delivery date',
    hint: 'Weekdays only. We deliver within 6 weeks.',
    min: oct(15),
    max: oct(15 + 42),
    isDateDisabled: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
    showWeekNumbers: true,
  },
}

export const English: Story = {
  name: 'US English',
  args: { label: 'Start date', locale: 'en-US', defaultValue: oct(5) },
}

export const Error: Story = {
  args: { error: 'Choose a delivery date.', required: true },
}

export const Disabled: Story = { args: { defaultValue: oct(22), disabled: true } }

// Open on load, for the visual and a11y checks of the calendar popover.
export const Open: Story = {
  tags: ['!autodocs'],
  render: args => <OpenExample {...args} />,
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('grid')).toBeVisible())
  },
}

function OpenExample(args: React.ComponentProps<typeof DatePicker>) {
  const [mounted, setMounted] = useState(false)
  return (
    <div style={{ minBlockSize: '28rem' }} ref={node => {
      if (node && !mounted) {
        setMounted(true)
        requestAnimationFrame(() => node.querySelector<HTMLButtonElement>('button')?.click())
      }
    }}>
      <DatePicker {...args} defaultValue={oct(22)} />
    </div>
  )
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '30rem' }}>
      <OpenExample {...args} />
    </ThemeScope>
  ),
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('dialog')).toHaveAttribute('data-mode', 'dark'))
  },
}
