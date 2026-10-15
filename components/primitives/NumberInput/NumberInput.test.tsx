/**
 * NumberInput: the WAI-ARIA spinbutton pattern on a text input. Parses
 * either decimal mark, steps with the keys and buttons, clamps on blur,
 * keeps what was typed when it isn't a number and says why. Runs in
 * Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { NumberInput, parseNumber } from './NumberInput'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

describe('parseNumber', () => {
  test.each([
    ['', null], ['  ', null],
    ['12', 12], ['-3', -3], ['−3', -3],
    ['1,5', 1.5], ['1.5', 1.5], [',5', 0.5],
    ['1.234,5', 1234.5], ['1,234.5', 1234.5],
    ['1.000.000', 1000000], ['1 000', 1000],
    ['abc', NaN], ['1-2', NaN], ['1,2,3.4.5', NaN],
  ])('%j → %s', (text, expected) => {
    expect(parseNumber(text)).toBe(expected)
  })
})

describe('NumberInput', () => {
  test('a named spinbutton with min, max and now', () => {
    const { getByRole } = render(<NumberInput label="Guests" min={1} max={12} defaultValue={2} />)
    const s = getByRole('spinbutton', { name: 'Guests' })
    expect([s.getAttribute('aria-valuemin'), s.getAttribute('aria-valuemax'), s.getAttribute('aria-valuenow')]).toEqual(['1', '12', '2'])
  })

  test('keys: arrows step, Page Up/Down take big steps, Home/End jump to the limits', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<NumberInput label="Guests" min={0} max={100} defaultValue={5} onValueChange={onValueChange} />)
    const s = getByRole('spinbutton') as HTMLInputElement
    s.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(s.value).toBe('6')
    await userEvent.keyboard('{PageUp}')
    expect(s.value).toBe('16')
    await userEvent.keyboard('{End}')
    expect(s.value).toBe('100')
    await userEvent.keyboard('{ArrowUp}')
    expect(s.value).toBe('100')
    await userEvent.keyboard('{Home}')
    expect(s.value).toBe('0')
    expect(onValueChange.mock.calls.map(c => c[0])).toEqual([6, 16, 100, 0])
  })

  test('decimal steps land cleanly (0.1 + 0.2 is 0.3)', async () => {
    const { getByRole } = render(<NumberInput label="Weight" step={0.1} defaultValue={0.1} locale="en" />)
    const s = getByRole('spinbutton') as HTMLInputElement
    s.focus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(s.value).toBe('0.3')
  })

  test('typing either mark works, and the locale formats it on blur', async () => {
    const onValueChange = vi.fn()
    const { getByRole } = render(<NumberInput label="Weight" locale="da-DK" onValueChange={onValueChange} />)
    const s = getByRole('spinbutton') as HTMLInputElement
    await userEvent.type(s, '2.5')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(2.5)
    expect(s.value).toBe('2,5')
  })

  test('clamps to the limits on blur', async () => {
    const { getByRole } = render(<NumberInput label="Guests" min={1} max={12} />)
    const s = getByRole('spinbutton') as HTMLInputElement
    await userEvent.type(s, '40')
    await userEvent.tab()
    expect(s.value).toBe('12')
  })

  test("not a number: keeps the text and says why after blur; clears on the next edit", async () => {
    const { getByRole, queryByText } = render(<NumberInput label="Guests" />)
    const s = getByRole('spinbutton') as HTMLInputElement
    await userEvent.type(s, 'two')
    expect(queryByText('Enter a number.')).toBeNull()
    await userEvent.tab()
    expect(s.value).toBe('two')
    expect(s.getAttribute('aria-invalid')).toBe('true')
    expect(queryByText('Enter a number.')).toBeTruthy()
    await userEvent.type(s, '{Backspace}')
    expect(queryByText('Enter a number.')).toBeNull()
  })

  test('buttons step, are named after the field, stay out of the Tab order, and disable at the limits', async () => {
    const { getByRole } = render(<NumberInput label="Guests" min={1} max={3} defaultValue={2} />)
    const plus = getByRole('button', { name: 'Increase Guests' }) as HTMLButtonElement
    const minus = getByRole('button', { name: 'Decrease Guests' }) as HTMLButtonElement
    expect(plus.tabIndex).toBe(-1)
    await userEvent.click(plus)
    expect((getByRole('spinbutton') as HTMLInputElement).value).toBe('3')
    expect(plus.disabled).toBe(true)
    expect(minus.disabled).toBe(false)
  })

  test('controlled: follows the prop', async () => {
    const onValueChange = vi.fn()
    const { getByRole, rerender } = render(<NumberInput label="Qty" value={1} onValueChange={onValueChange} />)
    const s = getByRole('spinbutton') as HTMLInputElement
    s.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenCalledWith(2)
    rerender(<NumberInput label="Qty" value={7} onValueChange={onValueChange} />)
    expect(s.value).toBe('7')
  })

  test('the unit is read with the value', () => {
    const { getByRole } = render(<NumberInput label="Budget" defaultValue={50} unit="kr." locale="en" />)
    expect(getByRole('spinbutton').getAttribute('aria-valuetext')).toBe('50 kr.')
  })
})
