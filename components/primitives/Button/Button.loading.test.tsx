/**
 * Loading keeps the variant's colours: it means "busy, wait", not
 * "unavailable". The native <button> is disabled while loading, so the
 * disabled styles must not apply to it: first the disabled opacity turned
 * primary pale; now disabled has its own quieter colours instead. Runs in
 * Chromium with the base CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Button } from './Button'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const opacity = (el: Element) => getComputedStyle(el).opacity
const look = (el: Element) => { const s = getComputedStyle(el); return `${s.backgroundColor} ${s.color}` }

describe('Button loading vs disabled', () => {
  for (const variant of ['primary', 'secondary', 'ghost'] as const) {
    test(`${variant}: loading keeps the variant's look; disabled looks different`, () => {
      const { getByText } = render(
        <>
          <Button variant={variant}>Enabled</Button>
          <Button variant={variant} loading>Loading</Button>
          <Button variant={variant} disabled>Disabled</Button>
        </>,
      )
      const enabled = getByText('Enabled').closest('button')!
      const loading = getByText('Loading').closest('button')!
      const disabled = getByText('Disabled').closest('button')!
      expect(loading.disabled).toBe(true)
      expect(opacity(loading)).toBe('1')
      expect(look(loading)).toBe(look(enabled))
      expect(look(disabled)).not.toBe(look(enabled))
    })
  }

  test('a loading link Button stays at full opacity too', () => {
    const { container } = render(<Button href="/x" loading>Go</Button>)
    expect(opacity(container.querySelector('a')!)).toBe('1')
  })
})
