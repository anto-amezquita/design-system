/**
 * A disabled Button must not react to hover: before 1.6.5 the variants'
 * :hover rules had the same specificity as .button:disabled and came later
 * in the file, so a disabled secondary button turned accent under the
 * pointer, as if it could be pressed. Runs in Chromium with the base CSS,
 * and hovers with a real pointer, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Button } from './Button'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const look = (el: Element) => {
  const s = getComputedStyle(el)
  return `${s.backgroundColor} | ${s.color} | ${s.borderColor}`
}

describe('Button: disabled ignores hover', () => {
  for (const variant of ['primary', 'secondary', 'ghost'] as const) {
    test(`${variant}: a disabled button looks the same with the pointer on it`, async () => {
      const { getByText } = render(
        <>
          <Button variant={variant}>Enabled</Button>
          <Button variant={variant} disabled>Disabled</Button>
        </>,
      )
      const enabled = getByText('Enabled').closest('button')!
      const disabled = getByText('Disabled').closest('button')!

      const enabledAtRest = look(enabled)
      await userEvent.hover(enabled)
      // Guard: hover does change an enabled button, so the check below means something.
      await expect.poll(() => look(enabled)).not.toBe(enabledAtRest)

      await userEvent.unhover(enabled)
      const disabledAtRest = look(disabled)
      await userEvent.hover(disabled)
      // Give a transition time to run before reading.
      await new Promise((r) => setTimeout(r, 300))
      expect(look(disabled)).toBe(disabledAtRest)
    })
  }
})
