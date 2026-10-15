/**
 * MobileNav: a fixed bottom bar of links with icons and labels; the
 * current one has aria-current="page"; badges are read after the label;
 * it hides from 1024px unless alwaysVisible. Runs in Chromium with real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { page } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { MobileNav } from './MobileNav'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const items = [
  { id: 'h', label: 'Home', href: '#h', icon: <svg /> },
  { id: 'm', label: 'Messages', href: '#m', icon: <svg />, badge: 3 },
  { id: 'p', label: 'Profile', href: '#p', icon: <svg />, badge: 0 },
  { id: 'n', label: 'News', href: '#n', icon: <svg />, badge: 140, badgeLabel: (n: number) => `${n} unread` },
]

describe('MobileNav', () => {
  test('a named nav with links named by label and badge; the current one marked', async () => {
    await page.viewport(400, 700)
    const { getByRole, getAllByRole } = render(<MobileNav items={items} currentHref="#m" />)
    expect(getByRole('navigation', { name: 'Main' })).toBeTruthy()
    expect(getAllByRole('link').map(a => a.textContent)).toEqual(['Home', '3Messages (3 new)', 'Profile', '99+News (140 unread)'])
    expect(getByRole('link', { name: 'Messages (3 new)' }).getAttribute('aria-current')).toBe('page')
    expect(getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull()
  })

  test('the icon and the visible count are hidden; the label and spoken count carry it', async () => {
    await page.viewport(400, 700)
    const { container } = render(<MobileNav items={items} />)
    for (const icon of container.querySelectorAll('.mobile-nav__icon')) expect(icon.getAttribute('aria-hidden')).toBe('true')
  })

  test('fixed to the bottom, every link at least 44px tall', async () => {
    await page.viewport(400, 700)
    const { getByRole, getAllByRole } = render(<MobileNav items={items} />)
    const nav = getByRole('navigation')
    expect(getComputedStyle(nav).position).toBe('fixed')
    expect(Math.round(nav.getBoundingClientRect().bottom)).toBe(700)
    for (const a of getAllByRole('link')) expect(a.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
  })

  test('hidden from 1024px up, unless alwaysVisible', async () => {
    await page.viewport(1200, 700)
    const { container, rerender } = render(<MobileNav items={items} />)
    expect(container.querySelector('nav')!.checkVisibility()).toBe(false)
    rerender(<MobileNav items={items} alwaysVisible />)
    expect(container.querySelector('nav')!.checkVisibility()).toBe(true)
  })
})
