/**
 * CodeBlock: the code exactly as given (no extra lines, numbers not part of
 * the text), the Copy button copies it and says so, highlighted lines are
 * marked by more than colour, long lines scroll in a keyboard-reachable
 * region or wrap, and everything is readable in every brand and mode.
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
import { CodeBlock } from './CodeBlock'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const code = `
import { Button } from '@amezquita/design-system'

export function Save() {
  return <Button>Save</Button>
}
`

describe('CodeBlock content', () => {
  test('a figure named by its filename, with the code in pre > code', () => {
    const { container, getByRole } = render(<CodeBlock code={code} filename="Save.tsx" language="tsx" />)
    expect(getByRole('figure', { name: 'Save.tsx' })).toBeTruthy()
    const codeEl = container.querySelector('pre > code')!
    expect(codeEl.className).toBe('language-tsx')
    expect(container.querySelectorAll('.code-block__line')).toHaveLength(5)
  })

  test('the rendered text is the code: trimmed, no extra blank lines, numbers left out', () => {
    const { container } = render(<CodeBlock code={code} lineNumbers />)
    const pre = container.querySelector('pre')!
    const trimmed = code.trim()
    // Numbers are aria-hidden and not selectable.
    const n = container.querySelector('.code-block__number')!
    expect(n.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(n).userSelect).toBe('none')
    // Text content of the code lines, joined, is exactly the trimmed code.
    const lines = Array.from(container.querySelectorAll('.code-block__text')).map(t => t.textContent === ' ' ? '' : t.textContent)
    expect(lines.join('\n')).toBe(trimmed)
    // Each line is one line tall: no doubled breaks.
    const h = parseFloat(getComputedStyle(pre).lineHeight)
    expect(container.querySelector('.code-block__line')!.getBoundingClientRect().height).toBeCloseTo(h, 0)
  })

  test('highlighted lines are a mark, with a bar as well as a tint', () => {
    const { container } = render(<CodeBlock code={code} highlight={[4]} />)
    const lines = container.querySelectorAll('.code-block__line')
    const marked = lines[3]
    expect(marked.querySelector('mark')!.textContent).toBe('  return <Button>Save</Button>')
    expect(lines[0].querySelector('mark')).toBeNull()
    const bar = getComputedStyle(marked, '::before')
    expect(parseFloat(bar.width)).toBeGreaterThan(0)
  })

  test('long lines scroll sideways in a named, focusable region; wrap wraps', () => {
    const long = 'const tokens = ' + '"--color-surface-primary", '.repeat(12)
    const { container, getByRole } = render(
      <div style={{ inlineSize: '300px' }}>
        <CodeBlock code={long} language="ts" data-c="scroll" />
        <CodeBlock code={long} filename="wrap.ts" wrap data-c="wrap" />
      </div>,
    )
    const region = getByRole('region', { name: 'Code: ts' })
    expect(region.tabIndex).toBe(0)
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth)
    const wrapped = getByRole('region', { name: 'Code: wrap.ts' })
    expect(wrapped.scrollWidth).toBeLessThanOrEqual(wrapped.clientWidth)
    expect(container.querySelector('[data-c="wrap"] .code-block__line')!.getBoundingClientRect().height)
      .toBeGreaterThan(parseFloat(getComputedStyle(container.querySelector('[data-c="wrap"] pre')!).lineHeight) * 1.5)
  })
})

describe('CodeBlock copy', () => {
  test('copies the trimmed code, then says Copied, and announces it', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    const { getByRole, container } = render(<CodeBlock code={code} filename="Save.tsx" />)
    await userEvent.click(getByRole('button', { name: 'Copy Save.tsx' }))
    expect(write).toHaveBeenCalledWith(code.trim())
    await waitFor(() => getByRole('button', { name: 'Copied' }))
    expect(container.querySelector('[role="status"]')!.textContent).toBe('Copied to clipboard')
  })

  test('a blocked clipboard leaves the button as it was', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    const { getByRole } = render(<CodeBlock code="x" />)
    await userEvent.click(getByRole('button', { name: 'Copy code' }))
    await new Promise(r => setTimeout(r, 50))
    expect(getByRole('button', { name: 'Copy code' })).toBeTruthy()
  })

  test('copyable={false} and no name: no header', () => {
    const { container } = render(<CodeBlock code="x" copyable={false} />)
    expect(container.querySelector('.code-block__header')).toBeNull()
    expect(container.querySelector('[role="region"]')!.getAttribute('aria-label')).toBe('Code')
  })

  test('passes className, data attributes and ref to the figure', () => {
    let node: HTMLElement | null = null
    const { container } = render(<CodeBlock code="x" className="extra" data-x="1" ref={n => { node = n }} />)
    const fig = container.querySelector('figure')!
    expect(fig.className).toBe('code-block extra')
    expect(fig.dataset.x).toBe('1')
    expect(node).toBe(fig)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

describe('CodeBlock follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: code, line numbers, name and highlighted line 4.5:1; mono face`, () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <CodeBlock code={code} filename="Save.tsx" lineNumbers highlight={[4]} />
            <span data-probe style={{ fontFamily: 'var(--font-family-mono)' }} />
          </div>,
        )
        expect(getComputedStyle(container.querySelector('pre')!).fontFamily).toBe(getComputedStyle(container.querySelector('[data-probe]')!).fontFamily)
        for (const sel of ['.code-block__text', '.code-block__number', '.code-block__name', 'mark']) {
          for (const el of Array.from(container.querySelectorAll(sel))) {
            expect(contrastOf(el), sel).toBeGreaterThanOrEqual(4.5)
          }
        }
      })
    }
  }
})
