/**
 * DateRangePicker: a fieldset with two typed date fields and Calendar's
 * range mode in a Popover. A range is only reported when both ends are
 * valid; an end before the start, the limits and unavailable days inside
 * the range each get a reason; the reason is described on each field.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { DateRangePicker } from './DateRangePicker'
import { fullDate } from '../../../lib/date-test-utils'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const oct = (d: number) => new Date(2026, 9, d)
const described = (el: Element) =>
  el.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')

const setup = (props: Partial<React.ComponentProps<typeof DateRangePicker>> = {}) => {
  const onValueChange = vi.fn()
  const utils = render(<DateRangePicker label="Stay" startLabel="Check-in" endLabel="Check-out" locale="en-GB" onValueChange={onValueChange} {...props} />)
  return {
    ...utils,
    onValueChange,
    start: utils.getByRole('textbox', { name: 'Check-in' }) as HTMLInputElement,
    end: utils.getByRole('textbox', { name: 'Check-out' }) as HTMLInputElement,
  }
}

describe('DateRangePicker', () => {
  test('a group named by the label, two named fields with their own ids, described by the format', () => {
    const { getByRole, start, end } = setup()
    expect(getByRole('group', { name: 'Stay' }).tagName).toBe('FIELDSET')
    expect(start.id).not.toBe(end.id)
    expect(described(start)).toBe('dd/mm/yyyy')
  })

  test('typing both ends reports the range once both are in', async () => {
    const { start, end, onValueChange } = setup()
    await userEvent.type(start, '12/10/2026')
    await userEvent.tab()
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.type(end, '16/10/26{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith({ start: oct(12), end: oct(16) })
    expect(end.value).toBe('16/10/2026')
  })

  test('an end before the start is refused, and both fields say why', async () => {
    const { start, end, onValueChange } = setup()
    await userEvent.type(start, '16/10/2026')
    await userEvent.type(end, '12/10/2026{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(start.getAttribute('aria-invalid')).toBe('true')
    expect(described(start)).toBe('The end date is before the start date.')
    expect(described(end)).toBe('The end date is before the start date.')
  })

  test('a range crossing an unavailable day names the day', async () => {
    const { start, end } = setup({ isDateDisabled: d => d.getDate() === 14 })
    await userEvent.type(start, '12/10/2026')
    await userEvent.type(end, '16/10/2026{Enter}')
    expect(described(end)).toBe("The dates include 14 October 2026, which isn't available.")
  })

  test('limits', async () => {
    const { start, end } = setup({ min: oct(10), max: oct(20) })
    await userEvent.type(start, '05/10/2026')
    await userEvent.type(end, '12/10/2026{Enter}')
    expect(described(end)).toBe('Start on 10 October 2026 or later.')
  })

  test('an unreadable date says which end', async () => {
    const { start, end } = setup()
    await userEvent.type(start, '12/10/2026')
    await userEvent.type(end, 'next week{Enter}')
    expect(described(end)).toBe('Enter the end date like 15/10/2026.')
  })

  test('picking two days in the calendar fills both fields and closes it', async () => {
    const { getByRole, start, end, onValueChange } = setup({ defaultValue: { start: oct(1), end: oct(2) } })
    await userEvent.click(getByRole('button', { name: /^Choose Stay/ }))
    await expect.poll(() => document.querySelector('[role="grid"]')).not.toBeNull()
    await userEvent.click(document.querySelector(`[aria-label="${fullDate(2026, 10, 12)}"]`)!)
    expect(start.value).toBe('12/10/2026')
    expect(end.value).toBe('')
    await userEvent.click(document.querySelector(`[aria-label="${fullDate(2026, 10, 16)}"]`)!)
    expect(onValueChange).toHaveBeenLastCalledWith({ start: oct(12), end: oct(16) })
    await expect.poll(() => document.querySelector('[role="grid"]')).toBeNull()
    expect(end.value).toBe('16/10/2026')
  })

  test('a picked range across an unavailable day stays open with the reason', async () => {
    const { getByRole, end } = setup({ defaultValue: { start: oct(1), end: oct(2) }, isDateDisabled: d => d.getDate() === 14 })
    await userEvent.click(getByRole('button', { name: /^Choose Stay/ }))
    await userEvent.click(document.querySelector(`[aria-label="${fullDate(2026, 10, 12)}"]`)!)
    await userEvent.click(document.querySelector(`[aria-label="${fullDate(2026, 10, 16)}"]`)!)
    expect(document.querySelector('[role="grid"]')).not.toBeNull()
    expect(described(end)).toBe("The dates include 14 October 2026, which isn't available.")
  })

  test('submits both ends as yyyy-mm-dd', () => {
    const { container } = render(
      <form><DateRangePicker label="Stay" name="stay" defaultValue={{ start: oct(12), end: oct(16) }} /></form>,
    )
    const data = new FormData(container.querySelector('form')!)
    expect([data.get('stay-start'), data.get('stay-end')]).toEqual(['2026-10-12', '2026-10-16'])
  })
})
