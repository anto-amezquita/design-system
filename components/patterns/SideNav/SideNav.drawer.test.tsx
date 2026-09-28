/**
 * Contract tests for SideNav's mobile drawer and its wiring to SideNavTrigger
 * — the part of this component that's this repo's own logic rather than
 * Radix's. Focus handling when a side panel opens from a hamburger is the
 * open accessibility issue in Carbon's tracker that this design was checked
 * against (specs/navigation-components-spec.md), so it's pinned here with
 * real keyboard and pointer input (vitest/browser, backed by Playwright).
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'
import '../../../styles/brands/base-light.css'
import type { NavItem } from '../../../lib/navigation'
import { SideNav, SideNavProvider, SideNavTrigger } from './SideNav'

const items: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/app' },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'monthly', label: 'Monthly', href: '/app/reports/monthly' },
      { id: 'team', label: 'By team', href: '/app/reports/team' },
    ],
  },
  { id: 'settings', label: 'Settings', href: '/app/settings' },
]

const headerItems: NavItem[] = [
  { id: 'work', label: 'Work', href: '/work' },
  { id: 'about', label: 'About', href: '/about' },
]

function Shell(props: Partial<React.ComponentProps<typeof SideNav>>) {
  return (
    <SideNavProvider>
      <header><SideNavTrigger /></header>
      <SideNav items={items} headerItems={headerItems} {...props} />
      <main id="main-content">Content</main>
    </SideNavProvider>
  )
}

describe('SideNav below desktop width (drawer)', () => {
  beforeEach(async () => {
    await page.viewport(800, 800)
  })
  afterEach(async () => {
    await page.viewport(1280, 800)
  })

  test('the trigger opens the drawer and focus lands on the first link', async () => {
    render(<Shell />)
    const trigger = page.getByRole('button', { name: 'Open navigation' })
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    // The inline nav is hidden here; the drawer isn't mounted yet.
    await expect.element(page.getByRole('navigation', { name: 'Section', includeHidden: true })).not.toBeVisible()

    // Held as a DOM node: while the modal drawer is open, Radix hides
    // everything outside it from the accessibility tree, trigger included.
    const triggerEl = trigger.element()
    await trigger.click()
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
    expect(triggerEl).toHaveAttribute('aria-expanded', 'true')
    // headerItems come first in the drawer, so the first link is a header link.
    await expect.element(page.getByRole('link', { name: 'Work' })).toHaveFocus()
    // aria-controls points at the <nav> inside the drawer.
    const controls = triggerEl.getAttribute('aria-controls')!
    expect(document.getElementById(controls)?.tagName).toBe('NAV')
  })

  test('Escape closes the drawer and focus returns to the trigger', async () => {
    render(<Shell />)
    const trigger = page.getByRole('button', { name: 'Open navigation' })
    await trigger.click()
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    await expect.element(trigger).toHaveFocus()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('the drawer also opens from the keyboard, and Tab moves through its links', async () => {
    render(<Shell />)
    ;(page.getByRole('button', { name: 'Open navigation' }).element() as HTMLElement).focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('link', { name: 'Work' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'About' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Overview' })).toHaveFocus()
  })

  test('headerItems render only in the drawer, above items, with a separator', async () => {
    render(<Shell />)
    // Before opening: no header link anywhere in the document.
    await expect.element(page.getByRole('link', { name: 'Work', includeHidden: true })).not.toBeInTheDocument()

    await page.getByRole('button', { name: 'Open navigation' }).click()
    const drawerNav = page.getByRole('dialog').getByRole('navigation')
    const links = drawerNav.getByRole('link').elements().map(el => el.textContent)
    expect(links.slice(0, 3)).toEqual(['Work', 'About', 'Overview'])
    await expect.element(drawerNav.getByRole('separator')).toBeInTheDocument()
  })

  test('choosing a link closes the drawer', async () => {
    render(<Shell />)
    await page.getByRole('button', { name: 'Open navigation' }).click()
    const settings = page.getByRole('dialog').getByRole('link', { name: 'Settings' })
    // Keep the test page where it is.
    settings.element().addEventListener('click', e => e.preventDefault())
    await settings.click()
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
  })

  test('growing the viewport past 1024px while open closes the drawer', async () => {
    render(<Shell />)
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()

    await page.viewport(1280, 800)
    await expect.element(page.getByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('navigation', { name: 'Section' })).toBeVisible()
  })
})

describe('SideNav at desktop width (inline)', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800)
  })

  test('currentHref sets aria-current, and the group holding it starts open', async () => {
    render(<Shell currentHref="/app/reports/team" />)
    const nav = page.getByRole('navigation', { name: 'Section' })
    await expect.element(nav.getByRole('link', { name: 'By team' })).toHaveAttribute('aria-current', 'page')
    await expect.element(nav.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
    await expect.element(nav.getByRole('button', { name: 'Reports' })).toHaveAttribute('aria-expanded', 'true')
  })

  test('a group toggles its links, and the trigger is hidden', async () => {
    render(<Shell />)
    const nav = page.getByRole('navigation', { name: 'Section' })
    const toggle = nav.getByRole('button', { name: 'Reports' })
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect.element(nav.getByRole('link', { name: 'Monthly', includeHidden: true })).not.toBeVisible()

    await toggle.click()
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect.element(nav.getByRole('link', { name: 'Monthly' })).toBeVisible()

    await expect.element(page.getByRole('button', { name: 'Open navigation', includeHidden: true })).not.toBeVisible()
  })

  test('layout="drawer-only" renders nothing inline', async () => {
    render(<Shell layout="drawer-only" />)
    await expect.element(page.getByRole('navigation', { name: 'Section', includeHidden: true })).not.toBeInTheDocument()
  })

  test('collapsed without an icon on every item warns and renders expanded', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Shell collapsed />)
    const nav = page.getByRole('navigation', { name: 'Section' })
    await expect.element(nav).not.toHaveClass('side-nav--collapsed')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[SideNav] collapsed is set'))
    warn.mockRestore()
  })

  test('collapsed with icons becomes a rail that keeps each label as the accessible name', async () => {
    const icon = <svg width="16" height="16" />
    const withIcons: NavItem[] = [
      { id: 'overview', label: 'Overview', href: '/app', icon },
      { id: 'settings', label: 'Settings', href: '/app/settings', icon },
    ]
    render(
      <SideNavProvider>
        <SideNav items={withIcons} collapsed currentHref="/app" />
      </SideNavProvider>,
    )
    const nav = page.getByRole('navigation', { name: 'Section' })
    await expect.element(nav).toHaveClass('side-nav--collapsed')
    await expect.element(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('SideNav outside its provider', () => {
  test('SideNav and SideNavTrigger throw a clear error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<SideNav items={items} />)).toThrow('must be inside <SideNavProvider>')
    expect(() => render(<SideNavTrigger />)).toThrow('must be inside <SideNavProvider>')
    error.mockRestore()
  })
})
