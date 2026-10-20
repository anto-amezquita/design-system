/**
 * Stack: the gap follows each brand's spacing roles, direction and alignment
 * map to flex, and a list keeps its semantics. Runs in Chromium with the real
 * CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Stack, type StackGap } from './Stack'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Stack layout', () => {
  test('vertical with the element gap by default', () => {
    const { container } = render(<Stack><span>a</span><span>b</span></Stack>)
    const s = getComputedStyle(container.firstElementChild!)
    expect(s.display).toBe('flex')
    expect(s.flexDirection).toBe('column')
    expect(s.alignItems).toBe('stretch')
    expect(s.flexWrap).toBe('nowrap')
  })

  test('horizontal, aligned, justified and wrapping', () => {
    const { container } = render(
      <Stack direction="horizontal" align="center" justify="between" wrap><span>a</span></Stack>,
    )
    const s = getComputedStyle(container.firstElementChild!)
    expect(s.flexDirection).toBe('row')
    expect(s.alignItems).toBe('center')
    expect(s.justifyContent).toBe('space-between')
    expect(s.flexWrap).toBe('wrap')
  })

  test('gap none is zero', () => {
    const { container } = render(<Stack gap="none" />)
    expect(getComputedStyle(container.firstElementChild!).rowGap).toBe('0px')
  })
})

describe('Stack semantics', () => {
  test('ul keeps list semantics without markers', () => {
    const { getByRole, getAllByRole } = render(
      <Stack as="ul"><li>One</li><li>Two</li></Stack>,
    )
    const list = getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(getAllByRole('listitem')).toHaveLength(2)
    const s = getComputedStyle(list)
    expect(s.listStyleType).toBe('none')
    expect(s.paddingInlineStart).toBe('0px')
  })

  test('a passed role wins', () => {
    const { container } = render(<Stack as="ul" role="menu" />)
    expect(container.firstElementChild!.getAttribute('role')).toBe('menu')
  })

  test('renders the semantic element asked for', () => {
    const { container } = render(<Stack as="nav" aria-label="Footer" />)
    expect(container.firstElementChild!.tagName).toBe('NAV')
    expect(container.firstElementChild!.getAttribute('role')).toBeNull()
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(<Stack className="extra" data-x="1" ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('stack stack--vertical stack--gap-element stack--align-stretch stack--justify-start extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const gaps: Exclude<StackGap, 'none'>[] = ['tight', 'inline', 'element', 'component', 'section']

describe('Stack gap follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: each gap is its --space-*-gap token`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {gaps.map(gap => (
              <div key={gap}>
                <span data-probe={gap} style={{ display: 'block', inlineSize: `var(--space-${gap}-gap)` }} />
                <Stack gap={gap} data-stack={gap}><span>a</span><span>b</span></Stack>
              </div>
            ))}
          </div>,
        )
        for (const gap of gaps) {
          const probe = container.querySelector(`[data-probe="${gap}"]`)!
          const stack = container.querySelector(`[data-stack="${gap}"]`)!
          const expected = probe.getBoundingClientRect().width
          expect(expected, gap).toBeGreaterThan(0)
          expect(parseFloat(getComputedStyle(stack).rowGap), gap).toBeCloseTo(expected, 1)
        }
      })
    }
  }
})
