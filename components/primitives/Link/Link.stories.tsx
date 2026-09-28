import { forwardRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { darkModeDecorator } from '../../../lib/storybook'
import { Link } from './Link'

const meta: Meta<typeof Link> = {
  title: 'Primitives/Link',
  component: Link,
}

export default meta
type Story = StoryObj<typeof Link>

const prose = {
  margin: 0,
  maxWidth: 'var(--size-container-text)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-primary)',
}

export const Default: Story = {
  render: () => (
    <p>
      Tokens are documented in the <Link href="/docs/tokens">token reference</Link>, generated from source on every build.
    </p>
  ),
}

export const Standalone: Story = {
  render: () => (
    <ul style={{ ...prose, listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-inline-gap)' }}>
      <li><Link variant="standalone" href="/work">Selected work</Link></li>
      <li><Link variant="standalone" href="/about">About</Link></li>
      <li><Link variant="standalone" href="/contact">Contact</Link></li>
    </ul>
  ),
}

export const External: Story = {
  render: () => (
    <p style={prose}>
      Built on <Link href="https://www.radix-ui.com" external>Radix Primitives</Link> for behaviour and accessibility.
    </p>
  ),
}

// Stand-in for a router's Link (next/link, React Router): renders an <a> and
// forwards what it's given. Link's asChild merges its class and props onto it.
const RouterLink = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function RouterLink(props, ref) {
    return <a ref={ref} {...props} data-router-link="" />
  },
)

export const AsChild: Story = {
  name: 'With a router link (asChild)',
  render: () => (
    <p style={prose}>
      Read the <Link asChild><RouterLink href="/docs/start">getting started guide</RouterLink></Link> first.
    </p>
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-component-gap)' }}>
      <p style={prose}>Inline: see the <Link href="/docs">documentation</Link>.</p>
      <p style={prose}>Standalone: <Link variant="standalone" href="/docs">Documentation</Link></p>
      <p style={prose}>External: <Link href="https://example.com" external>example.com</Link></p>
      <p style={prose}>Standalone and external: <Link variant="standalone" href="https://example.com" external>example.com</Link></p>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllVariants,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
