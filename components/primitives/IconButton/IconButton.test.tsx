/**
 * IconButton: named by its label, a 44px square (or a smaller square with a
 * 44px hit area), and Button's behaviour underneath. Runs in Chromium with
 * the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../../../styles/brands/base-light.css?raw'
import baseDark from '../../../styles/brands/base-dark.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { IconButton } from './IconButton'
import { contrastOf } from '../../../lib/contrast-test-utils'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const Icon = () => <svg data-testid="icon" viewBox="0 0 10 10"><rect width="10" height="10" /></svg>

describe('IconButton', () => {
  test('the label is the accessible name; the icon is hidden', () => {
    const { getByRole, getByTestId } = render(<IconButton icon={<Icon />} label="Close" />)
    expect(getByRole('button', { name: 'Close' })).toBeTruthy()
    expect(getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  test('md is a 44px square with a 20px icon', () => {
    const { getByRole, getByTestId } = render(<IconButton icon={<Icon />} label="Search" />)
    const r = getByRole('button').getBoundingClientRect()
    expect([r.width, r.height]).toEqual([44, 44])
    expect(getByTestId('icon').getBoundingClientRect().width).toBe(20)
  })

  test('sm draws a 28px square but its hit area reaches 44px', () => {
    const { getByRole, getByTestId } = render(<div style={{ padding: 40 }}><IconButton size="sm" icon={<Icon />} label="Remove" /></div>)
    const button = getByRole('button')
    const r = button.getBoundingClientRect()
    expect([r.width, r.height]).toEqual([28, 28])
    expect(getByTestId('icon').getBoundingClientRect().width).toBe(16)
    // A point just outside the square, inside the 44px target, still lands on the button.
    const hit = document.elementFromPoint(r.left - 6, r.top + r.height / 2)
    expect(button.contains(hit)).toBe(true)
  })

  test('defaults to ghost; variant passes through', () => {
    const { getAllByRole } = render(
      <>
        <IconButton icon={<Icon />} label="a" />
        <IconButton icon={<Icon />} label="b" variant="primary" />
      </>,
    )
    const [ghost, primary] = getAllByRole('button')
    expect(ghost.className).toContain('button--ghost')
    expect(primary.className).not.toContain('button--ghost')
  })

  test('disabled and loading block the click; loading sets aria-busy', () => {
    const onClick = vi.fn()
    const { getAllByRole } = render(
      <>
        <IconButton icon={<Icon />} label="a" disabled onClick={onClick} />
        <IconButton icon={<Icon />} label="b" loading onClick={onClick} />
      </>,
    )
    const [disabled, loading] = getAllByRole('button')
    disabled.click()
    loading.click()
    expect(onClick).not.toHaveBeenCalled()
    expect(loading.getAttribute('aria-busy')).toBe('true')
  })

  test('href renders a link with the same name', () => {
    const { getByRole } = render(<IconButton icon={<Icon />} label="Settings" href="/settings" />)
    expect(getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe('/settings')
  })

  test('disabled is not faded: the icon stays at 4.5:1 in every variant, brand and mode', () => {
    const style = document.createElement('style')
    style.textContent = baseDark + portfolio + demoCool + demoWarm + demoSoft
    document.head.append(style)
    const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft']
    const { getAllByRole } = render(<>
      {brands.flatMap(b => (['light', 'dark'] as const).map(m => (
        <div key={`${b}${m}`} data-brand={b} data-mode={m} style={{ background: 'var(--color-surface-primary)' }}>
          <IconButton icon={<Icon />} label="Primary" disabled />
          <IconButton icon={<Icon />} label="Secondary" variant="secondary" disabled />
          <IconButton icon={<Icon />} label="Ghost" variant="ghost" disabled />
        </div>
      )))}
    </>)
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(30)
    for (const b of buttons) {
      expect(getComputedStyle(b).opacity).toBe('1')
      expect(contrastOf(b)).toBeGreaterThanOrEqual(4.5)
    }
    style.remove()
  })
})
