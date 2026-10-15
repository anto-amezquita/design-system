'use client'

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import { Divider } from '../../primitives/Divider'
import { mergeRefs } from '../../../lib/mergeRefs'
import { cn } from '../../../lib/cn'
import './Toolbar.css'

type Orientation = 'horizontal' | 'vertical'

const ToolbarContext = createContext<Orientation>('horizontal')

// The controls the arrow keys move between.
const ITEMS = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), [role="button"]:not([aria-disabled="true"]), [data-toolbar-item]'

// Inside these, the arrow keys belong to the control: moving the caret, changing a value.
const OWNS_ARROWS = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea, select, [contenteditable="true"], [role="slider"], [role="spinbutton"]'

type ToolbarOwnProps = {
  /** Names the toolbar: "Text formatting", "Board actions". Required when the page has more than one. */
  'aria-label': string
  orientation?: Orientation
  /** Buttons, ToggleButtons, IconButtons, Menu triggers, a Select or short input; ToolbarSeparator between groups. */
  children: React.ReactNode
}

type ToolbarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label' | 'children'> & ToolbarOwnProps

/**
 * A row of controls for one area: the formatting buttons over an editor,
 * the actions over a table. The WAI-ARIA toolbar: one Tab stop for the
 * whole row; the arrow keys move between controls, skipping disabled ones,
 * and Home and End jump to the ends. Tab back in returns to the control
 * last used.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar({
  'aria-label': ariaLabel,
  orientation = 'horizontal',
  className,
  children,
  onKeyDown,
  onFocus,
  ...rest
}, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const current = useRef<HTMLElement | null>(null)

  const items = useCallback(
    () => [...(rootRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])].filter(el => !el.closest('[hidden]')),
    [],
  )

  // Roving tabindex: only the current control is in the Tab order.
  const rove = useCallback((to?: HTMLElement | null) => {
    const all = items()
    if (!all.length) return
    const next = to && all.includes(to) ? to : current.current && all.includes(current.current) ? current.current : all[0]
    current.current = next
    for (const el of all) el.tabIndex = el === next ? 0 : -1
  }, [items])

  // Keep it right as controls are added, removed or disabled.
  useEffect(() => {
    rove()
    const root = rootRef.current
    if (!root) return
    const observer = new MutationObserver(() => rove())
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'hidden'] })
    return () => observer.disconnect()
  }, [rove])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    const target = event.target as HTMLElement
    // Ignore keys from a Menu or Popover opened from the toolbar: React passes them up through the portal.
    if (event.defaultPrevented || !rootRef.current?.contains(target)) return
    const all = items()
    const at = all.indexOf(target)
    if (at < 0) return
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    const ownsArrows = target.matches(OWNS_ARROWS)
    let to: HTMLElement | undefined
    if (event.key === next && !ownsArrows) to = all[(at + 1) % all.length]
    else if (event.key === prev && !ownsArrows) to = all[(at - 1 + all.length) % all.length]
    else if (event.key === 'Home' && !ownsArrows) to = all[0]
    else if (event.key === 'End' && !ownsArrows) to = all[all.length - 1]
    if (!to) return
    event.preventDefault()
    rove(to)
    to.focus()
  }

  return (
    <ToolbarContext.Provider value={orientation}>
      <div
        {...rest}
        ref={mergeRefs(ref, rootRef)}
        role="toolbar"
        aria-label={ariaLabel}
        // Horizontal is the default for a toolbar, so it's only stated when vertical.
        aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
        className={cn('toolbar', orientation === 'vertical' && 'toolbar--vertical', className)}
        onKeyDown={handleKeyDown}
        onFocus={e => {
          onFocus?.(e)
          // A click or a programmatic focus also makes that control the current one.
          if (items().includes(e.target as HTMLElement)) rove(e.target as HTMLElement)
        }}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  )
})

Toolbar.displayName = 'Toolbar'

/** A line between groups of controls; it runs across the toolbar's direction. */
export function ToolbarSeparator({ className }: { className?: string }) {
  const orientation = useContext(ToolbarContext)
  return <Divider orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} className={cn('toolbar__separator', className)} />
}

/** Pushes what follows to the far end: the row's main action, a "More" menu. Not a control. */
export function ToolbarSpacer() {
  return <span className="toolbar__spacer" aria-hidden="true" />
}
