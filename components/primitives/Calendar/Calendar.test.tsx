/**
 * Calendar: the WAI-ARIA date grid. One Tab stop; arrows, Home/End and
 * Page Up/Down (with Shift for years) move focus; Enter or Space chooses;
 * unavailable days are reachable but not chosen; ranges take two presses
 * and swap if the second end is earlier. Names come from the locale.
 * Runs in Chromium with the real CSS.
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
import { Calendar } from './Calendar'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const oct = (d: number) => new Date(2026, 9, d)
const focusedName = () => document.activeElement?.getAttribute('aria-label')

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

describe('Calendar structure', () => {
  test('a grid named by the month; day cells named in full; one Tab stop', () => {
    const { getByRole, getAllByRole } = render(<Calendar locale="en-GB" defaultValue={oct(15)} />)
    expect(getByRole('grid', { name: 'October 2026' })).toBeTruthy()
    const cells = getAllByRole('gridcell')
    expect(cells).toHaveLength(31)
    expect(cells.filter(c => c.tabIndex === 0).map(c => c.getAttribute('aria-label'))).toEqual(['Thursday 15 October 2026'])
  })

  test('a label is added to the month', () => {
    const { getByRole } = render(<Calendar locale="en-GB" label="Delivery date" defaultValue={oct(15)} />)
    expect(getByRole('grid', { name: 'Delivery date, October 2026' })).toBeTruthy()
  })

  test('Danish: weeks start on Monday, names in Danish, ISO week numbers', () => {
    const { container, getByRole } = render(<Calendar locale="da-DK" showWeekNumbers defaultValue={oct(15)} />)
    const heads = Array.from(container.querySelectorAll('.calendar__weekday abbr')).map(a => a.getAttribute('title'))
    expect(heads[0]).toBe('mandag')
    expect(heads[6]).toBe('søndag')
    expect(getByRole('gridcell', { name: 'torsdag den 15. oktober 2026' })).toBeTruthy()
    const weeks = Array.from(container.querySelectorAll('tbody .calendar__weeknum')).map(t => t.textContent)
    expect(weeks).toEqual(['40', '41', '42', '43', '44'])
  })

  test('US: weeks start on Sunday', () => {
    const { container } = render(<Calendar locale="en-US" defaultValue={oct(15)} />)
    expect(container.querySelector('.calendar__weekday abbr')!.getAttribute('title')).toBe('Sunday')
  })

  test("today is marked with aria-current", () => {
    const { container } = render(<Calendar locale="en-GB" />)
    const today = container.querySelector('[aria-current="date"]')!
    expect(today.getAttribute('aria-label')).toBe(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ''))
  })
})

describe('Calendar keyboard', () => {
  test('arrows by day and week, Home/End to the week ends, Page by month, Shift+Page by year', async () => {
    const { getByRole } = render(<Calendar locale="en-GB" defaultValue={oct(15)} />)
    getByRole('gridcell', { name: 'Thursday 15 October 2026' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(focusedName()).toBe('Friday 16 October 2026')
    await userEvent.keyboard('{ArrowDown}')
    expect(focusedName()).toBe('Friday 23 October 2026')
    await userEvent.keyboard('{Home}')
    expect(focusedName()).toBe('Monday 19 October 2026')
    await userEvent.keyboard('{End}')
    expect(focusedName()).toBe('Sunday 25 October 2026')
    await userEvent.keyboard('{PageDown}')
    expect(focusedName()).toBe('Wednesday 25 November 2026')
    expect(getByRole('grid', { name: 'November 2026' })).toBeTruthy()
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}')
    expect(focusedName()).toBe('Tuesday 25 November 2025')
  })

  test('arrows cross into the next month', async () => {
    const { getByRole } = render(<Calendar locale="en-GB" defaultValue={oct(31)} />)
    getByRole('gridcell', { name: 'Saturday 31 October 2026' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(focusedName()).toBe('Sunday 1 November 2026')
  })

  test('Enter and Space choose', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Calendar locale="en-GB" defaultValue={oct(15)} onValueChange={onValueChange} />)
    getByRole('gridcell', { name: 'Thursday 15 October 2026' }).focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(oct(16))
    await userEvent.keyboard('{ArrowRight} ')
    expect(onValueChange).toHaveBeenLastCalledWith(oct(17))
    expect(getByRole('gridcell', { name: 'Saturday 17 October 2026' }).getAttribute('aria-selected')).toBe('true')
  })
})

describe('Calendar limits', () => {
  test('min and max stop focus; unavailable days are reachable but not chosen', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(
      <Calendar locale="en-GB" defaultValue={oct(16)} min={oct(6)} max={oct(28)} isDateDisabled={d => d.getDay() === 6} onValueChange={onValueChange} />,
    )
    const sat = getByRole('gridcell', { name: 'Saturday 17 October 2026' })
    expect(sat.getAttribute('aria-disabled')).toBe('true')
    getByRole('gridcell', { name: 'Friday 16 October 2026' }).focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    expect(focusedName()).toBe('Saturday 17 October 2026')
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.keyboard('{PageDown}')
    expect(focusedName()).toBe('Wednesday 28 October 2026')
    expect((getByRole('button', { name: 'Next month' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('Calendar range', () => {
  test('two presses make a range; an earlier second end swaps; middle days are selected', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<Calendar mode="range" locale="en-GB" defaultMonth={oct(1)} onValueChange={onValueChange} />)
    expect(getByRole('grid').getAttribute('aria-multiselectable')).toBe('true')
    await userEvent.click(getByRole('gridcell', { name: 'Friday 16 October 2026' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: oct(16), end: null })
    await userEvent.click(getByRole('gridcell', { name: 'Monday 12 October 2026' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: oct(12), end: oct(16) })
    expect(getByRole('gridcell', { name: 'Wednesday 14 October 2026' }).getAttribute('aria-selected')).toBe('true')
    expect(getByRole('gridcell', { name: 'Saturday 17 October 2026' }).getAttribute('aria-selected')).toBe('false')
    // A third press starts over.
    await userEvent.click(getByRole('gridcell', { name: 'Tuesday 20 October 2026' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: oct(20), end: null })
  })
})

describe('Calendar colours', () => {
  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: chosen day 4.5:1; other days and weekday names 4.5:1 on the page`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Calendar locale="en-GB" defaultValue={oct(15)} />
          </div>,
        )
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        const chosen = getComputedStyle(container.querySelector('.calendar__day--selected .calendar__day-number')!)
        expect(contrast(chosen.color, chosen.backgroundColor)).toBeGreaterThanOrEqual(4.5)
        const plain = container.querySelector('.calendar__day:not(.calendar__day--selected)')!
        expect(contrast(getComputedStyle(plain).color, page)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(getComputedStyle(container.querySelector('.calendar__weekday')!).color, page)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
