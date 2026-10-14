/**
 * Card's outline comes from card-border-color: the default border in base,
 * transparent in demo-soft, whose cards get their edge from a shadow (light)
 * or a lighter fill (dark) instead. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import demoSoftScoped from '../../../styles/brands/demo-soft-scoped.css?raw'
import { Card } from './Card'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + demoSoftScoped
  document.head.append(style)
})

afterEach(cleanup)

function resolved(name: string, scope: Element) {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  scope.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

describe('Card border', () => {
  test('base: the default border', () => {
    const { container } = render(<div data-mode="light"><Card>x</Card></div>)
    const card = container.querySelector('.card')!
    expect(getComputedStyle(card).borderTopColor).toBe(resolved('--color-border-default', container.firstElementChild!))
  })

  for (const mode of ['light', 'dark'] as const) {
    test(`demo-soft ${mode}: no outline, and the card still stands apart`, () => {
      const { container } = render(<div data-brand="demo-soft" data-mode={mode}><Card>x</Card></div>)
      const scope = container.firstElementChild!
      const card = container.querySelector('.card')!
      const style = getComputedStyle(card)
      expect(style.borderTopColor).toBe(TRANSPARENT)
      if (mode === 'light') expect(style.boxShadow).not.toBe('none')
      else expect(style.backgroundColor).not.toBe(resolved('--color-surface-primary', scope))
    })
  }
})
