import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { OtpInput } from './OtpInput'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof OtpInput> = {
  title: 'Components/OtpInput',
  component: OtpInput,
  args: { label: 'Verification code', hint: 'We sent a 6-digit code to +45 •• •• •• 12.' },
}

export default meta
type Story = StoryObj<typeof OtpInput>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Verification code' })
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    await expect(input).toHaveAccessibleDescription('We sent a 6-digit code to +45 •• •• •• 12.')
  },
}

export const PartlyFilled: Story = { args: { defaultValue: '482' } }

export const FourCharacters: Story = {
  name: 'Four letters and digits',
  args: { label: 'Pairing code', hint: 'Shown on the TV.', length: 4, mode: 'alphanumeric', defaultValue: 'K7' },
}

export const Error: Story = {
  args: { defaultValue: '482913', error: "That code didn't work. Check the latest message, or send a new code." },
}

export const Disabled: Story = { args: { defaultValue: '482913', disabled: true } }

function VerifyExample() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok'>('idle')
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <OtpInput
        label="Verification code"
        hint="Any 6 digits work here."
        onValueChange={() => setStatus('idle')}
        onComplete={() => { setStatus('checking'); setTimeout(() => setStatus('ok'), 600) }}
      />
      <p role="status" style={{ margin: 0, fontSize: 'var(--font-size-small)' }}>
        {status === 'checking' ? 'Checking…' : status === 'ok' ? 'Verified.' : ''}
      </p>
    </div>
  )
}

export const SubmitsWhenComplete: Story = { render: () => <VerifyExample /> }

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-component-gap)' }}>
      <OtpInput label="Verification code" hint="We sent a 6-digit code." defaultValue="482" />
      <OtpInput label="Code" defaultValue="482913" error="That code didn't work." />
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
