import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { FileTextIcon, FileCodeIcon, ShareNetworkIcon } from '@phosphor-icons/react'
import { Item } from './Item'
import { Dialog } from '../../composition/Dialog'
import { List } from '../List'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { Badge } from '../Badge'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  args: {
    title: 'brand-brief.pdf',
    description: '2 MB · Edited yesterday',
    size: 'default',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    href: { control: 'text' },
    current: { control: 'boolean' },
  },
  // Each story renders its own List: a decorator that wrapped Story in a List
  // would put the dark-mode decorator between the ul and its li.
  decorators: [Story => <div style={{ maxWidth: '28rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Item>

export const Default: Story = {
  args: { leading: <Icon icon={FileTextIcon} size="lg" tone="secondary" /> },
  render: args => <List aria-label="Files"><Item {...args} /></List>,
}

export const Linked: Story = {
  name: 'Linked row with an action',
  render: () => (
    <List aria-label="Files">
      <Item
        href="#brief"
        leading={<Icon icon={FileTextIcon} size="lg" tone="secondary" />}
        title="brand-brief.pdf"
        description="2 MB · Edited yesterday"
        trailing={<IconButton icon={<ShareNetworkIcon />} label="Share brand-brief.pdf" variant="ghost" size="sm" />}
      />
      <Item
        href="#tokens"
        leading={<Icon icon={FileCodeIcon} size="lg" tone="secondary" />}
        title="tokens.json"
        description="12 KB · Edited today"
        trailing={<IconButton icon={<ShareNetworkIcon />} label="Share tokens.json" variant="ghost" size="sm" />}
      />
    </List>
  ),
}

function RowsThatOpenADialog() {
  const [open, setOpen] = useState<string | null>(null)
  const rows = [
    { id: 'carmesi', title: 'Carmesí', description: '3 splits · PRS registered' },
    { id: 'ajar', title: 'Ajar', description: '2 splits · Not registered yet' },
  ]
  return (
    <>
      <List aria-label="Songs" divided>
        {rows.map(row => (
          <Item
            key={row.id}
            onClick={() => setOpen(row.id)}
            title={row.title}
            description={row.description}
            trailing={<Badge variant={row.id === 'ajar' ? 'warning' : 'success'}>{row.id === 'ajar' ? 'Draft' : 'Done'}</Badge>}
          />
        ))}
      </List>
      <Dialog open={open !== null} onOpenChange={o => { if (!o) setOpen(null) }} title={rows.find(r => r.id === open)?.title ?? ''}>
        <p>Rights profile</p>
      </Dialog>
    </>
  )
}

/**
 * `onClick`: the row is one button, named by its title, here opening a
 * controlled Dialog. Shown with keyboard focus on the first row; closing the
 * Dialog gives focus back to it.
 */
export const OpensADialog: Story = {
  name: 'Row that opens a dialog',
  render: () => <RowsThatOpenADialog />,
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(within(canvasElement).getByRole('button', { name: 'Carmesí' })).toHaveFocus()
  },
}

export const Navigation: Story = {
  name: 'Navigation (current page)',
  render: () => (
    <List aria-label="Docs">
      <Item href="#overview" title="Overview" size="compact" current />
      <Item href="#tokens" title="Tokens" size="compact" />
      <Item href="#components" title="Components" size="compact" trailing={<Badge variant="info" shape="count">80</Badge>} />
    </List>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <List aria-label="Example">
      <Item href="#a" title="Overview" description="Current page" current />
      <Item href="#b" leading={<Icon icon={FileTextIcon} size="lg" tone="secondary" />} title="brand-brief.pdf" description="2 MB" />
    </List>
  ),
  decorators: [darkModeDecorator],
}
