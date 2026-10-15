/**
 * DatePicker: type a date in the locale's order, or pick it from the
 * calendar. Unreadable, out-of-range and unavailable dates get a plain
 * reason; picking fills the field and closes the calendar; a hidden ISO
 * value submits with the form. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { DatePicker, datePattern } from './DatePicker'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const oct = (d: number) => new Date(2026, 9, d)
const describedText = (el: Element) =>
  el.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')

describe('datePattern', () => {
  test('in the reader’s language and order', () => {
    expect(datePattern('da-DK')).toBe('dd.mm.åååå')
    expect(datePattern('en-US')).toBe('mm/dd/yyyy')
    expect(datePattern('en-GB')).toBe('dd/mm/yyyy')
  })
})

describe('DatePicker typing', () => {
  test('shows the value in the locale format and the format as a hint', () => {
    const { getByRole } = render(<DatePicker label="Delivery date" locale="da-DK" defaultValue={oct(5)} />)
    const input = getByRole('textbox', { name: 'Delivery date' }) as HTMLInputElement
    expect(input.value).toBe('05.10.2026')
    expect(describedText(input)).toBe('dd.mm.åååå')
  })

  test('a typed date is read on blur and tidied', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<DatePicker label="Date" locale="da-DK" onValueChange={onValueChange} />)
    const input = getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, '7/11/26')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 10, 7))
    expect(input.value).toBe('07.11.2026')
  })

  test('an unreadable date keeps the text and says how to write it', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<DatePicker label="Date" locale="da-DK" onValueChange={onValueChange} />)
    const input = getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, '31.02.2026{Enter}')
    expect(input.value).toBe('31.02.2026')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(describedText(input)).toBe('Enter a date like 15.10.2026.')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('outside the limits or unavailable: the reason, in words', async () => {
    const { getByRole } = render(
      <DatePicker label="Date" locale="en-GB" min={oct(10)} max={oct(30)} isDateDisabled={d => d.getDay() === 0} />,
    )
    const input = getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, '01/10/2026{Enter}')
    expect(describedText(input)).toBe('Choose 10 October 2026 or later.')
    await userEvent.clear(input)
    await userEvent.type(input, '18/10/2026{Enter}')
    expect(describedText(input)).toBe("18 October 2026 isn't available. Choose another date.")
  })

  test('clearing the field clears the value', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<DatePicker label="Date" locale="da-DK" defaultValue={oct(5)} onValueChange={onValueChange} />)
    const input = getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.tab()
    expect(onValueChange).toHaveBeenCalledWith(null)
  })
})

describe('DatePicker calendar', () => {
  test('the button opens the calendar on the chosen date; picking fills the field and closes it', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<DatePicker label="Delivery date" locale="en-GB" defaultValue={oct(22)} onValueChange={onValueChange} />)
    await userEvent.click(getByRole('button', { name: 'Choose Delivery date, 22 October 2026 chosen' }))
    await expect.poll(() => document.activeElement?.getAttribute('aria-label')).toBe('Thursday 22 October 2026')
    await userEvent.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith(oct(23))
    await expect.poll(() => document.querySelector('[role="grid"]')).toBeNull()
    expect((getByRole('textbox') as HTMLInputElement).value).toBe('23/10/2026')
  })

  test('Alt+ArrowDown in the field opens the calendar', async () => {
    const { getByRole } = render(<DatePicker label="Date" locale="en-GB" />)
    getByRole('textbox').focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(() => document.querySelector('[role="grid"]')).not.toBeNull()
  })

  test('a hidden yyyy-mm-dd value submits with a form', () => {
    const { container } = render(<form><DatePicker label="Date" name="delivery" defaultValue={oct(5)} /></form>)
    expect(new FormData(container.querySelector('form')!).get('delivery')).toBe('2026-10-05')
  })
})
