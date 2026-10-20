/**
 * TreeView: the WAI-ARIA tree. One Tab stop; arrows move, open and close;
 * Home, End, typing and * work; each item is named by its own label, not
 * its children's; selection (single or multiple) and activation behave;
 * disabled rows can't be chosen; and rows stay readable in every brand.
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
import { contrastOf } from '../../../lib/contrast-test-utils'
import { TreeView, type TreeNode } from './TreeView'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

const items: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components', children: [{ id: 'button', label: 'Button.tsx' }, { id: 'card', label: 'Card.tsx' }] },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'docs', label: 'docs', children: [] },
  { id: 'readme', label: 'README.md' },
  { id: 'pkg', label: 'package.json', disabled: true },
]

/** A tree item by its label. */
const item = (name: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="treeitem"]'))
    .find(el => document.getElementById(el.getAttribute('aria-labelledby')!)!.textContent === name)!

describe('TreeView structure', () => {
  test('a named tree; items named by their own label, with level, position and one Tab stop', () => {
    const { getByRole } = render(<TreeView aria-label="Files" items={items} defaultExpanded={['src']} />)
    const tree = getByRole('tree', { name: 'Files' })
    expect(getByRole('treeitem', { name: 'src' }).getAttribute('aria-expanded')).toBe('true')
    const components = getByRole('treeitem', { name: 'components' })
    expect(components.getAttribute('aria-level')).toBe('2')
    expect(components.getAttribute('aria-posinset')).toBe('1')
    expect(components.getAttribute('aria-setsize')).toBe('2')
    expect(getByRole('treeitem', { name: 'README.md' }).hasAttribute('aria-expanded')).toBe(false)
    const stops = Array.from(tree.querySelectorAll('[role="treeitem"]')).filter(el => (el as HTMLElement).tabIndex === 0)
    expect(stops).toHaveLength(1)
    expect(stops[0]).toBe(item('src'))
  })
})

