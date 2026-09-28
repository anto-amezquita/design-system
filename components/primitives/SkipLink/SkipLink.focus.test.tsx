/**
 * Contract test: SkipLink moves focus, not just the scroll position. A plain
 * #hash jump to a non-focusable <main> scrolls there in most browsers, but the
 * next Tab starts again from the top of the page — the whole point of a skip
 * link is lost. Driven with real keyboard input (vitest/browser's userEvent,
 * backed by Playwright), not a synthetic click.
 */

import { createRef } from 'react'
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import '../../../styles/brands/base-light.css'
import { SkipLink } from './SkipLink'

describe('SkipLink focus', () => {
  test('Tab reveals it first, Enter moves focus into <main>', async () => {
    render(
      <>
        <SkipLink />
        <nav><a href="/a">A</a><a href="/b">B</a></nav>
        <main id="main-content"><p>Content</p></main>
      </>,
    )
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    const main = screen.getByRole('main')

    await userEvent.keyboard('{Tab}')
    expect(link).toHaveFocus()
    // Revealed: no longer the 1px clipped box it is at rest.
    expect(link.getBoundingClientRect().width).toBeGreaterThan(1)

    await userEvent.keyboard('{Enter}')
    expect(main).toHaveFocus()
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  test('leaves a target that is already focusable alone', async () => {
    render(
      <>
        <SkipLink targetId="search" />
        <input id="search" aria-label="Search" />
      </>,
    )
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    const input = screen.getByRole('textbox', { name: 'Search' })
    expect(input).toHaveFocus()
    expect(input).not.toHaveAttribute('tabindex')
  })
})

describe('SkipLink passthrough', () => {
  test('className merges and the ref reaches the <a>', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(<SkipLink ref={ref} className="site-skip" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(ref.current).toBe(el)
    expect(el.className).toContain('skip-link')
    expect(el.className).toContain('site-skip')
    expect(el).toHaveAttribute('href', '#main-content')
  })
})
