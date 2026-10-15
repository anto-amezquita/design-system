import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { NumberInput } from './NumberInput'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
  args: { label: 'Guests', min: 1, max: 12, defaultValue: 2 },
  decorators: [Story => <div style={{ maxWidth: '20rem', display: 'grid', gap: 'var(--space-component-gap)' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof NumberInput>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('spinbutton', { name: 'Guests' })
    await expect(input).toHaveAttribute('aria-valuenow', '2')
    await expect(input).toHaveAttribute('aria-valuemin', '1')
  },
}

export const Money: Story = {
  name: 'Amount with a unit',
  args: {
    label: 'Budget', min: 0, step: 50, defaultValue: 1250, unit: 'kr.', locale: 'da-DK',
    formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    hint: 'Type 1250,50 or 1250.50. Arrows move by 50 kr.',
  },
}

export const Decimal: Story = {
  args: { label: 'Weight', min: 0, max: 50, step: 0.1, defaultValue: 2.5, unit: 'kg', locale: 'da-DK' },
}

export const NoSteppers: Story = {
  name: 'Without buttons',
  args: { label: 'Year', min: 1900, max: 2100, defaultValue: 2026, hideSteppers: true },
}

export const States: Story = {
  render: () => (
    <>
      <NumberInput label="Guests" min={1} max={12} defaultValue={12} hint="At the limit: + is disabled." />
      <NumberInput label="Guests" min={1} max={12} defaultValue={0} error="Choose between 1 and 12 guests." />
      <NumberInput label="Guests" defaultValue={4} disabled />
    </>
  ),
}

function ControlledExample() {
  const [qty, setQty] = useState<number | null>(1)
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
      <NumberInput label="Quantity" min={0} max={99} value={qty} onValueChange={setQty} />
      <span>Total: {((qty ?? 0) * 149).toLocaleString('da-DK')} kr.</span>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledExample /> }

export const DarkMode: Story = {
  render: () => (
    <>
      <NumberInput label="Guests" min={1} max={12} defaultValue={2} />
      <NumberInput label="Budget" min={0} step={50} defaultValue={1250} unit="kr." />
      <NumberInput label="Guests" min={1} max={12} defaultValue={0} error="Choose between 1 and 12 guests." />
    </>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
