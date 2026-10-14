/**
 * ToggleButton: aria-pressed carries the state, the label stays put, and
 * an off toggle never looks filled, not even on hover. Runs in Chromium
 * with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { ToggleButton } from './ToggleButton'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const Icon = () => <svg data-testid="icon" viewBox="0 0 10 10"><rect width="10" height="10" /></svg>

describe('ToggleButton', () => {
  test('uncontrolled: toggles aria-pressed and reports each change; the name stays', async () => {
    const onPressedChange = vi.fn()
    const { getByRole } = render(<ToggleButton label="Bold" onPressedChange={onPressedChange} />)
    const button = getByRole('button', { name: 'Bold' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(getByRole('button', { name: 'Bold' })).toBe(button)
    await userEvent.click(button)
    expect(onPressedChange.mock.calls).toEqual([[true], [false]])
  })

  test('controlled: follows the prop, not the click', async () => {
    const onPressedChange = vi.fn()
    const { getByRole } = render(<ToggleButton label="Mute" pressed={false} onPressedChange={onPressedChange} />)
    const button = getByRole('button')
    await userEvent.click(button)
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  test('keyboard: Space and Enter toggle', async () => {
    const { getByRole } = render(<ToggleButton label="Grid" />)
    const button = getByRole('button')
    button.focus()
    await userEvent.keyboard(' ')
    expect(button.getAttribute('aria-pressed')).toBe('true')
    await userEvent.keyboard('{Enter}')
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  test('disabled does not toggle', async () => {
    const { getByRole } = render(<ToggleButton label="Grid" disabled />)
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    button.click()
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  test('onClick runs first and can cancel the toggle', async () => {
    const { getByRole } = render(<ToggleButton label="Grid" onClick={e => e.preventDefault()} />)
    await userEvent.click(getByRole('button'))
    expect(getByRole('button').getAttribute('aria-pressed')).toBe('false')
  })

  test('hideLabel: a square icon button named by the label', () => {
    const { getByRole } = render(<ToggleButton label="Italic" icon={<Icon />} hideLabel />)
    const button = getByRole('button', { name: 'Italic' })
    expect(button.textContent).toBe('')
    const r = button.getBoundingClientRect()
    expect(r.width).toBe(r.height)
  })

  test('on is filled, off is not, and off stays unfilled on hover', async () => {
    const { getAllByRole } = render(
      <>
        <ToggleButton label="Off" />
        <ToggleButton label="On" defaultPressed />
      </>,
    )
    const [off, on] = getAllByRole('button')
    const accent = getComputedStyle(on).backgroundColor
    expect(getComputedStyle(off).backgroundColor).not.toBe(accent)
    await userEvent.hover(off)
    expect(getComputedStyle(off).backgroundColor).not.toBe(accent)
  })
})
