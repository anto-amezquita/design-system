import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { VisuallyHidden } from './VisuallyHidden'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
}

export default meta
type Story = StoryObj<typeof VisuallyHidden>

const iconButton: React.CSSProperties = {
  display: 'inline-grid',
  placeItems: 'center',
  inlineSize: '44px',
  blockSize: '44px',
  border: 'var(--border-width-default) solid var(--color-border-strong)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
}

/** An icon-only button: the icon is all you see, the hidden text is its name. */
export const IconButtonLabel: Story = {
  name: 'Labels an icon-only button',
  render: () => (
    <button type="button" style={iconButton}>
      <MagnifyingGlassIcon size={20} aria-hidden="true" />
      <VisuallyHidden>Search</VisuallyHidden>
    </button>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Search' })).toBeInTheDocument()
  },
}

export const LinkSuffix: Story = {
  name: 'Adds context to a link',
  render: () => (
    <a href="https://www.w3.org/WAI/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-text)' }}>
      WAI guidelines
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  ),
}

export const DarkMode: Story = {
  ...IconButtonLabel,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
