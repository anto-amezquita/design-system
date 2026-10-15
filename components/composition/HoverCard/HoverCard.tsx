'use client'

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { Slot } from '@radix-ui/react-slot'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import { mergeRefs } from '../../../lib/mergeRefs'
import { cn } from '../../../lib/cn'
import '../Popover/Popover.css'
import './HoverCard.css'

type HoverCardContextValue = {
  open: boolean
  show: () => void
  hide: () => void
  cancel: () => void
  close: () => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
  contentRef: React.MutableRefObject<HTMLDivElement | null>
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null)

function useHoverCard(part: string) {
  const ctx = useContext(HoverCardContext)
  if (!ctx) throw new Error(`<${part}> must be inside <HoverCard>.`)
  return ctx
}

/** Reads a duration token ("500ms" or "0.5s") from the element's styles, in milliseconds. */
function readDelay(el: Element | null, token: string, fallback: number) {
  if (!el || typeof window === 'undefined') return fallback
  const raw = getComputedStyle(el).getPropertyValue(token).trim()
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return fallback
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type HoverCardProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Milliseconds before opening. Defaults to `--hover-card-open-delay` (500 ms). */
  openDelay?: number
  /** Milliseconds before closing once the pointer leaves. Defaults to `--hover-card-close-delay` (300 ms). */
  closeDelay?: number
}

/**
 * A preview of what a link leads to, shown while the pointer rests on it or
 * keyboard focus lands on it: a person's profile, a page's summary. Built on
 * Popover, so it isn't Radix HoverCard's mouse-only kind: it opens on
 * keyboard focus too, Tab moves into it when it has links, and Escape closes
 * it. It stays while the pointer is over it (WCAG 1.4.13). Touch doesn't
 * open it; the link just works.
 */
export function HoverCard({ children, open: openProp, defaultOpen = false, onOpenChange, openDelay, closeDelay }: HoverCardProps) {
  const [inner, setInner] = useState(defaultOpen)
  const open = openProp ?? inner
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const set = useCallback((next: boolean) => {
    if (openProp === undefined) setInner(next)
    onOpenChange?.(next)
  }, [openProp, onOpenChange])

  const cancel = useCallback(() => clearTimeout(timer.current), [])
  const show = useCallback(() => {
    clearTimeout(timer.current)
    if (open) return
    const ms = openDelay ?? readDelay(triggerRef.current, '--hover-card-open-delay', 500)
    timer.current = setTimeout(() => set(true), ms)
  }, [open, openDelay, set])
  const hide = useCallback(() => {
    clearTimeout(timer.current)
    const ms = closeDelay ?? readDelay(triggerRef.current, '--hover-card-close-delay', 300)
    timer.current = setTimeout(() => set(false), ms)
  }, [closeDelay, set])
  const close = useCallback(() => { clearTimeout(timer.current); set(false) }, [set])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <HoverCardContext.Provider value={{ open, show, hide, cancel, close, triggerRef, contentRef }}>
      <RadixPopover.Root open={open} onOpenChange={next => (next ? set(true) : close())}>
        {children}
      </RadixPopover.Root>
    </HoverCardContext.Provider>
  )
}

type HoverCardTriggerProps = React.HTMLAttributes<HTMLElement> & {
  /** The link or button it previews. Required: the trigger keeps its own role and name. */
  children: React.ReactElement
}

/** The link the card previews. It keeps its own role, name and click; nothing is added to its name. */
export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(function HoverCardTrigger({ children, ...rest }, ref) {
  const { open, show, hide, close, triggerRef, contentRef } = useHoverCard('HoverCardTrigger')

  // Only a mouse or pen hovers; a touch goes straight through to the link.
  const fromPointer = (e: React.PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen'

  return (
    <RadixPopover.Anchor asChild>
      <Slot
        {...rest}
        ref={mergeRefs(ref, triggerRef as React.Ref<HTMLElement>)}
        data-state={open ? 'open' : 'closed'}
        onPointerEnter={(e: React.PointerEvent) => { rest.onPointerEnter?.(e as React.PointerEvent<HTMLElement>); if (fromPointer(e)) show() }}
        onPointerLeave={(e: React.PointerEvent) => { rest.onPointerLeave?.(e as React.PointerEvent<HTMLElement>); if (fromPointer(e)) hide() }}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          rest.onFocus?.(e)
          // Keyboard focus only: a click also focuses the link, and that shouldn't open a card.
          if (e.currentTarget.matches(':focus-visible')) show()
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          rest.onBlur?.(e)
          if (!contentRef.current?.contains(e.relatedTarget as Node)) hide()
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          rest.onKeyDown?.(e)
          if (e.key === 'Escape' && open) { e.preventDefault(); close() }
          // Tab moves into the card when it has links or buttons.
          if (e.key === 'Tab' && !e.shiftKey && open) {
            const first = contentRef.current?.querySelector<HTMLElement>(TABBABLE)
            if (first) { e.preventDefault(); first.focus() }
          }
        }}
      >
        {children}
      </Slot>
    </RadixPopover.Anchor>
  )
})

HoverCardTrigger.displayName = 'HoverCardTrigger'

type HoverCardContentProps = Omit<React.ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'title'>

/** The preview. Keep it short, and never the only place something can be found or done. */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { className, children, sideOffset = 8, collisionPadding = 16, side = 'bottom', align = 'start', ...rest },
  ref,
) {
  const { show, hide, cancel, close, triggerRef, contentRef } = useHoverCard('HoverCardContent')
  const scope = useThemeScopeAttributes()

  // After the card's last link, Tab continues from the trigger, as if the card sat right after it.
  const afterTrigger = (backwards: boolean) => {
    const trigger = triggerRef.current
    if (!trigger) return
    if (backwards) return trigger.focus()
    const all = [...document.querySelectorAll<HTMLElement>(TABBABLE)].filter(el => !contentRef.current?.contains(el))
    const next = all[all.indexOf(trigger) + 1]
    close()
    next?.focus()
  }

  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        {...scope}
        {...rest}
        ref={mergeRefs(ref, contentRef)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        // Not a dialog: a preview that opens without taking focus.
        role="group"
        className={cn('popover hover-card', className)}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        onPointerEnter={e => { rest.onPointerEnter?.(e); cancel() }}
        onPointerLeave={e => { rest.onPointerLeave?.(e); if (e.pointerType !== 'touch') hide() }}
        onFocusOutside={e => { if (triggerRef.current?.contains(e.target as Node)) e.preventDefault() }}
        onKeyDown={e => {
          rest.onKeyDown?.(e)
          if (e.key !== 'Tab') return
          const items = [...(contentRef.current?.querySelectorAll<HTMLElement>(TABBABLE) ?? [])]
          const at = items.indexOf(document.activeElement as HTMLElement)
          if (e.shiftKey && at === 0) { e.preventDefault(); afterTrigger(true) }
          if (!e.shiftKey && at === items.length - 1) { e.preventDefault(); afterTrigger(false) }
        }}
        onFocus={e => { rest.onFocus?.(e); show() }}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
})

HoverCardContent.displayName = 'HoverCardContent'
