/**
 * Badge as="button" looks like it does something (G2): a border in the
 * text's own colour on hover, the focus ring on keyboard focus, and a target
 * of at least 24px (WCAG 2.5.8) without changing the pill's size. A plain
 * Badge keeps none of that. Runs in Chromium with the real CSS and real
 * pointer and keyboard input, so :hover and :focus-visible are the browser's.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import { Badge } from './Badge'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark
  document.head.append(style)
})

afterEach(cleanup)

const variants = ['neutral', 'success', 'warning', 'error', 'info'] as const

describe('Badge as="button"', () => {
  test.each(variants)('%s: hover turns the border to the text colour', async variant => {
    const { container } = render(<div style={{ padding: '2rem' }}><Badge as="button" variant={variant}>Ajar</Badge></div>)
    const badge = container.querySelector('button')!
    const rest = getComputedStyle(badge).borderTopColor
    await userEvent.hover(badge)
    await expect.poll(() => getComputedStyle(badge).borderTopColor).toBe(getComputedStyle(badge).color)
    expect(getComputedStyle(badge).borderTopColor).not.toBe(rest)
    expect(getComputedStyle(badge).cursor).toBe('pointer')
  })

  test('keyboard focus shows the focus ring', async () => {
    const { container } = render(<Badge as="button">Ajar</Badge>)
    await userEvent.keyboard('{Tab}')
    const badge = container.querySelector('button')!
    expect(document.activeElement).toBe(badge)
    expect(getComputedStyle(badge).outlineStyle).toBe('solid')
    expect(parseFloat(getComputedStyle(badge).outlineWidth)).toBeGreaterThan(0)
  })

  test('the target is at least 24px tall, while the pill stays the size of a plain Badge', () => {
    const { container } = render(<div><Badge as="button">Ajar</Badge><Badge>Ajar</Badge></div>)
    const [button, span] = Array.from(container.firstElementChild!.children) as HTMLElement[]
    expect(button.getBoundingClientRect().height).toBe(span.getBoundingClientRect().height)
    const grow = -parseFloat(getComputedStyle(button, '::after').top)
    expect(button.getBoundingClientRect().height + 2 * grow).toBeGreaterThanOrEqual(24)
  })

  test('looks like a plain Badge at rest: same font, colours and border', () => {
    const { container } = render(<div><Badge as="button" variant="info">Ajar</Badge><Badge variant="info">Ajar</Badge></div>)
    const [button, span] = Array.from(container.firstElementChild!.children).map(el => getComputedStyle(el))
    for (const prop of ['fontFamily', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'borderTopColor', 'borderTopWidth', 'paddingTop', 'paddingLeft'] as const) {
      expect(button[prop], prop).toBe(span[prop])
    }
  })
})

describe('a plain Badge', () => {
  test('stays a span, out of the tab order, with no pointer', async () => {
    const { container } = render(<Badge>Ajar</Badge>)
    const badge = container.firstElementChild as HTMLElement
    expect(badge.tagName).toBe('SPAN')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).not.toBe(badge)
    expect(getComputedStyle(badge).cursor).not.toBe('pointer')
  })
})
