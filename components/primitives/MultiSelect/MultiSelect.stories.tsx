import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { MultiSelect } from './MultiSelect'
import { ThemeScope } from '../../composition/ThemeScope'

const skills = [
  'Accessibility', 'Animation', 'Art direction', 'Content design', 'CSS', 'Design systems', 'Figma',
  'Illustration', 'Interaction design', 'JavaScript', 'Motion', 'Prototyping', 'React', 'Research',
  'Service design', 'TypeScript', 'Typography', 'UX writing', 'Visual design', 'Workshops',
]

const people = [
  { value: 'u1', label: 'Ana Quispe', description: 'ana.quispe@example.com' },
  { value: 'u2', label: 'Mikkel Sørensen', description: 'mikkel@example.dk' },
  { value: 'u3', label: 'José Álvarez', description: 'jose.alvarez@example.com' },
  { value: 'u4', label: 'Freja Holm', description: 'Away until Monday', disabled: true },
  { value: 'u5', label: 'Lucía Martín', description: 'lucia@example.es' },
]

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: { label: 'Skills', options: skills },
  decorators: [Story => <div style={{ maxWidth: '22rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof MultiSelect>

export const Default: Story = {
  args: { hint: 'Type to filter, then pick as many as fit.' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('combobox', { name: 'Skills' })
    await expect(box).toHaveAttribute('aria-expanded', 'false')
    await expect(box).toHaveAccessibleDescription(/None chosen\./)
  },
}

export const Chosen: Story = {
  args: { defaultValue: ['Accessibility', 'Design systems', 'React'] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByRole('list', { name: 'Chosen skills' })).toBeVisible()
    await expect(c.getByRole('button', { name: 'Remove React' })).toBeVisible()
  },
}

export const WithDescriptions: Story = {
  name: 'With descriptions',
  args: { label: 'Reviewers', options: people, defaultValue: ['u2'] },
}

export const Max: Story = {
  name: 'Up to three',
  args: { label: 'Focus areas', max: 3, defaultValue: ['Research', 'Prototyping', 'Figma'] },
}

export const Danish: Story = {
  args: {
    label: 'Sprog',
    hint: 'Vælg alle du taler.',
    options: ['Dansk', 'Engelsk', 'Spansk', 'Tysk', 'Svensk', 'Norsk', 'Fransk', 'Portugisisk'],
    defaultValue: ['Dansk', 'Spansk'],
    emptyMessage: (text: string) => `Ingen sprog matcher “${text}”`,
  },
}

export const Error: Story = { args: { error: 'Choose at least one skill.', required: true } }

export const Disabled: Story = { args: { defaultValue: ['CSS', 'React'], disabled: true } }

function OpenExample(args: React.ComponentProps<typeof MultiSelect>) {
  const [done, setDone] = useState(false)
  return (
    <div style={{ minBlockSize: '26rem' }} ref={node => {
      if (node && !done) { setDone(true); requestAnimationFrame(() => node.querySelector<HTMLInputElement>('input')?.click()) }
    }}>
      <MultiSelect {...args} />
    </div>
  )
}

export const Open: Story = {
  tags: ['!autodocs'],
  args: { label: 'Reviewers', options: people, defaultValue: ['u2'] },
  render: args => <OpenExample {...args} />,
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox')).toBeVisible())
    await expect(within(document.body).getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  args: { label: 'Reviewers', options: people, defaultValue: ['u2', 'u5'] },
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '28rem' }}>
      <OpenExample {...args} />
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('listbox').closest('[data-mode]')).toHaveAttribute('data-mode', 'dark'))
  },
}
