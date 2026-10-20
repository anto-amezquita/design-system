/**
 * Section: content centred at the brand's container widths, the page gutter
 * per breakpoint, space above and below from the spacing roles, and text that
 * stays readable on the subtle band in every brand and mode. Runs in Chromium
 * with the real CSS, so the cascade and the media queries decide.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { page } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Section } from './Section'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

/** Resolves a token to px in the current context. */
function px(token: string, within: Element = document.body) {
  const probe = document.createElement('div')
  probe.style.inlineSize = `var(${token})`
  probe.style.position = 'absolute'
  within.append(probe)
  const w = probe.getBoundingClientRect().width
  probe.remove()
  return w
}

describe('Section width', () => {
  for (const [width, token] of [['text', '--size-container-text'], ['media', '--size-container-media'], ['wide', '--size-container-wide'], ['page', '--size-container-page']] as const) {
    test(`${width}: content capped at ${token}, centred`, async () => {
      await page.viewport(1600, 800)
      const { container } = render(<Section width={width}>content</Section>)
      const section = container.firstElementChild!
      const inner = section.firstElementChild!
      const r = inner.getBoundingClientRect()
      const outer = section.getBoundingClientRect()
      const gutter = px('--space-container-padding')
      expect(r.width).toBeCloseTo(Math.min(px(token), outer.width - 2 * gutter), 0)
      expect(r.left - outer.left).toBeCloseTo(outer.right - r.right, 0)
    })
  }

  test('full: content runs to the gutters', async () => {
    await page.viewport(1600, 800)
    const { container } = render(<Section width="full">content</Section>)
    const section = container.firstElementChild!
    expect(section.firstElementChild!.getBoundingClientRect().width)
      .toBeCloseTo(section.getBoundingClientRect().width - 2 * px('--space-container-padding'), 0)
  })
})

describe('Section gutter and spacing', () => {
  test('phone gutter is the element gap; tablet and up, the container padding', async () => {
    await page.viewport(400, 800)
    const { container, rerender } = render(<Section>content</Section>)
    expect(parseFloat(getComputedStyle(container.firstElementChild!).paddingInlineStart)).toBeCloseTo(px('--space-element-gap'), 1)
    await page.viewport(800, 800)
    rerender(<Section>content</Section>)
    expect(parseFloat(getComputedStyle(container.firstElementChild!).paddingInlineStart)).toBeCloseTo(px('--space-container-padding'), 1)
  })

  for (const [spacing, token] of [['section', '--space-section-gap'], ['component', '--space-component-gap']] as const) {
    test(`spacing ${spacing}: ${token} above and below`, async () => {
      await page.viewport(1280, 800)
      const { container } = render(<Section spacing={spacing}>content</Section>)
      const s = getComputedStyle(container.firstElementChild!)
      expect(parseFloat(s.paddingBlockStart)).toBeCloseTo(px(token), 1)
      expect(parseFloat(s.paddingBlockEnd)).toBeCloseTo(px(token), 1)
    })
  }

  test('spacing none: no space above or below', () => {
    const { container } = render(<Section spacing="none">content</Section>)
    expect(getComputedStyle(container.firstElementChild!).paddingBlockStart).toBe('0px')
  })
})

describe('Section semantics', () => {
  test('a section named by its heading is a region landmark', () => {
    const { getByRole } = render(
      <Section aria-labelledby="pricing"><h2 id="pricing">Pricing</h2></Section>,
    )
    expect(getByRole('region', { name: 'Pricing' }).tagName).toBe('SECTION')
  })

  test('renders the element asked for, and passes attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(<Section as="footer" className="extra" data-x="1" ref={n => { node = n }}>x</Section>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('FOOTER')
    expect(el.className).toBe('section section--spacing-section section--tone-default extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Section subtle tone', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: secondary surface; primary and secondary text 4.5:1 on it`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            <span data-probe style={{ background: 'var(--color-surface-secondary)' }} />
            <Section tone="subtle">
              <p data-text="primary" style={{ color: 'var(--color-text-primary)' }}>Primary</p>
              <p data-text="secondary" style={{ color: 'var(--color-text-secondary)' }}>Secondary</p>
            </Section>
          </div>,
        )
        const section = container.querySelector('.section')!
        expect(getComputedStyle(section).backgroundColor)
          .toBe(getComputedStyle(container.querySelector('[data-probe]')!).backgroundColor)
        expect(contrastOf(container.querySelector('[data-text="primary"]')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('[data-text="secondary"]')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
