/**
 * Colour mode (G7): the before-paint script and the TypeScript functions
 * agree on every stored pick and system setting, the script keeps following
 * the system until the visitor picks, the hook reports and changes the mode,
 * and the brand CSS actually switches on what they set.
 *
 * The system setting is a stub: a test can't flip the operating system's
 * dark mode, so matchMedia returns a fake list the test can change.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'

import baseDark from '../styles/brands/base-dark.css?raw'
import baseLight from '../styles/brands/base-light.css?raw'
import source from './color-mode.ts?raw'
import { useColorMode } from '../hooks/useColorMode'
import {
  COLOR_MODE_STORAGE_KEY,
  applyColorMode,
  colorModeScript,
  readColorModePreference,
  setColorModePreference,
} from './color-mode'

// ── A system setting the test controls ──────────────────────────────────
let systemDark = false
const listeners = new Set<() => void>()
function setSystem(dark: boolean) {
  systemDark = dark
  for (const listener of listeners) listener()
}
const realMatchMedia = window.matchMedia

beforeEach(() => {
  systemDark = false
  listeners.clear()
  localStorage.clear()
  delete document.documentElement.dataset.mode
  window.matchMedia = ((query: string) => ({
    get matches() { return query.includes('dark') && systemDark },
    media: query,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  })) as unknown as typeof window.matchMedia
})

afterEach(() => {
  cleanup()
  window.matchMedia = realMatchMedia
  vi.restoreAllMocks()
  localStorage.clear()
  delete document.documentElement.dataset.mode
})

/** Runs the script the way a page does: an inline <script>, executed on insert. */
function runScript(options?: Parameters<typeof colorModeScript>[0]) {
  const script = document.createElement('script')
  script.textContent = colorModeScript(options)
  document.head.append(script)
  script.remove()
  return document.documentElement.dataset.mode
}

describe('colorModeScript', () => {
  const cases = [
    { stored: null, system: false, expected: 'light' },
    { stored: null, system: true, expected: 'dark' },
    { stored: 'light', system: true, expected: 'light' },
    { stored: 'dark', system: false, expected: 'dark' },
    { stored: 'sepia', system: true, expected: 'dark' },
  ] as const

  test.each(cases)('stored $stored, system dark $system → $expected, the same as applyColorMode', ({ stored, system, expected }) => {
    if (stored) localStorage.setItem(COLOR_MODE_STORAGE_KEY, stored)
    systemDark = system
    expect(runScript()).toBe(expected)
    delete document.documentElement.dataset.mode
    expect(applyColorMode(readColorModePreference())).toBe(expected)
  })

  test('follows the system until the visitor picks, then stops', () => {
    runScript()
    setSystem(true)
    expect(document.documentElement.dataset.mode).toBe('dark')
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark')
    setSystem(false)
    expect(document.documentElement.dataset.mode).toBe('dark')
  })

  test('falls back to the system when storage is blocked, without throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    systemDark = true
    expect(runScript()).toBe('dark')
    expect(readColorModePreference()).toBe('system')
  })

  test('takes its own storage key, written so it can\'t end the script', () => {
    localStorage.setItem('ajar-mode', 'dark')
    expect(runScript({ storageKey: 'ajar-mode' })).toBe('dark')
    const hostile = colorModeScript({ storageKey: '</script><script>alert(1)</script>' })
    expect(hostile).not.toContain('</')
  })

  test('is not a client module, so a server layout gets the string itself', () => {
    expect(source.trimStart().startsWith("'use client'")).toBe(false)
    expect(source.trimStart().startsWith('"use client"')).toBe(false)
  })
})

describe('setColorModePreference', () => {
  test('remembers light and dark, and system forgets', () => {
    setColorModePreference('dark')
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.mode).toBe('dark')
    setColorModePreference('system')
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBeNull()
    expect(document.documentElement.dataset.mode).toBe('light')
  })

  test('still applies when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(setColorModePreference('dark')).toBe('dark')
    expect(document.documentElement.dataset.mode).toBe('dark')
  })
})

describe('useColorMode', () => {
  function Probe({ storageKey }: { storageKey?: string }) {
    const { preference, mode, setPreference } = useColorMode({ storageKey })
    return (
      <div>
        <output data-testid="state">{preference}:{mode}</output>
        <button type="button" onClick={() => setPreference('dark')}>Dark</button>
        <button type="button" onClick={() => setPreference('system')}>System</button>
      </div>
    )
  }
  const state = (container: HTMLElement) => container.querySelector('[data-testid="state"]')!.textContent

  test('reports the pick and the mode, and a pick that keeps the mode still shows', () => {
    systemDark = true
    runScript()
    const { container, getByRole } = render(<Probe />)
    expect(state(container)).toBe('system:dark')
    // Dark while the system is already dark: data-mode doesn't change, the preference does.
    act(() => getByRole('button', { name: 'Dark' }).click())
    expect(state(container)).toBe('dark:dark')
    act(() => getByRole('button', { name: 'System' }).click())
    expect(state(container)).toBe('system:dark')
  })

  test('follows the system while the preference is system', () => {
    const { container } = render(<Probe />)
    act(() => setSystem(true))
    expect(state(container)).toBe('system:dark')
    act(() => setSystem(false))
    expect(state(container)).toBe('system:light')
  })

  test('applies a pick made in another tab', () => {
    const { container } = render(<Probe />)
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark')
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: COLOR_MODE_STORAGE_KEY, newValue: 'dark' })) })
    expect(document.documentElement.dataset.mode).toBe('dark')
    expect(state(container)).toBe('dark:dark')
  })

  test('a custom key reads and writes its own pick only', () => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'light')
    const { container, getByRole } = render(<Probe storageKey="ajar-mode" />)
    act(() => getByRole('button', { name: 'Dark' }).click())
    expect(localStorage.getItem('ajar-mode')).toBe('dark')
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('light')
    expect(state(container)).toBe('dark:dark')
  })
})

describe('with the brand CSS', () => {
  test('the page takes base\'s dark values when the script picks dark', () => {
    const style = document.createElement('style')
    style.textContent = baseLight + baseDark
    document.head.append(style)
    const surface = () => getComputedStyle(document.documentElement).getPropertyValue('--color-surface-primary').trim()
    runScript()
    const light = surface()
    delete document.documentElement.dataset.mode
    systemDark = true
    runScript()
    expect(surface()).not.toBe(light)
    style.remove()
  })
})
