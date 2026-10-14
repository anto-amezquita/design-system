import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  ArrowArcLeftIcon, ArrowArcRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon,
  TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon,
} from '@phosphor-icons/react'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  name: 'Spaced',
  render: () => (
    <ButtonGroup label="Form actions">
      <Button variant="secondary">Cancel</Button>
      <Button>Save changes</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('group', { name: 'Form actions' })).toBeInTheDocument()
  },
}

export const Attached: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)', justifyItems: 'start' }}>
      <ButtonGroup label="History" attached>
        <Button variant="secondary" icon={<ArrowArcLeftIcon />}>Undo</Button>
        <Button variant="secondary" icon={<ArrowArcRightIcon />}>Redo</Button>
      </ButtonGroup>
      <ButtonGroup label="Zoom" attached>
        <IconButton variant="secondary" icon={<MagnifyingGlassMinusIcon />} label="Zoom out" />
        <Button variant="secondary">100%</Button>
        <IconButton variant="secondary" icon={<MagnifyingGlassPlusIcon />} label="Zoom in" />
      </ButtonGroup>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup label="Align" attached orientation="vertical">
      <IconButton variant="secondary" icon={<TextAlignLeftIcon />} label="Align left" />
      <IconButton variant="secondary" icon={<TextAlignCenterIcon />} label="Align centre" />
      <IconButton variant="secondary" icon={<TextAlignRightIcon />} label="Align right" />
    </ButtonGroup>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-element-gap)', justifyItems: 'start' }}>
      <ButtonGroup label="Form actions">
        <Button variant="secondary">Cancel</Button>
        <Button>Save changes</Button>
      </ButtonGroup>
      <ButtonGroup label="History" attached>
        <Button variant="secondary" icon={<ArrowArcLeftIcon />}>Undo</Button>
        <Button variant="secondary" icon={<ArrowArcRightIcon />}>Redo</Button>
      </ButtonGroup>
    </div>
  ),
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
