/**
 * Carousel: the WAI-ARIA carousel pattern on a scroll-snap track. Moves by
 * button, dot and arrow key; out-of-view slides are inert; a polite status
 * names the slide after a user move; autoplay rotates, pauses, and never
 * runs under reduced motion. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Carousel, CarouselSlide } from './Carousel'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const five = (props: Partial<React.ComponentProps<typeof Carousel>> = {}) => (
  <div style={{ inlineSize: '400px' }}>
    <Carousel label="Projects" {...props}>
      {['A', 'B', 'C', 'D', 'E'].map(t => (
        <CarouselSlide key={t}><div style={{ blockSize: '100px' }}>Slide {t} <a href="#x">link {t}</a></div></CarouselSlide>
      ))}
    </Carousel>
  </div>
)

const currentDot = () => document.querySelector('.carousel__dot[aria-current="true"]')?.getAttribute('aria-label')

describe('Carousel semantics', () => {
  test('a named carousel region with "n of N" slides', () => {
    const { getByRole, getAllByRole } = render(five())
    const region = getByRole('region', { name: 'Projects' })
    expect(region.getAttribute('aria-roledescription')).toBe('carousel')
    const slides = getAllByRole('group').filter(g => g.getAttribute('aria-roledescription') === 'slide')
    expect(slides.map(s => s.getAttribute('aria-label'))).toEqual(['1 of 5', '2 of 5', '3 of 5', '4 of 5', '5 of 5'])
  })

  test('slides out of view are inert, so Tab skips their links', () => {
    const { getAllByRole } = render(five())
    const slides = getAllByRole('group').filter(g => g.getAttribute('aria-roledescription') === 'slide')
    expect(slides.map(s => s.inert)).toEqual([false, true, true, true, true])
  })
})

describe('Carousel movement', () => {
  test('Next and Previous move one slide; Previous is disabled at the start, Next at the end', async () => {
    const onIndexChange = vi.fn()
    const { getByRole } = render(five({ onIndexChange }))
    const prev = getByRole('button', { name: 'Previous slide' }) as HTMLButtonElement
    const next = getByRole('button', { name: 'Next slide' }) as HTMLButtonElement
    expect(prev.disabled).toBe(true)
    await userEvent.click(next)
    await expect.poll(currentDot).toBe('Go to slide 2')
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    await userEvent.click(getByRole('button', { name: 'Go to slide 5' }))
    await expect.poll(currentDot).toBe('Go to slide 5')
    expect(next.disabled).toBe(true)
    await userEvent.click(prev)
    await expect.poll(currentDot).toBe('Go to slide 4')
  })

  test('arrow keys on the track move by a slide', async () => {
    const { getByRole } = render(five())
    getByRole('group', { name: 'Slides' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(currentDot).toBe('Go to slide 2')
    await userEvent.keyboard('{ArrowLeft}')
    await expect.poll(currentDot).toBe('Go to slide 1')
  })

  test('a user move is announced politely', async () => {
    const { getByRole, container } = render(five())
    const status = container.querySelector('.carousel__status')!
    expect(status.textContent).toBe('')
    expect(status.getAttribute('aria-live')).toBe('polite')
    await userEvent.click(getByRole('button', { name: 'Next slide' }))
    await expect.poll(() => status.textContent).toBe('Slide 2 of 5')
  })

  test('perView 2: one dot per position, and two slides awake', () => {
    const { getAllByRole, container } = render(five({ perView: 2 }))
    expect(container.querySelectorAll('.carousel__dot')).toHaveLength(4)
    const slides = getAllByRole('group').filter(g => g.getAttribute('aria-roledescription') === 'slide')
    expect(slides.map(s => s.inert)).toEqual([false, false, true, true, true])
  })

  test('defaultIndex starts there', async () => {
    render(five({ defaultIndex: 2 }))
    await expect.poll(currentDot).toBe('Go to slide 3')
  })

  test('controlled index scrolls to the prop', async () => {
    const { rerender } = render(five({ index: 0 }))
    rerender(five({ index: 3 }))
    await expect.poll(currentDot).toBe('Go to slide 4')
  })
})

describe('Carousel autoplay', () => {
  test('rotates, with a pause button first and the status silent', async () => {
    // Earlier tests leave the pointer where this carousel renders, and a
    // hovered carousel rightly waits. Park the pointer outside first.
    const { getByRole, container } = render(<>{five({ autoplay: true, interval: 200 })}<p data-testid="away">away</p></>)
    await userEvent.hover(container.querySelector('[data-testid="away"]')!)
    const pause = getByRole('button', { name: 'Pause slides' })
    expect(container.querySelector('.carousel__controls button')).toBe(pause)
    expect(container.querySelector('.carousel__status')!.getAttribute('aria-live')).toBe('off')
    await expect.poll(currentDot, { timeout: 2000 }).toBe('Go to slide 2')
    await userEvent.click(pause)
    expect(getByRole('button', { name: 'Play slides' })).toBeTruthy()
  })

  test('stops while focus is inside', async () => {
    const { getByRole } = render(five({ autoplay: true, interval: 150 }))
    getByRole('button', { name: 'Next slide' }).focus()
    await new Promise(r => setTimeout(r, 500))
    expect(currentDot()).toBe('Go to slide 1')
  })

  test('never rotates under reduced motion, and offers Play', async () => {
    const real = window.matchMedia
    vi.spyOn(window, 'matchMedia').mockImplementation(q =>
      q.includes('prefers-reduced-motion') ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList) : real(q),
    )
    const { getByRole } = render(five({ autoplay: true, interval: 100 }))
    await new Promise(r => setTimeout(r, 450))
    expect(currentDot()).toBe('Go to slide 1')
    // The button tells the truth: it isn't rotating, so it offers Play.
    expect(getByRole('button', { name: 'Play slides' })).toBeTruthy()
  })
})

describe('Carousel dots', () => {
  test('the current dot is wider, not only a different colour; each dot has a 44px target', () => {
    const { getByRole } = render(five())
    const current = getByRole('button', { name: 'Go to slide 1' })
    const other = getByRole('button', { name: 'Go to slide 2' })
    expect(current.getBoundingClientRect().width).toBe(other.getBoundingClientRect().width * 3)
    const r = other.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top - 15)
    expect(hit).toBe(other)
  })

  for (const brand of [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: dots 3:1 on the page`, () => {
        const { getByRole } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)', padding: 40 }}>{five()}</div>,
        )
        const page = getComputedStyle(getByRole('region').closest('[data-mode]')!).backgroundColor
        for (const name of ['Go to slide 1', 'Go to slide 2']) {
          const dot = getComputedStyle(getByRole('button', { name })).backgroundColor
          expect(contrast(dot, page)).toBeGreaterThanOrEqual(3)
        }
      })
    }
  }
})

function luminance(color: string) {
  const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
