/**
 * ButtonGroup: a named group; attached buttons share one edge and keep
 * round corners only at the ends; every button stays a Tab stop. Runs in
 * Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + demoWarm
  document.head.append(style)
})

afterEach(cleanup)

const three = (props: Partial<React.ComponentProps<typeof ButtonGroup>> = {}) => (
  <ButtonGroup label="History" {...props}>
    <Button variant="secondary">One</Button>
    <Button variant="secondary">Two</Button>
    <Button variant="secondary">Three</Button>
  </ButtonGroup>
)

describe('ButtonGroup', () => {
  test('a group named by its label', () => {
    const { getByRole } = render(three())
    expect(getByRole('group', { name: 'History' })).toBeTruthy()
  })

  test('spaced by default', () => {
    const { getAllByRole } = render(three())
    const [a, b] = getAllByRole('button').map(x => x.getBoundingClientRect())
    expect(b.left - a.right).toBe(8)
  })

  for (const brand of [undefined, 'demo-warm'] as const) {
    test(`attached (${brand ?? 'base'}): neighbours overlap by one border, inner corners square`, () => {
      const { getAllByRole } = render(<div data-brand={brand}>{three({ attached: true })}</div>)
      const [a, b, c] = getAllByRole('button')
      const border = parseFloat(getComputedStyle(b).borderLeftWidth)
      expect(a.getBoundingClientRect().right - b.getBoundingClientRect().left).toBeCloseTo(border, 1)
      expect(getComputedStyle(a).borderTopRightRadius).toBe('0px')
      expect(getComputedStyle(b).borderTopLeftRadius).toBe('0px')
      expect(getComputedStyle(b).borderTopRightRadius).toBe('0px')
      expect(getComputedStyle(c).borderTopLeftRadius).toBe('0px')
      expect(getComputedStyle(a).borderTopLeftRadius).toBe(getComputedStyle(c).borderTopRightRadius)
    })
  }

  test('vertical attached: stacked, sharing horizontal edges', () => {
    const { getAllByRole, getByRole } = render(three({ attached: true, orientation: 'vertical' }))
    // role="group" doesn't take aria-orientation (axe: aria-allowed-attr); the layout is visual only.
    expect(getByRole('group').hasAttribute('aria-orientation')).toBe(false)
    const [a, b] = getAllByRole('button')
    expect(b.getBoundingClientRect().top).toBeLessThan(a.getBoundingClientRect().bottom)
    expect(getComputedStyle(a).borderBottomLeftRadius).toBe('0px')
  })

  test('each button is its own Tab stop', async () => {
    const { getAllByRole } = render(three({ attached: true }))
    const buttons = getAllByRole('button')
    buttons[0].focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(buttons[1])
  })
})
