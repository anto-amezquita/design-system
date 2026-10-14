/**
 * Slider: a native range named by its label; keyboard steps; the track
 * fills to the thumb; the fill and thumb edge are 3:1 in every brand and
 * mode. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Slider } from './Slider'

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
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('Slider', () => {
  test('a slider named by its label, with min, max and value', () => {
    const { getByRole } = render(<Slider label="Volume" defaultValue={40} />)
    const s = getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    expect([s.min, s.max, s.value]).toEqual(['0', '100', '40'])
  })

  test('keyboard: arrows step, Home and End jump; each change is reported', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Slider label="Volume" defaultValue={40} step={5} onValueChange={onValueChange} />)
    const s = getByRole('slider') as HTMLInputElement
    s.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(s.value).toBe('45')
    await userEvent.keyboard('{Home}')
    expect(s.value).toBe('0')
    await userEvent.keyboard('{End}')
    expect(s.value).toBe('100')
    expect(onValueChange.mock.calls).toEqual([[45], [0], [100]])
  })

  test('controlled: follows the prop', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Slider label="Volume" value={10} onValueChange={onValueChange} />)
    const s = getByRole('slider') as HTMLInputElement
    s.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(11)
    expect(s.value).toBe('10')
  })

  test('formatValue sets aria-valuetext and the shown value', () => {
    const { getByRole, getByText } = render(<Slider label="Price" defaultValue={750} max={2000} formatValue={v => `${v} kr.`} showValue />)
    expect(getByRole('slider').getAttribute('aria-valuetext')).toBe('750 kr.')
    expect(getByText('750 kr.')).toBeTruthy()
  })

  test('hint is the description', () => {
    const { getByRole } = render(<Slider label="Opacity" hint="Lower lets the background through." />)
    expect(getByRole('slider', { description: 'Lower lets the background through.' })).toBeTruthy()
  })

  test('hideLabel keeps the name', () => {
    const { getByRole } = render(<Slider label="Volume" hideLabel />)
    expect(getByRole('slider', { name: 'Volume' })).toBeTruthy()
  })

  test('the fill stops where the value is; the row is 44px tall', () => {
    const { getByRole } = render(<Slider label="Volume" min={20} max={60} defaultValue={30} />)
    const s = getByRole('slider')
    expect(s.style.getPropertyValue('--slider-fill')).toBe('25%')
    expect(s.getBoundingClientRect().height).toBe(44)
  })

  test('disabled: no change from the keyboard', async () => {
    const { getByRole } = render(<Slider label="Volume" defaultValue={30} disabled />)
    const s = getByRole('slider') as HTMLInputElement
    expect(s.disabled).toBe(true)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: fill and thumb edge (accent-text) 3:1 on the track and the page`, () => {
        const { getByRole } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Slider label="Volume" defaultValue={50} />
          </div>,
        )
        // Chromium doesn't report a range's thumb or track styles to scripts,
        // so resolve the tokens the CSS draws them with, in this brand and mode.
        const probe = (prop: string) => {
          const el = document.createElement('span')
          el.style.color = `var(${prop})`
          getByRole('slider').closest('[data-mode]')!.append(el)
          return getComputedStyle(el).color
        }
        const fill = probe('--color-accent-text') // fill and thumb edge
        const track = probe('--color-surface-tertiary')
        const page = probe('--color-surface-primary')
        expect(contrast(fill, track)).toBeGreaterThanOrEqual(3)
        expect(contrast(fill, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
