/**
 * IconButton: named by its label, a 44px square (or a smaller square with a
 * 44px hit area), and Button's behaviour underneath. Runs in Chromium with
 * the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { IconButton } from './IconButton'

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
})
