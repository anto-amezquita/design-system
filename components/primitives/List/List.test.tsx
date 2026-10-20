/**
 * List: list semantics that survive removing the markers, text lists that
 * keep theirs, ordered when asked, dividers in the border colour and gaps
 * from the spacing roles. Runs in Chromium with the real CSS.
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
import { List } from './List'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const three = [<li key="a">Alpha</li>, <li key="b">Beta</li>, <li key="c">Gamma</li>]

describe('List semantics', () => {
  test('a ul with role="list" and no markers by default', () => {
    const { getByRole, getAllByRole } = render(<List aria-label="Files">{three}</List>)
    const list = getByRole('list', { name: 'Files' })
    expect(list.tagName).toBe('UL')
    expect(list.getAttribute('role')).toBe('list')
    expect(getAllByRole('listitem')).toHaveLength(3)
    expect(getComputedStyle(list).listStyleType).toBe('none')
  })

  test('number renders an ol with numbers; bullet keeps discs; no extra role on either', () => {
    const { container } = render(<div><List marker="number">{three}</List><List marker="bullet">{three}</List></div>)
    const [ol, ul] = Array.from(container.querySelectorAll('.list'))
    expect(ol.tagName).toBe('OL')
    expect(getComputedStyle(ol).listStyleType).toBe('decimal')
    expect(getComputedStyle(ol.firstElementChild!).display).toBe('list-item')
    expect(ul.tagName).toBe('UL')
    expect(getComputedStyle(ul).listStyleType).toBe('disc')
    expect(ol.getAttribute('role')).toBeNull()
    expect(ul.getAttribute('role')).toBeNull()
  })

  test('ordered without numbers shown', () => {
    const { container } = render(<List ordered>{three}</List>)
    const ol = container.querySelector('ol')!
    expect(ol.getAttribute('role')).toBe('list')
    expect(getComputedStyle(ol).listStyleType).toBe('none')
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(<List className="extra" data-x="1" ref={n => { node = n }}>{three}</List>)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('list list--marker-none list--gap-none extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('List follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: dividers and gaps are their tokens; text 4.5:1`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <span data-probe style={{ borderStyle: 'solid', borderWidth: 'var(--border-width-default)', borderColor: 'var(--color-border-default)', inlineSize: 'var(--space-inline-gap)', display: 'block' }} />
            <List divided data-l="divided">{three}</List>
            <List gap="inline" marker="bullet" data-l="gap">{three}</List>
          </div>,
        )
        const probe = getComputedStyle(container.querySelector('[data-probe]')!)
        const second = getComputedStyle(container.querySelector('[data-l="divided"] > li + li')!)
        const first = getComputedStyle(container.querySelector('[data-l="divided"] > li')!)
        expect(second.borderTopWidth).toBe(probe.borderTopWidth)
        expect(second.borderTopColor).toBe(probe.borderTopColor)
        expect(first.borderTopWidth).toBe('0px')
        expect(parseFloat(getComputedStyle(container.querySelector('[data-l="gap"]')!).rowGap))
          .toBeCloseTo(container.querySelector('[data-probe]')!.getBoundingClientRect().width - 2 * parseFloat(probe.borderTopWidth), 1)
        for (const li of Array.from(container.querySelectorAll('li'))) expect(contrastOf(li)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
