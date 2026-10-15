import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { TagInput } from './TagInput'
import { ThemeScope } from '../../composition/ThemeScope'

const topics = [
  'Accessibility', 'AI', 'Animation', 'CSS', 'Design systems', 'Design tokens', 'Figma', 'Prototyping',
  'React', 'Research', 'Typography', 'UX writing',
]

const isEmail = (t: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? undefined : `“${t}” isn’t an email address. Use the form name@example.com.`)

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  args: { label: 'Keywords' },
  decorators: [Story => <div style={{ maxWidth: '22rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof TagInput>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const box = c.getByRole('textbox', { name: 'Keywords' })
    await userEvent.type(box, 'tokens,motion{Enter}')
    await expect(c.getByRole('list', { name: 'Keywords' })).toBeVisible()
    await expect(c.getByRole('button', { name: 'Remove motion' })).toBeVisible()
  },
}

export const WithTags: Story = {
  name: 'With tags',
  args: { defaultValue: ['Design systems', 'Accessibility', 'React'] },
}

export const Suggestions: Story = {
  args: { label: 'Topics', suggestions: topics, hint: 'Pick a suggestion or add your own.', defaultValue: ['Figma'] },
}

export const Emails: Story = {
  name: 'Email addresses',
  args: { label: 'Invite people', validate: isEmail, hint: 'Paste a list or add one at a time.', max: 10 },
}

export const Danish: Story = {
  args: { label: 'Ingredienser', hint: 'Fx mel, smør, sukker.', defaultValue: ['mel', 'smør'] },
}

export const Error: Story = {
  args: { label: 'Invite people', validate: isEmail, defaultValue: ['ana@example.com'] },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', { name: 'Invite people' })
    await userEvent.type(box, 'mikkel@example{Enter}')
    await expect(box).toHaveAttribute('aria-invalid', 'true')
    await expect(box).toHaveValue('mikkel@example')
  },
}

export const Disabled: Story = { args: { defaultValue: ['CSS', 'React'], disabled: true } }

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  args: { label: 'Topics', suggestions: topics, defaultValue: ['Figma', 'Research'] },
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '22rem' }}>
      <TagInput {...args} />
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole('combobox', { name: 'Topics' }), 'des')
    await waitFor(() => expect(within(document.body).getByRole('listbox').closest('[data-mode]')).toHaveAttribute('data-mode', 'dark'))
  },
}
