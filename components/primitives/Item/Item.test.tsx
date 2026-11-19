/**
 * Item: the row's parts in order, a linked row that is one target with the
 * title as its name while trailing controls stay their own Tab stops, the
 * focus ring on the row, current page marked by more than colour, and text
 * readable at rest and on hover in every brand and mode.
 */

import { useState } from 'react'
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
import { Dialog } from '../../composition/Dialog'
import { List } from '../List'
import { Item } from './Item'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight + baseDark + portfolio + demoCool + demoWarm + demoSoft
  document.head.append(style)
})

afterEach(cleanup)

describe('Item', () => {
  test('a list item with leading, title, description and trailing in order', () => {
    const { getByRole } = render(
      <List aria-label="Files">
        <Item leading={<span data-part="lead" />} title="tokens.json" description="12 KB" trailing={<span data-part="trail">Edited</span>} />
      </List>,
    )
    const li = getByRole('listitem')
    expect(Array.from(li.children).map(c => c.className)).toEqual(['item__leading', 'item__body', 'item__trailing'])
    expect(li.querySelector('.item__title')!.textContent).toBe('tokens.json')
    expect(li.querySelector('.item__description')!.textContent).toBe('12 KB')
  })

  test('without href there is nothing to focus', () => {
    const { container } = render(<Item as="div" title="Plain" />)
    expect(container.querySelector('a')).toBeNull()
  })

  test('href: the title is the link, and the whole row is its target', () => {
    const { getByRole, container } = render(
      <List><Item href="#brief" title="Brand brief" description="PDF, 2 MB" /></List>,
    )
    const link = getByRole('link', { name: 'Brand brief' })
    expect(link.getAttribute('href')).toBe('#brief')
    const row = container.querySelector('.item')!.getBoundingClientRect()
    const after = getComputedStyle(link, '::after')
    expect(after.position).toBe('absolute')
    // Clicking the description (not the title) lands on the link.
    const desc = container.querySelector('.item__description')!.getBoundingClientRect()
    const hit = document.elementFromPoint(desc.left + 2, desc.top + desc.height / 2)
    expect(hit).toBe(link)
    expect(row.width).toBeGreaterThan(0)
  })

  test('trailing controls stay their own targets and Tab stops', async () => {
    const { getByRole } = render(
      <List>
        <Item href="#brief" title="Brand brief" trailing={<button type="button">Share</button>} />
      </List>,
    )
    const button = getByRole('button', { name: 'Share' })
    const r = button.getBoundingClientRect()
    expect(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)).toBe(button)
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('link'))
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(button)
  })

  test('keyboard focus rings the whole row', async () => {
    const { container } = render(<List><Item href="#a" title="A" /></List>)
    await userEvent.keyboard('{Tab}')
    expect(getComputedStyle(container.querySelector('.item')!).outlineStyle).toBe('solid')
  })

  test('current: aria-current on the link, and a bar, not only a colour', () => {
    const { getByRole, container } = render(<List><Item href="#a" title="Overview" current /></List>)
    expect(getByRole('link').getAttribute('aria-current')).toBe('page')
    const bar = getComputedStyle(container.querySelector('.item')!, '::before')
    expect(bar.content).not.toBe('none')
    expect(parseFloat(bar.width)).toBeGreaterThan(0)
  })

  test('passes className, data attributes and ref through', () => {
    let node: HTMLElement | null = null
    const { container } = render(<Item as="div" title="x" className="extra" data-x="1" ref={n => { node = n }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('item item--default extra')
    expect(el.dataset.x).toBe('1')
    expect(node).toBe(el)
  })

  test('square in a divided list, so the divider runs straight', () => {
    const { container } = render(<div><List divided><Item title="a" /><Item title="b" /></List><List><Item title="c" data-i="free" /></List></div>)
    expect(getComputedStyle(container.querySelector('.list--divided > .item + .item')!).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(container.querySelector('[data-i="free"]')!).borderTopLeftRadius).not.toBe('0px')
  })

  test('long titles wrap instead of overflowing', () => {
    const { container } = render(
      <div style={{ inlineSize: '200px' }}><Item as="div" title="brand-brief-final-final-v3-approved-for-real.pdf" trailing={<span>2 MB</span>} /></div>,
    )
    const item = container.querySelector('.item')!
    expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
  })
})

