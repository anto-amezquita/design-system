/**
 * ContextMenu: right-click, long press, or Shift+F10 on the focused area
 * opens Menu-styled items at the pointer; arrows move, Enter chooses, Escape
 * closes and focus goes back to the area. Runs in Chromium with real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { ContextMenu } from './ContextMenu'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const menu = () => document.querySelector('[role="menu"]')
const focused = () => document.activeElement?.textContent

function Example({ onRename = () => {}, disabled = false }: { onRename?: () => void; disabled?: boolean }) {
  return (
    <ContextMenu
      aria-label="Actions for report.pdf"
      disabled={disabled}
      groups={[
        { items: [{ id: 'r', label: 'Rename', shortcut: ['F2'], onSelect: onRename }, { id: 'c', label: 'Copy link', shortcut: ['Ctrl', 'C'] }, { id: 'x', label: 'Archive', disabled: true }] },
        { items: [{ id: 'd', label: 'Delete', variant: 'destructive' }] },
      ]}
    >
      <div data-testid="area" style={{ marginInlineStart: 100, inlineSize: 300 }}>report.pdf</div>
    </ContextMenu>
  )
}

describe('ContextMenu', () => {
  test('the area is made focusable; a native control is left as it is', () => {
    const { getByTestId, getByRole } = render(<>
      <Example />
      <ContextMenu groups={[{ items: [{ id: 'a', label: 'A' }] }]}><button>File</button></ContextMenu>
    </>)
    expect(getByTestId('area').getAttribute('tabindex')).toBe('0')
    expect(getByRole('button', { name: 'File' }).getAttribute('tabindex')).toBeNull()
  })

  test('right-click opens a named menu at the pointer, with focus on the menu', async () => {
    const { getByTestId } = render(<Example />)
    const area = getByTestId('area')
    const r = area.getBoundingClientRect()
    fireEvent.contextMenu(area, { clientX: r.left + 30, clientY: r.top + 5 })
    await vi.waitFor(() => expect(menu()).not.toBeNull())
    expect(menu()!.getAttribute('aria-label')).toBe('Actions for report.pdf')
    // A pointer user hovers items; the first arrow press moves to the first item.
    await vi.waitFor(() => expect(document.activeElement).toBe(menu()))
    // Radix places it a frame after mounting.
    await vi.waitFor(() => expect(Math.abs(menu()!.getBoundingClientRect().left - (r.left + 30))).toBeLessThan(4))
  })

  test('Shift+F10 on the focused area opens it from the keyboard', async () => {
    const { getByTestId } = render(<Example />)
    await userEvent.tab()
    expect(document.activeElement).toBe(getByTestId('area'))
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await vi.waitFor(() => expect(menu()).not.toBeNull())
    // From the keyboard, focus lands on the first item.
    await vi.waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'))
    expect(focused()).toBe('RenameF2')
  })

  test('arrows skip disabled items; Enter chooses; focus returns to the area', async () => {
    const onRename = vi.fn()
    const { getByTestId } = render(<Example onRename={onRename} />)
    const area = getByTestId('area')
    area.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await vi.waitFor(() => expect(focused()).toBe('RenameF2'))
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toContain('Copy link')
    await userEvent.keyboard('{ArrowDown}')
    expect(focused()).toBe('Delete')
    await userEvent.keyboard('{ArrowUp}')
    expect(focused()).toContain('Copy link')
    await userEvent.keyboard('{ArrowUp}')
    expect(focused()).toBe('RenameF2')
    await userEvent.keyboard('{Enter}')
    expect(onRename).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(menu()).toBeNull())
    await vi.waitFor(() => expect(document.activeElement).toBe(area))
  })

  test('Escape closes; type-ahead matches labels', async () => {
    const { getByTestId } = render(<Example />)
    const area = getByTestId('area')
    area.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await vi.waitFor(() => expect(focused()).toBe('RenameF2'))
    await userEvent.keyboard('d')
    expect(focused()).toBe('Delete')
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(() => expect(menu()).toBeNull())
  })

  test('shortcuts are keycaps for the eye and aria-keyshortcuts for screen readers', async () => {
    const { getByTestId } = render(<Example />)
    fireEvent.contextMenu(getByTestId('area'))
    await vi.waitFor(() => expect(menu()).not.toBeNull())
    const copy = [...document.querySelectorAll('[role="menuitem"]')].find(i => i.textContent?.startsWith('Copy link'))!
    expect(copy.getAttribute('aria-keyshortcuts')).toBe('Control+C')
    expect(copy.querySelectorAll('.kbd')).toHaveLength(2)
    expect(copy.querySelector('.context-menu__shortcut')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('disabled: no menu', async () => {
    const { getByTestId } = render(<Example disabled />)
    fireEvent.contextMenu(getByTestId('area'))
    await new Promise(r => setTimeout(r, 100))
    expect(menu()).toBeNull()
  })
})
