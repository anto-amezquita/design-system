/**
 * Divider: semantics for screen readers, and a visible line drawn with the
 * brand's default border width and colour in every brand and mode. Runs in Chromium with
 * the real CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Divider } from './Divider'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Divider semantics', () => {
  test('separates content by default', () => {
    const { getByRole } = render(<Divider />)
    const el = getByRole('separator')
    expect(el.getAttribute('aria-orientation')).toBeNull()
  })

  test('vertical says so', () => {
    const { getByRole } = render(<Divider orientation="vertical" />)
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })

  test('decorative is hidden from the accessibility tree', () => {
    const { container, queryByRole } = render(<Divider decorative />)
    expect(queryByRole('separator')).toBeNull()
    expect(container.firstElementChild!.getAttribute('role')).toBe('none')
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLDivElement | null = null
    const { getByRole } = render(<Divider className="extra" data-x="1" ref={n => { node = n }} />)
    const el = getByRole('separator')
    expect(el.className).toBe('divider divider--horizontal extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Divider line', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: line in border-width-default and color-border-default`, () => {
        const { getAllByRole } = render(
          <div data-brand={brand} data-mode={mode} style={{ display: 'flex', blockSize: '40px', inlineSize: '200px' }}>
            <span data-probe style={{ borderStyle: 'solid', borderColor: 'var(--color-border-default)', borderWidth: 'var(--border-width-default)' }} />
            <div style={{ inlineSize: '100px' }}><Divider /></div>
            <Divider orientation="vertical" />
          </div>,
        )
        const probe = document.querySelector('[data-probe]')!
        const expected = getComputedStyle(probe).borderTopColor
        const width = getComputedStyle(probe).borderTopWidth
        const [horizontal, vertical] = getAllByRole('separator')

        const h = getComputedStyle(horizontal)
        expect(h.borderTopWidth).toBe(width)
        expect(h.borderTopColor).toBe(expected)
        expect(horizontal.getBoundingClientRect().width).toBe(100)
        expect(horizontal.getBoundingClientRect().height).toBe(parseFloat(width))

        const v = getComputedStyle(vertical)
        expect(v.borderLeftWidth).toBe(width)
        expect(v.borderLeftColor).toBe(expected)
        expect(vertical.getBoundingClientRect().height).toBe(40)
        expect(expected).not.toMatch(/rgba\(0, 0, 0, 0\)/)
        expect(parseFloat(width)).toBeGreaterThan(0)
      })
    }
  }
})
