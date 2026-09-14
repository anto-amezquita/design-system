/**
 * Contract test: Input forwards a ref and merges a consumer's className,
 * closing the gap in Input's own passthrough — it already extended
 * InputHTMLAttributes and spread `...rest`, but had no typed `ref` prop and
 * its `className="input-field__input"` was a literal, not merged. Part of
 * decisions/0007's className fix, applied to every primitive including the
 * ones that already had partial passthrough.
 */

import { createRef } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { Input } from './Input'

describe('Input ref forwarding and className merge', () => {
  test('ref reaches the real <input> DOM node', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} aria-label="Song title" value="hi" onChange={() => {}} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('INPUT')
  })

  test('consumer className merges with the component’s own', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} aria-label="Song title" value="hi" onChange={() => {}} className="song-title" />)

    expect(ref.current?.className).toContain('input-field__input')
    expect(ref.current?.className).toContain('song-title')
  })

  test('children is rejected at compile time — <input> is a void element', () => {
    // Same latent gap the code review flagged on Textarea (2026-09-14):
    // InputHTMLAttributes admits `children` via DOMAttributes, but <input>
    // is a void element. Constructed only, never rendered — React itself
    // throws a hard invariant for children on a void element at mount time,
    // which is a real, separate guarantee, not what this test is checking.
    // The directive below is the actual assertion: if `children` stops
    // erroring (someone widens the Omit list back), typecheck fails here.
    // @ts-expect-error - <input> is a void element, doesn't accept children
    const element = <Input aria-label="Song title" value="hi" onChange={() => {}} children="nope" />
    void element
  })
})
