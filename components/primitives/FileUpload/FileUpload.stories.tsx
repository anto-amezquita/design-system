import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { FileUpload } from './FileUpload'
import { darkModeDecorator } from '@/lib/storybook'

const sample = [
  new File(['x'.repeat(240_000)], 'portfolio.pdf', { type: 'application/pdf' }),
  new File(['x'.repeat(1_800_000)], 'case-study-cover.png', { type: 'image/png' }),
]

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  args: { label: 'Attachments', hint: 'PDF or images, up to 5 MB each.', accept: 'image/*,.pdf', maxSize: 5_000_000 },
  decorators: [Story => <div style={{ maxWidth: '28rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="file"]')!
    await expect(input).toHaveAccessibleName('Attachments Choose files')
    await expect(input).toHaveAccessibleDescription('PDF or images, up to 5 MB each.')
  },
}

function WithFilesExample(args: React.ComponentProps<typeof FileUpload>) {
  const [files, setFiles] = useState<File[]>(sample)
  return <FileUpload {...args} files={files} onFilesChange={setFiles} />
}

export const WithFiles: Story = {
  name: 'With chosen files',
  render: args => <WithFilesExample {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Remove portfolio.pdf' })).toBeInTheDocument()
  },
}

export const Single: Story = {
  name: 'One file',
  args: { label: 'Profile photo', hint: 'A square image works best.', accept: 'image/*', maxFiles: 1 },
}

export const Error: Story = {
  args: { error: 'Add at least one file.', required: true },
}

export const Disabled: Story = { args: { disabled: true } }

export const DarkMode: Story = {
  render: args => (
    <div style={{ display: 'grid', gap: 'var(--space-component-gap)' }}>
      <WithFilesExample {...args} />
      <FileUpload {...args} label="Cover letter" error="Add a file." />
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
