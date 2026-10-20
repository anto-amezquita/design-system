/**
 * DescriptionList: a dl whose terms and values screen readers pair up,
 * side by side when there's room and stacked when there isn't, several
 * values per term, dividers in the border colour, and text readable in
 * every brand and mode. Runs in Chromium with the real CSS.
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
import { DescriptionList, type DescriptionListEntry } from './DescriptionList'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const items: DescriptionListEntry[] = [
  { term: 'Status', description: 'Published' },
  { term: 'Authors', description: ['Antonio Amézquita', 'Claude'] },
  { term: 'Licence', description: 'MIT' },
]

describe('DescriptionList semantics', () => {
  test('a dl of dt/dd pairs, each pair in a div; several values give several dd', () => {
    const { container } = render(<DescriptionList items={items} />)
    const dl = container.querySelector('dl')!
    const groups = Array.from(dl.children)
    expect(groups.map(g => g.tagName)).toEqual(['DIV', 'DIV', 'DIV'])
    expect(groups.map(g => Array.from(g.children).map(c => c.tagName).join(' '))).toEqual(['DT DD', 'DT DD DD', 'DT DD'])
    expect(groups[1].querySelectorAll('dd')[1].textContent).toBe('Claude')
  })

  test('screen readers get terms and definitions', () => {
    const { getAllByRole } = render(<DescriptionList items={items} />)
    expect(getAllByRole('term').map(t => t.textContent)).toEqual(['Status', 'Authors', 'Licence'])
    expect(getAllByRole('definition')).toHaveLength(4)
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLDListElement | null = null
    const { container } = render(<DescriptionList items={items} className="extra" data-x="1" ref={n => { node = n }} />)
    const dl = container.querySelector('dl')!
    expect(dl.className).toBe('description-list description-list--inline extra')
    expect(dl.dataset.x).toBe('1')
    expect(node).toBe(dl)
  })
})

describe('DescriptionList layout', () => {
  const box = (el: Element) => el.getBoundingClientRect()

  test('inline: side by side when 30rem or wider, values stacked in the second column', () => {
    const { container } = render(<div style={{ inlineSize: '600px' }}><DescriptionList items={items} /></div>)
    const authors = container.querySelectorAll('.description-list__group')[1]
    const dt = box(authors.querySelector('dt')!)
    const [dd1, dd2] = Array.from(authors.querySelectorAll('dd')).map(box)
    expect(dd1.left).toBeGreaterThan(dt.right)
    expect(dd2.left).toBe(dd1.left)
    expect(dd2.top).toBeGreaterThan(dd1.top)
    expect(dt.width).toBeLessThanOrEqual(600 / 3 + 1)
    // The pair is only as tall as its values, not stretched by implicit rows.
    expect(box(authors).height).toBeCloseTo(dd2.bottom - dd1.top, 0)
  })

  test('inline: stacked in a container narrower than 30rem', () => {
    const { container } = render(<div style={{ inlineSize: '300px' }}><DescriptionList items={items} /></div>)
    const g = container.querySelector('.description-list__group')!
    expect(box(g.querySelector('dd')!).top).toBeGreaterThan(box(g.querySelector('dt')!).bottom - 1)
  })

  test('stacked: term above value at any width', () => {
    const { container } = render(<div style={{ inlineSize: '800px' }}><DescriptionList items={items} layout="stacked" /></div>)
    const g = container.querySelector('.description-list__group')!
    expect(box(g.querySelector('dd')!).left).toBe(box(g.querySelector('dt')!).left)
  })

  test('long values wrap instead of overflowing', () => {
    const { container } = render(
      <div style={{ inlineSize: '320px' }}><DescriptionList items={[{ term: 'File', description: 'brand-brief-final-final-v3-approved-for-real-this-time.pdf' }]} /></div>,
    )
    const dl = container.querySelector('dl')!
    expect(dl.scrollWidth).toBeLessThanOrEqual(dl.clientWidth)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('DescriptionList follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: divider is the border role; terms and values 4.5:1 on the page surfaces`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            <span data-probe style={{ borderStyle: 'solid', borderWidth: 'var(--border-width-default)', borderColor: 'var(--color-border-default)' }} />
            {(['primary', 'secondary'] as const).map(s => (
              <div key={s} style={{ background: `var(--color-surface-${s})` }}>
                <DescriptionList items={items} divided />
              </div>
            ))}
          </div>,
        )
        const probe = getComputedStyle(container.querySelector('[data-probe]')!)
        const second = getComputedStyle(container.querySelector('.description-list__group + .description-list__group')!)
        expect(second.borderTopColor).toBe(probe.borderTopColor)
        expect(second.borderTopWidth).toBe(probe.borderTopWidth)
        for (const el of Array.from(container.querySelectorAll('dt, dd'))) expect(contrastOf(el), el.tagName).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
