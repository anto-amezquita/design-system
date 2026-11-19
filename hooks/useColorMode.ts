'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  COLOR_MODE_CHANGE_EVENT,
  COLOR_MODE_STORAGE_KEY,
  applyColorMode,
  readColorModePreference,
  setColorModePreference,
  type ColorMode,
  type ColorModePreference,
} from '../lib/color-mode'

export type { ColorMode, ColorModePreference }

type ColorModeState = {
  /** What the visitor picked, or `system`. */
  preference: ColorModePreference
  /** What the page is in now: `<html data-mode>`. */
  mode: ColorMode
  /** Pick light, dark, or `system` to follow the operating system again. */
  setPreference: (preference: ColorModePreference) => void
}

/**
 * The page's colour mode, for a light/dark/system switch (G7). Pair it with
 * `colorModeScript()` (lib/color-mode) in `<head>`, which sets the mode
 * before first paint; this reads it and changes it.
 *
 * Stays in step with other tabs (a pick in one applies in all) and with the
 * system setting while the preference is `system`. Before hydration it
 * reports `system` and `light`, so server and first client render match;
 * show the switch's state after mount if that matters.
 */
export function useColorMode({ storageKey = COLOR_MODE_STORAGE_KEY }: { storageKey?: string } = {}): ColorModeState {
  const subscribe = useCallback((onChange: () => void) => {
    const html = document.documentElement
    const observer = new MutationObserver(onChange)
    observer.observe(html, { attributes: true, attributeFilter: ['data-mode'] })

    // Another tab picked: apply it here too.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return
      applyColorMode(readColorModePreference(storageKey))
      onChange()
    }
    window.addEventListener('storage', onStorage)
    // This tab picked: the preference changed even if data-mode didn't.
    const onPick = (event: Event) => {
      if ((event as CustomEvent<{ storageKey: string }>).detail?.storageKey === storageKey) onChange()
    }
    window.addEventListener(COLOR_MODE_CHANGE_EVENT, onPick)

    // The system setting changed: follow it while the visitor hasn't picked.
    // (The before-paint script does too; applying twice is harmless.)
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null
    const onSystem = () => {
      if (readColorModePreference(storageKey) !== 'system') return
      applyColorMode('system')
      onChange()
    }
    media?.addEventListener('change', onSystem)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(COLOR_MODE_CHANGE_EVENT, onPick)
      media?.removeEventListener('change', onSystem)
    }
  }, [storageKey])

  // A string snapshot, so React compares it by value.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => `${readColorModePreference(storageKey)}:${document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light'}`,
    () => 'system:light',
  )
  const [preference, mode] = snapshot.split(':') as [ColorModePreference, ColorMode]

  const setPreference = useCallback(
    (next: ColorModePreference) => { setColorModePreference(next, storageKey) },
    [storageKey],
  )

  return { preference, mode, setPreference }
}
