/**
 * Icon: hidden from screen readers unless named, sized to the brand's icon
 * tokens, and every tone at least 3:1 on the page surfaces (WCAG 1.4.11) in
 * every brand and mode. Runs in Chromium with the real CSS, so the cascade decides.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { BellIcon, WarningIcon } from '@phosphor-icons/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Icon } from './Icon'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Icon semantics', () => {
  test('decorative by default: hidden, not focusable', () => {
    const { container, queryByRole } = render(<Icon icon={BellIcon} />)
    const el = container.firstElementChild!
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(queryByRole('img')).toBeNull()
    expect(el.querySelector('svg')!.getAttribute('focusable')).toBe('false')
  })

  test('a label makes it an image with that name', () => {
    const { getByRole } = render(<Icon icon={WarningIcon} label="Warning" />)
    const img = getByRole('img', { name: 'Warning' })
    expect(img.getAttribute('aria-hidden')).toBeNull()
    expect(img.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('weight reaches the glyph', () => {
    const { container } = render(
      <div><Icon icon={BellIcon} data-w="regular" /><Icon icon={BellIcon} weight="fill" data-w="fill" /></div>,
    )
    const path = (w: string) => container.querySelector(`[data-w="${w}"] svg`)!.innerHTML
    expect(path('fill')).not.toBe(path('regular'))
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLSpanElement | null = null
    const { container } = render(<Icon icon={BellIcon} className="extra" data-x="1" ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLSpanElement
    expect(el.className).toBe('icon icon--md icon--tone-current extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })

  test('current takes the colour around it', () => {
    const { container } = render(<div style={{ color: 'rgb(1, 2, 3)' }}><Icon icon={BellIcon} /></div>)
    expect(getComputedStyle(container.querySelector('svg')!).color).toBe('rgb(1, 2, 3)')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const tones = ['primary', 'secondary', 'accent', 'error'] as const

describe('Icon follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: each size is its --size-icon-* token`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {sizes.map(size => (
              <div key={size}>
                <span data-probe={size} style={{ display: 'block', inlineSize: `var(--size-icon-${size})` }} />
                <Icon icon={BellIcon} size={size} data-size={size} />
              </div>
            ))}
          </div>,
        )
        for (const size of sizes) {
          const expected = container.querySelector(`[data-probe="${size}"]`)!.getBoundingClientRect().width
          const svg = container.querySelector(`[data-size="${size}"] svg`)!.getBoundingClientRect()
          expect(expected, size).toBeGreaterThan(0)
          expect(svg.width, size).toBe(expected)
          expect(svg.height, size).toBe(expected)
        }
      })

      test(`${brand ?? 'base'} ${mode}: every tone is 3:1 on the primary, secondary and tertiary surfaces`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode}>
            {(['primary', 'secondary', 'tertiary'] as const).map(surface => (
              <div key={surface} style={{ background: `var(--color-surface-${surface})` }}>
                {tones.map(tone => <Icon key={tone} icon={BellIcon} tone={tone} data-c={`${surface} ${tone}`} />)}
              </div>
            ))}
          </div>,
        )
        for (const el of Array.from(container.querySelectorAll('[data-c]'))) {
          expect(contrastOf(el), el.getAttribute('data-c')!).toBeGreaterThanOrEqual(3)
        }
      })
    }
  }
})
