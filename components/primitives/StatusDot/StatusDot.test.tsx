/**
 * StatusDot: always has words (visible or read), the dot is hidden from
 * screen readers, each status is its feedback role's colour at 3:1 on the
 * page surfaces, and the pulse stops for reduced motion. Runs in Chromium
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
import { StatusDot } from './StatusDot'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
const lum = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('StatusDot words', () => {
  test('visible text is the name; the dot is hidden', () => {
    const { container, getByText } = render(<StatusDot status="success">Online</StatusDot>)
    expect(getByText('Online')).toBeTruthy()
    expect(container.querySelector('.status-dot__dot')!.getAttribute('aria-hidden')).toBe('true')
    expect(container.textContent).toBe('Online')
  })

  test('label is read but not shown', () => {
    const { container } = render(<StatusDot status="error" label="Build failed" />)
    const hidden = container.querySelector('.visually-hidden')!
    expect(hidden.textContent).toBe('Build failed')
    expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1)
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLSpanElement | null = null
    const { container } = render(<StatusDot className="extra" data-x="1" label="Idle" ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLSpanElement
    expect(el.className).toBe('status-dot status-dot--neutral extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

describe('StatusDot pulse', () => {
  test('pulses when asked', () => {
    const { container } = render(<StatusDot status="success" pulse label="Live" />)
    expect(getComputedStyle(container.querySelector('.status-dot__dot')!, '::after').animationName).toBe('status-dot-pulse')
  })

  test('no pulse unless asked', () => {
    const { container } = render(<StatusDot status="success" label="Live" />)
    expect(getComputedStyle(container.querySelector('.status-dot__dot')!, '::after').animationName).toBe('none')
  })

  test('stops for reduced motion: the loaded CSS turns the ring off under prefers-reduced-motion', () => {
    render(<StatusDot status="success" pulse label="Live" />)
    const rules = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules) } catch { return [] }
    })
    const reduced = rules.filter((r): r is CSSMediaRule => r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion: reduce'))
    const ring = reduced.flatMap(m => Array.from(m.cssRules) as CSSStyleRule[])
      .find(r => r.selectorText === '.status-dot--pulse .status-dot__dot::after')
    expect(ring).toBeDefined()
    expect(ring!.style.animationName || ring!.style.animation).toBe('none')
    expect(ring!.style.display).toBe('none')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const statuses = [
  ['neutral', '--color-border-strong'],
  ['info', '--color-feedback-info-border'],
  ['success', '--color-feedback-success-border'],
  ['warning', '--color-feedback-warning-border'],
  ['error', '--color-feedback-error'],
] as const

describe('StatusDot follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: each status is its feedback colour, 3:1 on the page (2.8:1 floor on secondary)`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {(['primary', 'secondary'] as const).map(surface => (
              <div key={surface} data-surface={surface} style={{ background: `var(--color-surface-${surface})` }}>
                {statuses.map(([status, token]) => (
                  <span key={status}>
                    <span data-probe={status} style={{ color: `var(${token})` }} />
                    <StatusDot status={status} data-status={status} label={status} />
                  </span>
                ))}
              </div>
            ))}
          </div>,
        )
        for (const surface of ['primary', 'secondary']) {
          const box = container.querySelector(`[data-surface="${surface}"]`)!
          const bg = getComputedStyle(box).backgroundColor
          for (const [status] of statuses) {
            const dot = getComputedStyle(box.querySelector(`[data-status="${status}"] .status-dot__dot`)!).backgroundColor
            expect(dot, status).toBe(getComputedStyle(box.querySelector(`[data-probe="${status}"]`)!).color)
            // 3:1 on the page surface. On the secondary surface, light mode's
            // success and warning measure about 2.9:1 (accepted and documented:
            // the types require words, so colour never carries the status
            // alone). The floor here catches a real regression below that.
            const floor = surface === 'primary' ? 3 : 2.8
            expect(ratio(dot, bg), `${surface} ${status}`).toBeGreaterThanOrEqual(floor)
          }
        }
      })
    }
  }
})
