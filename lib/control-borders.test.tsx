/**
 * Form fields draw their edge with color-border-strong, which the
 * control-boundary contrast pairs keep at 3:1 or more on both surfaces
 * (WCAG 1.4.11). They used color-border-default, 1.21:1 in base light and
 * 1.04:1 in demo-soft: an input's edge was close to invisible. Runs in
 * Chromium with the real CSS, in base and demo-soft, light and dark.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../styles/brands/base-dark.css?raw'
import baseLight from '../styles/brands/base-light.css?raw'
import demoSoftScoped from '../styles/brands/demo-soft-scoped.css?raw'
import { Input } from '../components/primitives/Input'
import { Select } from '../components/primitives/Select'
import { Textarea } from '../components/primitives/Textarea'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + demoSoftScoped
  document.head.append(style)
})

afterEach(cleanup)

function rgb(color: string) {
  const [r, g, b] = color.match(/[\d.]+/g)!.map(Number)
  return [r, g, b]
}
function luminance(color: string) {
  const [r, g, b] = rgb(color).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const scopes = [
  ['base light', { 'data-mode': 'light' }],
  ['base dark', { 'data-mode': 'dark' }],
  ['demo-soft light', { 'data-brand': 'demo-soft', 'data-mode': 'light' }],
  ['demo-soft dark', { 'data-brand': 'demo-soft', 'data-mode': 'dark' }],
] as const

describe('form field edges', () => {
  for (const [name, attrs] of scopes) {
    test(`${name}: Input, Textarea and Select have a 3:1 edge`, () => {
      const { container } = render(
        <div {...attrs} style={{ background: 'var(--color-surface-primary)' }}>
          <Input label="Name" />
          <Textarea label="Notes" />
          <Select aria-label="Size" groups={[{ options: [{ value: "s", label: "Small" }] }]} />
        </div>,
      )
      const scope = container.firstElementChild!
      const surface = getComputedStyle(scope).backgroundColor
      for (const selector of ['.input-field__wrapper', '.textarea-field__wrapper', '.select__trigger']) {
        const edge = getComputedStyle(container.querySelector(selector)!).borderTopColor
        expect(contrast(edge, surface), `${selector} ${edge} on ${surface}`).toBeGreaterThanOrEqual(3)
      }
    })
  }
})
