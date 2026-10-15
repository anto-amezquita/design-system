/**
 * CommandPalette: a modal dialog with a combobox over a grouped listbox.
 * Ctrl/⌘+K opens it; focus is in the search field; the top match is ready
 * for Enter; arrows wrap and skip disabled commands; keywords match;
 * Enter closes it, returns focus, then runs. Runs in Chromium with real CSS.
 */

import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { useState } from 'react'

import baseLight from '../../../styles/brands/base-light.css?raw'
import { CommandPalette, useCommandPaletteShortcut, type CommandGroup } from './CommandPalette'

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = baseLight
  document.head.append(style)
})

afterEach(cleanup)

const make = (run: (id: string) => void): CommandGroup[] => [
  { label: 'Create', commands: [{ id: 'page', label: 'New page', shortcut: ['Ctrl', 'N'], onSelect: () => run('page') }] },
  {
    label: 'Settings',
    commands: [
      { id: 'theme', label: 'Switch to dark mode', keywords: ['night'], onSelect: () => run('theme') },
      { id: 'out', label: 'Sign out', disabled: true, onSelect: () => run('out') },
      { id: 'prefs', label: 'Preferences', onSelect: () => run('prefs') },
    ],
  },
]

function App({ run = () => {} }: { run?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  useCommandPaletteShortcut(setOpen)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <CommandPalette open={open} onOpenChange={setOpen} groups={make(run)} />
    </>
  )
}

const box = () => document.querySelector<HTMLInputElement>('[role="combobox"]')
const activeLabel = () => {
  const id = box()?.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.querySelector('.combobox__option-label')?.textContent : null
}
const status = () => document.querySelector('[role="status"]')?.textContent

describe('CommandPalette', () => {
  test('Ctrl+K opens a named dialog with focus in the search field; again closes it', async () => {
    render(<App />)
    await userEvent.keyboard('{Control>}k{/Control}')
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())
    expect(document.querySelector('[role="dialog"]')!.getAttribute('aria-labelledby')).toBeTruthy()
    expect(document.activeElement).toBe(box())
    expect(box()!.getAttribute('aria-label')).toBe('Search commands')
    await userEvent.keyboard('{Control>}k{/Control}')
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
  })

  test('grouped options; the first is ready; arrows wrap and skip disabled ones', async () => {
    const { getByRole } = render(<App />)
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    expect([...document.querySelectorAll('[role="group"]')].map(g => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent)).toEqual(['Create', 'Settings'])
    expect(activeLabel()).toBe('New page')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(activeLabel()).toBe('Preferences')
    await userEvent.keyboard('{ArrowDown}')
    expect(activeLabel()).toBe('New page')
    await userEvent.keyboard('{ArrowUp}')
    expect(activeLabel()).toBe('Preferences')
  })

  test('typing filters, keywords count, the count is announced', async () => {
    const { getByRole } = render(<App />)
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    expect(status()).toBe('4 commands')
    await userEvent.keyboard('night')
    expect(activeLabel()).toBe('Switch to dark mode')
    expect(status()).toBe('1 command')
    await userEvent.keyboard('xyz')
    expect(status()).toBe('No commands match “nightxyz”')
    expect(document.querySelector('.command-palette__empty')?.textContent).toBe('No commands match “nightxyz”')
  })

  test('Enter closes, returns focus to the trigger, then runs the command', async () => {
    const run = vi.fn()
    const { getByRole } = render(<App run={run} />)
    const trigger = getByRole('button', { name: 'Open' })
    await userEvent.click(trigger)
    await vi.waitFor(() => expect(box()).not.toBeNull())
    await userEvent.keyboard('pref{Enter}')
    await vi.waitFor(() => expect(run).toHaveBeenCalledWith('prefs'))
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  test('a disabled command can be seen but not run', async () => {
    const run = vi.fn()
    const { getByRole } = render(<App run={run} />)
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    const out = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(o => o.textContent?.includes('Sign out'))!
    expect(out.getAttribute('aria-disabled')).toBe('true')
    out.click()
    expect(run).not.toHaveBeenCalled()
  })

  test('shortcuts are aria-keyshortcuts; the keycaps are hidden', async () => {
    const { getByRole } = render(<App />)
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    const page = document.querySelector('[role="option"]')!
    expect(page.getAttribute('aria-keyshortcuts')).toBe('Control+N')
    expect(page.querySelector('.command-palette__shortcut')!.getAttribute('aria-hidden')).toBe('true')
  })

  test('Escape closes and opening again starts with an empty search', async () => {
    const { getByRole } = render(<App />)
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    await userEvent.keyboard('pref{Escape}')
    await vi.waitFor(() => expect(box()).toBeNull())
    await userEvent.click(getByRole('button', { name: 'Open' }))
    await vi.waitFor(() => expect(box()).not.toBeNull())
    expect(box()!.value).toBe('')
  })
})
