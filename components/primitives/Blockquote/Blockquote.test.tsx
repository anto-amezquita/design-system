/**
 * Blockquote: the quote is a blockquote, the attribution sits outside it in
 * a figcaption (so it isn't read as part of the quote), the source is a
 * cite, and text stays readable in every brand and mode. Runs in Chromium
 * with the real CSS, so the cascade decides.
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
import { Blockquote } from './Blockquote'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Blockquote semantics', () => {
  test('a bare quote is just a blockquote', () => {
    const { container } = render(<Blockquote>Less, but better.</Blockquote>)
    const q = container.firstElementChild!
    expect(q.tagName).toBe('BLOCKQUOTE')
    expect(container.querySelector('figure')).toBeNull()
  })

  test('attribution and source go in a figcaption outside the quote; source is a cite', () => {
    const { container } = render(
      <Blockquote attribution="Dieter Rams" source="Ten principles for good design" cite="https://example.com/rams">
        Less, but better.
      </Blockquote>,
    )
    const figure = container.querySelector('figure')!
    const quote = figure.querySelector('blockquote')!
    expect(quote.textContent).toBe('Less, but better.')
    expect(quote.getAttribute('cite')).toBe('https://example.com/rams')
    expect(figure.querySelector('figcaption')!.textContent).toBe('Dieter Rams, Ten principles for good design')
    expect(figure.querySelector('figcaption cite')!.textContent).toBe('Ten principles for good design')
    expect(quote.contains(figure.querySelector('figcaption'))).toBe(false)
  })

  test('attribution alone has no stray comma', () => {
    const { container } = render(<Blockquote attribution="Dieter Rams">Less, but better.</Blockquote>)
    expect(container.querySelector('figcaption')!.textContent).toBe('Dieter Rams')
  })

  test('passes className, data attributes and ref to the blockquote', () => {
    let node: HTMLQuoteElement | null = null
    const { container } = render(<Blockquote className="extra" data-x="1" attribution="A" ref={n => { node = n }}>q</Blockquote>)
    const q = container.querySelector('blockquote')!
    expect(q.className).toBe('blockquote blockquote--default extra')
    expect(q.dataset.x).toBe('1')
    expect(node).toBe(q)
  })
})

describe('Blockquote look', () => {
  test('default has a rule beside it; pull is larger, in the heading face, with no rule', () => {
    const { container } = render(
      <div>
        <Blockquote data-q="default">q</Blockquote>
        <Blockquote size="pull" data-q="pull">q</Blockquote>
        <span data-probe style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--font-size-h4)', borderStyle: 'solid', borderWidth: 'var(--border-width-thick)', borderColor: 'var(--color-border-strong)' }} />
      </div>,
    )
    const cs = (s: string) => getComputedStyle(container.querySelector(s)!)
    expect(cs('[data-q="default"]').borderInlineStartWidth).toBe(cs('[data-probe]').borderTopWidth)
    expect(cs('[data-q="default"]').borderInlineStartColor).toBe(cs('[data-probe]').borderTopColor)
    expect(cs('[data-q="pull"]').borderInlineStartWidth).toBe('0px')
    expect(cs('[data-q="pull"]').fontFamily).toBe(cs('[data-probe]').fontFamily)
    expect(cs('[data-q="pull"]').fontSize).toBe(cs('[data-probe]').fontSize)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Blockquote follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: quote and caption 4.5:1 on the page surfaces`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {(['primary', 'secondary'] as const).map(s => (
              <div key={s} style={{ background: `var(--color-surface-${s})` }}>
                <Blockquote attribution="Dieter Rams" source="Ten principles">Less, but better.</Blockquote>
                <Blockquote size="pull" attribution="Dieter Rams">Less, but better.</Blockquote>
              </div>
            ))}
          </div>,
        )
        for (const el of Array.from(container.querySelectorAll('blockquote, figcaption'))) {
          expect(contrastOf(el), el.tagName).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }
})
