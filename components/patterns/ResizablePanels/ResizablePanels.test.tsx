/**
 * ResizablePanels: the window splitter pattern (a focusable separator with
 * its value, range and the pane it controls), arrow keys, Home and End,
 * Enter to collapse and restore, pointer dragging (in both writing
 * directions), double-click to reset, clamping, and a separator that's
 * visible and gains an accent when used, in every brand and mode.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseDark from '../../../styles/brands/base-dark.css?raw'
import baseLight from '../../../styles/brands/base-light.css?raw'
import portfolio from '../../../styles/brands/portfolio-scoped.css?raw'
import demoCool from '../../../styles/brands/demo-cool-scoped.css?raw'
import demoWarm from '../../../styles/brands/demo-warm-scoped.css?raw'
import demoSoft from '../../../styles/brands/demo-soft-scoped.css?raw'
import { ResizablePanels } from './ResizablePanels'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
    + '.resizable-panels__separator { transition: none !important; }'
  document.head.append(style)
})

afterEach(cleanup)

const panes = (props: Partial<React.ComponentProps<typeof ResizablePanels>> = {}) => (
  <div style={{ inlineSize: '1000px', blockSize: '400px', display: 'flex' }}>
    <ResizablePanels label="Resize file list" style={{ flex: 1 }} {...props}>
      <nav aria-label="Files">files</nav>
      <article>editor</article>
    </ResizablePanels>
  </div>
)

const firstWidth = (c: HTMLElement) => c.querySelector('.resizable-panels__pane--first')!.getBoundingClientRect().width

describe('ResizablePanels semantics', () => {
  test('a focusable separator with its name, value, range and the pane it controls', () => {
    const { getByRole, container } = render(panes({ defaultSize: 25, minSize: 15, maxSize: 60 }))
    const sep = getByRole('separator', { name: 'Resize file list' })
    expect(sep.tabIndex).toBe(0)
    expect(sep.getAttribute('aria-valuenow')).toBe('25')
    expect(sep.getAttribute('aria-valuemin')).toBe('15')
    expect(sep.getAttribute('aria-valuemax')).toBe('60')
    expect(sep.getAttribute('aria-valuetext')).toBe('25%')
    expect(sep.getAttribute('aria-orientation')).toBe('vertical')
    expect(document.getElementById(sep.getAttribute('aria-controls')!)).toBe(container.querySelector('.resizable-panels__pane--first'))
    expect(firstWidth(container)).toBeCloseTo(250, 0)
  })

  test('vertical: stacked, with a horizontal separator', () => {
    const { getByRole, container } = render(panes({ orientation: 'vertical', defaultSize: 50 }))
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal')
    const first = container.querySelector('.resizable-panels__pane--first')!.getBoundingClientRect()
    const second = container.querySelector('.resizable-panels__pane--second')!.getBoundingClientRect()
    expect(second.top).toBeGreaterThanOrEqual(first.bottom)
    expect(first.height).toBeCloseTo(200, 0)
  })
})

describe('ResizablePanels keyboard', () => {
  test('arrows move by the step; Home and End go to the limits', async () => {
    const onSizeChange = vi.fn()
    const { getByRole } = render(panes({ defaultSize: 30, minSize: 20, maxSize: 70, onSizeChange }))
    const sep = getByRole('separator')
    sep.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(sep.getAttribute('aria-valuenow')).toBe('35')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(sep.getAttribute('aria-valuenow')).toBe('25')
    await userEvent.keyboard('{End}')
    expect(sep.getAttribute('aria-valuenow')).toBe('70')
    await userEvent.keyboard('{ArrowRight}')
    expect(sep.getAttribute('aria-valuenow')).toBe('70')
    await userEvent.keyboard('{Home}')
    expect(sep.getAttribute('aria-valuenow')).toBe('20')
    expect(onSizeChange).toHaveBeenLastCalledWith(20)
  })

  test('vertical uses Up and Down', async () => {
    const { getByRole } = render(panes({ orientation: 'vertical', defaultSize: 50 }))
    const sep = getByRole('separator')
    sep.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(sep.getAttribute('aria-valuenow')).toBe('55')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(sep.getAttribute('aria-valuenow')).toBe('45')
  })

  test('collapsible: Enter collapses the first pane and restores it', async () => {
    const { getByRole, container } = render(panes({ defaultSize: 40, collapsible: true }))
    const sep = getByRole('separator')
    sep.focus()
    await userEvent.keyboard('{Enter}')
    expect(sep.getAttribute('aria-valuenow')).toBe('0')
    expect(sep.getAttribute('aria-valuetext')).toBe('Collapsed')
    expect(sep.getAttribute('aria-valuemin')).toBe('0')
    expect((container.querySelector('.resizable-panels__pane--first') as HTMLElement).hidden).toBe(true)
    await userEvent.keyboard('{Enter}')
    expect(sep.getAttribute('aria-valuenow')).toBe('40')
  })

  test('Enter does nothing when not collapsible', async () => {
    const { getByRole } = render(panes({ defaultSize: 40 }))
    getByRole('separator').focus()
    await userEvent.keyboard('{Enter}')
    expect(getByRole('separator').getAttribute('aria-valuenow')).toBe('40')
  })

  test('keyboard focus shows a ring', async () => {
    const { getByRole } = render(panes())
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('separator'))
    expect(getComputedStyle(getByRole('separator')).outlineStyle).toBe('solid')
  })
})

describe('ResizablePanels pointer', () => {
  const drag = (sep: Element, x: number, y = 200) => {
    fireEvent.pointerDown(sep, { pointerId: 1, button: 0, clientX: 300, clientY: y })
    fireEvent.pointerMove(sep, { pointerId: 1, clientX: x, clientY: y })
    fireEvent.pointerUp(sep, { pointerId: 1, clientX: x, clientY: y })
  }

  test('dragging sets the size from the pointer, clamped to the range', () => {
    const { getByRole, container } = render(panes({ defaultSize: 30, minSize: 10, maxSize: 80 }))
    const sep = getByRole('separator')
    const left = container.querySelector('.resizable-panels')!.getBoundingClientRect().left
    drag(sep, left + 500)
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    drag(sep, left + 950)
    expect(sep.getAttribute('aria-valuenow')).toBe('80')
    drag(sep, left + 300)
    expect(sep.getAttribute('aria-valuenow')).toBe('30')
  })

  test('right to left: the first pane is on the right, and dragging follows', () => {
    const { getByRole, container } = render(<div dir="rtl">{panes({ defaultSize: 30 })}</div>)
    const sep = getByRole('separator')
    const root = container.querySelector('.resizable-panels')!.getBoundingClientRect()
    drag(sep, root.right - 400)
    expect(sep.getAttribute('aria-valuenow')).toBe('40')
  })

  test('double-click returns to the default size', () => {
    const { getByRole } = render(panes({ defaultSize: 30 }))
    const sep = getByRole('separator')
    sep.focus()
    fireEvent.keyDown(sep, { key: 'End' })
    fireEvent.doubleClick(sep)
    expect(sep.getAttribute('aria-valuenow')).toBe('30')
  })

  test('controlled: reports changes, shows the size it is given', () => {
    const onSizeChange = vi.fn()
    const { getByRole, rerender } = render(panes({ size: 30, onSizeChange }))
    fireEvent.keyDown(getByRole('separator'), { key: 'ArrowRight' })
    expect(onSizeChange).toHaveBeenCalledWith(35)
    expect(getByRole('separator').getAttribute('aria-valuenow')).toBe('30')
    rerender(panes({ size: 50, onSizeChange }))
    expect(getByRole('separator').getAttribute('aria-valuenow')).toBe('50')
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
const lum = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const ratio = (a: string, b: string) => { const [h, l] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05) }

describe('ResizablePanels follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: the line is the border colour; focused, it turns accent at 3:1`, () => {
        const { getByRole, container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            {panes()}
            <span data-probe style={{ color: 'var(--color-border-default)' }} />
          </div>,
        )
        const sep = getByRole('separator')
        expect(getComputedStyle(sep).backgroundColor).toBe(getComputedStyle(container.querySelector('[data-probe]')!).color)
        sep.focus()
        const page = getComputedStyle(container.firstElementChild!).backgroundColor
        expect(ratio(getComputedStyle(sep).backgroundColor, page)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
