/**
 * Citation: a link whose name says it's a source and which one, a new tab
 * announced, a visible focus ring, and the marker at 4.5:1 on its chip in
 * every brand and mode. Runs in Chromium with the real CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Citation } from './Citation'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Citation semantics', () => {
  test('numbered: shows the number; the link is named as a source with its title', () => {
    const { getByRole } = render(<Citation href="#source-1" index={1} title="Brand guidelines, 2026" />)
    const link = getByRole('link', { name: 'Source 1: Brand guidelines, 2026' })
    expect(link.getAttribute('href')).toBe('#source-1')
    expect(link.textContent).toBe('1')
    expect(link.className).toBe('citation citation--number')
  })

  test('source chip: shows the source name, which is inside the link\'s name', () => {
    const { getByRole } = render(<Citation href="https://en.wikipedia.org/wiki/Bauhaus" source="Wikipedia" title="Bauhaus" />)
    const link = getByRole('link', { name: 'Source Wikipedia: Bauhaus' })
    expect(link.textContent).toBe('Wikipedia')
  })

  test('external opens a new tab safely and says so', () => {
    const { getByRole } = render(<Citation href="https://example.com" index={2} title="Report" external rel="nofollow" />)
    const link = getByRole('link', { name: 'Source 2: Report (opens in a new tab)' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer nofollow')
  })

  test('same tab by default', () => {
    const { getByRole } = render(<Citation href="#s" index={1} title="T" />)
    expect(getByRole('link').getAttribute('target')).toBeNull()
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLAnchorElement | null = null
    const { getByRole } = render(<Citation href="#s" index={1} title="T" className="extra" data-x="1" ref={n => { node = n }} />)
    const link = getByRole('link')
    expect(link.className).toBe('citation citation--number extra')
    expect(link.dataset.x).toBe('1')
    expect(node).toBe(link)
  })

  test('keyboard focus shows the focus ring', async () => {
    const { getByRole } = render(<Citation href="#s" index={1} title="T" />)
    await userEvent.keyboard('{Tab}')
    const link = getByRole('link')
    expect(document.activeElement).toBe(link)
    expect(getComputedStyle(link).outlineStyle).toBe('solid')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Citation follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: marker 4.5:1 on its chip, at rest and on hover`, async () => {
        const { getAllByRole } = render(
          <p data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            A claim<Citation href="#s1" index={1} title="One" />
            and another<Citation href="#s2" source="Wikipedia" title="Two" />
          </p>,
        )
        const [a, b] = getAllByRole('link')
        expect(contrastOf(a)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(b)).toBeGreaterThanOrEqual(4.5)
        await userEvent.hover(a)
        expect(contrastOf(a)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
