/**
 * Contract tests for decisions/0016: Button is functional by default and the
 * expressive wipe is opt-in.
 *
 * Scope is deliberately the structural contract — which elements render for
 * which props, and that the two guards still short-circuit. Colours are not
 * asserted: the `unit` project loads no brand CSS, so every `var(--color-*)`
 * resolves to nothing here. Chromatic owns those.
 *
 * The wipe *animating* is not asserted either, and that gap is deliberate
 * rather than an oversight. Hovering an expressive Button reaches Button's
 * dynamic `import('gsap')`, which Vite then discovers mid-test and reloads the
 * page for; browser mode never recovers and the whole run hangs with no
 * failure, past every test timeout. A side-effect `import 'gsap'` at the top
 * of this file to force it into the graph at collection time does not fix it.
 * That proof lives one level up instead — driving real Storybook with
 * Playwright, where the chunk loads the way a consumer's would.
 *
 * matchMedia is stubbed rather than trusted, since a headless browser
 * answering `(hover: none)` differently would turn the wipe off and make these
 * pass for the wrong reason. The stub overrides only the two queries Button
 * checks and delegates the rest — replacing it wholesale starves Vitest's own
 * browser runner.
 */

import { afterEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Button } from './Button'

function stubMatchMedia({ reduce = false, noHover = false } = {}) {
  const real = window.matchMedia.bind(window)
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    const override = query.includes('prefers-reduced-motion')
      ? reduce
      : query.includes('hover')
        ? noHover
        : null
    const mql = real(query)
    if (override === null) return mql
    return {
      media: mql.media,
      matches: override,
      onchange: null,
      addListener: mql.addListener?.bind(mql),
      removeListener: mql.removeListener?.bind(mql),
      addEventListener: mql.addEventListener.bind(mql),
      removeEventListener: mql.removeEventListener.bind(mql),
      dispatchEvent: mql.dispatchEvent.bind(mql),
    } as MediaQueryList
  })
}

const wipePath = () => document.querySelector('.button__wipe path')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Button motion default', () => {
  test('functional is the default — no wipe, no glow, no GSAP to load', () => {
    stubMatchMedia()
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).className).not.toContain('button--expressive')
    expect(document.querySelector('.button__wipe')).toBeNull()
    expect(document.querySelector('.button__glow')).toBeNull()
  })

  test('expressive renders the wipe and glow it animates', () => {
    stubMatchMedia()
    render(<Button motion="expressive">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).className).toContain('button--expressive')
    expect(document.querySelector('.button__wipe')).not.toBeNull()
    expect(document.querySelector('.button__glow')).not.toBeNull()
  })

  test('the link variant opts out of the wipe even when asked for expressive', () => {
    stubMatchMedia()
    render(<Button variant="link" motion="expressive">Read more</Button>)
    expect(document.querySelector('.button__wipe')).toBeNull()
  })
})

describe('Button arrow default', () => {
  test('no arrow by default', () => {
    stubMatchMedia()
    render(<Button>Cancel</Button>)
    expect(document.querySelector('.button__arrow')).toBeNull()
  })

  test('arrow opts one in', () => {
    stubMatchMedia()
    render(<Button arrow>Read the case</Button>)
    expect(document.querySelector('.button__arrow')).not.toBeNull()
  })

  test('a trailing icon still wins over the arrow', () => {
    stubMatchMedia()
    render(<Button arrow icon={<span data-testid="icon" />} iconPosition="end">Star</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(document.querySelector('.button__arrow')).toBeNull()
  })
})

describe('Button expressive guards', () => {
  test('reduced motion leaves the wipe undrawn', async () => {
    stubMatchMedia({ reduce: true })
    render(<Button motion="expressive">Hover me</Button>)
    const el = screen.getByRole('button', { name: 'Hover me' })

    // The effect returns at the reduced-motion guard, before it draws anything.
    expect(wipePath()).not.toHaveAttribute('d')

    fireEvent.mouseEnter(el, { clientX: 10, clientY: 10 })
    await new Promise(r => setTimeout(r, 300))
    expect(wipePath()).not.toHaveAttribute('d')
  })

  test('a device without hover leaves the wipe undrawn', async () => {
    stubMatchMedia({ noHover: true })
    render(<Button motion="expressive">Tap me</Button>)
    const el = screen.getByRole('button', { name: 'Tap me' })

    fireEvent.mouseEnter(el, { clientX: 10, clientY: 10 })
    await new Promise(r => setTimeout(r, 300))
    expect(wipePath()).not.toHaveAttribute('d')
  })
})
