/**
 * Light or dark for the whole page, from the visitor's pick or the system
 * setting (G7). The brand CSS switches on `<html data-mode="dark">`; this
 * sets that attribute, before first paint so dark pages never flash light.
 *
 * Deliberately not 'use client': a Next.js root layout is a Server
 * Component and needs `colorModeScript()`'s string itself, not a client
 * reference to it. The hook is hooks/useColorMode.
 *
 * Two parts:
 *   colorModeScript()  a string for an inline <script> in <head>. It sets
 *                      data-mode before paint and keeps following the
 *                      system setting while the visitor hasn't picked.
 *   useColorMode()     (hooks/useColorMode) the current preference and mode,
 *                      and a setter for a light/dark/system switch.
 */

export type ColorMode = 'light' | 'dark'
/** `system` follows the operating system's setting, live. */
export type ColorModePreference = ColorMode | 'system'

/** Where the visitor's pick is remembered. Pass your own key to keep apps on one domain apart. */
export const COLOR_MODE_STORAGE_KEY = 'amezquita-color-mode'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark'
}

/** The visitor's remembered pick, or `system` when there's none or storage is blocked. */
export function readColorModePreference(storageKey: string = COLOR_MODE_STORAGE_KEY): ColorModePreference {
  try {
    const stored = localStorage.getItem(storageKey)
    return isMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

/** What a preference means right now: `system` becomes the system's light or dark. */
export function resolveColorMode(preference: ColorModePreference): ColorMode {
  if (preference !== 'system') return preference
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Sets `<html data-mode>` to the resolved mode and returns it. */
export function applyColorMode(preference: ColorModePreference): ColorMode {
  const mode = resolveColorMode(preference)
  document.documentElement.dataset.mode = mode
  return mode
}

/**
 * Remembers the visitor's pick (`system` forgets it) and applies it. When
 * storage is blocked, the pick still applies to this page; it just isn't
 * remembered.
 */
export function setColorModePreference(preference: ColorModePreference, storageKey: string = COLOR_MODE_STORAGE_KEY): ColorMode {
  try {
    if (preference === 'system') localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, preference)
  } catch {
    // Not remembered; still applied below.
  }
  const mode = applyColorMode(preference)
  // The `storage` event only reaches other tabs. This tells this one, for a
  // pick that doesn't change data-mode (dark while the system is dark).
  window.dispatchEvent(new CustomEvent(COLOR_MODE_CHANGE_EVENT, { detail: { storageKey } }))
  return mode
}

/** Fired on window when setColorModePreference() runs, with `detail.storageKey`. */
export const COLOR_MODE_CHANGE_EVENT = 'amezquita:color-mode'

/**
 * The before-paint script, as a string for an inline `<script>` in `<head>`,
 * ahead of the stylesheets. It does what `applyColorMode(readColorModePreference())`
 * does, in plain ES5 with no imports, and then follows the system setting
 * while the visitor hasn't picked.
 *
 * Next.js App Router:
 *   <Script id="color-mode" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
 *   and `suppressHydrationWarning` on <html>, since the script changes it.
 * Vite: put it in index.html's <head> with transformIndexHtml.
 *
 * The key is a constant from your own code, never from user input. It's
 * written as a JSON string with `<` escaped, so it can't end the script.
 */
export function colorModeScript({ storageKey = COLOR_MODE_STORAGE_KEY }: { storageKey?: string } = {}): string {
  const key = JSON.stringify(storageKey).replace(/</g, '\\u003c')
  const query = JSON.stringify(DARK_QUERY)
  return (
    '(function(){' +
    `var k=${key},q=${query},d=document.documentElement;` +
    "function p(){try{var v=localStorage.getItem(k);return v==='light'||v==='dark'?v:null}catch(e){return null}}" +
    "function a(){d.dataset.mode=p()||(window.matchMedia&&matchMedia(q).matches?'dark':'light')}" +
    'a();' +
    "try{matchMedia(q).addEventListener('change',function(){if(!p())a()})}catch(e){}" +
    '})()'
  )
}
