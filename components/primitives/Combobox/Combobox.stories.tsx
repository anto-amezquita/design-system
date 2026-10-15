import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Combobox } from './Combobox'
import { ThemeScope } from '../../composition/ThemeScope'

const countries = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Bolivia', 'Brazil', 'Canada', 'Chile', 'Colombia',
  'Costa Rica', 'Denmark', 'Ecuador', 'Estonia', 'Finland', 'France', 'Germany', 'Iceland', 'Ireland',
  'Italy', 'Japan', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Paraguay', 'Peru', 'Poland',
  'Portugal', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States', 'Uruguay',
]

const people = [
  { value: 'u1', label: 'Ana Quispe', description: 'ana.quispe@example.com' },
  { value: 'u2', label: 'Mikkel Sørensen', description: 'mikkel@example.dk' },
  { value: 'u3', label: 'José Álvarez', description: 'jose.alvarez@example.com' },
  { value: 'u4', label: 'Freja Holm', description: 'freja.holm@example.dk' },
  { value: 'u5', label: 'Lucía Martín', description: 'lucia@example.es' },
]

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  args: { label: 'Country', options: countries },
  decorators: [Story => <div style={{ maxWidth: '20rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Combobox>

export const Default: Story = {
  args: { hint: 'Start typing, then choose from the list.' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('combobox', { name: 'Country' })
    await expect(box).toHaveAttribute('aria-expanded', 'false')
    await expect(box).toHaveAttribute('aria-autocomplete', 'list')
  },
}

export const Chosen: Story = { args: { defaultValue: 'Peru' } }

export const WithDescriptions: Story = {
  name: 'With descriptions',
  args: { label: 'Assign to', options: people, hint: 'Search by name or email.' },
}

export const Danish: Story = {
  args: {
    label: 'By',
    hint: 'Skriv og vælg fra listen.',
    options: ['Aarhus', 'Aalborg', 'Esbjerg', 'Horsens', 'Odense', 'Randers', 'Silkeborg', 'Skanderborg', 'Vejle', 'København'],
    emptyMessage: (text: string) => `Ingen byer matcher “${text}”`,
  },
}

export const AllowCustom: Story = {
  name: 'Typed values allowed',
  args: { label: 'Job title', options: ['Designer', 'Developer', 'Product manager', 'Researcher'], allowCustom: true, hint: 'Choose one, or type your own.' },
}

export const Unavailable: Story = {
  name: 'Unavailable options',
  args: {
    label: 'Room',
    options: [
      { value: 'a', label: 'Aurora', description: '8 people' },
      { value: 'b', label: 'Borealis', description: 'Booked until 15.00', disabled: true },
      { value: 'c', label: 'Cumulus', description: '4 people' },
    ],
  },
}

// A fetch stand-in: results arrive after a short wait.
function AsyncExample(args: React.ComponentProps<typeof Combobox>) {
  const [text, setText] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!text.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    const t = setTimeout(() => {
      setResults(countries.filter(c => c.toLowerCase().includes(text.trim().toLowerCase())))
      setLoading(false)
    }, 600)
    return () => clearTimeout(t)
  }, [text])
  return <Combobox {...args} options={results} loading={loading} onInputChange={setText} />
}

export const Async: Story = {
  name: 'Results from a server',
  args: { hint: 'Results load as you type.', emptyMessage: (t: string) => (t.trim() ? `No matches for “${t.trim()}”` : 'Type to search') },
  render: args => <AsyncExample {...args} />,
}

export const Error: Story = { args: { error: 'Choose a country.', required: true } }

export const Disabled: Story = { args: { defaultValue: 'Denmark', disabled: true } }

function OpenExample(args: React.ComponentProps<typeof Combobox>) {
  const [done, setDone] = useState(false)
  return (
    <div style={{ minBlockSize: '24rem' }} ref={node => {
      if (node && !done) { setDone(true); requestAnimationFrame(() => node.querySelector<HTMLInputElement>('input')?.click()) }
    }}>
      <Combobox {...args} />
    </div>
  )
}

export const Open: Story = {
  name: 'Open, filtered',
  tags: ['!autodocs'],
  args: { label: 'Assign to', options: people, defaultValue: 'u2' },
  render: args => <OpenExample {...args} />,
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox')).toBeVisible())
    const box = within(document.body).getByRole('combobox', { name: 'Assign to' })
    await userEvent.clear(box)
    await userEvent.type(box, 'jo')
    await waitFor(() => expect(within(document.body).getAllByRole('option')).toHaveLength(1))
    await userEvent.keyboard('{ArrowDown}')
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  args: { label: 'Assign to', options: people, defaultValue: 'u2' },
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '26rem' }}>
      <OpenExample {...args} />
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox').closest('[data-mode]')).toHaveAttribute('data-mode', 'dark'))
  },
}
