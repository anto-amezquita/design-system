import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { FormLayout, FormSection, FormRow, FormActions, FormErrorSummary, type FormError } from './FormLayout'
import { Input } from '../../primitives/Input'
import { Field } from '../../primitives/Field'
import { Select } from '../../primitives/Select'
import { NumberInput } from '../../primitives/NumberInput'
import { SegmentedControl } from '../../primitives/SegmentedControl'
import { Button } from '../../primitives/Button'
import { darkModeDecorator } from '@/lib/storybook'

const countries = [{ options: [{ value: 'dk', label: 'Denmark' }, { value: 'pe', label: 'Peru' }, { value: 'se', label: 'Sweden' }] }]

const meta: Meta<typeof FormLayout> = {
  title: 'Components/FormLayout',
  component: FormLayout,
}

export default meta
type Story = StoryObj<typeof FormLayout>

export const Default: Story = {
  name: 'Sections, rows and actions',
  render: () => (
    <FormLayout onSubmit={e => e.preventDefault()}>
      <FormSection title="Contact details" description="We only use these to send your order.">
        <FormRow>
          <Input label="First name" autoComplete="given-name" />
          <Input label="Last name" autoComplete="family-name" />
        </FormRow>
        <Input label="Email" type="email" autoComplete="email" hint="For the receipt." />
      </FormSection>
      <FormSection title="Delivery">
        <Input label="Street and number" autoComplete="street-address" />
        <FormRow columns={3}>
          <Input label="Postcode" autoComplete="postal-code" />
          <Input label="City" autoComplete="address-level2" />
          <Field label="Country">
            <Select groups={countries} placeholder="Choose" />
          </Field>
        </FormRow>
      </FormSection>
      <FormActions>
        <Button variant="secondary">Back</Button>
        <Button type="submit">Continue to payment</Button>
      </FormActions>
    </FormLayout>
  ),
}

type Values = { name: string; email: string; country?: string; guests: number | null; plan: string }

function validate(v: Values): FormError[] {
  const errors: FormError[] = []
  if (!v.name.trim()) errors.push({ id: 'name', message: 'Enter your name.' })
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.push({ id: 'email', message: 'Enter an email address like name@example.dk.' })
  if (!v.country) errors.push({ id: 'country', message: 'Choose the country the invoice goes to.' })
  if (v.guests === null || v.guests < 1) errors.push({ id: 'guests', message: 'Choose between 1 and 12 guests.' })
  return errors
}

function ValidatingExample() {
  const [values, setValues] = useState<Values>({ name: '', email: '', guests: null, plan: 'm' })
  const [errors, setErrors] = useState<FormError[]>([])
  const [sent, setSent] = useState(false)
  const errorFor = (id: string) => errors.find(e => e.id === id)?.message
  const set = (patch: Partial<Values>) => setValues(v => ({ ...v, ...patch }))

  return (
    <FormLayout
      noValidate
      onSubmit={e => {
        e.preventDefault()
        const found = validate(values)
        setErrors(found)
        setSent(found.length === 0)
      }}
    >
      <FormErrorSummary errors={errors} />
      {sent && <p role="status" style={{ margin: 0, color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>Booked. We sent the details to {values.email}.</p>}
      <FormSection title="Book a table">
        <Input id="name" label="Name" value={values.name} onChange={name => set({ name })} error={errorFor('name')} autoComplete="name" />
        <Input id="email" label="Email" type="email" value={values.email} onChange={email => set({ email })} error={errorFor('email')} autoComplete="email" />
        <FormRow>
          <Field id="country" label="Country" error={errorFor('country')}>
            <Select groups={countries} value={values.country} onValueChange={country => set({ country })} placeholder="Choose" />
          </Field>
          <NumberInput id="guests" label="Guests" min={1} max={12} value={values.guests} onValueChange={guests => set({ guests })} error={errorFor('guests')} />
        </FormRow>
        <Field label="Seating" group>
          <SegmentedControl label="Seating" options={[{ value: 'm', label: 'Inside' }, { value: 'y', label: 'Terrace' }]} value={values.plan} onValueChange={plan => set({ plan })} />
        </Field>
      </FormSection>
      <FormActions>
        <Button type="submit">Book</Button>
      </FormActions>
    </FormLayout>
  )
}

export const Validating: Story = {
  name: 'With an error summary',
  render: () => <ValidatingExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Book' }))
    const summary = await canvas.findByRole('region', { name: 'There are 4 problems' })
    await waitFor(() => expect(summary).toHaveFocus())
  },
}

export const Narrow: Story = {
  name: 'Narrow container',
  decorators: [Story => <div style={{ maxWidth: '22rem' }}><Story /></div>],
  render: Default.render,
}

export const DarkMode: Story = {
  render: () => (
    <FormLayout onSubmit={e => e.preventDefault()}>
      <FormErrorSummary focusOnChange={false} errors={[{ id: 'd-email', message: 'Enter an email address like name@example.dk.' }]} />
      <FormSection title="Contact details" description="We only use these to send your order.">
        <FormRow>
          <Input label="First name" />
          <Input label="Last name" />
        </FormRow>
        <Input id="d-email" label="Email" error="Enter an email address like name@example.dk." />
      </FormSection>
      <FormActions>
        <Button variant="secondary">Back</Button>
        <Button type="submit">Continue</Button>
      </FormActions>
    </FormLayout>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
