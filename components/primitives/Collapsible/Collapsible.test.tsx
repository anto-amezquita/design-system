/**
 * Collapsible: the disclosure pattern (a button with aria-expanded that
 * controls its panel), closed content out of the tab order and the
 * accessibility tree, keyboard operation, controlled and uncontrolled use,
 * and the trigger readable in every brand and mode.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { contrastOf } from '../../../lib/contrast-test-utils'
import { Collapsible } from './Collapsible'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
    // No waiting on the collapse in tests: the visibility change is delayed by the transition.
    + '.collapsible__panel, .collapsible__panel[data-state="open"] { transition: none !important; }'
  document.head.append(style)
})

afterEach(cleanup)

describe('Collapsible', () => {
  test('a button with aria-expanded that controls its panel; closed by default', () => {
    const { getByRole, container } = render(<Collapsible title="Shipping options">Ships in 2 days.</Collapsible>)
    const button = getByRole('button', { name: 'Shipping options' })
    const panel = container.querySelector('.collapsible__panel')!
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-controls')).toBe(panel.id)
    expect(getComputedStyle(panel).visibility).toBe('hidden')
    expect(panel.getBoundingClientRect().height).toBe(0)
  })

  test('closed content is out of the tab order', async () => {
    const { getByRole } = render(
      <Collapsible title="More"><a href="#x">Hidden link</a></Collapsible>,
    )
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('button'))
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(document.body)
  })

  test('Enter and Space open and close it; content becomes reachable', async () => {
    const { getByRole, container } = render(
      <Collapsible title="More"><a href="#x">Inside link</a></Collapsible>,
    )
    const button = getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    const panel = container.querySelector('.collapsible__panel')!
    await waitFor(() => expect(panel.getBoundingClientRect().height).toBeGreaterThan(0))
    expect(getComputedStyle(panel).visibility).toBe('visible')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('link', { name: 'Inside link' }))
    button.focus()
    await userEvent.keyboard(' ')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  test('defaultOpen starts open; onOpenChange reports changes', async () => {
    const onOpenChange = vi.fn()
    const { getByRole } = render(<Collapsible title="More" defaultOpen onOpenChange={onOpenChange}>x</Collapsible>)
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  test('controlled: follows the open prop, not its own clicks', async () => {
    const onOpenChange = vi.fn()
    const { getByRole, rerender } = render(<Collapsible title="More" open={false} onOpenChange={onOpenChange}>x</Collapsible>)
    await userEvent.click(getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('false')
    rerender(<Collapsible title="More" open onOpenChange={onOpenChange}>x</Collapsible>)
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('true')
  })

  test('headingLevel wraps a block trigger in a heading; inline never gets one', () => {
    const { getByRole, container } = render(
      <div>
        <Collapsible title="Shipping" headingLevel={3}>x</Collapsible>
        <Collapsible title="Show more" variant="inline" headingLevel={3}>y</Collapsible>
      </div>,
    )
    const heading = getByRole('heading', { level: 3, name: 'Shipping' })
    expect(heading.querySelector('button')).not.toBeNull()
    expect(container.querySelectorAll('h3')).toHaveLength(1)
  })

  test('closing hides the content only after the height has collapsed, and not at all for reduced motion', () => {
    render(<Collapsible title="t">x</Collapsible>)
    const rules = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules) } catch { return [] }
    })
    const closed = rules.find((r): r is CSSStyleRule => r instanceof CSSStyleRule && r.selectorText === '.collapsible__panel')!
    expect(closed.style.transition).toContain('visibility 0s linear var(--duration-transition)')
    const reduced = rules.filter((r): r is CSSMediaRule => r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion: reduce'))
      .flatMap(m => Array.from(m.cssRules) as CSSStyleRule[])
      .find(r => r.selectorText.includes('.collapsible__panel'))
    expect(reduced?.style.transition).toBe('none')
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(<Collapsible title="t" className="extra" data-x="1" ref={n => { node = n }}>x</Collapsible>)
    const el = container.firstElementChild as HTMLDivElement
    expect(el.className).toBe('collapsible collapsible--block extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('Collapsible follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: triggers 4.5:1 at rest and hovered; content 4.5:1`, async () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <Collapsible title="Block" defaultOpen data-c="block">Content</Collapsible>
            <Collapsible title="Inline" variant="inline" data-c="inline">Content</Collapsible>
          </div>,
        )
        for (const c of ['block', 'inline']) {
          const trigger = container.querySelector(`[data-c="${c}"] .collapsible__trigger`)!
          expect(contrastOf(trigger), `${c} rest`).toBeGreaterThanOrEqual(4.5)
          await userEvent.hover(trigger)
          expect(contrastOf(trigger), `${c} hover`).toBeGreaterThanOrEqual(4.5)
        }
        expect(contrastOf(container.querySelector('[data-c="block"] .collapsible__content')!)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
