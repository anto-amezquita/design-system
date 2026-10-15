/**
 * OtpInput: one real input named by the label, with one-time-code
 * autocomplete; keeps only allowed characters; paste fills every box;
 * onComplete fires once; an error marks it invalid; the boxes show what
 * the input holds. Runs in Chromium with the real CSS.
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
import { OtpInput } from './OtpInput'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const boxes = (c: HTMLElement) => Array.from(c.querySelectorAll('.otp-input__box')).map(b => b.textContent)

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

describe('OtpInput', () => {
  test('one input, named, described, set up for SMS autofill', () => {
    const { getAllByRole, getByRole } = render(<OtpInput label="Code" hint="Sent by text." />)
    expect(getAllByRole('textbox')).toHaveLength(1)
    const input = getByRole('textbox', { name: 'Code' })
    expect(input.getAttribute('autocomplete')).toBe('one-time-code')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    // No maxlength: it would cut a pasted "482 913" before the space is dropped.
    expect(input.hasAttribute('maxlength')).toBe(false)
  })

  test('typing fills the boxes and drops anything but digits', async () => {
    const { getByRole, container } = render(<OtpInput label="Code" />)
    await userEvent.type(getByRole('textbox'), '4a8-2')
    expect(boxes(container)).toEqual(['4', '8', '2', '', '', ''])
  })

  test('pasting a whole code fills every box and completes once', async () => {
    const onComplete = vi.fn()
    const { getByRole, container } = render(
      <>
        <input aria-label="Message" defaultValue="482 913" />
        <OtpInput label="Code" onComplete={onComplete} />
      </>,
    )
    // Copy the code the way it's often written, with a space, then paste it.
    const message = getByRole('textbox', { name: 'Message' }) as HTMLInputElement
    message.focus()
    message.select()
    await userEvent.copy()
    getByRole('textbox', { name: 'Code' }).focus()
    await userEvent.paste()
    expect(boxes(container)).toEqual(['4', '8', '2', '9', '1', '3'])
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('482913')
  })

  test('alphanumeric keeps letters, uppercased', async () => {
    const { getByRole, container } = render(<OtpInput label="Pairing" length={4} mode="alphanumeric" />)
    await userEvent.type(getByRole('textbox'), 'k7-x2')
    expect(boxes(container)).toEqual(['K', '7', 'X', '2'])
  })

  test('the next box shows the focus ring while focused', async () => {
    const { getByRole, container } = render(<OtpInput label="Code" defaultValue="48" />)
    expect(container.querySelector('.otp-input__box--active')).toBeNull()
    getByRole('textbox').focus()
    await expect.poll(() => Array.from(container.querySelectorAll('.otp-input__box')).findIndex(b => b.classList.contains('otp-input__box--active'))).toBe(2)
  })

  test('error marks it invalid and turns every box red', () => {
    const { getByRole, container } = render(<OtpInput label="Code" error="Wrong code." />)
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    const red = getComputedStyle(container.querySelector('.field__message--error')!).color
    for (const b of container.querySelectorAll('.otp-input__box')) expect(getComputedStyle(b).borderTopColor).toBe(red)
  })

  test('disabled', () => {
    const { getByRole } = render(<OtpInput label="Code" disabled />)
    expect((getByRole('textbox') as HTMLInputElement).disabled).toBe(true)
  })

  test('each box is a 44px-wide target and the input covers them all', () => {
    const { getByRole, container } = render(<OtpInput label="Code" />)
    const first = container.querySelector('.otp-input__box')!.getBoundingClientRect()
    expect(first.width).toBe(44)
    const input = getByRole('textbox').getBoundingClientRect()
    const row = container.querySelector('.otp-input__boxes')!.getBoundingClientRect()
    expect([input.width, input.height]).toEqual([row.width, row.height])
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: characters 4.5:1, box edge 3:1`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <OtpInput label="Code" defaultValue="4" />
          </div>,
        )
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        const box = getComputedStyle(container.querySelector('.otp-input__box')!)
        expect(contrast(box.color, box.backgroundColor)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(box.borderTopColor, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
