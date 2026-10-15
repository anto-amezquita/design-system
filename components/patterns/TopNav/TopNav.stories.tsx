import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { TopNav } from './TopNav'
import { ThemeScope } from '../../composition/ThemeScope'
import { IconButton } from '../../primitives/IconButton'
import { Avatar } from '../../primitives/Avatar'
import { Button } from '../../primitives/Button'
import type { NavItem } from '../../../lib/navigation'

const items: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'components', label: 'Components', items: [
    { id: 'inputs', label: 'Inputs', href: '#inputs' },
    { id: 'overlays', label: 'Overlays', href: '#overlays' },
    { id: 'patterns', label: 'Patterns', href: '#patterns' },
  ] },
  { id: 'tokens', label: 'Tokens', href: '#tokens' },
  { id: 'changelog', label: 'Changelog', href: '#changelog' },
]

const brand = <a href="#home" style={{ color: 'inherit', textDecoration: 'none' }}>Amezquita DS</a>
const actions = (
  <>
    <IconButton variant="ghost" icon={<MagnifyingGlassIcon />} label="Search" />
    <Avatar fallback="AA" alt="Antonio Amézquita" size="sm" />
  </>
)

const meta: Meta<typeof TopNav> = {
  title: 'Components/TopNav',
  component: TopNav,
  args: { brand, items, currentHref: '#tokens', actions },
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof TopNav>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('banner')).toBeVisible()
  },
}

export const WithButton: Story = {
  name: 'With a call to action',
  args: { actions: <><IconButton variant="ghost" icon={<MagnifyingGlassIcon />} label="Search" /><Button>Get started</Button></> },
}

export const Narrow: Story = {
  name: 'Small screen: the Menu drawer',
  globals: { viewport: { value: 'mobile1' } },
  decorators: [Story => <div style={{ maxWidth: 380 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const menu = within(canvasElement).queryByRole('button', { name: 'Menu' })
    // Only on screens narrower than 1024px.
    if (menu && menu.checkVisibility()) {
      await userEvent.click(menu)
      await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Main' })).toBeVisible())
      await expect(within(document.body).getByRole('link', { name: 'Tokens' })).toHaveAttribute('aria-current', 'page')
    }
  },
}

export const Danish: Story = {
  args: {
    navLabel: 'Hovedmenu',
    menuLabel: 'Menu',
    currentHref: '#oversigt',
    items: [
      { id: 'o', label: 'Oversigt', href: '#oversigt' },
      { id: 'k', label: 'Komponenter', href: '#komponenter' },
      { id: 't', label: 'Tokens', href: '#tokens' },
    ],
    actions: <IconButton variant="ghost" icon={<MagnifyingGlassIcon />} label="Søg" />,
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', minBlockSize: '12rem' }}>
      <TopNav {...args} />
    </ThemeScope>
  ),
}
