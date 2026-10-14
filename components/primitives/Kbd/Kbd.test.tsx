/**
 * Kbd: a native <kbd>, readable in every brand and mode. Runs in Chromium
 * with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Kbd } from './Kbd'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

function luminance(color: string) {
  const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('Kbd', () => {
  test('renders a native kbd and passes props through', () => {
    let node: HTMLElement | null = null
    const { getByText } = render(<Kbd className="extra" title="Escape" ref={n => { node = n }}>Esc</Kbd>)
    const el = getByText('Esc')
    expect(el.tagName).toBe('KBD')
    expect(el.className).toBe('kbd extra')
    expect(el.title).toBe('Escape')
    expect(node).toBe(el)
  })

  test('scales with the text around it', () => {
    const { getByText } = render(
      <>
        <p style={{ fontSize: '12px' }}><Kbd>small</Kbd></p>
        <p style={{ fontSize: '24px' }}><Kbd>large</Kbd></p>
      </>,
    )
    const small = parseFloat(getComputedStyle(getByText('small')).fontSize)
    const large = parseFloat(getComputedStyle(getByText('large')).fontSize)
    expect(large).toBeCloseTo(small * 2, 1)
  })

  test('the outer combination kbd stays plain text', () => {
    const { container } = render(<p style={{ fontSize: '20px' }}><kbd><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></kbd></p>)
    const outer = container.querySelector('p > kbd')!
    expect(getComputedStyle(outer).fontSize).toBe('20px')
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: text 4.5:1 on the keycap, lower edge 3:1 on the page`, () => {
        const { getByText } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Kbd>K</Kbd>
          </div>,
        )
        const el = getByText('K')
        const s = getComputedStyle(el)
        const page = getComputedStyle(el.parentElement!).backgroundColor
        expect(contrast(s.color, s.backgroundColor)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(s.borderBottomColor, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
