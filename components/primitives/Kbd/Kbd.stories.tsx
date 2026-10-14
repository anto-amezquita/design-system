import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd } from './Kbd'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'Esc' },
}

export default meta
type Story = StoryObj<typeof Kbd>

const text: React.CSSProperties = {
  margin: 0,
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-base)',
}

export const Default: Story = {}

export const InText: Story = {
  name: 'In running text',
  render: () => (
    <p style={{ ...text, fontSize: 'var(--font-size-body)' }}>
      Press <Kbd>Esc</Kbd> to close the dialog.
    </p>
  ),
}

export const Combination: Story = {
  render: () => (
    <p style={{ ...text, fontSize: 'var(--font-size-body)' }}>
      Open search with{' '}
      <kbd><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></kbd>
    </p>
  ),
}

export const Sizes: Story = {
  name: 'Follows the text size',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <p style={{ ...text, fontSize: 'var(--font-size-caption)' }}>Caption: <Kbd>Enter</Kbd></p>
      <p style={{ ...text, fontSize: 'var(--font-size-body)' }}>Body: <Kbd>Enter</Kbd></p>
      <p style={{ ...text, fontSize: 'var(--font-size-lg)' }}>Large: <Kbd>Enter</Kbd></p>
    </div>
  ),
}

export const DarkMode: Story = {
  ...Combination,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
