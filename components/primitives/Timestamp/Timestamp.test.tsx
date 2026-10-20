/**
 * Timestamp: a time element with the exact moment for machines, the words
 * people use for humans, the full date as a tooltip, and relative text that
 * stays current while the page is open. The wording rules themselves are
 * tested in lib/relative-time.test.ts.
 */

import { afterEach, describe, expect, test, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { Timestamp } from './Timestamp'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const NOW = new Date(2026, 9, 20, 11, 30, 0)
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m)

function freeze() {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
  vi.setSystemTime(NOW)
}

describe('Timestamp', () => {
  test('a time element with the ISO moment and the full date as its title', () => {
    freeze()
    const moment = at(20, 11, 25)
    const { container } = render(<Timestamp date={moment} locale="en-GB" />)
    const time = container.querySelector('time')!
    expect(time.dateTime).toBe(moment.toISOString())
    expect(time.textContent).toBe('5 minutes ago')
    expect(time.title).toBe(new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(moment))
  })

  test('accepts an ISO string or epoch milliseconds', () => {
    freeze()
    const moment = at(19, 12)
    const { container } = render(
      <div><Timestamp date={moment.toISOString()} locale="en-GB" /><Timestamp date={moment.getTime()} locale="en-GB" /></div>,
    )
    expect(Array.from(container.querySelectorAll('time')).map(t => t.textContent)).toEqual(['yesterday', 'yesterday'])
  })

  test('past the limit, relative shows the date', () => {
    freeze()
    const { container } = render(<Timestamp date={at(1, 9)} locale="en-GB" />)
    expect(container.querySelector('time')!.textContent).toBe(new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(at(1, 9)))
  })

  test('absolute formats', () => {
    freeze()
    const moment = at(20, 9, 5)
    const { container } = render(
      <div>
        <Timestamp date={moment} format="date" locale="en-GB" />
        <Timestamp date={moment} format="datetime" locale="en-GB" />
        <Timestamp date={moment} format="time" locale="en-GB" />
      </div>,
    )
    const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', o).format(moment)
    expect(Array.from(container.querySelectorAll('time')).map(t => t.textContent)).toEqual([
      fmt({ day: 'numeric', month: 'short', year: 'numeric' }),
      fmt({ day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      fmt({ hour: '2-digit', minute: '2-digit' }),
    ])
  })

  test('the locale sets the words', () => {
    freeze()
    const { container } = render(<Timestamp date={at(19, 12)} locale="da-DK" />)
    expect(container.querySelector('time')!.textContent).toBe('i går')
  })

  test('an invalid date shows a dash and no dateTime', () => {
    const { container } = render(<Timestamp date="not a date" />)
    const time = container.querySelector('time')!
    expect(time.textContent).toBe('—')
    expect(time.getAttribute('datetime')).toBeNull()
  })

  test('live: the words move on as time passes', () => {
    freeze()
    const { container } = render(<Timestamp date={NOW} locale="en-GB" />)
    const text = () => container.querySelector('time')!.textContent
    // Each tick schedules the next one after React re-renders, so the clock
    // moves in steps, as it does in a real page.
    const wait = (ms: number) => { for (let t = 0; t < ms; t += 15_000) act(() => { vi.advanceTimersByTime(15_000) }) }
    expect(text()).toBe('now')
    wait(60_000)
    expect(text()).toBe('1 minute ago')
    wait(4 * 60_000)
    expect(text()).toBe('5 minutes ago')
  })

  test('live={false} and absolute formats don\'t update', () => {
    freeze()
    const { container } = render(
      <div><Timestamp date={NOW} locale="en-GB" live={false} /><Timestamp date={NOW} format="time" locale="en-GB" /></div>,
    )
    const before = Array.from(container.querySelectorAll('time')).map(t => t.textContent)
    act(() => { vi.advanceTimersByTime(10 * 60_000) })
    expect(Array.from(container.querySelectorAll('time')).map(t => t.textContent)).toEqual(before)
    expect(vi.getTimerCount()).toBe(0)
  })

  test('passes a title, className, data attributes and ref through', () => {
    let node: HTMLTimeElement | null = null
    const { container } = render(<Timestamp date={NOW} title="Published" className="extra" data-x="1" ref={n => { node = n }} />)
    const time = container.querySelector('time')!
    expect(time.title).toBe('Published')
    expect(time.className).toBe('timestamp extra')
    expect(time.dataset.x).toBe('1')
    expect(node).toBe(time)
  })

  test('tabular figures, and it takes the text style around it', () => {
    const { container } = render(<p style={{ color: 'rgb(1, 2, 3)', fontSize: '13px' }}><Timestamp date={NOW} /></p>)
    const s = getComputedStyle(container.querySelector('time')!)
    expect(s.fontVariantNumeric).toBe('tabular-nums')
    expect(s.color).toBe('rgb(1, 2, 3)')
    expect(s.fontSize).toBe('13px')
  })
})