// G3 (Ajar's RightsView and SessionsView rows): a row that opens a Dialog.
describe('Item with onClick', () => {
  test('the row is one button, named by its title, and runs onClick', async () => {
    const onClick = vi.fn()
    const { getByRole, container } = render(<List><Item onClick={onClick} title="Rights profile" description="3 splits" /></List>)
    const button = getByRole('button', { name: 'Rights profile' })
    expect(button.getAttribute('type')).toBe('button')
    expect(container.querySelector('li')!.classList).toContain('item--interactive')
    // The stretched button covers the row: a click on the description lands on it.
    const desc = container.querySelector('.item__description')!.getBoundingClientRect()
    expect(document.elementFromPoint(desc.left + 2, desc.top + desc.height / 2)).toBe(button)
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('trailing controls stay their own targets and Tab stops, and don\'t run the row\'s onClick', async () => {
    const onClick = vi.fn()
    const onShare = vi.fn()
    const { getByRole } = render(
      <List><Item onClick={onClick} title="Brand brief" trailing={<button type="button" onClick={onShare}>Share</button>} /></List>,
    )
    const share = getByRole('button', { name: 'Share' })
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(getByRole('button', { name: 'Brand brief' }))
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(share)
    const r = share.getBoundingClientRect()
    expect(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)).toBe(share)
    await userEvent.click(share)
    expect(onShare).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('keyboard focus rings the whole row; Enter and Space run onClick', async () => {
    const onClick = vi.fn()
    const { container } = render(<List><Item onClick={onClick} title="A" /></List>)
    await userEvent.keyboard('{Tab}')
    expect(getComputedStyle(container.querySelector('.item')!).outlineStyle).toBe('solid')
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  test('the button looks like the title of a plain row', () => {
    const { container } = render(<List><Item onClick={() => {}} title="Clickable" /><Item title="Plain" /></List>)
    const [button, plain] = Array.from(container.querySelectorAll('.item__title')).map(el => getComputedStyle(el))
    for (const prop of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'textAlign', 'backgroundColor', 'borderTopWidth', 'paddingTop'] as const) {
      expect(button[prop], prop).toBe(plain[prop])
    }
    expect(button.cursor).toBe('pointer')
  })

  test('with href too, the row stays a link and onClick runs on it', async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    const { getByRole, queryByRole } = render(<List><Item href="#a" onClick={onClick} title="Overview" /></List>)
    expect(queryByRole('button')).toBeNull()
    await userEvent.click(getByRole('link', { name: 'Overview' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('opens a controlled Dialog, and focus comes back to the row when it closes', async () => {
    function Row() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <List><Item onClick={() => setOpen(true)} title="Rights profile" /></List>
          <Dialog open={open} onOpenChange={setOpen} title="Rights profile"><p>content</p></Dialog>
        </>
      )
    }
    const { getByRole, queryByText } = render(<Row />)
    const row = getByRole('button', { name: 'Rights profile' })
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => queryByText('content')).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => queryByText('content')).toBeNull()
    await expect.poll(() => document.activeElement).toBe(row)
  })
})

const brands = [undefined, 'portfolio', 'demo-cool', 'demo-warm', 'demo-soft'] as const

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
const lum = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const ratio = (a: string, b: string) => { const [h, l] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05) }

describe('Item follows the brand', () => {
  for (const brand of brands) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${brand ?? 'base'} ${mode}: title and description 4.5:1 at rest, hovered and current; current bar 3:1`, async () => {
        const { container } = render(
          <div data-brand={brand} data-mode={mode} style={{ background: 'var(--color-surface-primary)' }}>
            <List>
              <Item href="#a" title="At rest" description="Description" data-i="rest" />
              <Item href="#b" title="Hovered" description="Description" data-i="hover" />
              <Item href="#c" title="Current" description="Description" current data-i="current" />
              <Item onClick={() => {}} title="Button" description="Description" data-i="button" />
            </List>
          </div>,
        )
        await userEvent.hover(container.querySelector('[data-i="hover"] .item__title')!)
        for (const i of ['rest', 'hover', 'current', 'button']) {
          for (const part of ['.item__title', '.item__description']) {
            expect(contrastOf(container.querySelector(`[data-i="${i}"] ${part}`)!), `${i} ${part}`).toBeGreaterThanOrEqual(4.5)
          }
        }
        const current = container.querySelector('[data-i="current"]')!
        expect(ratio(getComputedStyle(current, '::before').backgroundColor, getComputedStyle(current).backgroundColor)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
