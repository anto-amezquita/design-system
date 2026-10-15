import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Field } from './Field'
import { Select } from '../Select'
import { RadioGroup } from '../Radio'
import { SegmentedControl } from '../SegmentedControl'
import { darkModeDecorator } from '@/lib/storybook'

const countries = [{ options: [
  { value: 'dk', label: 'Denmark' },
  { value: 'pe', label: 'Peru' },
  { value: 'se', label: 'Sweden' },
] }]

const nativeInput: React.CSSProperties = {
  font: 'inherit',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-control)',
  padding: 'var(--space-control-padding-y) var(--space-control-padding-x)',
  border: 'var(--border-width-interactive) solid var(--color-border-strong)',
  borderRadius: 'var(--border-radius-interactive)',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
}

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  decorators: [Story => <div style={{ maxWidth: '22rem', display: 'grid', gap: 'var(--space-component-gap)' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Field>

export const WithSelect: Story = {
  name: 'With a Select',
  render: () => (
    <Field label="Country" hint="Where the invoice goes.">
      <Select groups={countries} placeholder="Choose a country" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Country' })
    await expect(trigger).toHaveAccessibleDescription('Where the invoice goes.')
  },
}

export const Error: Story = {
  render: () => (
    <Field label="Country" error="Choose the country the invoice goes to." required>
      <Select groups={countries} placeholder="Choose a country" />
    </Field>
  ),
}

export const NativeControl: Story = {
  name: 'With a native control',
  render: () => (
    <Field label="Date of the event" hint="Day, month and year." required>
      <input type="date" style={nativeInput} />
    </Field>
  ),
}

export const Group: Story = {
  name: 'Group (fieldset)',
  render: () => (
    <>
      <Field label="Delivery" group hint="Pick-up points are open until 20:00.">
        <RadioGroup aria-label="Delivery" options={[
          { value: 'home', label: 'To my door' },
          { value: 'point', label: 'To a pick-up point' },
        ]} defaultValue="home" />
      </Field>
      <Field label="Plan" group error="This plan isn't available in your country.">
        <SegmentedControl label="Plan" options={[
          { value: 'm', label: 'Monthly' },
          { value: 'y', label: 'Yearly' },
        ]} />
      </Field>
    </>
  ),
}

function ValidatingExample() {
  const [country, setCountry] = useState<string>()
  const [tried, setTried] = useState(false)
  return (
    <form
      noValidate
      onSubmit={e => { e.preventDefault(); setTried(true) }}
      style={{ display: 'grid', gap: 'var(--space-element-gap)', justifyItems: 'start' }}
    >
      <Field label="Country" required error={tried && !country ? 'Choose a country.' : undefined}>
        <Select groups={countries} value={country} onValueChange={setCountry} placeholder="Choose a country" />
      </Field>
      <button type="submit" style={nativeInput}>Continue</button>
    </form>
  )
}

export const Validating: Story = { render: () => <ValidatingExample /> }

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-component-gap)' }}>
      <Field label="Country" hint="Where the invoice goes.">
        <Select groups={countries} placeholder="Choose a country" />
      </Field>
      <Field label="Country" error="Choose the country the invoice goes to." required>
        <Select groups={countries} placeholder="Choose a country" />
      </Field>
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
