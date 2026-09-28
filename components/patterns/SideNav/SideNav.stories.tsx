import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  BookOpenIcon,
  ChartBarIcon,
  FolderIcon,
  GearIcon,
  HouseIcon,
  PaletteIcon,
  SidebarSimpleIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { bodyDarkModeDecorator, darkModeDecorator } from '../../../lib/storybook'
import { mediaQuery } from '../../../lib/breakpoints'
import type { NavItem } from '../../../lib/navigation'
import { Button } from '../../primitives/Button'
import { SkipLink } from '../../primitives/SkipLink'
import { NavigationMenu } from '../../composition/NavigationMenu'
import { SideNav, SideNavProvider, SideNavTrigger } from './SideNav'

const meta: Meta<typeof SideNav> = {
  title: 'Patterns/SideNav',
  component: SideNav,
}

export default meta
type Story = StoryObj<typeof SideNav>

export const Default: Story = {
  render: () => (
    <SideNavProvider>
      <SkipLink />
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-inline-gap)' }}>
        <SideNavTrigger />
        <strong style={{ marginInlineEnd: 'auto' }}>Studio</strong>
        <NavigationMenu
          currentHref="/docs/tokens"
          items={[
            { id: 'work', label: 'Work', href: '/work' },
            { id: 'about', label: 'About', href: '/about' },
          ]}
        />
      </header>
      <div style={{ display: 'flex', gap: 'var(--space-component-gap)' }}>
        <SideNav
          currentHref="/docs/tokens"
          headerItems={[
            { id: 'work', label: 'Work', href: '/work' },
            { id: 'about', label: 'About', href: '/about' },
          ]}
          items={[
            { id: 'start', label: 'Getting started', href: '/docs/start' },
            {
              id: 'foundations',
              label: 'Foundations',
              items: [
                { id: 'tokens', label: 'Tokens', href: '/docs/tokens' },
                { id: 'type', label: 'Typography', href: '/docs/type' },
              ],
            },
            { id: 'components', label: 'Components', href: '/docs/components' },
          ]}
        />
        <main id="main-content" style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0 }}>Page content.</p>
        </main>
      </div>
    </SideNavProvider>
  ),
}

const appItems: NavItem[] = [
  { id: 'home', label: 'Overview', href: '/app', icon: <HouseIcon size={16} /> },
  { id: 'projects', label: 'Projects', href: '/app/projects', icon: <FolderIcon size={16} /> },
  {
    id: 'reports',
    label: 'Reports',
    icon: <ChartBarIcon size={16} />,
    items: [
      { id: 'monthly', label: 'Monthly', href: '/app/reports/monthly', icon: <ChartBarIcon size={16} /> },
      { id: 'team', label: 'By team', href: '/app/reports/team', icon: <UsersIcon size={16} /> },
    ],
  },
  { id: 'settings', label: 'Settings', href: '/app/settings', icon: <GearIcon size={16} /> },
]

const headerItems: NavItem[] = [
  { id: 'work', label: 'Work', href: '/work' },
  {
    id: 'writing',
    label: 'Writing',
    items: [
      { id: 'essays', label: 'Essays', href: '/writing/essays' },
      { id: 'notes', label: 'Notes', href: '/writing/notes' },
    ],
  },
  { id: 'about', label: 'About', href: '/about' },
]

export const WithIcons: Story = {
  name: 'With icons, current page in a group',
  render: () => (
    <SideNavProvider>
      <SideNav items={appItems} currentHref="/app/reports/team" aria-label="App" />
    </SideNavProvider>
  ),
}

export const Collapsed: Story = {
  name: 'Collapsed rail, driven by a Button',
  render: function CollapsedStory() {
    const [collapsed, setCollapsed] = useState(true)
    return (
      <SideNavProvider>
        <div style={{ display: 'grid', gap: 'var(--space-inline-gap)', justifyItems: 'start' }}>
          <Button
            variant="ghost"
            icon={<SidebarSimpleIcon size={16} />}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={!collapsed}
            onClick={() => setCollapsed(value => !value)}
          >
            {null}
          </Button>
          <SideNav items={appItems} currentHref="/app/projects" collapsed={collapsed} aria-label="App" />
        </div>
      </SideNavProvider>
    )
  },
}

// The drawer exists below breakpoint.desktop. Chromatic snapshots this at
// 375px, where the trigger shows and the play function opens it; in a wide
// viewport there's nothing to open and the story shows the inline nav.
const openDrawer: Story['play'] = async ({ canvasElement }) => {
  if (window.matchMedia(mediaQuery('desktop')).matches) return
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open navigation' }))
  const drawer = await within(document.body).findByRole('dialog', { name: 'Navigation' })
  await expect(drawer).toBeVisible()
}

export const MobileDrawer: Story = {
  name: 'Mobile drawer, with header items',
  parameters: { chromatic: { viewports: [375] } },
  render: () => (
    <SideNavProvider>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-inline-gap)' }}>
        <SideNavTrigger />
        <NavigationMenu items={headerItems} currentHref="/work" />
      </header>
      <SideNav items={appItems} headerItems={headerItems} currentHref="/app/projects" aria-label="App" />
    </SideNavProvider>
  ),
  play: openDrawer,
}

export const DrawerOnly: Story = {
  name: 'Drawer only (content site with a header nav)',
  parameters: { chromatic: { viewports: [375, 1280] } },
  render: () => (
    <SideNavProvider>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong>Site</strong>
        <NavigationMenu items={headerItems} currentHref="/about" />
        <SideNavTrigger />
      </header>
      {/* Nothing inline at desktop width; below it, the drawer holds the header's links. */}
      <SideNav layout="drawer-only" items={[]} headerItems={headerItems} currentHref="/about" />
    </SideNavProvider>
  ),
}

export const PageShell: Story = {
  name: 'Page shell: SkipLink, header, side nav, main',
  parameters: { chromatic: { viewports: [375, 1280] } },
  render: () => (
    <SideNavProvider>
      <SkipLink />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-inline-gap)',
          paddingBlockEnd: 'var(--space-element-gap)',
          borderBottom: 'var(--border-width-default) solid var(--color-border-default)',
        }}
      >
        <SideNavTrigger />
        <strong style={{ marginInlineEnd: 'auto' }}>Studio</strong>
        <NavigationMenu items={headerItems} currentHref="/work" />
      </header>
      <div style={{ display: 'flex', gap: 'var(--space-component-gap)', paddingBlockStart: 'var(--space-element-gap)' }}>
        <SideNav items={appItems} headerItems={headerItems} currentHref="/app/projects" aria-label="App" />
        <main id="main-content" style={{ flex: 1 }}>
          <p style={{ margin: 0 }}>Main content.</p>
        </main>
      </div>
    </SideNavProvider>
  ),
}

export const DarkMode: Story = {
  ...MobileDrawer,
  name: 'Dark mode',
  decorators: [darkModeDecorator, bodyDarkModeDecorator],
}

export const CollapsedWithoutIcons: Story = {
  name: 'Collapsed without icons (falls back to expanded)',
  render: () => (
    <SideNavProvider>
      <SideNav
        collapsed
        aria-label="Themes"
        items={[
          { id: 'a', label: 'Has an icon', href: '/a', icon: <PaletteIcon size={16} /> },
          { id: 'b', label: 'No icon, so the rail is off', href: '/b' },
          { id: 'c', label: 'Also documented', href: '/c', icon: <BookOpenIcon size={16} /> },
        ]}
      />
    </SideNavProvider>
  ),
}
