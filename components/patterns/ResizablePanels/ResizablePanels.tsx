'use client'

import { forwardRef, useId, useRef } from 'react'
import { cn } from '../../../lib/cn'
import { mergeRefs } from '../../../lib/mergeRefs'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import './ResizablePanels.css'

type ResizablePanelsOwnProps = {
  /** Exactly two panes: the first is the one being sized (a sidebar, a list), the second takes the rest. */
  children: [React.ReactNode, React.ReactNode]
  /** `horizontal` (default): side by side, the separator is a vertical bar. `vertical`: stacked. */
  orientation?: 'horizontal' | 'vertical'
  /** Controlled size of the first pane, in percent. Pair with `onSizeChange`. */
  size?: number
  /** Uncontrolled starting size of the first pane, in percent. Default 30. Double-clicking the separator returns to it. */
  defaultSize?: number
  /** Called with the new size, in percent, while dragging and on each key press. */
  onSizeChange?: (size: number) => void
  /** Smallest the first pane gets, in percent. Default 10. */
  minSize?: number
  /** Largest the first pane gets, in percent. Default 90. */
  maxSize?: number
  /** How far one arrow-key press moves the separator, in percent. Default 5. */
  step?: number
  /** Enter collapses the first pane to nothing, and Enter again restores it. Default `false`. */
  collapsible?: boolean
  /**
   * Names the separator for screen readers: what it resizes, like "Resize
   * file list". Required: the separator is a focusable control.
   */
  label: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type ResizablePanelsProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & ResizablePanelsOwnProps

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const round = (n: number) => Math.round(n * 10) / 10

/**
 * Two panes with a separator between them that people drag, or move with
 * the arrow keys, to share the space (the WAI-ARIA window splitter pattern).
 */
export const ResizablePanels = forwardRef<HTMLDivElement, ResizablePanelsProps>(function ResizablePanels({
  children,
  orientation = 'horizontal',
  size: sizeProp,
  defaultSize = 30,
  onSizeChange,
  minSize = 10,
  maxSize = 90,
  step = 5,
  collapsible = false,
  label,
  className,
  style,
  ...rest
}, ref) {
  const [size, isControlled, setSize] = useUncontrolledValue<number>(sizeProp, clamp(defaultSize, minSize, maxSize), clamp(defaultSize, minSize, maxSize))
  const rootRef = useRef<HTMLDivElement | null>(null)
  // The latest size, for the drag handlers, which are created once per drag
  // and would otherwise compare against the size the drag started at.
  const sizeRef = useRef(size)
  sizeRef.current = size
  const restoreRef = useRef(size)
  const firstId = useId()
  const horizontal = orientation === 'horizontal'
  const collapsed = collapsible && size === 0

  const commit = (next: number) => {
    const value = round(next)
    if (value === sizeRef.current) return
    sizeRef.current = value
    if (!isControlled) setSize(value)
    onSizeChange?.(value)
  }
  const resize = (next: number) => commit(clamp(next, minSize, maxSize))

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const back = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const forward = horizontal ? 'ArrowRight' : 'ArrowDown'
    let handled = true
    if (event.key === back) resize((collapsed ? minSize : size) - step)
    else if (event.key === forward) resize((collapsed ? minSize : size) + step)
    else if (event.key === 'Home') resize(minSize)
    else if (event.key === 'End') resize(maxSize)
    else if (event.key === 'Enter' && collapsible) {
      if (collapsed) commit(clamp(restoreRef.current, minSize, maxSize))
      else {
        restoreRef.current = size
        commit(0)
      }
    } else handled = false
    if (handled) event.preventDefault()
  }

  // Dragging: pointer capture keeps the separator receiving moves even when
  // the pointer runs ahead of it, over an iframe or off the window.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const root = rootRef.current
    if (!root) return
    event.preventDefault()
    const separator = event.currentTarget
    separator.setPointerCapture(event.pointerId)
    root.dataset.dragging = 'true'
    const rect = root.getBoundingClientRect()
    const move = (e: PointerEvent) => {
      const offset = horizontal ? e.clientX - rect.left : e.clientY - rect.top
      const total = horizontal ? rect.width : rect.height
      // The writing direction decides which side the first pane is on.
      const rtl = horizontal && getComputedStyle(root).direction === 'rtl'
      resize(((rtl ? total - offset : offset) / total) * 100)
    }
    const up = (e: PointerEvent) => {
      separator.releasePointerCapture(e.pointerId)
      separator.removeEventListener('pointermove', move)
      separator.removeEventListener('pointerup', up)
      separator.removeEventListener('pointercancel', up)
      delete root.dataset.dragging
    }
    separator.addEventListener('pointermove', move)
    separator.addEventListener('pointerup', up)
    separator.addEventListener('pointercancel', up)
  }

  const [first, second] = children

  return (
    <div
      {...rest}
      ref={mergeRefs(rootRef, ref)}
      style={{ ...style, '--resizable-size': `${size}%` } as React.CSSProperties}
      className={cn('resizable-panels', `resizable-panels--${orientation}`, className)}
    >
      <div id={firstId} className="resizable-panels__pane resizable-panels__pane--first" hidden={collapsed || undefined}>
        {first}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-controls={firstId}
        // A splitter's orientation is the separator's own: side-by-side
        // panes have a vertical separator.
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={size}
        aria-valuemin={collapsible ? 0 : minSize}
        aria-valuemax={maxSize}
        aria-valuetext={collapsed ? 'Collapsed' : `${Math.round(size)}%`}
        className="resizable-panels__separator"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onDoubleClick={() => resize(defaultSize)}
      />
      <div className="resizable-panels__pane resizable-panels__pane--second">{second}</div>
    </div>
  )
})

ResizablePanels.displayName = 'ResizablePanels'
