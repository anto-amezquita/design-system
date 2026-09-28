import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { darkModeDecorator } from '../../../lib/storybook'
import { SkipLink } from './SkipLink'

const meta: Meta<typeof SkipLink> = {
  title: 'Primitives/SkipLink',
  component: SkipLink,
}

export default meta
type Story = StoryObj<typeof SkipLink>

const note = {
  margin: 0,
  fontSize: 'var(--font-size-small)',
  lineHeight: 'var(--line-height-small)',
  color: 'var(--color-text-secondary)',
}

export const Default: Story = {
  render: () => (
    <>
      <SkipLink />
      <main id="main-content">
        <p>Press Tab: the skip link appears in the top-left corner.</p>
      </main>
    </>
  ),
}

// Focused on mount so the visible state is what gets snapshotted.
export const Focused: Story = {
  render: () => (
    <>
      <SkipLink />
      <main id="main-content">
        <p style={note}>Focused state, as a keyboard user sees it after the first Tab.</p>
      </main>
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('.skip-link')!
    link.focus()
    await expect(link).toHaveFocus()
  },
}

export const CustomTarget: Story = {
  name: 'Custom target and label',
  render: () => (
    <>
      <SkipLink targetId="results">Skip to search results</SkipLink>
      <p style={note}>Press Tab to reveal it; it jumps to the results list below.</p>
      <section id="results" aria-label="Search results">
        <p>Results</p>
      </section>
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('.skip-link')!
    link.focus()
    await expect(link).toHaveTextContent('Skip to search results')
  },
}

export const DarkMode: Story = {
  ...Focused,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
