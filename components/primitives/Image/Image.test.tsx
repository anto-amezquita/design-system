/**
 * Image: alt and loading behaviour, the held space, the fallback when the
 * file fails (keeping the name and the space), the caption as a figure, and
 * the fallback icon and caption at 3:1 / 4.5:1 in every brand and mode.
 * Runs in Chromium with the real CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Image } from './Image'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
const broken = 'data:image/png;base64,bm90LWFuLWltYWdl'

describe('Image', () => {
  test('renders an img with its alt, lazy and async by default', () => {
    const { getByRole } = render(<Image src={pixel} alt="Studio desk" />)
    const img = getByRole('img', { name: 'Studio desk' }) as HTMLImageElement
    expect(img.tagName).toBe('IMG')
    expect(img.loading).toBe('lazy')
    expect(img.decoding).toBe('async')
  })

  test('eager when asked; empty alt is decoration', () => {
    const { container, queryByRole } = render(<Image src={pixel} alt="" loading="eager" />)
    expect((container.querySelector('img') as HTMLImageElement).loading).toBe('eager')
    expect(queryByRole('img')).toBeNull()
  })

  test('width and height hold the space before it loads, and it never overflows', () => {
    const { container } = render(
      <div style={{ inlineSize: '300px' }}><Image src={pixel} alt="x" width={600} height={400} /></div>,
    )
    const r = container.querySelector('img')!.getBoundingClientRect()
    expect(r.width).toBe(300)
    expect(r.height).toBe(200)
  })

  test('ratio frames it in an AspectRatio with the fit', () => {
    const { container } = render(
      <div style={{ inlineSize: '320px' }}><Image src={pixel} alt="x" ratio="4/3" fit="contain" rounded /></div>,
    )
    const frame = container.querySelector('.aspect-ratio')!
    expect(frame.className).toContain('aspect-ratio--contain')
    expect(frame.className).toContain('aspect-ratio--rounded')
    expect(frame.getBoundingClientRect().height).toBe(240)
    expect(container.querySelector('img')!.getBoundingClientRect().height).toBe(240)
  })

  test('passes attributes, className and ref to the img', () => {
    let node: HTMLImageElement | null = null
    const { container } = render(<Image src={pixel} alt="x" className="extra" data-x="1" ref={n => { node = n }} />)
    const img = container.querySelector('img')!
    expect(img.className).toBe('image extra')
    expect(img.dataset.x).toBe('1')
    expect(node).toBe(img)
  })
})

describe('Image fallback', () => {
  test('a failed image keeps its name and its space', async () => {
    const onError = vi.fn()
    const { container, getByRole } = render(
      <div style={{ inlineSize: '320px' }}><Image src={broken} alt="Team photo" ratio="16/9" onError={onError} /></div>,
    )
    await waitFor(() => expect(container.querySelector('img')).toBeNull())
    const fallback = getByRole('img', { name: 'Team photo' })
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback.getBoundingClientRect().height).toBe(180)
    expect(onError).toHaveBeenCalledOnce()
  })

  test('without a ratio it takes the width/height shape', async () => {
    const { container } = render(
      <div style={{ inlineSize: '300px' }}><Image src={broken} alt="x" width={600} height={300} /></div>,
    )
    await waitFor(() => expect(container.querySelector('.image__fallback')).not.toBeNull())
    expect(container.querySelector('.image__fallback')!.getBoundingClientRect().height).toBe(150)
  })

  test('a decorative image that fails stays hidden', async () => {
    const { container, queryByRole } = render(<Image src={broken} alt="" />)
    await waitFor(() => expect(container.querySelector('.image__fallback')).not.toBeNull())
    expect(queryByRole('img')).toBeNull()
  })

  test('a new src tries again', async () => {
    const { container, rerender } = render(<Image src={broken} alt="x" />)
    await waitFor(() => expect(container.querySelector('img')).toBeNull())
    rerender(<Image src={pixel} alt="x" />)
    await waitFor(() => expect(container.querySelector('img')).not.toBeNull())
  })
})

describe('Image caption', () => {
  test('a caption makes it a figure, named by the caption', () => {
    const { getByRole } = render(<Image src={pixel} alt="Studio desk" caption="The desk where the brands were drawn." />)
    const figure = getByRole('figure', { name: 'The desk where the brands were drawn.' })
    expect(figure.querySelector('img')!.alt).toBe('Studio desk')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Image follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: fallback icon 3:1 on its surface; caption 4.5:1 on the page`, async () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Image src={broken} alt="Team photo" ratio="1/1" caption="Caption text" />
          </div>,
        )
        await waitFor(() => expect(container.querySelector('.image__fallback')).not.toBeNull())
        expect(contrastOf(container.querySelector('.image__fallback')!)).toBeGreaterThanOrEqual(3)
        expect(contrastOf(container.querySelector('figcaption')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
