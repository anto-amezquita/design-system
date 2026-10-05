import type { Meta, StoryObj } from '@storybook/react-vite'
import { darkModeDecorator } from '../../../lib/storybook'
import { Button } from '../../primitives/Button'
import { Menu } from '../Menu'
import { ThemeScope } from './ThemeScope'

// Storybook loads portfolio-light.css and portfolio-dark.css for the whole
// canvas, so the `brand` prop changes nothing here: every story is already
// portfolio. These stories show the mode side, which is visible. The brand
// side is on the docs site's Themes page, which loads portfolio-scoped.css.

const meta: Meta<typeof ThemeScope> = {
  title: 'Composition/ThemeScope',
  component: ThemeScope,
}

export default meta
type Story = StoryObj<typeof ThemeScope>

const panel: React.CSSProperties = {
  display: 'grid',
  gap: 'var(--space-element-gap)',
  justifyItems: 'start',
  padding: 'var(--space-container-padding)',
  borderRadius: 'var(--border-radius-component)',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
}

const menu = (defaultOpen = false) => (
  <Menu
    aria-label="Project actions"
    defaultOpen={defaultOpen}
    trigger={<Button variant="secondary">More</Button>}
    groups={[
      { items: [{ id: 'export', label: 'Export tokens', onSelect: () => {} }, { id: 'duplicate', label: 'Duplicate project', onSelect: () => {} }] },
      { items: [{ id: 'archive', label: 'Archive project', variant: 'destructive', onSelect: () => {} }] },
    ]}
  />
)

// Written out in full, not with the helpers above: the doc twin's usage
// example is taken from this story, and agents copy it.
export const Default: Story = {
  name: 'Dark region on a light page',
  render: () => (
    <ThemeScope brand="portfolio" mode="dark" style={{ padding: 'var(--space-container-padding)', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
      <p>This part of the page is dark. The page around it isn’t.</p>
      <Menu
        aria-label="Project actions"
        trigger={<Button variant="secondary">More</Button>}
        groups={[{ items: [{ id: 'export', label: 'Export tokens', onSelect: () => {} }] }]}
      />
    </ThemeScope>
  ),
}

export const MenuOpen: Story = {
  name: 'Menu opened inside the region',
  render: () => (
    <div style={{ minHeight: '16rem' }}>
      <ThemeScope mode="dark" style={panel}>
        <p>The menu renders at the end of the page, outside this region, and still comes out dark.</p>
        {menu(true)}
      </ThemeScope>
    </div>
  ),
}

export const Nested: Story = {
  name: 'Nested scopes',
  render: () => (
    <ThemeScope mode="dark" style={panel}>
      <p>Dark region.</p>
      <ThemeScope mode="light" style={{ ...panel, border: 'var(--border-width-default) solid var(--color-border-default)' }}>
        <p>A light region inside it. Anything it doesn’t set comes from the outer scope.</p>
        {menu()}
      </ThemeScope>
    </ThemeScope>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [darkModeDecorator],
  render: () => (
    <ThemeScope mode="light" style={panel}>
      <p>A light region on a dark page.</p>
      {menu()}
    </ThemeScope>
  ),
}
