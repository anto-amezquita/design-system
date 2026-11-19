import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Badge } from './Badge'
import { Dialog } from '../../composition/Dialog'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    variant: 'neutral',
    shape: 'status',
    children: 'Label',
  },
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'success', 'warning', 'error', 'info'] },
    shape: { control: 'select', options: ['status', 'count', 'dot'] },
    children: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: 'Label' },
}

export const Count: Story = {
  args: { shape: 'count', children: '12' },
}

export const Dot: Story = {
  args: { shape: 'dot', 'aria-label': 'Online' },
}

export const AllVariants: Story = {
  name: 'All color variants',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const AllShapes: Story = {
  name: 'All shapes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge shape="status">Status</Badge>
      <Badge shape="count">9</Badge>
      <Badge shape="count">99+</Badge>
      <Badge shape="dot" aria-label="Online" />
    </div>
  ),
}

export const AllVariantsAllShapes: Story = {
  name: 'All variants × shapes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {(['neutral', 'success', 'warning', 'error', 'info'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant={variant}>Label</Badge>
          <Badge variant={variant} shape="count">5</Badge>
          <Badge variant={variant} shape="dot" aria-label={variant} />
        </div>
      ))}
    </div>
  ),
}

/**
 * `as="button"`: a pill that does something, here a Dialog trigger. At rest
 * it looks like any Badge; hover turns its border to the text colour, and
 * keyboard focus, shown here, adds the focus ring.
 */
export const Clickable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-inline-gap)', alignItems: 'center' }}>
      <Dialog trigger={<Badge as="button" variant="warning">Ajar</Badge>} title="Door">
        <p>The door is ajar: the section can still change.</p>
      </Dialog>
      <Badge as="button" variant="success">Open</Badge>
      <Badge as="button" shape="count" aria-label="3 unread messages">3</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Ajar' })
    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  },
}

export const DarkMode: Story = {
  ...AllVariantsAllShapes,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
