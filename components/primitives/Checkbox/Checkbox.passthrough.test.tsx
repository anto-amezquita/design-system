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

  test('children and asChild are rejected at compile time, not silently discarded at runtime', () => {
    // Code review (2026-09-14): widening to RadixCheckbox.Root's own prop
    // type admitted `children`/`asChild` too, but Checkbox always renders a
    // fixed check/indeterminate icon as Root's real children, so either one
    // silently did nothing (children) or broke the component (asChild).
    // These two @ts-expect-error lines are the actual assertion — if either
    // prop stops erroring (someone widens the Omit list back), typecheck
    // fails here.
    // @ts-expect-error - Checkbox doesn't support custom children
    const withChildren = <Checkbox label="Agree" children={<span>nope</span>} />
    void withChildren
    // @ts-expect-error - Checkbox doesn't support asChild
    const withAsChild = <Checkbox label="Agree" asChild />
    void withAsChild
  })
})
