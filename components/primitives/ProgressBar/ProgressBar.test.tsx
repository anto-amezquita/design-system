/**
 * ProgressBar: what screen readers are told, and a fill that shows its
 * length in every brand and mode. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { ProgressBar } from './ProgressBar'

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

describe('ProgressBar semantics', () => {
  test('determinate: named by its label, with min, max and now', () => {
    const { getByRole } = render(<ProgressBar label="Uploading photos" value={40} />)
    const bar = getByRole('progressbar', { name: 'Uploading photos' })
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.hasAttribute('aria-busy')).toBe(false)
  })

  test('indeterminate: no value, marked busy', () => {
    const { getByRole } = render(<ProgressBar label="Preparing export" />)
    const bar = getByRole('progressbar', { name: 'Preparing export' })
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.getAttribute('aria-busy')).toBe('true')
  })

  test('valueText is read and shown instead of the percentage', () => {
    const { getByRole, getByText } = render(
      <ProgressBar label="Uploading files" value={3} max={10} valueText="3 of 10 files" showValue />,
    )
    expect(getByRole('progressbar').getAttribute('aria-valuetext')).toBe('3 of 10 files')
    expect(getByText('3 of 10 files')).toBeTruthy()
  })

  test('out-of-range values are clamped', () => {
    const { getAllByRole } = render(
      <>
        <ProgressBar label="low" value={-5} />
        <ProgressBar label="high" value={250} />
      </>,
    )
    const [low, high] = getAllByRole('progressbar')
    expect(low.getAttribute('aria-valuenow')).toBe('0')
    expect(high.getAttribute('aria-valuenow')).toBe('100')
  })

  test('hideLabel keeps the name but takes no space', () => {
    const { getByRole, getByText } = render(<ProgressBar label="Uploading" value={10} hideLabel />)
    expect(getByRole('progressbar', { name: 'Uploading' })).toBeTruthy()
    expect(getByText('Uploading').parentElement!.getBoundingClientRect().height).toBeLessThanOrEqual(1)
  })
})

describe('ProgressBar fill', () => {
  test('fills to the value', () => {
    const { container } = render(<div style={{ inlineSize: '200px' }}><ProgressBar label="x" value={25} /></div>)
    const fill = container.querySelector('.progress-bar__fill')!
    expect(fill.getBoundingClientRect().width).toBeCloseTo(50, 0)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: fill is 3:1 on the track and on the page`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <ProgressBar label="x" value={50} />
          </div>,
        )
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        const track = getComputedStyle(container.querySelector('.progress-bar__track')!).backgroundColor
        const fill = getComputedStyle(container.querySelector('.progress-bar__fill')!).backgroundColor
        expect(contrast(fill, track)).toBeGreaterThanOrEqual(3)
        expect(contrast(fill, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
