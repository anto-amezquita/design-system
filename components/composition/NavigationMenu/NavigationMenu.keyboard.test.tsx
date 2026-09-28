/**
 * Contract test: NavigationMenu's keyboard open/close, its current-page
 * marking, and the CSS switch at breakpoint.desktop. Keyboard behaviour is
 * Radix's, but the wiring that makes it reachable (a real trigger, content
 * inside the item, links that take Radix's roving focus through asChild) is
 * this repo's, and a screenshot can't show any of it.
 */

import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { page, userEvent } from 'vitest/browser'
import '../../../styles/brands/base-light.css'
import type { NavItem } from '../../../lib/navigation'
import { NavigationMenu } from './NavigationMenu'

const items: NavItem[] = [
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

describe('NavigationMenu at desktop width', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800)
  })

  test('keyboard: Enter opens a group, Tab reaches its links, Escape closes and returns focus', async () => {
    render(<NavigationMenu items={items} />)
    const trigger = page.getByRole('button', { name: 'Writing' })

    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Work' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(trigger).toHaveFocus()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.keyboard('{Enter}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.element(page.getByRole('link', { name: 'Essays' })).toBeVisible()

    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Essays' })).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect.element(trigger).toHaveFocus()
    await expect.element(page.getByRole('link', { name: 'Essays' })).not.toBeInTheDocument()
  })

  test('currentHref sets aria-current on the exact link and marks its group', async () => {
    render(<NavigationMenu items={items} currentHref="/writing/notes" />)
    const trigger = page.getByRole('button', { name: 'Writing' })
    await expect.element(trigger).toHaveClass('navigation-menu__trigger--active')
    await expect.element(page.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current')

    await trigger.click()
    await expect.element(page.getByRole('link', { name: 'Notes' })).toHaveAttribute('aria-current', 'page')
    await expect.element(page.getByRole('link', { name: 'Essays' })).not.toHaveAttribute('aria-current')
  })

  test('the <nav> is named, and className and ref pass through', async () => {
    let navEl: HTMLElement | null = null
    render(<NavigationMenu items={items} className="site-nav" ref={el => { navEl = el }} />)
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect.element(nav).toBeVisible()
    await expect.element(nav).toHaveClass('navigation-menu')
    await expect.element(nav).toHaveClass('site-nav')
    expect(navEl).toBe(nav.element())
  })
})

describe('NavigationMenu below desktop width', () => {
  beforeEach(async () => {
    await page.viewport(1023, 800)
  })
  afterEach(async () => {
    await page.viewport(1280, 800)
  })

  test('is hidden at 1023px (SideNav’s drawer carries the items there)', async () => {
    render(<NavigationMenu items={items} />)
    await expect.element(page.getByRole('navigation', { name: 'Main', includeHidden: true })).not.toBeVisible()
  })
})
