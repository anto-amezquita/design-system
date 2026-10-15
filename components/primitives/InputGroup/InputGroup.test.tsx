/**
 * InputGroup: the label names the Input, addon text and the hint describe
 * it, an error marks it invalid, and the pieces join into one shape. Also
 * covers Input reading a surrounding Field. Runs in Chromium with the real
 * CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { InputGroup, InputAddon } from './InputGroup'
import { Input } from '../Input'
import { Button } from '../Button'
import { Field } from '../Field'

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
const description = (el: Element) =>
  el.getAttribute('aria-describedby')!.split(' ').map(id => document.getElementById(id)!.textContent).join(' ')

describe('InputGroup', () => {
  test('the label names the Input; addon text and hint describe it, in order', () => {
    const { getByRole } = render(
      <InputGroup label="Website" hint="Your site.">
        <InputAddon>https://</InputAddon>
        <Input />
      </InputGroup>,
    )
    expect(description(getByRole('textbox', { name: 'Website' }))).toBe('https:// Your site.')
  })

  test('error: invalid, red edge, message replaces hint', () => {
    const { getByRole, queryByText, container } = render(
      <InputGroup label="Price" hint="Hint" error="Enter a price.">
        <Input />
        <InputAddon>kr.</InputAddon>
      </InputGroup>,
    )
    const input = getByRole('textbox', { name: 'Price' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(queryByText('Hint')).toBeNull()
    const red = getComputedStyle(container.querySelector('.field__message--error')!).color
    expect(getComputedStyle(container.querySelector('.input-field__wrapper')!).borderTopColor).toBe(red)
  })

  test('required and disabled reach the Input', () => {
    const { getByRole } = render(
      <InputGroup label="Code" required disabled><Input /></InputGroup>,
    )
    const input = getByRole('textbox', { name: 'Code' }) as HTMLInputElement
    expect(input.required).toBe(true)
    expect(input.disabled).toBe(true)
  })

  test('pieces join: one shared edge, square inner corners, round ends', () => {
    const { container } = render(
      <div style={{ inlineSize: '360px' }}>
        <InputGroup label="Price">
          <InputAddon>https://</InputAddon>
          <Input />
          <Button variant="secondary">Apply</Button>
        </InputGroup>
      </div>,
    )
    const addon = container.querySelector('.input-group__addon')!
    const wrapper = container.querySelector('.input-field__wrapper')!
    const button = container.querySelector('.button')!
    const border = parseFloat(getComputedStyle(wrapper).borderLeftWidth)
    expect(addon.getBoundingClientRect().right - wrapper.getBoundingClientRect().left).toBeCloseTo(border, 1)
    expect(getComputedStyle(addon).borderTopRightRadius).toBe('0px')
    expect(getComputedStyle(wrapper).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(wrapper).borderTopRightRadius).toBe('0px')
    expect(getComputedStyle(button).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(addon).borderTopLeftRadius).not.toBe('0px')
    // Same height across the row.
    expect(addon.getBoundingClientRect().height).toBe(wrapper.getBoundingClientRect().height)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: addon text 4.5:1 on its surface`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            <InputGroup label="Price"><Input /><InputAddon>kr.</InputAddon></InputGroup>
          </div>,
        )
        const s = getComputedStyle(container.querySelector('.input-group__addon')!)
        expect(contrast(s.color, s.backgroundColor)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

describe('Input inside a Field', () => {
  test('an unlabelled Input takes the Field label, hint and error', () => {
    const { getByRole } = render(<Field label="Email" error="Enter an email."><Input /></Field>)
    const input = getByRole('textbox', { name: 'Email' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(description(input)).toBe('Enter an email.')
  })

  test('an Input with its own label ignores the Field context', () => {
    const { getByRole } = render(
      <InputGroup label="Outer"><Input label="Inner" /></InputGroup>,
    )
    expect(getByRole('textbox', { name: 'Inner' }).getAttribute('aria-describedby')).toBeNull()
  })
})
