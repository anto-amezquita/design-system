import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { DotsThreeIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { IconButton } from './IconButton'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    icon: <MagnifyingGlassIcon />,
    label: 'Search',
    variant: 'ghost',
    size: 'md',
  },
  argTypes: {
    icon: { control: false },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

const row: React.CSSProperties = { display: 'flex', gap: 'var(--space-inline-gap)', alignItems: 'center' }

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Search' })).toBeInTheDocument()
  },
}

export const Variants: Story = {
  render: () => (
    <div style={row}>
      <IconButton variant="primary" icon={<PlusIcon />} label="Add item" />
      <IconButton variant="secondary" icon={<PencilSimpleIcon />} label="Edit" />
      <IconButton variant="ghost" icon={<TrashIcon />} label="Delete" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <IconButton icon={<DotsThreeIcon />} label="More actions" />
      <IconButton size="sm" icon={<DotsThreeIcon />} label="More actions (small)" />
      <IconButton size="sm" variant="secondary" icon={<XIcon />} label="Remove" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={row}>
      <IconButton variant="primary" icon={<PlusIcon />} label="Add item" loading />
      <IconButton variant="secondary" icon={<PencilSimpleIcon />} label="Edit" disabled />
      <IconButton icon={<TrashIcon />} label="Delete" disabled />
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)' }}>
      <div style={row}>
        <IconButton variant="primary" icon={<PlusIcon />} label="Add item" />
        <IconButton variant="secondary" icon={<PencilSimpleIcon />} label="Edit" />
        <IconButton icon={<TrashIcon />} label="Delete" />
        <IconButton size="sm" icon={<XIcon />} label="Remove" />
      </div>
      <div style={row}>
        <IconButton variant="primary" icon={<PlusIcon />} label="Adding" loading />
        <IconButton variant="secondary" icon={<PencilSimpleIcon />} label="Edit" disabled />
      </div>
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
