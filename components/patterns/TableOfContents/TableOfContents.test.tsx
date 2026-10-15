/**
 * TableOfContents: a named nav with a nested list of in-page links; the
 * section being read gets aria-current="location". Follows the scroll of
 * the page or a container, marks a clicked link at once, and counts a
 * short last section at the end. Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { TableOfContents, headingsToItems } from './TableOfContents'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const items = [
  { id: 's1', label: 'One', children: [{ id: 's1a', label: 'One A' }] },
  { id: 's2', label: 'Two' },
  { id: 's3', label: 'Three' },
]

function Scroller({ onActiveChange }: { onActiveChange?: (id: string | null) => void }) {
  return (
    <div style={{ display: 'flex' }}>
      <div data-testid="root" style={{ height: 300, overflow: 'auto', width: 400 }}>
        <h2 id="s1" style={{ margin: 0, height: 400 }}>One</h2>
        <h3 id="s1a" style={{ margin: 0, height: 400 }}>One A</h3>
        <h2 id="s2" style={{ margin: 0, height: 400 }}>Two</h2>
        {/* A short last section that can never scroll up to the top. */}
        <h2 id="s3" style={{ margin: 0, height: 60 }}>Three</h2>
      </div>
      <Toc onActiveChange={onActiveChange} />
    </div>
  )
}

function Toc({ onActiveChange }: { onActiveChange?: (id: string | null) => void }) {
  return <TableOfContents items={items} root={document.querySelector<HTMLElement>('[data-testid="root"]')} offset={20} onActiveChange={onActiveChange} />
}

const current = () => document.querySelector('[aria-current="location"]')?.textContent ?? null

describe('TableOfContents', () => {
  test('a nav named "On this page" with a nested list of in-page links', () => {
    const { getByRole, getAllByRole } = render(<TableOfContents items={items} />)
    const nav = getByRole('navigation', { name: 'On this page' })
    expect(nav.querySelectorAll('ul ul')).toHaveLength(1)
    expect(getAllByRole('link').map(a => a.getAttribute('href'))).toEqual(['#s1', '#s1a', '#s2', '#s3'])
  })

  test('follows the scroll of a container, and counts a short last section at the end', async () => {
    const onActiveChange = vi.fn()
    const { getByTestId, rerender } = render(<Scroller />)
    // The root exists now; render again so the Toc gets it.
    rerender(<Scroller onActiveChange={onActiveChange} />)
    const root = getByTestId('root')
    await vi.waitFor(() => expect(current()).toBe('One'))
    root.scrollTop = 420
    await vi.waitFor(() => expect(current()).toBe('One A'))
    root.scrollTop = 820
    await vi.waitFor(() => expect(current()).toBe('Two'))
    root.scrollTop = root.scrollHeight
    await vi.waitFor(() => expect(current()).toBe('Three'))
    expect(onActiveChange).toHaveBeenLastCalledWith('s3')
  })

  test('a click marks the link at once', async () => {
    const { getByRole } = render(<TableOfContents items={items} />)
    await userEvent.click(getByRole('link', { name: 'Two' }))
    expect(current()).toBe('Two')
  })

  test('activeId sets it instead of the scroll', () => {
    render(<TableOfContents items={items} activeId="s1a" />)
    expect(current()).toBe('One A')
  })

  test('the visible title is hidden from screen readers, which hear the nav name', () => {
    const { container, rerender } = render(<TableOfContents items={items} />)
    expect(container.querySelector('.toc__title')!.getAttribute('aria-hidden')).toBe('true')
    rerender(<TableOfContents items={items} title={null} />)
    expect(container.querySelector('.toc__title')).toBeNull()
  })

  test('headingsToItems nests h3s under the h2 before them and skips headings without ids', () => {
    const div = document.createElement('div')
    div.innerHTML = '<h2 id="a">A</h2><h3 id="a1">A1</h3><h3>No id</h3><h2 id="b">B</h2><h3 id="b1">B1</h3>'
    expect(headingsToItems(div)).toEqual([
      { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
      { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
    ])
  })
})
