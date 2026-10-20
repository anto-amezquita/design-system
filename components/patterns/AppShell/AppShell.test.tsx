/**
 * AppShell: one of each landmark in order, the skip link moving focus to
 * main, sidebar and aside beside main from 1024px and stacked below it, a
 * sticky sidebar that starts below a sticky header, and room at the bottom
 * for MobileNav below 1024px. Built with the real TopNav, SideNav and
 * MobileNav, in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { AppShell } from './AppShell'
import { TopNav } from '../TopNav'
import { SideNav, SideNavProvider, SideNavTrigger } from '../SideNav'
import { MobileNav } from '../MobileNav'
import { NavigationMenu } from '../../composition/NavigationMenu'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const navItems = [
  { id: 'tokens', label: 'Tokens', href: '/tokens' },
  { id: 'components', label: 'Components', href: '/components' },
]
const sectionItems = [
  { id: 'overview', label: 'Overview', href: '/components' },
  { id: 'button', label: 'Button', href: '/components/button' },
]
const bottomItems = [
  { id: 'home', label: 'Home', href: '/', icon: <span /> },
  { id: 'search', label: 'Search', href: '/search', icon: <span /> },
  { id: 'me', label: 'Account', href: '/me', icon: <span /> },
]

function Shell(props: Partial<React.ComponentProps<typeof AppShell>> & { sticky?: boolean }) {
  const { sticky = false, ...rest } = props
  return (
    <SideNavProvider>
      <AppShell
        header={
          <header style={sticky ? { position: 'sticky', top: 0, background: 'var(--color-surface-primary)' } : undefined}>
            <SideNavTrigger />
            <a href="/">Amezquita</a>
            <NavigationMenu items={navItems} />
          </header>
        }
        sidebar={<SideNav items={sectionItems} headerItems={navItems} aria-label="Components" />}
        aside={<p>On this page</p>}
        asideLabel="On this page"
        footer={<p>© 2026</p>}
        {...rest}
      >
        <h1>Button</h1>
        {Array.from({ length: 40 }, (_, i) => <p key={i}>Paragraph {i + 1}</p>)}
      </AppShell>
    </SideNavProvider>
  )
}

describe('AppShell landmarks', () => {
  test('banner, navigation, main, complementary and contentinfo, one each, in order', async () => {
    await page.viewport(1280, 800)
    const { getByRole, container } = render(<Shell />)
    const banner = getByRole('banner')
    const main = getByRole('main')
    const aside = getByRole('complementary', { name: 'On this page' })
    const footer = getByRole('contentinfo')
    const nav = getByRole('navigation', { name: 'Components' })
    const order = [banner, nav, main, aside, footer].map(el => Array.from(container.querySelectorAll('*')).indexOf(el))
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('footer')).toHaveLength(1)
  })

  test('the skip link is first and moves focus to main', async () => {
    const { getByRole } = render(<Shell />)
    await userEvent.keyboard('{Tab}')
    const skip = getByRole('link', { name: 'Skip to main content' })
    expect(document.activeElement).toBe(skip)
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(document.activeElement).toBe(getByRole('main')))
  })

  test('mainId and skipLinkLabel', () => {
    const { getByRole } = render(<Shell mainId="content" skipLinkLabel="Skip to content" />)
    expect(getByRole('main').id).toBe('content')
    expect(getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#content')
  })

  test('an aside without a label warns in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Shell asideLabel={undefined} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('asideLabel'))
    warn.mockRestore()
  })
})

describe('AppShell layout', () => {
  const box = (el: Element) => el.getBoundingClientRect()

  test('from 1024px: sidebar, main and aside side by side', async () => {
    await page.viewport(1280, 800)
    const { getByRole, container } = render(<Shell />)
    const sidebar = box(container.querySelector('.app-shell__sidebar')!)
    const main = box(getByRole('main'))
    const aside = box(getByRole('complementary'))
    expect(sidebar.right).toBeLessThanOrEqual(main.left + 1)
    expect(main.right).toBeLessThanOrEqual(aside.left + 1)
    expect(main.top).toBe(aside.top)
    expect(aside.width).toBe(320)
  })

  test('below 1024px: one column, aside after main', async () => {
    await page.viewport(400, 800)
    const { getByRole } = render(<Shell />)
    const main = box(getByRole('main'))
    const aside = box(getByRole('complementary'))
    expect(aside.top).toBeGreaterThanOrEqual(main.bottom - 1)
    expect(main.width).toBe(400)
  })

  test('the footer sits at the bottom of a short page', async () => {
    await page.viewport(1280, 800)
    const { getByRole } = render(
      <SideNavProvider><AppShell footer={<p>© 2026</p>}><p>Short</p></AppShell></SideNavProvider>,
    )
    expect(Math.round(box(getByRole('contentinfo')).bottom)).toBe(800)
  })

  test('a sticky header: the sidebar sticks just below it', async () => {
    await page.viewport(1280, 800)
    const { container, getByRole } = render(<Shell sticky />)
    const header = getByRole('banner')
    const sidebar = container.querySelector('.app-shell__sidebar') as HTMLElement
    await waitFor(() => expect(getComputedStyle(sidebar).top).toBe(`${header.getBoundingClientRect().height}px`))
    window.scrollTo(0, 600)
    await waitFor(() => expect(Math.round(sidebar.getBoundingClientRect().top)).toBe(Math.round(header.getBoundingClientRect().bottom)))
    expect(Math.round(header.getBoundingClientRect().top)).toBe(0)
    window.scrollTo(0, 0)
  })

  test('a header that isn\'t sticky: the sidebar sticks to the top', async () => {
    await page.viewport(1280, 800)
    const { container } = render(<Shell />)
    const sidebar = container.querySelector('.app-shell__sidebar') as HTMLElement
    await waitFor(() => expect(getComputedStyle(sidebar).top).toBe('0px'))
  })

  test('with MobileNav, room at the bottom below 1024px only', async () => {
    await page.viewport(400, 800)
    const { container, rerender } = render(<Shell bottomNav={<MobileNav items={bottomItems} />} />)
    const footer = container.querySelector('.app-shell__footer') as HTMLElement
    const bar = container.querySelector('.mobile-nav') as HTMLElement
    expect(parseFloat(getComputedStyle(footer).paddingBottom)).toBeGreaterThanOrEqual(bar.getBoundingClientRect().height - 1)
    await page.viewport(1280, 800)
    rerender(<Shell bottomNav={<MobileNav items={bottomItems} />} />)
    expect(getComputedStyle(footer).paddingBottom).toBe('0px')
  })

  test('with a SideNav and NavigationMenu, a phone gets one menu button; TopNav alone brings its own', async () => {
    await page.viewport(400, 800)
    const { getAllByRole, unmount } = render(<Shell />)
    expect(getAllByRole('button').filter(b => b.getBoundingClientRect().width > 0 && /navigation|menu/i.test(b.getAttribute('aria-label') ?? ''))).toHaveLength(1)
    unmount()
    const top = render(<AppShell header={<TopNav brand={<a href="/">A</a>} items={navItems} sticky />}><p>x</p></AppShell>)
    expect(top.getAllByRole('button', { name: 'Menu' }).filter(b => b.getBoundingClientRect().width > 0)).toHaveLength(1)
  })

  test('a sticky TopNav works inside the shell (display: contents wrapper)', async () => {
    await page.viewport(1280, 800)
    const { getByRole } = render(
      <AppShell header={<TopNav brand={<a href="/">A</a>} items={navItems} sticky />}>
        {Array.from({ length: 60 }, (_, i) => <p key={i}>Line {i}</p>)}
      </AppShell>,
    )
    window.scrollTo(0, 500)
    await waitFor(() => expect(Math.round(getByRole('banner').getBoundingClientRect().top)).toBe(0))
    window.scrollTo(0, 0)
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(<AppShell className="extra" data-x="1" ref={n => { node = n }}><p>x</p></AppShell>)
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toBe('app-shell extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})
