/**
 * Contract test: Checkbox must forward a ref and spread unrecognised props
 * onto the real Radix root element, and merge a consumer's className instead
 * of discarding it. decisions/0006 established this for Button, decisions/0007
 * extends it to every primitive.
 */

import { createRef } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox prop/ref passthrough', () => {
  test('ref reaches the real Radix root DOM node', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Checkbox ref={ref} label="Agree" />)

    expect(ref.current).not.toBeNull()
    expect(ref.current).toHaveAttribute('role', 'checkbox')
  })

  test('consumer className merges with the component’s own', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Checkbox ref={ref} label="Agree" className="rights-checkbox" />)

    expect(ref.current?.className).toContain('checkbox__root')
    expect(ref.current?.className).toContain('rights-checkbox')
  })
})
