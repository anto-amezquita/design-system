import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Stepper, type StepperStep } from './Stepper'
import { ThemeScope } from '../../composition/ThemeScope'
import { Button } from '../../primitives/Button'

const checkout: StepperStep[] = [
  { id: 'cart', label: 'Basket' },
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'pay', label: 'Payment' },
]

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { steps: checkout, current: 2, 'aria-label': 'Checkout progress' },
  decorators: [Story => <div style={{ maxWidth: '40rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Checkout progress' })
    const items = within(list).getAllByRole('listitem')
    await expect(items[2]).toHaveAttribute('aria-current', 'step')
    await expect(items[0]).toHaveTextContent('Basket (Completed)')
    await expect(items[3]).toHaveTextContent('Payment (Not started)')
  },
}

function Interactive() {
  const [current, setCurrent] = useState(2)
  return (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      <Stepper steps={checkout} current={current} onStepClick={setCurrent} aria-label="Checkout progress" />
      <div style={{ display: 'flex', gap: 'var(--space-inline-gap)' }}>
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Back</Button>
        <Button disabled={current === checkout.length} onClick={() => setCurrent(c => c + 1)}>Continue</Button>
      </div>
    </div>
  )
}

export const GoBack: Story = {
  name: 'Finished steps lead back',
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    // Only reached steps are buttons.
    await expect(c.queryByRole('button', { name: /Payment/ })).toBeNull()
    await userEvent.click(c.getByRole('button', { name: 'Address (Completed)' }))
    await expect(c.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step')
  },
}

export const WithError: Story = {
  name: 'A step needs attention',
  args: {
    current: 3,
    steps: [
      { id: 'cart', label: 'Basket' },
      { id: 'address', label: 'Address', error: true, description: 'Postcode is missing' },
      { id: 'delivery', label: 'Delivery' },
      { id: 'pay', label: 'Payment' },
    ],
  },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    current: 1,
    'aria-label': 'Application progress',
    steps: [
      { id: 'a', label: 'About you', description: 'Name and contact details' },
      { id: 'b', label: 'Experience', description: 'Roles and dates' },
      { id: 'c', label: 'Portfolio', description: 'Links or files' },
      { id: 'd', label: 'Review and send' },
    ],
  },
}

export const Narrow: Story = {
  name: 'Narrow, horizontal',
  decorators: [Story => <div style={{ maxWidth: '18rem' }}><Story /></div>],
}

export const Danish: Story = {
  args: {
    'aria-label': 'Fremskridt',
    statusLabels: { complete: 'Fuldført', current: 'Nuværende trin', upcoming: 'Ikke startet', error: 'Kræver handling' },
    steps: [
      { id: 'k', label: 'Kurv' },
      { id: 'a', label: 'Adresse' },
      { id: 'l', label: 'Levering' },
      { id: 'b', label: 'Betaling' },
    ],
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px' }}>
      <Stepper {...args} />
    </ThemeScope>
  ),
}
