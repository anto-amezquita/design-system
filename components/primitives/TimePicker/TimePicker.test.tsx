/**
 * TimePicker: the WAI-ARIA combobox with a listbox of times. Focus stays
 * in the field; Arrow Down opens at the nearest slot; arrows, Page and
 * Home/End move; Enter picks; Escape closes. Typing is forgiving and the
 * display follows the locale's clock. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { TimePicker } from './TimePicker'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const activeOption = (box: Element) => {
  const id = box.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}
const described = (el: Element) =>
  el.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')

describe('TimePicker', () => {
  test('a named combobox, closed, showing the time in the locale', () => {
    const { getByRole } = render(<TimePicker label="Meeting" locale="da-DK" defaultValue="14:30" />)
    const box = getByRole('combobox', { name: 'Meeting' }) as HTMLInputElement
    expect(box.value).toBe('14.30')
    expect(box.getAttribute('aria-expanded')).toBe('false')
    expect(described(box)).toBe('For example 14.30')
  })

  test('Arrow Down opens at the nearest slot; focus stays in the field', async () => {
    const { getByRole } = render(<TimePicker label="Meeting" locale="en-GB" defaultValue="14:37" />)
    const box = getByRole('combobox')
    box.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => box.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(box)
    expect(activeOption(box)).toBe('14:30')
    expect(document.getElementById(box.getAttribute('aria-controls')!)!.getAttribute('role')).toBe('listbox')
  })

  test('arrows, Page Up/Down (an hour) and Home/End move; Enter picks and closes', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TimePicker label="Meeting" locale="en-GB" defaultValue="09:00" onValueChange={onValueChange} />)
    const box = getByRole('combobox') as HTMLInputElement
    box.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(activeOption(box)).toBe('09:15')
    await userEvent.keyboard('{PageDown}')
    expect(activeOption(box)).toBe('10:15')
    await userEvent.keyboard('{End}')
    expect(activeOption(box)).toBe('23:45')
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('00:15')
    expect(box.value).toBe('00:15')
    await expect.poll(() => box.getAttribute('aria-expanded')).toBe('false')
  })

  test('Escape closes without changing the value', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TimePicker label="Meeting" defaultValue="09:00" onValueChange={onValueChange} />)
    const box = getByRole('combobox')
    box.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}')
    await expect.poll(() => box.getAttribute('aria-expanded')).toBe('false')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('clicking an option picks it and keeps focus in the field', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TimePicker label="Meeting" locale="en-GB" step={30} onValueChange={onValueChange} />)
    const box = getByRole('combobox')
    await userEvent.click(box)
    await expect.poll(() => document.querySelector('[role="listbox"]')).not.toBeNull()
    const option = Array.from(document.querySelectorAll('[role="option"]')).find(o => o.textContent === '10:30') as HTMLElement
    await userEvent.click(option)
    expect(onValueChange).toHaveBeenCalledWith('10:30')
    expect(document.activeElement).toBe(box)
  })

  test('typing is forgiving and tidied on Enter', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<TimePicker label="Meeting" locale="en-US" onValueChange={onValueChange} />)
    const box = getByRole('combobox') as HTMLInputElement
    await userEvent.type(box, '2pm{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('14:00')
    expect(box.value).toBe('2:00 PM')
  })

  test('a typed time outside the limits, or not a time, says why', async () => {
    const { getByRole } = render(<TimePicker label="Table at" locale="en-GB" min="17:00" max="22:00" />)
    const box = getByRole('combobox')
    await userEvent.type(box, '16:30{Enter}')
    expect(described(box)).toBe('Choose 17:00 or later.')
    await userEvent.clear(box)
    await userEvent.type(box, 'tea time{Enter}')
    expect(described(box)).toBe('Enter a time like 14:30.')
    expect(box.getAttribute('aria-invalid')).toBe('true')
  })

  test('the list respects min, max and step; the chosen option is selected', async () => {
    const { getByRole } = render(<TimePicker label="Table at" locale="en-GB" min="17:00" max="19:00" step={30} defaultValue="18:00" />)
    getByRole('combobox').focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(5)
    const selected = document.querySelector('[role="option"][aria-selected="true"]')!
    expect(selected.textContent).toBe('18:00')
  })

  test('submits "HH:mm" with a form', () => {
    const { container } = render(<form><TimePicker label="t" name="at" defaultValue="09:05" /></form>)
    expect(new FormData(container.querySelector('form')!).get('at')).toBe('09:05')
  })
})
