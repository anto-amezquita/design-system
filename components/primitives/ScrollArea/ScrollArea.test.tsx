/**
 * ScrollArea: a named region that takes focus so the keyboard can scroll
 * it, scrolls only the axis asked for, stops scroll chaining, and draws a
 * thumb in the strong border colour (3:1 on the page surfaces) in every
 * brand and mode. Runs in Chromium with the real CSS.
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
import { ScrollArea } from './ScrollArea'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const tall = Array.from({ length: 40 }, (_, i) => <p key={i} style={{ margin: 0, blockSize: '24px' }}>Line {i + 1}</p>)

describe('ScrollArea', () => {
  test('a named region in the tab order', () => {
    const { getByRole } = render(<ScrollArea label="Release notes" maxHeight={120}>{tall}</ScrollArea>)
    const region = getByRole('region', { name: 'Release notes' })
    expect(region.tabIndex).toBe(0)
  })

  test('maxHeight limits it and it scrolls vertically only by default', () => {
    const { getByRole } = render(<ScrollArea label="Notes" maxHeight="120px">{tall}</ScrollArea>)
    const region = getByRole('region')
    expect(region.getBoundingClientRect().height).toBe(120)
    expect(region.scrollHeight).toBeGreaterThan(120)
    const s = getComputedStyle(region)
    expect(s.overflowY).toBe('auto')
    expect(s.overflowX).toBe('hidden')
    expect(s.overscrollBehaviorY).toBe('contain')
  })

  test('horizontal and both', () => {
    const { container } = render(
      <div>
        <ScrollArea label="h" orientation="horizontal">x</ScrollArea>
        <ScrollArea label="b" orientation="both">y</ScrollArea>
      </div>,
    )
    const [h, b] = Array.from(container.querySelectorAll('.scroll-area')).map(el => getComputedStyle(el))
    expect([h.overflowX, h.overflowY]).toEqual(['auto', 'hidden'])
    expect([b.overflowX, b.overflowY]).toEqual(['auto', 'auto'])
  })

  test('the keyboard reaches it and scrolls it; focus shows a ring', async () => {
    const { getByRole } = render(<ScrollArea label="Notes" maxHeight={120}>{tall}</ScrollArea>)
    const region = getByRole('region')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(region)
    expect(getComputedStyle(region).outlineStyle).toBe('solid')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    await new Promise(r => setTimeout(r, 300))
    expect(region.scrollTop).toBeGreaterThan(0)
  })

  test('passes className, style, data attributes and ref through', () => {
    let node: HTMLDivElement | null = null
    const { getByRole } = render(
      <ScrollArea label="n" maxHeight={100} className="extra" data-x="1" style={{ inlineSize: '50px' }} ref={n => { node = n }}>x</ScrollArea>,
    )
    const el = getByRole('region')
    expect(el.className).toBe('scroll-area scroll-area--vertical extra')
    expect(el.dataset.x).toBe('1')
    expect(el.style.inlineSize).toBe('50px')
    expect(el.style.maxBlockSize).toBe('100px')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
const lum = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const ratio = (a: string, b: string) => { const [h, l] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05) }

describe('ScrollArea follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: thumb is the strong border colour, 3:1 on the page surfaces`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {(['primary', 'secondary'] as const).map(s => (
              <div key={s} data-surface={s} style={{ background: `var(--color-surface-${s})` }}>
                <ScrollArea label={s}>x</ScrollArea>
              </div>
            ))}
            <span data-probe style={{ color: 'var(--color-border-strong)' }} />
          </div>,
        )
        const thumb = getComputedStyle(container.querySelector('[data-probe]')!).color
        for (const s of ['primary', 'secondary']) {
          const area = container.querySelector(`[data-surface="${s}"] .scroll-area`)!
          expect(getComputedStyle(area).scrollbarColor.startsWith(thumb)).toBe(true)
          const bg = getComputedStyle(container.querySelector(`[data-surface="${s}"]`)!).backgroundColor
          expect(ratio(thumb, bg), s).toBeGreaterThanOrEqual(3)
        }
      })
    }
  }
})
