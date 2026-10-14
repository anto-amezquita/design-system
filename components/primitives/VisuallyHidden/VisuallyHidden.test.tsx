/**
 * VisuallyHidden: announced, not seen. Runs in Chromium with the real CSS,
 * so the box it takes up is measured, not assumed.
 */

import { afterEach, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import { VisuallyHidden } from './VisuallyHidden'

afterEach(cleanup)

describe('VisuallyHidden', () => {
  test('names an icon-only button', () => {
    const { getByRole } = render(
      <button type="button"><svg aria-hidden="true" /><VisuallyHidden>Search</VisuallyHidden></button>,
    )
    expect(getByRole('button', { name: 'Search' })).toBeTruthy()
  })

  test('takes no visible space and does not shift layout', () => {
    const { getByText, getByTestId } = render(
      <div data-testid="row" style={{ display: 'flex', inlineSize: '200px' }}>
        <VisuallyHidden>A long hidden sentence that would otherwise wrap</VisuallyHidden>
      </div>,
    )
    const el = getByText(/long hidden/)
    const style = getComputedStyle(el)
    expect(style.position).toBe('absolute')
    expect(style.clipPath).toBe('inset(50%)')
    expect(el.getBoundingClientRect().width).toBe(1)
    expect(el.getBoundingClientRect().height).toBe(1)
    expect(getByTestId('row').getBoundingClientRect().height).toBe(0)
  })

  test('stays in the accessibility tree (not display: none or hidden)', () => {
    const { getByText } = render(<VisuallyHidden>Still here</VisuallyHidden>)
    const el = getByText('Still here')
    expect(getComputedStyle(el).display).not.toBe('none')
    expect(getComputedStyle(el).visibility).toBe('visible')
    expect(el.hasAttribute('hidden')).toBe(false)
  })

  test('renders a span by default, a div with as="div", and passes props through', () => {
    let node: HTMLElement | null = null
    const { getByText } = render(
      <>
        <VisuallyHidden>inline</VisuallyHidden>
        <VisuallyHidden as="div" id="x" className="extra" ref={n => { node = n }}>block</VisuallyHidden>
      </>,
    )
    expect(getByText('inline').tagName).toBe('SPAN')
    const block = getByText('block')
    expect(block.tagName).toBe('DIV')
    expect(block.id).toBe('x')
    expect(block.className).toBe('visually-hidden extra')
    expect(node).toBe(block)
  })
})
