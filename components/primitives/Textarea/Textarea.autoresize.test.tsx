/**
 * Textarea autoResize (G5, Ajar's LineRow and LineEditorSheet): the field
 * starts at `rows` lines, grows as the text wraps or breaks, stops at
 * `maxRows` and scrolls, shrinks back when text goes, and re-measures when
 * its width changes. Shares hooks/useAutoResize with ChatComposer. Runs in
 * Chromium with the real CSS, so the line height and padding are the brand's.
 */

import { createRef, useState } from 'react'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Textarea } from './Textarea'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const heightOf = (el: Element) => el.getBoundingClientRect().height
const lineOf = (el: Element) => parseFloat(getComputedStyle(el).lineHeight)
const lines = (n: number) => Array.from({ length: n }, (_, i) => `line ${i + 1}`).join('\n')

describe('Textarea autoResize', () => {
  test('starts at rows, grows a line at a time, stops at maxRows and scrolls', async () => {
    const { getByRole } = render(<Textarea label="Lyric" rows={2} autoResize maxRows={4} />)
    const field = getByRole('textbox')
    const start = heightOf(field)
    const line = lineOf(field)

    await userEvent.type(field, 'one{Enter}two')
    expect(heightOf(field)).toBe(start)

    await userEvent.type(field, '{Enter}three')
    expect(heightOf(field)).toBeCloseTo(start + line, 0)

    await userEvent.type(field, '{Enter}four{Enter}five{Enter}six')
    expect(heightOf(field)).toBeCloseTo(start + 2 * line, 0)
    expect(getComputedStyle(field).overflowY).toBe('auto')
  })

  test('shrinks back when text goes, never below rows', async () => {
    const { getByRole } = render(<Textarea label="Lyric" rows={2} autoResize defaultValue={lines(5)} />)
    const field = getByRole('textbox') as HTMLTextAreaElement
    const tall = heightOf(field)
    await userEvent.clear(field)
    const empty = heightOf(field)
    expect(empty).toBeLessThan(tall)
    await userEvent.type(field, 'x')
    expect(heightOf(field)).toBe(empty)
    expect(getComputedStyle(field).overflowY).toBe('hidden')
  })

  test('grows without a cap when maxRows is left out', () => {
    const { getByRole } = render(<Textarea label="Lyric" rows={1} autoResize defaultValue={lines(12)} />)
    const field = getByRole('textbox')
    expect(field.scrollHeight).toBeLessThanOrEqual(Math.ceil(heightOf(field)))
    expect(getComputedStyle(field).overflowY).toBe('hidden')
  })

  test('follows a controlled value set from outside', async () => {
    function Controlled() {
      const [value, setValue] = useState('one')
      return <><Textarea label="Lyric" rows={1} autoResize value={value} onChange={setValue} /><button type="button" onClick={() => setValue(lines(3))}>Fill</button></>
    }
    const { getByRole } = render(<Controlled />)
    const field = getByRole('textbox')
    const start = heightOf(field)
    await userEvent.click(getByRole('button', { name: 'Fill' }))
    expect(heightOf(field)).toBeCloseTo(start + 2 * lineOf(field), 0)
  })

  test('re-measures when the field gets narrower and the text wraps into more lines', async () => {
    const long = 'Every colour, size and space comes from a token, so a brand is a thin skin over the same components.'
    const { getByRole, container } = render(<div style={{ inlineSize: '40rem' }}><Textarea label="Lyric" rows={1} autoResize defaultValue={long} /></div>)
    const field = getByRole('textbox')
    const wide = heightOf(field)
    ;(container.firstElementChild as HTMLElement).style.inlineSize = '12rem'
    await expect.poll(() => heightOf(field)).toBeGreaterThan(wide)
  })

  test('has no resize handle, and the ref still reaches the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    const { getByRole } = render(<Textarea label="Lyric" autoResize ref={ref} />)
    expect(getComputedStyle(getByRole('textbox')).resize).toBe('none')
    expect(ref.current).toBe(getByRole('textbox'))
  })
})

describe('Textarea without autoResize', () => {
  test('keeps its rows and scrolls, with the handle', async () => {
    const { getByRole } = render(<Textarea label="Notes" rows={2} />)
    const field = getByRole('textbox')
    const start = heightOf(field)
    await userEvent.type(field, '1{Enter}2{Enter}3{Enter}4{Enter}5')
    expect(heightOf(field)).toBe(start)
    expect(getComputedStyle(field).resize).toBe('vertical')
    expect(field.style.blockSize).toBe('')
  })

  test('turning autoResize off hands the height back', async () => {
    const { getByRole, rerender } = render(<Textarea label="Lyric" rows={2} autoResize defaultValue={lines(6)} />)
    const field = getByRole('textbox')
    expect(field.style.blockSize).not.toBe('')
    rerender(<Textarea label="Lyric" rows={2} defaultValue={lines(6)} />)
    expect(field.style.blockSize).toBe('')
    expect(field.style.overflowY).toBe('')
  })
})
