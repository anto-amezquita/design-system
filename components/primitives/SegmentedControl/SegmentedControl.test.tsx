/**
 * SegmentedControl: a radio group named by its label; arrows move and
 * choose; one Tab stop; the chosen segment is filled; 44px tall. Runs in
 * Chromium with the real CSS, in every brand and mode for the colours.
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
import { SegmentedControl } from './SegmentedControl'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
  { value: 'year', label: 'Year' },
]

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

describe('SegmentedControl', () => {
  test('a named radio group; the first option is chosen by default', () => {
    const { getByRole } = render(<SegmentedControl label="Time range" options={options} />)
    expect(getByRole('radiogroup', { name: 'Time range' })).toBeTruthy()
    expect(getByRole('radio', { name: 'Day' }).getAttribute('aria-checked')).toBe('true')
  })

  test('arrows move and choose, skip disabled, and wrap', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<SegmentedControl label="Range" options={options} defaultValue="week" onValueChange={onValueChange} />)
    getByRole('radio', { name: 'Week' }).focus()
    // Radix moves focus on the next tick and checks the item only while the
    // arrow is still down, as it is for a person; so hold it, then release.
    const arrow = async (name: string) => {
      await userEvent.keyboard('{ArrowRight>}')
      await expect.poll(() => getByRole('radio', { name }).getAttribute('aria-checked')).toBe('true')
      await userEvent.keyboard('{/ArrowRight}')
    }
    await arrow('Year')
    await arrow('Day')
    expect(onValueChange.mock.calls).toEqual([['year'], ['day']])
  })

  test('one Tab stop: Tab enters on the chosen segment and leaves the group', async () => {
    const { getByRole } = render(
      <>
        <button type="button">before</button>
        <SegmentedControl label="Range" options={options} defaultValue="week" />
        <button type="button">after</button>
      </>,
    )
    getByRole('button', { name: 'before' }).focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(getByRole('radio', { name: 'Week' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(getByRole('button', { name: 'after' }))
  })

  test('controlled: follows the prop', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<SegmentedControl label="Range" options={options} value="day" onValueChange={onValueChange} />)
    await userEvent.click(getByRole('radio', { name: 'Year' }))
    expect(onValueChange).toHaveBeenCalledWith('year')
    expect(getByRole('radio', { name: 'Day' }).getAttribute('aria-checked')).toBe('true')
  })

  test('hideLabels: segments named by their labels, square', () => {
    const Icon = () => <svg viewBox="0 0 10 10"><rect width="10" height="10" /></svg>
    const { getByRole } = render(
      <SegmentedControl label="View" hideLabels options={[{ value: 'a', label: 'List view', icon: <Icon /> }, { value: 'b', label: 'Grid view', icon: <Icon /> }]} />,
    )
    const item = getByRole('radio', { name: 'Grid view' })
    expect(item.textContent).toBe('')
    const r = item.getBoundingClientRect()
    expect(Math.round(r.width)).toBe(Math.round(r.height))
  })

  test('the control is 44px tall', () => {
    const { getByRole } = render(<SegmentedControl label="Range" options={options} />)
    expect(getByRole('radiogroup').getBoundingClientRect().height).toBe(44)
  })

  test('fullWidth: segments share the width equally', () => {
    const { getAllByRole } = render(
      <div style={{ inlineSize: '400px' }}><SegmentedControl label="Range" options={options} fullWidth /></div>,
    )
    const widths = getAllByRole('radio').map(r => Math.round(r.getBoundingClientRect().width))
    expect(new Set(widths).size).toBe(1)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: chosen text 4.5:1 on its fill; outline 3:1 on the page`, () => {
        const { getByRole } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <SegmentedControl label="Range" options={options} defaultValue="week" />
          </div>,
        )
        const chosen = getComputedStyle(getByRole('radio', { name: 'Week' }))
        const group = getByRole('radiogroup')
        const page = getComputedStyle(group.parentElement!).backgroundColor
        expect(contrast(chosen.color, chosen.backgroundColor)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(getComputedStyle(group).borderTopColor, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
