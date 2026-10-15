import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { BellIcon, ChatCircleIcon, HouseIcon, MagnifyingGlassIcon, UserIcon } from '@phosphor-icons/react'
import { MobileNav, type MobileNavItem } from './MobileNav'
import { ThemeScope } from '../../composition/ThemeScope'

const items: MobileNavItem[] = [
  { id: 'home', label: 'Home', href: '#home', icon: <HouseIcon /> },
  { id: 'search', label: 'Search', href: '#search', icon: <MagnifyingGlassIcon /> },
  { id: 'inbox', label: 'Messages', href: '#messages', icon: <ChatCircleIcon />, badge: 3, badgeLabel: n => `${n} unread` },
  { id: 'alerts', label: 'Alerts', href: '#alerts', icon: <BellIcon /> },
  { id: 'me', label: 'Profile', href: '#profile', icon: <UserIcon /> },
]

// A phone-sized frame: the bar is fixed to the bottom of whatever contains it here.
const Phone = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative', inlineSize: 380, blockSize: 220, overflow: 'hidden', transform: 'translateZ(0)', border: '1px solid var(--color-border-default)', background: 'var(--color-surface-primary)' }}>
    {children}
  </div>
)

const meta: Meta<typeof MobileNav> = {
  title: 'Components/MobileNav',
  component: MobileNav,
  args: { items, currentHref: '#messages', alwaysVisible: true },
  decorators: [Story => <Phone><Story /></Phone>],
}

export default meta
type Story = StoryObj<typeof MobileNav>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Main' })
    await expect(within(nav).getByRole('link', { name: 'Messages (3 unread)' })).toHaveAttribute('aria-current', 'page')
  },
}

export const ThreeItems: Story = {
  name: 'Three items',
  args: { items: items.slice(0, 3).map(i => ({ ...i, badge: undefined })), currentHref: '#home' },
}

export const Danish: Story = {
  args: {
    'aria-label': 'Hovedmenu',
    currentHref: '#hjem',
    items: [
      { id: 'h', label: 'Hjem', href: '#hjem', icon: <HouseIcon /> },
      { id: 's', label: 'Søg', href: '#sog', icon: <MagnifyingGlassIcon /> },
      { id: 'b', label: 'Beskeder', href: '#beskeder', icon: <ChatCircleIcon />, badge: 12, badgeLabel: n => `${n} ulæste` },
      { id: 'p', label: 'Profil', href: '#profil', icon: <UserIcon /> },
    ],
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  decorators: [Story => <ThemeScope mode="dark"><Story /></ThemeScope>],
}
