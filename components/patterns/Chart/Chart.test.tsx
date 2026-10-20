/**
 * Chart: a named figure whose plot is a keyboard-explorable group with a
 * spoken summary; arrow keys read each point aloud; series differ by line
 * style and marker shape as well as colour; the same data switches to a
 * table; gaps stay gaps; and marks, text and tooltip are readable in every
 * brand and mode.
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
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Chart, type ChartSeries } from './Chart'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const data = [
  { q: 'Q1', a: 1200, b: 800, c: null },
  { q: 'Q2', a: 1500, b: 900, c: 400 },
  { q: 'Q3', a: 1300, b: null, c: 600 },
  { q: 'Q4', a: 1800, b: 1100, c: 700 },
]
const series: ChartSeries[] = [{ key: 'a', label: 'Web' }, { key: 'b', label: 'iOS' }, { key: 'c', label: 'Android' }]

const setup = (props: Partial<React.ComponentProps<typeof Chart>> = {}) => {
  const utils = render(
    <div style={{ inlineSize: '640px' }}>
      <Chart type="line" title="Signups" description="Web leads." data={data} x="q" series={series} locale="en-GB" {...props} />
    </div>,
  )
  const status = () => utils.container.querySelector('[role="status"]')!.textContent
  return { ...utils, status }
}

describe('Chart semantics', () => {
  test('a figure named by its title; the plot is a chart group described by a summary and how to explore it', () => {
    const { getByRole, container } = setup()
    expect(getByRole('figure', { name: 'Signups' })).toBeTruthy()
    const plot = getByRole('group', { name: 'Signups' })
    expect(plot.getAttribute('aria-roledescription')).toBe('chart')
    expect(plot.tabIndex).toBe(0)
    const desc = document.getElementById(plot.getAttribute('aria-describedby')!)!.textContent!
    expect(desc).toContain('Web leads.')
    expect(desc).toContain('Line chart, 3 series: Web, iOS, Android, 4 points, from Q1 to Q4.')
    expect(desc).toContain('Values from 400 to 1,800.')
    expect(desc).toContain('arrow keys')
    expect(container.querySelector('svg.chart__svg')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('a legend for two or more series; none for one', () => {
    const { getByRole, rerender } = setup()
    expect(getByRole('list', { name: 'Series' }).textContent).toBe('WebiOSAndroid')
    rerender(<Chart type="line" title="T" data={data} x="q" series={[series[0]]} />)
    expect(document.querySelector('.chart__legend')).toBeNull()
  })

  test('series differ by line style and marker shape, not only colour', () => {
    const { container } = setup()
    const lines = Array.from(container.querySelectorAll('.chart__svg .chart__line'))
    expect(new Set(lines.map(l => l.getAttribute('stroke-dasharray') ?? '')).size).toBe(3)
    const shapes = Array.from(container.querySelectorAll('.chart__svg [class*="chart__series--"]')).map(g => g.querySelector('.chart__marker')!.getAttribute('d'))
    expect(new Set(shapes).size).toBe(3)
  })

  test('a missing value is a gap in the line and a dash in the table', async () => {
    const { container, getByRole } = setup()
    const android = container.querySelector('.chart__svg .chart__series--3 .chart__line')!.getAttribute('d')!
    expect(android.startsWith('M')).toBe(true)
    const ios = container.querySelector('.chart__svg .chart__series--2 .chart__line')!.getAttribute('d')!
    expect(ios.match(/M/g)!.length).toBe(2)
    await userEvent.click(getByRole('button', { name: 'Show as table' }))
    expect(getByRole('row', { name: /Q3/ }).textContent).toContain('—')
  })
})

describe('Chart keyboard', () => {
  test('arrow keys move by point and by series, reading each aloud', async () => {
    const { getByRole, status } = setup()
    getByRole('group', { name: 'Signups' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(status()).toBe('Q1: Web, 1,200. Point 1 of 4.')
    await userEvent.keyboard('{ArrowRight}')
    expect(status()).toBe('Q2: Web, 1,500. Point 2 of 4.')
    await userEvent.keyboard('{ArrowDown}')
    expect(status()).toBe('Q2: iOS, 900. Point 2 of 4.')
    await userEvent.keyboard('{End}')
    expect(status()).toBe('Q4: iOS, 1,100. Point 4 of 4.')
    await userEvent.keyboard('{ArrowRight}')
    expect(status()).toBe('Q4: iOS, 1,100. Point 4 of 4.')
    await userEvent.keyboard('{ArrowLeft}{ArrowDown}')
    expect(status()).toBe('Q3: Android, 600. Point 3 of 4.')
  })

  test('a missing value is read as "no value"; one series is read without its name', async () => {
    const { getByRole, status, rerender } = setup()
    getByRole('group', { name: 'Signups' }).focus()
    await userEvent.keyboard('{ArrowRight}{ArrowUp}')
    expect(status()).toBe('Q1: Android, no value. Point 1 of 4.')
    rerender(<div style={{ inlineSize: '640px' }}><Chart type="bar" title="One" data={data} x="q" series={[series[0]]} /></div>)
    getByRole('group', { name: 'One' }).focus()
    await userEvent.keyboard('{Home}')
    expect(status()).toBe('Q1: 1,200. Point 1 of 4.')
  })

  test('the point you are on shows its tooltip; Escape and leaving hide it', async () => {
    const { getByRole, container } = setup()
    const plot = getByRole('group', { name: 'Signups' })
    plot.focus()
    await userEvent.keyboard('{ArrowRight}')
    const tip = container.querySelector('.chart__tooltip')!
    expect(tip.getAttribute('aria-hidden')).toBe('true')
    expect(tip.textContent).toContain('Q1')
    expect(container.querySelector('.chart__tooltip-row--active')!.textContent).toContain('Web')
    await userEvent.keyboard('{Escape}')
    expect(container.querySelector('.chart__tooltip')).toBeNull()
  })
})

describe('Chart table and bars', () => {
  test('"Show as table" shows the same data with headers; the button swaps back', async () => {
    const { getByRole, queryByRole } = setup({ xLabel: 'Quarter' })
    await userEvent.click(getByRole('button', { name: 'Show as table' }))
    expect(queryByRole('group', { name: 'Signups' })).toBeNull()
    const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.textContent)
    expect(headers).toEqual(['Quarter', 'Web', 'iOS', 'Android'])
    expect(getByRole('rowheader', { name: 'Q4' })).toBeTruthy()
    expect(getByRole('row', { name: /Q4/ }).textContent).toContain('1,800')
    await userEvent.click(getByRole('button', { name: 'Show as chart' }))
    expect(getByRole('group', { name: 'Signups' })).toBeTruthy()
  })

  test('bars: one per value, standing on the zero baseline', () => {
    const { container } = setup({ type: 'bar' })
    const bars = container.querySelectorAll('.chart__svg .chart__bar')
    expect(bars).toHaveLength(10)
    const baseline = container.querySelector('.chart__baseline')!.getBoundingClientRect().top
    for (const bar of bars) expect(bar.getBoundingClientRect().bottom).toBeCloseTo(baseline, 0)
  })

  test('formatValue formats the axis, the speech and the table', async () => {
    const { getByRole, status, container } = setup({ formatValue: v => `${v / 1000}k` })
    expect(Array.from(container.querySelectorAll('.chart__tick')).some(t => t.textContent === '1k')).toBe(true)
    getByRole('group', { name: 'Signups' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(status()).toBe('Q1: Web, 1.2k. Point 1 of 4.')
  })

  test('more than six series: the first six are drawn, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const many = Array.from({ length: 7 }, (_, i) => ({ key: 'a', label: `S${i}` }))
    const { container } = setup({ series: many })
    expect(container.querySelectorAll('.chart__svg .chart__line')).toHaveLength(6)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  test('passes className, data attributes and ref to the figure', () => {
    let node: HTMLElement | null = null
    const { getByRole } = render(<Chart type="bar" title="T" data={data} x="q" series={series} className="extra" data-x="1" ref={n => { node = n }} />)
    const fig = getByRole('figure')
    expect(fig.className).toBe('chart extra')
    expect(fig.dataset.x).toBe('1')
    expect(node).toBe(fig)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

/** Contrast of a colour against what's behind an element, measured as text of that colour. */
function colourContrast(host: Element, colour: string) {
  const probe = document.createElement('span')
  probe.textContent = 'x'
  probe.style.color = colour
  host.append(probe)
  const ratio = contrastOf(probe)
  probe.remove()
  return ratio
}

describe('Chart follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: six series colours, axis text and tooltip readable`, async () => {
        const six = Array.from({ length: 6 }, (_, i) => ({ key: 'a', label: `S${i + 1}` }))
        const { container, getByRole } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)', inlineSize: '640px' }}>
            <Chart type="line" title="T" data={data} x="q" series={six} />
          </div>,
        )
        const host = container.querySelector('.chart__plot')!
        for (const line of container.querySelectorAll('.chart__svg .chart__line')) {
          expect(colourContrast(host, getComputedStyle(line).stroke)).toBeGreaterThanOrEqual(3)
        }
        const tick = container.querySelector('.chart__tick')!
        expect(colourContrast(host, getComputedStyle(tick).fill)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('.chart__description') ?? container.querySelector('.chart__title')!)).toBeGreaterThanOrEqual(4.5)
        getByRole('group', { name: 'T' }).focus()
        await userEvent.keyboard('{ArrowRight}')
        expect(contrastOf(container.querySelector('.chart__tooltip-label')!)).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(container.querySelector('.chart__tooltip-value')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
