import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { CopyIcon, DotsThreeIcon, DownloadSimpleIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { ContextMenu, type ContextMenuGroup } from './ContextMenu'
import { Menu } from '../Menu'
import { ThemeScope } from '../ThemeScope'
import { IconButton } from '../../primitives/IconButton'

const actions = (file: string): ContextMenuGroup[] => [
  {
    items: [
      { id: 'rename', label: 'Rename', icon: <PencilSimpleIcon />, shortcut: ['F2'] },
      { id: 'copy', label: 'Copy link', icon: <CopyIcon />, shortcut: ['Ctrl', 'C'] },
      { id: 'download', label: 'Download', icon: <DownloadSimpleIcon /> },
    ],
  },
  { items: [{ id: 'delete', label: `Delete ${file}`, icon: <TrashIcon />, variant: 'destructive', shortcut: ['Del'] }] },
]

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  decorators: [Story => <div style={{ minBlockSize: '20rem', maxInlineSize: '28rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ContextMenu>

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-inline-gap)',
  padding: 'var(--space-tight-gap) var(--space-control-padding-x)', borderBlockEnd: 'var(--border-width-default) solid var(--color-border-default)',
  color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)',
}

/** The pattern to copy: the same actions are on a visible "More" button, so nobody depends on right-click. */
export const FileRows: Story = {
  name: 'File rows, with a visible More button',
  render: () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Files">
      {['report.pdf', 'budget.xlsx', 'logo.svg'].map(f => (
        <li key={f}>
          <ContextMenu groups={actions(f)} aria-label={`Actions for ${f}`}>
            <div style={row} aria-label={f}>
              <span>{f}</span>
              <Menu trigger={<IconButton variant="ghost" size="sm" icon={<DotsThreeIcon />} label={`More actions for ${f}`} />} groups={actions(f)} align="end" />
            </div>
          </ContextMenu>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const area = within(canvasElement).getByLabelText('report.pdf')
    await expect(area).toHaveAttribute('tabindex', '0')
  },
}

export const Canvas: Story = {
  name: 'On an area',
  render: () => (
    <ContextMenu
      aria-label="Canvas"
      groups={[
        { label: 'Insert', items: [{ id: 'text', label: 'Text box' }, { id: 'image', label: 'Image' }] },
        { items: [{ id: 'paste', label: 'Paste', shortcut: ['Ctrl', 'V'] }, { id: 'all', label: 'Select all', shortcut: ['Ctrl', 'A'], disabled: true }] },
      ]}
    >
      <div
        aria-label="Canvas. Right-click, or press Shift+F10, for actions."
        style={{
          display: 'grid', placeItems: 'center', blockSize: '12rem', border: 'var(--border-width-interactive) dashed var(--color-border-strong)',
          borderRadius: 'var(--border-radius-component)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-base)',
        }}
      >
        Right-click, or press Shift+F10
      </div>
    </ContextMenu>
  ),
}

export const Danish: Story = {
  render: () => (
    <ContextMenu
      aria-label="Handlinger for rapport.pdf"
      groups={[
        { items: [{ id: 'r', label: 'Omdøb', shortcut: ['F2'] }, { id: 'c', label: 'Kopiér link', shortcut: ['Ctrl', 'C'] }] },
        { items: [{ id: 'd', label: 'Slet', variant: 'destructive', shortcut: ['Del'] }] },
      ]}
    >
      <div style={row} aria-label="rapport.pdf">rapport.pdf</div>
    </ContextMenu>
  ),
}

const openOn = async (area: HTMLElement) => {
  const r = area.getBoundingClientRect()
  fireEvent.contextMenu(area, { clientX: r.left + 40, clientY: r.top + 10 })
  await waitFor(() => expect(within(document.body).getByRole('menu')).toBeVisible())
}

export const Open: Story = {
  tags: ['!autodocs'],
  render: () => (
    <ContextMenu groups={actions('report.pdf')} aria-label="Actions for report.pdf">
      <div style={row} aria-label="report.pdf">report.pdf</div>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => openOn(within(canvasElement).getByLabelText('report.pdf')),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: () => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', minBlockSize: '18rem' }}>
      <ContextMenu groups={actions('report.pdf')} aria-label="Actions for report.pdf">
        <div style={row} aria-label="report.pdf">report.pdf</div>
      </ContextMenu>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    await openOn(within(canvasElement).getByLabelText('report.pdf'))
    await expect(within(document.body).getByRole('menu').closest('[data-mode]')).toHaveAttribute('data-mode', 'dark')
  },
}
