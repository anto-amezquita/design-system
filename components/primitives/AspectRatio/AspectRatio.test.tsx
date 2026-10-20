/**
 * AspectRatio: the box keeps its ratio at any width, the media child fills
 * it with the chosen fit, and the held space and rounding follow each brand.
 * Runs in Chromium with the real CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { AspectRatio, type AspectRatioPreset } from './AspectRatio'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

// A 1×1 transparent GIF, so tests don't depend on the network.
const pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

const size = (el: Element) => {
  const r = el.getBoundingClientRect()
  return { w: r.width, h: r.height }
}

describe('AspectRatio box', () => {
  const cases: [AspectRatioPreset, number][] = [
    ['1/1', 480], ['4/3', 360], ['3/2', 320], ['16/9', 270], ['21/9', 480 * 9 / 21], ['3/4', 640], ['9/16', 480 * 16 / 9],
  ]
  for (const [ratio, height] of cases) {
    test(`${ratio}: 480px wide is ${height.toFixed(1)}px tall`, () => {
      const { container } = render(<div style={{ inlineSize: '480px' }}><AspectRatio ratio={ratio} /></div>)
      const { w, h } = size(container.querySelector('.aspect-ratio')!)
      expect(w).toBe(480)
      expect(h).toBeCloseTo(height, 0)
    })
  }

  test('16/9 by default, and a number works', () => {
    const { container } = render(
      <div style={{ inlineSize: '370px' }}>
        <AspectRatio data-r="default" />
        <AspectRatio ratio={1.85} data-r="num" />
      </div>,
    )
    expect(size(container.querySelector('[data-r="default"]')!).h).toBeCloseTo(370 * 9 / 16, 0)
    expect(size(container.querySelector('[data-r="num"]')!).h).toBeCloseTo(200, 0)
  })

  test('a ratio that isn\'t a positive number falls back to 1/1', () => {
    const { container } = render(
      <div style={{ inlineSize: '200px' }}>
        <AspectRatio ratio={0} data-r="zero" />
        <AspectRatio ratio={'1/0' as AspectRatioPreset} data-r="div0" />
        <AspectRatio ratio={Number.NaN} data-r="nan" />
      </div>,
    )
    for (const k of ['zero', 'div0', 'nan']) expect(size(container.querySelector(`[data-r="${k}"]`)!).h, k).toBe(200)
  })

  test('keeps the ratio when the width changes', () => {
    const { container, rerender } = render(<div style={{ inlineSize: '320px' }}><AspectRatio ratio="4/3" /></div>)
    expect(size(container.querySelector('.aspect-ratio')!).h).toBe(240)
    rerender(<div style={{ inlineSize: '800px' }}><AspectRatio ratio="4/3" /></div>)
    expect(size(container.querySelector('.aspect-ratio')!).h).toBe(600)
  })
})

describe('AspectRatio media', () => {
  test('an img fills the box and covers by default', () => {
    const { container } = render(
      <div style={{ inlineSize: '400px' }}><AspectRatio ratio="16/9"><img src={pixel} alt="Studio desk" /></AspectRatio></div>,
    )
    const img = container.querySelector('img')!
    expect(size(img)).toEqual({ w: 400, h: 225 })
    expect(getComputedStyle(img).objectFit).toBe('cover')
  })

  test('contain shows all of it', () => {
    const { container } = render(<AspectRatio fit="contain"><img src={pixel} alt="" /></AspectRatio>)
    expect(getComputedStyle(container.querySelector('img')!).objectFit).toBe('contain')
  })

  test('a picture\'s img fills it; video and iframe fill the box', () => {
    const { container } = render(
      <div style={{ inlineSize: '300px' }}>
        <AspectRatio ratio="1/1"><picture><img src={pixel} alt="" data-m="pic" /></picture></AspectRatio>
        <AspectRatio ratio="1/1"><video data-m="video" muted /></AspectRatio>
        <AspectRatio ratio="1/1"><iframe title="Map" data-m="iframe" /></AspectRatio>
      </div>,
    )
    for (const k of ['pic', 'video', 'iframe']) expect(size(container.querySelector(`[data-m="${k}"]`)!), k).toEqual({ w: 300, h: 300 })
  })

  test('passes className, style, data attributes and ref through', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(<AspectRatio className="extra" data-x="1" style={{ maxInlineSize: '10px' }} ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toBe('aspect-ratio aspect-ratio--cover extra')
    expect(el.dataset.x).toBe('1')
    expect(el.style.maxInlineSize).toBe('10px')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('AspectRatio follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: held space is the secondary surface; rounded uses the image radius`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            <span data-probe style={{ background: 'var(--color-surface-secondary)', borderRadius: 'var(--border-radius-image)' }} />
            <AspectRatio rounded />
            <AspectRatio data-square />
          </div>,
        )
        const probe = getComputedStyle(container.querySelector('[data-probe]')!)
        const box = getComputedStyle(container.querySelector('.aspect-ratio--rounded')!)
        expect(box.backgroundColor).toBe(probe.backgroundColor)
        expect(box.borderTopLeftRadius).toBe(probe.borderTopLeftRadius)
        expect(getComputedStyle(container.querySelector('[data-square]')!).borderTopLeftRadius).toBe('0px')
      })
    }
  }
})
