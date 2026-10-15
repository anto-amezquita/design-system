/**
 * TopNav: a header with brand, NavigationMenu (1024px and up) and actions;
 * below 1024px a Menu button opens a Drawer with the same items. One "Main"
 * navigation at a time. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render, within } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { TopNav } from './TopNav'
import type { NavItem } from '../../../lib/navigation'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const items: NavItem[] = [
  // In-page links, so following one doesn't navigate the test frame away.
  { id: 'a', label: 'Overview', href: '#overview' },
  { id: 'g', label: 'Components', items: [{ id: 'i', label: 'Inputs', href: '#inputs' }, { id: 'o', label: 'Overlays', href: '#overlays' }] },
  { id: 't', label: 'Tokens', href: '#tokens' },
]

const ui = () => <TopNav brand={<a href="#home">Brand</a>} items={items} currentHref="#inputs" actions={<button>Search</button>} />
const visibleNavs = () => [...document.querySelectorAll('nav')].filter(n => n.checkVisibility())

describe('TopNav', () => {
  test('wide: a header with the brand, one visible Main navigation and the actions; no Menu button', async () => {
    await page.viewport(1200, 600)
    const { getByRole, queryByRole } = render(ui())
    expect(getByRole('banner')).toBeTruthy()
    expect(visibleNavs().map(n => n.getAttribute('aria-label'))).toEqual(['Main'])
    expect(getByRole('button', { name: 'Search' })).toBeTruthy()
    // Hidden with display: none, so it's out of the accessibility tree too.
    expect(queryByRole('button', { name: 'Menu' })).toBeNull()
  })

  test('narrow: the Menu button opens a drawer with the same links, the current one marked', async () => {
    await page.viewport(400, 700)
    const { getByRole } = render(ui())
    expect(visibleNavs()).toHaveLength(0)
    await userEvent.click(getByRole('button', { name: 'Menu' }))
    const dialog = await vi.waitFor(() => within(document.body).getByRole('dialog', { name: 'Main' }))
    const nav = within(dialog).getByRole('navigation', { name: 'Main' })
    expect(within(nav).getAllByRole('link').map(a => a.textContent)).toEqual(['Overview', 'Inputs', 'Overlays', 'Tokens'])
    expect(within(nav).getByRole('link', { name: 'Inputs' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('list', { name: 'Components' })).toBeTruthy()
    expect(visibleNavs()).toHaveLength(1)
  })

  test('following a link in the drawer closes it', async () => {
    await page.viewport(400, 700)
    const { getByRole } = render(ui())
    await userEvent.click(getByRole('button', { name: 'Menu' }))
    const dialog = await vi.waitFor(() => within(document.body).getByRole('dialog', { name: 'Main' }))
    await userEvent.click(within(dialog).getByRole('link', { name: 'Tokens' }))
    await vi.waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull())
  })

  test('sticky keeps it at the top', async () => {
    await page.viewport(1200, 600)
    const { getByRole } = render(<TopNav brand="Brand" items={items} sticky />)
    expect(getComputedStyle(getByRole('banner')).position).toBe('sticky')
  })
})
