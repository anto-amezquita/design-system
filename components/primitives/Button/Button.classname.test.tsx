/**
 * Contract test: Button merges a consumer's className instead of discarding
 * it. Not covered by Button.slot.test.tsx (which only asserts the asChild
 * ARIA contract) or by decisions/0006's fix (which spreads `...rest` but
 * still wrote its own `className={className}` after it, silently
 * overwriting anything a consumer passed). decisions/0007 closes this.
 */

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button className merge', () => {
  test('consumer className merges with the component’s own, on the <button> branch', () => {
    render(<Button className="line-row__history">History</Button>)
    const el = screen.getByRole('button', { name: 'History' })
    expect(el.className).toContain('button')
    expect(el.className).toContain('line-row__history')
  })

  test('consumer className merges with the component’s own, on the <a> branch', () => {
    render(<Button href="/song/1" className="library-row__delete">Open</Button>)
    const el = screen.getByRole('link', { name: 'Open' })
    expect(el.className).toContain('button')
    expect(el.className).toContain('library-row__delete')
  })
})