describe('TreeView keyboard', () => {
  test('Right opens, then moves to the first child; Left goes to the parent, then closes it', async () => {
    render(<TreeView aria-label="Files" items={items} />)
    item('src').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(item('src').getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(item('components'))
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(item('src'))
    await userEvent.keyboard('{ArrowLeft}')
    expect(item('src').getAttribute('aria-expanded')).toBe('false')
  })

  test('Down and Up move through the visible rows only; Home and End go to the ends', async () => {
    render(<TreeView aria-label="Files" items={items} defaultExpanded={['src']} />)
    item('src').focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(document.activeElement).toBe(item('index.ts'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(item('docs'))
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(item('package.json'))
    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(item('src'))
    await userEvent.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(item('src'))
  })

  test('typing jumps to the next row starting with the letters', async () => {
    render(<TreeView aria-label="Files" items={items} />)
    item('src').focus()
    await userEvent.keyboard('r')
    expect(document.activeElement).toBe(item('README.md'))
    await userEvent.keyboard('pa')
    expect(document.activeElement).toBe(item('package.json'))
  })

  test('* opens every branch beside the focused one', async () => {
    render(<TreeView aria-label="Files" items={items} />)
    item('src').focus()
    await userEvent.keyboard('*')
    expect(item('src').getAttribute('aria-expanded')).toBe('true')
    expect(item('docs').getAttribute('aria-expanded')).toBe('true')
  })

  test('the Tab stop follows the row you were on', async () => {
    render(<TreeView aria-label="Files" items={items} />)
    item('src').focus()
    await userEvent.keyboard('{End}')
    expect(item('package.json').tabIndex).toBe(0)
    expect(item('src').tabIndex).toBe(-1)
  })
})

describe('TreeView selection and activation', () => {
  test('single: Enter or a click selects one row; the Tab stop starts on the selected row', async () => {
    const onSelectedChange = vi.fn()
    const { getByRole } = render(
      <TreeView aria-label="Files" items={items} selectionMode="single" defaultSelected={['readme']} onSelectedChange={onSelectedChange} />,
    )
    expect(item('README.md').getAttribute('aria-selected')).toBe('true')
    expect(item('README.md').tabIndex).toBe(0)
    expect(item('src').getAttribute('aria-selected')).toBe('false')
    item('src').focus()
    await userEvent.keyboard('{Enter}')
    expect(onSelectedChange).toHaveBeenLastCalledWith(['src'])
    await userEvent.click(getByRole('treeitem', { name: 'docs' }).querySelector('.tree-view__label')!)
    expect(onSelectedChange).toHaveBeenLastCalledWith(['docs'])
  })

  test('multiple: Space toggles each row; the tree is multiselectable', async () => {
    const { getByRole } = render(<TreeView aria-label="Files" items={items} selectionMode="multiple" />)
    expect(getByRole('tree').getAttribute('aria-multiselectable')).toBe('true')
    item('src').focus()
    await userEvent.keyboard(' {End}{ArrowUp} ')
    expect(item('src').getAttribute('aria-selected')).toBe('true')
    expect(item('README.md').getAttribute('aria-selected')).toBe('true')
    await userEvent.keyboard(' ')
    expect(item('README.md').getAttribute('aria-selected')).toBe('false')
  })

  test('a disabled row is reachable but can\'t be selected or activated', async () => {
    const onAction = vi.fn()
    render(<TreeView aria-label="Files" items={items} selectionMode="single" onAction={onAction} />)
    item('package.json').focus()
    expect(item('package.json').getAttribute('aria-disabled')).toBe('true')
    await userEvent.keyboard('{Enter}')
    expect(item('package.json').getAttribute('aria-selected')).toBe('false')
    expect(onAction).not.toHaveBeenCalled()
  })

  test('no selection: Enter activates a row; without onAction, Enter opens a branch', async () => {
    const onAction = vi.fn()
    const { rerender } = render(<TreeView aria-label="Files" items={items} onAction={onAction} />)
    item('README.md').focus()
    await userEvent.keyboard('{Enter}')
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }))
    expect(item('README.md').hasAttribute('aria-selected')).toBe(false)
    rerender(<TreeView aria-label="Files" items={items} />)
    item('src').focus()
    await userEvent.keyboard('{Enter}')
    expect(item('src').getAttribute('aria-expanded')).toBe('true')
  })

  test('a click on the caret only opens or closes', async () => {
    const onSelectedChange = vi.fn()
    render(<TreeView aria-label="Files" items={items} selectionMode="single" onSelectedChange={onSelectedChange} />)
    await userEvent.click(item('src').querySelector('.tree-view__toggle')!)
    expect(item('src').getAttribute('aria-expanded')).toBe('true')
    expect(onSelectedChange).not.toHaveBeenCalled()
  })

  test('controlled expansion reports the change and follows the prop', async () => {
    const onExpandedChange = vi.fn()
    const { rerender } = render(<TreeView aria-label="Files" items={items} expanded={[]} onExpandedChange={onExpandedChange} />)
    item('src').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onExpandedChange).toHaveBeenCalledWith(['src'])
    expect(item('src').getAttribute('aria-expanded')).toBe('false')
    rerender(<TreeView aria-label="Files" items={items} expanded={['src']} onExpandedChange={onExpandedChange} />)
    expect(item('src').getAttribute('aria-expanded')).toBe('true')
  })

  test('passes className, data attributes and ref to the tree', () => {
    let node: HTMLUListElement | null = null
    const { getByRole } = render(<TreeView aria-label="F" items={items} className="extra" data-x="1" ref={n => { node = n }} />)
    const tree = getByRole('tree')
    expect(tree.className).toBe('tree-view extra')
    expect(tree.dataset.x).toBe('1')
    expect(node).toBe(tree)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

/** Contrast of a colour (a background or an icon's) against what's behind it, measured as text. */
function colourContrast(el: Element, colour: string) {
  const probe = document.createElement('span')
  probe.textContent = 'x'
  probe.style.color = colour
  el.append(probe)
  const ratio = contrastOf(probe)
  probe.remove()
  return ratio
}

describe('TreeView follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: rows, selected rows and disabled rows readable; caret and bar visible`, () => {
        render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <TreeView aria-label="Files" items={items} selectionMode="single" defaultSelected={['readme']} />
          </div>,
        )
        const row = (name: string) => item(name).querySelector(':scope > .tree-view__row')!
        expect(contrastOf(row('docs'))).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(row('README.md'))).toBeGreaterThanOrEqual(4.5)
        expect(contrastOf(row('package.json'))).toBeGreaterThanOrEqual(4.5)
        expect(colourContrast(row('src'), getComputedStyle(row('src').querySelector('.tree-view__toggle')!).color)).toBeGreaterThanOrEqual(3)
        const bar = getComputedStyle(row('README.md'), '::before').backgroundColor
        expect(colourContrast(row('README.md'), bar)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
