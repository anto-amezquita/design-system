/**
 * Text: each size, tone and weight is the brand's own type role, secondary
 * text stays 4.5:1 on every page surface, and truncation cuts off visually
 * while the full text stays in the page. Runs in Chromium with the real CSS,
 * so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Text } from './Text'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const long = 'Every colour, size and space comes from a token, so a brand is a thin skin over the same components, and an agent can read the rules instead of guessing them.'

describe('Text semantics', () => {
  test('a paragraph by default', () => {
    const { container } = render(<Text>Hello</Text>)
    expect(container.firstElementChild!.tagName).toBe('P')
  })

  test('renders the element asked for; em keeps its italics', () => {
    const { container } = render(<div><Text as="span">a</Text><Text as="em">b</Text><Text as="strong">c</Text></div>)
    const [span, em, strong] = Array.from(container.firstElementChild!.children)
    expect(span.tagName).toBe('SPAN')
    expect(getComputedStyle(em).fontStyle).toBe('italic')
    expect(strong.tagName).toBe('STRONG')
  })

  test('passes className, style, data attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(<Text className="extra" data-x="1" style={{ maxInlineSize: '10px' }} ref={n => { node = n }}>x</Text>)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('text text--body text--tone-primary extra')
    expect(el.dataset.x).toBe('1')
    expect(el.style.maxInlineSize).toBe('10px')
    expect(node).toBe(el)
  })

  test('inherit takes the parent\'s colour', () => {
    const { container } = render(<div style={{ color: 'rgb(1, 2, 3)' }}><Text tone="inherit">x</Text></div>)
    expect(getComputedStyle(container.querySelector('.text')!).color).toBe('rgb(1, 2, 3)')
  })
})

describe('Text truncation', () => {
  test('truncate cuts to one line with an ellipsis; the full text stays in the page', () => {
    const { container } = render(<div style={{ inlineSize: '200px' }}><Text truncate>{long}</Text></div>)
    const el = container.querySelector('.text') as HTMLElement
    expect(getComputedStyle(el).textOverflow).toBe('ellipsis')
    expect(el.getBoundingClientRect().height).toBe(parseFloat(getComputedStyle(el).lineHeight))
    expect(el.scrollWidth).toBeGreaterThan(el.clientWidth)
    expect(el.textContent).toBe(long)
  })

  test('a number clamps to that many lines', () => {
    const { container } = render(<div style={{ inlineSize: '200px' }}><Text truncate={3}>{long}</Text></div>)
    const el = container.querySelector('.text') as HTMLElement
    expect(el.getBoundingClientRect().height).toBeCloseTo(3 * parseFloat(getComputedStyle(el).lineHeight), 0)
    expect(el.textContent).toBe(long)
  })

  test('false, 0 and negative numbers don\'t truncate', () => {
    const { container } = render(<div><Text truncate={0}>a</Text><Text truncate={-2}>b</Text></div>)
    for (const el of Array.from(container.querySelectorAll('.text'))) expect(el.className).toBe('text text--body text--tone-primary')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const sizes = ['body', 'small', 'caption'] as const

describe('Text follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: sizes, weights and tones are the type and colour roles`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {sizes.map(size => (
              <div key={size}>
                <span data-probe={size} style={{ fontSize: `var(--font-size-${size})`, lineHeight: `var(--line-height-${size})` }} />
                <Text size={size} data-text={size}>x</Text>
              </div>
            ))}
            <span data-probe="fonts" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-body)', color: 'var(--color-text-primary)' }} />
            <span data-probe="label" style={{ fontWeight: 'var(--font-weight-label)', color: 'var(--color-text-secondary)' }} />
            <Text weight="label" tone="secondary" data-text="label">x</Text>
          </div>,
        )
        const cs = (sel: string) => getComputedStyle(container.querySelector(sel)!)
        for (const size of sizes) {
          expect(cs(`[data-text="${size}"]`).fontSize, size).toBe(cs(`[data-probe="${size}"]`).fontSize)
          expect(cs(`[data-text="${size}"]`).lineHeight, size).toBe(cs(`[data-probe="${size}"]`).lineHeight)
        }
        expect(cs('[data-text="body"]').fontFamily).toBe(cs('[data-probe="fonts"]').fontFamily)
        expect(cs('[data-text="body"]').fontWeight).toBe(cs('[data-probe="fonts"]').fontWeight)
        expect(cs('[data-text="body"]').color).toBe(cs('[data-probe="fonts"]').color)
        expect(cs('[data-text="label"]').fontWeight).toBe(cs('[data-probe="label"]').fontWeight)
        expect(cs('[data-text="label"]').color).toBe(cs('[data-probe="label"]').color)
      })

      test(`${brand ?? 'base'} ${mode}: primary and secondary at every size are 4.5:1 on the page surfaces`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {(['primary', 'secondary', 'tertiary'] as const).map(surface => (
              <div key={surface} style={{ background: `var(--color-surface-${surface})` }}>
                {sizes.flatMap(size => (['primary', 'secondary'] as const).map(tone => (
                  <Text key={size + tone} size={size} tone={tone} data-c={`${surface} ${size} ${tone}`}>x</Text>
                )))}
              </div>
            ))}
          </div>,
        )
        for (const el of Array.from(container.querySelectorAll('[data-c]'))) {
          expect(contrastOf(el), el.getAttribute('data-c')!).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }
})
