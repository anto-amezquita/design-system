/**
 * Contract test: Textarea must forward a ref and spread unrecognised props
 * onto the rendered <textarea>, the same contract decisions/0006 established
 * for Button and decisions/0007 extends to every primitive.
 *
 * A real external consumer (Ajar, decisions/0030 in that repo) needed
 * exactly the three things asserted here — onKeyDown (Enter/Backspace line
 * editing), onBlur (commit-on-blur persistence), and a DOM ref (auto-grow
 * height, a cross-field focus map) — and had none of them available before
 * this fix, because Textarea's props were a hand-written list with no
 * `...rest` and no ref.
 */

import { createRef } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea prop/ref passthrough', () => {
  test('ref reaches the real <textarea> DOM node', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} aria-label="Notes" value="hi" onChange={() => {}} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('TEXTAREA')
  })

  test('onKeyDown reaches the real <textarea>', () => {
    const onKeyDown = vi.fn()
    render(<Textarea aria-label="Notes" value="" onChange={() => {}} onKeyDown={onKeyDown} />)

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Notes' }), { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  test('onBlur reaches the real <textarea>', () => {
    const onBlur = vi.fn()
    render(<Textarea aria-label="Notes" value="" onChange={() => {}} onBlur={onBlur} />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    field.focus()
    field.blur()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  test('consumer className merges with the component’s own, rather than replacing it', () => {
    render(<Textarea aria-label="Notes" value="" onChange={() => {}} className="lyric" />)

    const field = screen.getByRole('textbox', { name: 'Notes' })
    expect(field.className).toContain('textarea-field__textarea')
    expect(field.className).toContain('lyric')
  })

  test('children is rejected at compile time, not silently spread onto a controlled textarea', () => {
    // Code review (2026-09-14): widening to TextareaHTMLAttributes admitted
    // `children` too, but Textarea is controlled via value/onChange — a
    // passed children would land in ...rest and hit a controlled <textarea>,
    // which React warns about and can hydration-mismatch on. The directive
    // below is the actual assertion: if `children` stops erroring (someone
    // widens the Omit list back), typecheck fails here.
    // @ts-expect-error - Textarea is controlled via value, doesn't accept children
    const element = <Textarea aria-label="Notes" value="" onChange={() => {}} children="nope" />
    void element
  })
})
