/**
 * Toolbar: the WAI-ARIA toolbar. One Tab stop; arrows move (wrapping) and
 * skip disabled controls; Home and End; Tab back in returns to the last
 * control; text fields and opened menus keep their own arrow keys.
 * Runs in Chromium with the real CSS.
 */

import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { Toolbar, ToolbarSeparator } from './Toolbar'
import { Menu } from '../../composition/Menu'
import { Button } from '../../primitives/Button'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const name = () => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent

function Example({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <>
      <button>Before</button>
      <Toolbar aria-label="Formatting" orientation={orientation}>
        <button aria-label="Bold">B</button>
        <button aria-label="Italic" disabled>I</button>
        <button aria-label="Underline">U</button>
        <ToolbarSeparator />
        <input aria-label="Font size" defaultValue="16" />
        <button aria-label="Link">L</button>
      </Toolbar>
      <button>After</button>
    </>
  )
}

describe('Toolbar', () => {
  test('a named toolbar with one Tab stop', async () => {
    const { getByRole } = render(<Example />)
    expect(getByRole('toolbar', { name: 'Formatting' }).getAttribute('aria-orientation')).toBeNull()
    await userEvent.tab()
    await userEvent.tab()
    expect(name()).toBe('Bold')
    await userEvent.tab()
    expect(name()).toBe('After')
  })

  test('arrows move, skip disabled controls and wrap; Home and End jump', async () => {
    render(<Example />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(name()).toBe('Underline')
    await userEvent.keyboard('{End}')
    expect(name()).toBe('Link')
    await userEvent.keyboard('{ArrowRight}')
    expect(name()).toBe('Bold')
    await userEvent.keyboard('{ArrowLeft}')
    expect(name()).toBe('Link')
    await userEvent.keyboard('{Home}')
    expect(name()).toBe('Bold')
  })

  test('Tab back in returns to the control last used', async () => {
    render(<Example />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(name()).toBe('Underline')
    await userEvent.tab()
    expect(name()).toBe('After')
    await userEvent.tab({ shift: true })
    expect(name()).toBe('Underline')
  })

  test('a text field keeps its arrow keys', async () => {
    const { getByRole } = render(<Example />)
    const input = getByRole('textbox', { name: 'Font size' }) as HTMLInputElement
    await userEvent.click(input)
    input.setSelectionRange(2, 2)
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(1)
  })

  test('the separator is vertical in a horizontal toolbar', () => {
    const { getByRole } = render(<Example />)
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })

  test('vertical: Up and Down move, and the toolbar says so', async () => {
    const { getByRole } = render(<Example orientation="vertical" />)
    expect(getByRole('toolbar').getAttribute('aria-orientation')).toBe('vertical')
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(name()).toBe('Underline')
    await userEvent.keyboard('{ArrowRight}')
    expect(name()).toBe('Underline')
  })

  test('arrow keys inside a Menu opened from the toolbar stay in the menu', async () => {
    render(
      <Toolbar aria-label="Actions">
        <Button>Save</Button>
        <Menu trigger={<Button>Insert</Button>} groups={[{ items: [{ id: 'a', label: 'Image' }, { id: 'b', label: 'Table' }] }]} />
        <Button>Share</Button>
      </Toolbar>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(name()).toBe('Insert')
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menuitem')
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    expect(document.activeElement?.textContent).toBe('Table')
  })
})
