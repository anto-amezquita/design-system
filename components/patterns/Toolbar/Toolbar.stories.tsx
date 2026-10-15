import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  ArrowCounterClockwiseIcon, ArrowClockwiseIcon, CursorIcon, EraserIcon, LinkSimpleIcon, PencilSimpleIcon, PlusIcon,
  ShapesIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon, TextTIcon,
} from '@phosphor-icons/react'
import { Toolbar, ToolbarSeparator, ToolbarSpacer } from './Toolbar'
import { ToggleButton } from '../../primitives/ToggleButton'
import { IconButton } from '../../primitives/IconButton'
import { Button } from '../../primitives/Button'
import { Menu } from '../../composition/Menu'
import { ThemeScope } from '../../composition/ThemeScope'

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  decorators: [Story => <div style={{ maxWidth: '40rem', minBlockSize: '14rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Toolbar>

function Formatting() {
  return (
    <Toolbar aria-label="Text formatting">
      <IconButton variant="ghost" size="sm" icon={<ArrowCounterClockwiseIcon />} label="Undo" />
      <IconButton variant="ghost" size="sm" icon={<ArrowClockwiseIcon />} label="Redo" disabled />
      <ToolbarSeparator />
      <ToggleButton size="sm" icon={<TextBIcon />} label="Bold" hideLabel defaultPressed />
      <ToggleButton size="sm" icon={<TextItalicIcon />} label="Italic" hideLabel />
      <ToggleButton size="sm" icon={<TextUnderlineIcon />} label="Underline" hideLabel />
      <ToolbarSeparator />
      <IconButton variant="ghost" size="sm" icon={<LinkSimpleIcon />} label="Insert link" />
      <Menu
        trigger={<Button variant="ghost" icon={<PlusIcon />}>Insert</Button>}
        groups={[{ items: [{ id: 'img', label: 'Image' }, { id: 'tbl', label: 'Table' }, { id: 'hr', label: 'Divider' }] }]}
      />
      <ToolbarSpacer />
      <Button variant="primary">Publish</Button>
    </Toolbar>
  )
}

export const Default: Story = {
  name: 'Text formatting',
  render: () => <Formatting />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByRole('toolbar', { name: 'Text formatting' })).toBeVisible()
    // One Tab stop: only Undo is in the Tab order at first.
    await expect(c.getByRole('button', { name: 'Undo' })).toHaveAttribute('tabindex', '0')
    await expect(c.getByRole('button', { name: 'Bold' })).toHaveAttribute('tabindex', '-1')
  },
}

export const Vertical: Story = {
  name: 'Vertical, drawing tools',
  render: () => (
    <Toolbar aria-label="Drawing tools" orientation="vertical">
      <ToggleButton size="sm" icon={<CursorIcon />} label="Select" hideLabel defaultPressed />
      <ToggleButton size="sm" icon={<PencilSimpleIcon />} label="Pen" hideLabel />
      <ToggleButton size="sm" icon={<ShapesIcon />} label="Shapes" hideLabel />
      <ToggleButton size="sm" icon={<TextTIcon />} label="Text" hideLabel />
      <ToolbarSeparator />
      <IconButton variant="ghost" size="sm" icon={<EraserIcon />} label="Clear canvas" />
    </Toolbar>
  ),
}

export const Danish: Story = {
  render: () => (
    <Toolbar aria-label="Tekstformatering">
      <ToggleButton size="sm" icon={<TextBIcon />} label="Fed" hideLabel />
      <ToggleButton size="sm" icon={<TextItalicIcon />} label="Kursiv" hideLabel />
      <ToggleButton size="sm" icon={<TextUnderlineIcon />} label="Understreget" hideLabel />
      <ToolbarSeparator />
      <IconButton variant="ghost" size="sm" icon={<LinkSimpleIcon />} label="Indsæt link" />
      <ToolbarSpacer />
      <Button variant="primary">Udgiv</Button>
    </Toolbar>
  ),
}

export const Keyboard: Story = {
  name: 'Moving with the arrow keys',
  tags: ['!autodocs'],
  render: () => <Formatting />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.tab()
    await expect(c.getByRole('button', { name: 'Undo' })).toHaveFocus()
    // Redo is disabled, so the next stop is Bold.
    await userEvent.keyboard('{ArrowRight}')
    await expect(c.getByRole('button', { name: 'Bold' })).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(c.getByRole('button', { name: 'Publish' })).toHaveFocus()
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px' }}>
      <Formatting />
    </ThemeScope>
  ),
}
