/**
 * Contract test: Link follows the passthrough pattern every primitive has
 * since decisions/0006/0007 — consumer className merges, the ref reaches the
 * real <a>, and native attributes land on it — plus its own two contracts:
 * `external` sets target/rel and the hidden hint, and `asChild` hands all of
 * that to the child element instead of rendering its own <a>.
 */

import { createRef, forwardRef } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { page } from 'vitest/browser'
import { Link } from './Link'

describe('Link passthrough', () => {
  test('consumer className merges with the component’s own', () => {
    render(<Link href="/a" variant="standalone" className="site-footer__link">About</Link>)
    const el = screen.getByRole('link', { name: 'About' })
    expect(el.className).toContain('link')
    expect(el.className).toContain('link--standalone')
    expect(el.className).toContain('site-footer__link')
  })

  test('the ref reaches the real <a>', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(<Link ref={ref} href="/a">About</Link>)
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    expect(ref.current).toHaveAttribute('href', '/a')
  })

  test('native attributes and handlers reach the <a>', async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    render(<Link href="/a" data-testid="l" aria-describedby="x" onClick={onClick}>About</Link>)
    const el = screen.getByTestId('l')
    expect(el).toHaveAttribute('aria-describedby', 'x')
    await page.getByRole('link', { name: 'About' }).click()
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('Link external', () => {
  test('sets target and rel, keeps consumer rel tokens, and announces the new tab', () => {
    render(<Link href="https://example.com" external rel="me">Example</Link>)
    const el = screen.getByRole('link', { name: 'Example (opens in a new tab)' })
    expect(el).toHaveAttribute('target', '_blank')
    expect(el.getAttribute('rel')?.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer', 'me']))
  })

  test('without external, no target or hint is added', () => {
    render(<Link href="https://example.com">Example</Link>)
    const el = screen.getByRole('link', { name: 'Example' })
    expect(el).not.toHaveAttribute('target')
    expect(el).not.toHaveTextContent('opens in a new tab')
  })
})

describe('Link asChild', () => {
  const RouterLink = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    function RouterLink(props, ref) {
      return <a ref={ref} {...props} data-router="" />
    },
  )

  test('renders the child element with Link’s class and the child’s own props', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Link asChild ref={ref} className="extra" external>
        <RouterLink href="/start">Start</RouterLink>
      </Link>,
    )
    const el = screen.getByRole('link', { name: 'Start (opens in a new tab)' })
    expect(el).toHaveAttribute('data-router')
    expect(el).toHaveAttribute('href', '/start')
    expect(el).toHaveAttribute('target', '_blank')
    expect(el.className).toContain('link')
    expect(el.className).toContain('extra')
    expect(ref.current).toBe(el)
    // One element, not an <a> wrapping the router's <a>.
    expect(el.parentElement?.closest('a')).toBeNull()
  })
})
