import { useCallback, useEffect, useLayoutEffect } from 'react'

type AutoResizeOptions = {
  /** Off: the hook does nothing, and clears the height it set. Default true. */
  enabled?: boolean
  /** Grow up to this many lines, then scroll. Leave it out to grow without a cap. */
  maxRows?: number
}

/**
 * Grows a textarea with its text: measures the content, caps it at `maxRows`
 * lines and scrolls beyond that. The `rows` attribute stays the minimum.
 * Shared by Textarea (`autoResize`) and ChatComposer (G5).
 *
 * Runs before paint when the value changes, so the field never flickers, and
 * again when the field's width changes, since a narrower field wraps into
 * more lines. Assumes `box-sizing: border-box` and no border on the textarea
 * itself, as both fields have: the border is on the wrapper around it.
 */
export function useAutoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  { enabled = true, maxRows }: AutoResizeOptions = {},
) {
  const resize = useCallback(() => {
    const el = ref.current
    if (!el || !enabled) return
    const style = getComputedStyle(el)
    const line = parseFloat(style.lineHeight)
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const max = maxRows !== undefined && Number.isFinite(line) ? line * maxRows + padding : Infinity
    el.style.blockSize = 'auto'
    const height = Math.min(el.scrollHeight, max)
    el.style.blockSize = `${height}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [ref, enabled, maxRows])

  useLayoutEffect(resize, [value, resize])

  // Switched off: hand the height back to `rows` and the stylesheet.
  useLayoutEffect(() => {
    const el = ref.current
    if (enabled || !el) return
    el.style.blockSize = ''
    el.style.overflowY = ''
  }, [ref, enabled])

  // A width change rewraps the text. Only the width: the height is ours.
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || typeof ResizeObserver === 'undefined') return
    let width = el.getBoundingClientRect().width
    const observer = new ResizeObserver(() => {
      const next = el.getBoundingClientRect().width
      if (next === width) return
      width = next
      resize()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, enabled, resize])
}
