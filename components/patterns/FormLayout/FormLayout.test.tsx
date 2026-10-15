/**
 * FormLayout: sections are named landmarks; rows sit side by side only when
 * there's room; the actions stack with the main action on top when narrow;
 * the error summary takes focus, counts the problems and links to each
 * field. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { FormLayout, FormSection, FormRow, FormActions, FormErrorSummary } from './FormLayout'
import { Input } from '../../primitives/Input'
import { Button } from '../../primitives/Button'

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

const form = (width: number) => (
  <div style={{ inlineSize: `${width}px` }}>
    <FormLayout>
      <FormSection title="Contact details">
        <FormRow>
          <Input label="First name" />
          <Input label="Last name" />
        </FormRow>
      </FormSection>
      <FormActions>
        <Button variant="secondary">Back</Button>
        <Button type="submit">Continue</Button>
      </FormActions>
    </FormLayout>
  </div>
)

describe('FormLayout', () => {
  test('a section is a region named by its heading', () => {
    const { getByRole } = render(form(600))
    expect(getByRole('region', { name: 'Contact details' })).toBeTruthy()
    expect(getByRole('heading', { level: 2, name: 'Contact details' })).toBeTruthy()
  })

  test('wide: the row puts fields side by side; actions end-aligned, main action last', () => {
    const { getByRole } = render(form(600))
    const first = getByRole('textbox', { name: 'First name' }).getBoundingClientRect()
    const last = getByRole('textbox', { name: 'Last name' }).getBoundingClientRect()
    expect(last.top).toBe(first.top)
    const back = getByRole('button', { name: 'Back' }).getBoundingClientRect()
    const go = getByRole('button', { name: 'Continue' }).getBoundingClientRect()
    expect(go.left).toBeGreaterThan(back.left)
  })

  test('narrow: the row stacks; actions go full width with the main action on top', () => {
    const { getByRole } = render(form(320))
    const first = getByRole('textbox', { name: 'First name' }).getBoundingClientRect()
    const last = getByRole('textbox', { name: 'Last name' }).getBoundingClientRect()
    expect(last.top).toBeGreaterThan(first.bottom)
    const back = getByRole('button', { name: 'Back' }).getBoundingClientRect()
    const go = getByRole('button', { name: 'Continue' }).getBoundingClientRect()
    expect(go.top).toBeLessThan(back.top)
    expect(go.width).toBe(back.width)
  })
})

describe('FormErrorSummary', () => {
  const errors = [
    { id: 'name', message: 'Enter your name.' },
    { id: 'email', message: 'Enter an email address.' },
  ]

  test('nothing to show without errors', () => {
    const { container } = render(<FormErrorSummary errors={[]} />)
    expect(container.innerHTML).toBe('')
  })

  test('takes focus, is named by its count, and lists every message', () => {
    const { getByRole } = render(<FormErrorSummary errors={errors} />)
    const summary = getByRole('region', { name: 'There are 2 problems' })
    expect(document.activeElement).toBe(summary)
    expect(getByRole('link', { name: 'Enter your name.' })).toBeTruthy()
    expect(getByRole('link', { name: 'Enter an email address.' })).toBeTruthy()
  })

  test('one error reads "There is a problem"', () => {
    const { getByRole } = render(<FormErrorSummary errors={errors.slice(0, 1)} />)
    expect(getByRole('region', { name: 'There is a problem' })).toBeTruthy()
  })

  test('a link moves focus to its field', async () => {
    const { getByRole } = render(
      <>
        <FormErrorSummary errors={errors} />
        <Input id="name" label="Name" />
        <Input id="email" label="Email" />
      </>,
    )
    await userEvent.click(getByRole('link', { name: 'Enter an email address.' }))
    expect(document.activeElement).toBe(getByRole('textbox', { name: 'Email' }))
  })

  test('focusOnChange={false} leaves focus alone', () => {
    const { getByRole } = render(<><button type="button">x</button><FormErrorSummary errors={errors} focusOnChange={false} /></>)
    const b = getByRole('button')
    b.focus()
    expect(document.activeElement).toBe(b)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: summary text 4.5:1 on its background`, () => {
        const { getByRole } = render(
          <div data-brand={brand} data-mode={mode}><FormErrorSummary errors={errors} focusOnChange={false} /></div>,
        )
        const s = getComputedStyle(getByRole('region'))
        expect(contrast(s.color, s.backgroundColor)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
