/**
 * Field: the label names the control, the hint or error describes it, an
 * error marks it invalid, and a group becomes a fieldset with a legend.
 * Works on a native element (by cloning props) and on Select (through the
 * shared context). Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Field } from './Field'
import { Select } from '../Select'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const groups = [{ options: [{ value: 'dk', label: 'Denmark' }] }]

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

describe('Field with a native control', () => {
  test('label names it, hint describes it', () => {
    const { getByRole } = render(<Field label="Name" hint="As on your passport."><input /></Field>)
    const input = getByRole('textbox', { name: 'Name' })
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe('As on your passport.')
  })

  test('error replaces the hint and marks it invalid', () => {
    const { getByRole, queryByText } = render(<Field label="Name" hint="Hint" error="Enter your name."><input /></Field>)
    const input = getByRole('textbox', { name: 'Name' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(queryByText('Hint')).toBeNull()
    expect(document.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe('Enter your name.')
  })

  test('required: the control is required and the label says so', () => {
    const { getByRole, getByText } = render(<Field label="Name" required><input /></Field>)
    expect((getByRole('textbox') as HTMLInputElement).required).toBe(true)
    expect(getByText('Required')).toBeTruthy()
  })

  test("doesn't override what the control already sets, and keeps its own description", () => {
    const { getByRole } = render(
      <>
        <p id="own">Own description</p>
        <Field label="Name" hint="Hint"><input id="custom" aria-describedby="own" /></Field>
      </>,
    )
    const input = getByRole('textbox', { name: 'Name' })
    expect(input.id).toBe('custom')
    expect(input.getAttribute('aria-describedby')!.split(' ')).toContain('own')
    expect(input.getAttribute('aria-describedby')!.split(' ')).toHaveLength(2)
  })
})

describe('Field with a Select', () => {
  test('the label names the trigger and the hint describes it, with no aria-label', () => {
    const { getByRole } = render(<Field label="Country" hint="Where the invoice goes."><Select groups={groups} /></Field>)
    const trigger = getByRole('combobox', { name: 'Country' })
    expect(document.getElementById(trigger.getAttribute('aria-describedby')!)!.textContent).toBe('Where the invoice goes.')
  })

  test('an error turns the trigger invalid with a red edge', () => {
    const { getByRole } = render(<Field label="Country" error="Choose one."><Select groups={groups} /></Field>)
    const trigger = getByRole('combobox', { name: 'Country' })
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    const red = getComputedStyle(document.querySelector('.field__message--error')!).color
    expect(getComputedStyle(trigger).borderTopColor).toBe(red)
  })
})

describe('Field group', () => {
  test('a fieldset with the label as legend, described by the hint', () => {
    const { getByRole } = render(
      <Field label="Delivery" group hint="Pick-up closes at 20:00.">
        <label><input type="radio" name="d" /> Door</label>
        <label><input type="radio" name="d" /> Pick-up</label>
      </Field>,
    )
    const group = getByRole('group', { name: 'Delivery' })
    expect(group.tagName).toBe('FIELDSET')
    expect(document.getElementById(group.getAttribute('aria-describedby')!)!.textContent).toBe('Pick-up closes at 20:00.')
  })
})

describe('Field colours', () => {
  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: label, hint and error are 4.5:1 on the page`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Field label="A" hint="Hint" required><input /></Field>
            <Field label="B" error="Error"><input /></Field>
          </div>,
        )
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        for (const sel of ['.field__label', '.field__required', '.field__message', '.field__message--error']) {
          for (const el of container.querySelectorAll(sel)) {
            expect(contrast(getComputedStyle(el).color, page), sel).toBeGreaterThanOrEqual(4.5)
          }
        }
      })
    }
  }
})
