import { useEffect } from 'react'
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CopyIcon, DotsThreeIcon, PencilSimpleIcon, SignOutIcon, TrashIcon, UserIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '../../../lib/storybook'
import { Button } from '../../primitives/Button'
import { Menu } from './Menu'

const meta: Meta<typeof Menu> = {
  title: 'Composition/Menu',
  component: Menu,
}

export default meta
type Story = StoryObj<typeof Menu>

export const Default: Story = {
  render: () => (
    <Menu
      trigger={<Button variant="secondary">Actions</Button>}
      groups={[
        {
          items: [
            { id: 'edit', label: 'Edit', onSelect: () => {} },
            { id: 'duplicate', label: 'Duplicate', onSelect: () => {} },
            { id: 'archive', label: 'Archive', disabled: true },
          ],
        },
        {
          items: [{ id: 'delete', label: 'Delete', variant: 'destructive', onSelect: () => {} }],
        },
      ]}
    />
  ),
}

const openOnMount: Story['play'] = async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  const menu = await within(document.body).findByRole('menu')
  await expect(menu).toBeVisible()
}

export const Open: Story = {
  ...Default,
  name: 'Open',
  play: openOnMount,
}

export const WithGroupLabelsAndIcons: Story = {
  name: 'Group labels and icons',
  render: () => (
    <Menu
      trigger={<Button variant="ghost" icon={<UserIcon size={16} />}>Account</Button>}
      groups={[
        {
          label: 'Signed in as anto@example.com',
          items: [
            { id: 'profile', label: 'Profile', icon: <UserIcon size={16} />, onSelect: () => {} },
            { id: 'edit', label: 'Edit details', icon: <PencilSimpleIcon size={16} />, onSelect: () => {} },
          ],
        },
        {
          label: 'Session',
          items: [{ id: 'signout', label: 'Sign out', icon: <SignOutIcon size={16} />, onSelect: () => {} }],
        },
      ]}
    />
  ),
  play: openOnMount,
}

export const Overflow: Story = {
  name: 'Overflow menu (icon trigger, end-aligned)',
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 'var(--size-container-text)' }}>
      <Menu
        align="end"
        aria-label="Row actions"
        trigger={<Button variant="ghost" aria-label="More actions" icon={<DotsThreeIcon size={16} weight="bold" />}>{null}</Button>}
        groups={[
          {
            items: [
              { id: 'copy', label: 'Copy link', icon: <CopyIcon size={16} />, onSelect: () => {} },
              { id: 'edit', label: 'Rename', icon: <PencilSimpleIcon size={16} />, onSelect: () => {} },
            ],
          },
          {
            items: [{ id: 'delete', label: 'Delete', icon: <TrashIcon size={16} />, variant: 'destructive', onSelect: () => {} }],
          },
        ]}
      />
    </div>
  ),
  play: openOnMount,
}

// The menu panel is portalled to <body>, outside darkModeDecorator's
// wrapper, so on its own it would render light. Putting data-mode="dark" on
// <body> while this story is mounted puts the panel in the dark cascade too,
// so the rendered-story a11y audit sees the open menu in dark.
const bodyDarkModeDecorator: Decorator = (Story) => {
  useEffect(() => {
    document.body.setAttribute('data-mode', 'dark')
    return () => document.body.removeAttribute('data-mode')
  }, [])
  return <Story />
}

export const DarkMode: Story = {
  ...Open,
  name: 'Dark mode',
  decorators: [darkModeDecorator, bodyDarkModeDecorator],
}
