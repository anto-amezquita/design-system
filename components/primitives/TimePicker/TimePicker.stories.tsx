import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { TimePicker } from './TimePicker'
import { ThemeScope } from '../../composition/ThemeScope'

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  args: { label: 'Meeting time', locale: 'en-GB' },
  decorators: [Story => <div style={{ maxWidth: '16rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof TimePicker>

export const Default: Story = {
  args: { defaultValue: '14:30' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('combobox', { name: 'Meeting time' })
    await expect(box).toHaveValue('14:30')
    await expect(box).toHaveAttribute('aria-expanded', 'false')
  },
}

export const Danish: Story = {
  args: { label: 'Afhentning', locale: 'da-DK', defaultValue: '09:15', hint: 'Mellem 08.00 og 18.00.', min: '08:00', max: '18:00' },
}

export const TwelveHour: Story = {
  name: '12-hour clock (US)',
  args: { locale: 'en-US', defaultValue: '14:30', step: 30 },
}

export const OpeningHours: Story = {
  name: 'Opening hours, every 30 minutes',
  args: { label: 'Table at', min: '17:00', max: '22:00', step: 30 },
}

export const Error: Story = { args: { error: 'Choose a time.', required: true } }

export const Disabled: Story = { args: { defaultValue: '14:30', disabled: true } }

function OpenExample(args: React.ComponentProps<typeof TimePicker>) {
  const [done, setDone] = useState(false)
  return (
    <div style={{ minBlockSize: '22rem' }} ref={node => {
      if (node && !done) { setDone(true); requestAnimationFrame(() => node.querySelector<HTMLInputElement>('input')?.click()) }
    }}>
      <TimePicker {...args} defaultValue="14:30" />
    </div>
  )
}

export const Open: Story = {
  tags: ['!autodocs'],
  render: args => <OpenExample {...args} />,
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox')).toBeVisible())
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '24rem' }}>
      <OpenExample {...args} />
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox').closest('[data-mode]')).toHaveAttribute('data-mode', 'dark'))
  },
}
