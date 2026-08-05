import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './Tooltip'
import { Button } from '@/components/primitives/Button/Button'
import { CopyIcon, HeartIcon, TrashIcon, InfoIcon, PencilIcon, ShareIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px', gap: '16px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <Tooltip content="Copy to clipboard">
      <Button variant="ghost" icon={<CopyIcon size={16} aria-hidden="true" />} aria-label="Copy to clipboard">
        Copy
      </Button>
    </Tooltip>
  ),
}

export const AllSides: Story = {
  name: 'All sides',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '48px', alignItems: 'center', justifyItems: 'center' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`Tooltip on ${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
}

export const IconButtons: Story = {
  name: 'Icon-only buttons',
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip content="Like">
        <Button variant="ghost" aria-label="Like" icon={<HeartIcon size={16} aria-hidden="true" />} noArrow>
          <span style={{ display: 'none' }}>Like</span>
        </Button>
      </Tooltip>
      <Tooltip content="Edit">
        <Button variant="ghost" aria-label="Edit" icon={<PencilIcon size={16} aria-hidden="true" />} noArrow>
          <span style={{ display: 'none' }}>Edit</span>
        </Button>
      </Tooltip>
      <Tooltip content="Share">
        <Button variant="ghost" aria-label="Share" icon={<ShareIcon size={16} aria-hidden="true" />} noArrow>
          <span style={{ display: 'none' }}>Share</span>
        </Button>
      </Tooltip>
      <Tooltip content="Delete — cannot be undone" side="bottom">
        <Button variant="ghost" aria-label="Delete" icon={<TrashIcon size={16} aria-hidden="true" />} noArrow>
          <span style={{ display: 'none' }}>Delete</span>
        </Button>
      </Tooltip>
    </div>
  ),
}

export const LongContent: Story = {
  name: 'Long content',
  render: () => (
    <Tooltip content="This tooltip contains a longer description that wraps across multiple lines to demonstrate the max-width constraint." side="right">
      <Button variant="secondary" icon={<InfoIcon size={16} aria-hidden="true" />}>
        More info
      </Button>
    </Tooltip>
  ),
}

export const NoDelay: Story = {
  name: 'No delay',
  render: () => (
    <Tooltip content="Appears immediately" delayDuration={0}>
      <Button variant="primary">Hover me</Button>
    </Tooltip>
  ),
}

export const DarkMode: Story = {
  ...Default,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
