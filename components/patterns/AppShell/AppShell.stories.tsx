import type { Meta, StoryObj } from '@storybook/react-vite'
import { HouseIcon, MagnifyingGlassIcon, UserIcon, SquaresFourIcon, PaletteIcon } from '@phosphor-icons/react'
import { AppShell } from './AppShell'
import { TopNav } from '../TopNav'
import { SideNav, SideNavProvider, SideNavTrigger } from '../SideNav'
import { MobileNav } from '../MobileNav'
import { NavigationMenu } from '../../composition/NavigationMenu'
import { Section } from '../../primitives/Section'
import { DescriptionList } from '../../primitives/DescriptionList'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof AppShell>

const headerItems = [
  { id: 'tokens', label: 'Tokens', href: '#tokens' },
  { id: 'components', label: 'Components', href: '#components' },
]
const sectionItems = [
  { id: 'overview', label: 'Overview', href: '#overview', icon: <SquaresFourIcon /> },
  { id: 'button', label: 'Button', href: '#button', icon: <PaletteIcon /> },
  { id: 'card', label: 'Card', href: '#card', icon: <PaletteIcon /> },
]
const bottomItems = [
  { id: 'home', label: 'Home', href: '#home', icon: <HouseIcon /> },
  { id: 'search', label: 'Search', href: '#search', icon: <MagnifyingGlassIcon /> },
  { id: 'me', label: 'Account', href: '#me', icon: <UserIcon /> },
]

const text: React.CSSProperties = { margin: 0, fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)' }

const Content = () => (
  <Section width="text" spacing="component" aria-labelledby="page-title">
    <h1 id="page-title" style={text}>Button</h1>
    {Array.from({ length: 12 }, (_, i) => (
      <p key={i} style={{ ...text, marginBlockStart: 'var(--space-element-gap)', color: 'var(--color-text-secondary)' }}>
        Every colour, size and space comes from a token, so a brand is a thin skin over the same components.
      </p>
    ))}
  </Section>
)

// With a SideNav, the header is SideNavTrigger, the brand and NavigationMenu:
// NavigationMenu hides below 1024px, where SideNav's drawer carries the same
// links (headerItems), so there's one menu button. TopNav, which has its own
// drawer, is the header for pages without a SideNav.
const SectionHeader = ({ sticky = true }: { sticky?: boolean }) => (
  <header
    style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-inline-gap)',
      padding: 'var(--space-inline-gap) var(--space-element-gap)',
      borderBlockEnd: 'var(--border-width-default) solid var(--color-border-default)',
      background: 'var(--color-surface-primary)',
      ...(sticky && { position: 'sticky', top: 0, zIndex: 'var(--z-sticky)' }),
    }}
  >
    <SideNavTrigger />
    <a href="#home" style={text}>Amezquita</a>
    <NavigationMenu items={headerItems} currentHref="#components" />
  </header>
)

const SiteHeader = () => (
  <TopNav brand={<a href="#home" style={text}>Amezquita</a>} items={headerItems} currentHref="#components" sticky />
)

const Footer = () => <p style={{ ...text, padding: 'var(--space-element-gap)', color: 'var(--color-text-secondary)' }}>© 2026 Antonio Amézquita</p>

export const Default: Story = {
  render: () => (
    <SideNavProvider>
      <AppShell
        header={<SectionHeader />}
        sidebar={<SideNav items={sectionItems} headerItems={headerItems} currentHref="#button" aria-label="Components" />}
        footer={<Footer />}
      >
        <Content />
      </AppShell>
    </SideNavProvider>
  ),
}

export const WithAside: Story = {
  name: 'With an aside',
  render: () => (
    <SideNavProvider>
      <AppShell
        header={<SectionHeader />}
        sidebar={<SideNav items={sectionItems} headerItems={headerItems} currentHref="#button" aria-label="Components" />}
        aside={
          <div style={{ padding: 'var(--space-element-gap)' }}>
            <DescriptionList layout="stacked" items={[{ term: 'Status', description: 'Stable' }, { term: 'Since', description: '1.0.0' }]} />
          </div>
        }
        asideLabel="Component details"
        footer={<Footer />}
      >
        <Content />
      </AppShell>
    </SideNavProvider>
  ),
}

export const HeaderOnly: Story = {
  name: 'Header only, with a bottom bar',
  render: () => (
    <AppShell header={<SiteHeader />} footer={<Footer />} bottomNav={<MobileNav items={bottomItems} currentHref="#home" />}>
      <Content />
    </AppShell>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <SideNavProvider>
      <AppShell
        header={<SectionHeader sticky={false} />}
        sidebar={<SideNav items={sectionItems} currentHref="#button" aria-label="Components" />}
        footer={<Footer />}
      >
        <Content />
      </AppShell>
    </SideNavProvider>
  ),
  decorators: [darkModeDecorator],
}
