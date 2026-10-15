import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  ArrowSquareOutIcon, FileTextIcon, GearIcon, MoonIcon, PaletteIcon, PlusIcon, SignOutIcon, UserIcon,
} from '@phosphor-icons/react'
import { CommandPalette, useCommandPaletteShortcut, type CommandGroup } from './CommandPalette'
import { ThemeScope } from '../ThemeScope'
import { Button } from '../../primitives/Button'
import { Kbd } from '../../primitives/Kbd'

const groups = (log: (s: string) => void): CommandGroup[] => [
  {
    label: 'Create',
    commands: [
      { id: 'page', label: 'New page', icon: <PlusIcon />, shortcut: ['Ctrl', 'N'], onSelect: () => log('New page') },
      { id: 'brand', label: 'New brand', description: 'Start from the base tokens', icon: <PaletteIcon />, onSelect: () => log('New brand') },
    ],
  },
  {
    label: 'Go to',
    commands: [
      { id: 'tokens', label: 'Tokens', icon: <FileTextIcon />, keywords: ['colours', 'spacing'], onSelect: () => log('Tokens') },
      { id: 'contrast', label: 'Contrast report', icon: <FileTextIcon />, onSelect: () => log('Contrast report') },
      { id: 'storybook', label: 'Open Storybook', description: 'In a new tab', icon: <ArrowSquareOutIcon />, onSelect: () => log('Storybook') },
    ],
  },
  {
    label: 'Settings',
    commands: [
      { id: 'theme', label: 'Switch to dark mode', icon: <MoonIcon />, keywords: ['theme', 'night'], shortcut: ['Ctrl', 'Shift', 'L'], onSelect: () => log('Dark mode') },
      { id: 'account', label: 'Account', icon: <UserIcon />, onSelect: () => log('Account') },
      { id: 'prefs', label: 'Preferences', icon: <GearIcon />, shortcut: ['Ctrl', ','], onSelect: () => log('Preferences') },
      { id: 'signout', label: 'Sign out', icon: <SignOutIcon />, disabled: true, description: 'Not while a sync is running', onSelect: () => log('Sign out') },
    ],
  },
]

function Example({ defaultOpen = false, emptyMessage }: { defaultOpen?: boolean; emptyMessage?: (t: string) => string }) {
  const [open, setOpen] = useState(defaultOpen)
  const [ran, setRan] = useState('')
  useCommandPaletteShortcut(setOpen)
  return (
    <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', justifyItems: 'start', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Search commands <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></Button>
      <p aria-live="polite" style={{ margin: 0 }}>{ran && `Ran: ${ran}`}</p>
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups(setRan)} emptyMessage={emptyMessage} />
    </div>
  )
}

const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  decorators: [Story => <div style={{ minBlockSize: '32rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof CommandPalette>

export const Default: Story = {
  name: 'Ctrl+K or the button',
  render: () => <Example />,
}

export const Open: Story = {
  tags: ['!autodocs'],
  render: () => <Example defaultOpen />,
  play: async () => {
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole('dialog', { name: 'Command palette' })).toBeVisible())
    const box = body.getByRole('combobox', { name: 'Search commands' })
    await expect(box).toHaveFocus()
    await userEvent.type(box, 'dark')
    // Found by its keyword, ready for Enter.
    await waitFor(() => expect(body.getAllByRole('option')).toHaveLength(1))
    await expect(body.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  },
}

export const Run: Story = {
  name: 'Running a command',
  tags: ['!autodocs'],
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const button = c.getByRole('button', { name: /Search commands/ })
    await userEvent.click(button)
    await userEvent.keyboard('cont{Enter}')
    await waitFor(() => expect(c.getByText('Ran: Contrast report')).toBeVisible())
    await waitFor(() => expect(button).toHaveFocus())
  },
}

export const Danish: Story = {
  tags: ['!autodocs'],
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        title="Kommandopalet"
        placeholder="Søg i kommandoer"
        emptyMessage={t => `Ingen kommandoer matcher “${t.trim()}”`}
        hint={<span><Kbd>Enter</Kbd> kører, <Kbd>Esc</Kbd> lukker</span>}
        groups={[
          { label: 'Opret', commands: [{ id: 'p', label: 'Ny side', onSelect: () => {} }, { id: 'b', label: 'Nyt brand', onSelect: () => {} }] },
          { label: 'Gå til', commands: [{ id: 't', label: 'Tokens', onSelect: () => {} }, { id: 'k', label: 'Kontrastrapport', onSelect: () => {} }] },
        ]}
      />
    )
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => (
    // The palette alone: axe would otherwise measure the page's button dimmed behind the overlay.
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '30rem' }}>
      <CommandPalette open onOpenChange={() => {}} groups={groups(() => {})} />
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toHaveAttribute('data-mode', 'dark'))
  },
}
