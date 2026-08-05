'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, memo } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { XIcon } from '@phosphor-icons/react'
import { feedbackIcons, type FeedbackVariant } from '@/lib/feedbackIcons'
import './Toast.css'

// Swipe direction is 'right' (matches Toast.css slide-in/out keyframes direction).
// If the viewport position ever changes, update both swipeDirection here AND the
// @keyframes in Toast.css.
const SWIPE_DIRECTION = 'right' as const

// Derived from --duration-transition at startup so the value stays in sync
// when the token changes. Adds a 50ms buffer so the exit animation always
// completes before the item is removed from state.
function readDurationMs(property: string, fallback: number): number {
  if (typeof document === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000
  return Number.isFinite(ms) && ms > 0 ? ms : fallback
}

const TOAST_REMOVE_DELAY_MS = readDurationMs('--duration-transition', 400) + 50

type ToastVariant = FeedbackVariant | 'neutral'

type ToastOptions = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastItem = ToastOptions & {
  id: string
  open: boolean
}

type ToastContextValue = {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => '', dismiss: () => {} })

const EXIT_ANIMATIONS = new Set(['toast-slide-out', 'toast-swipe-out'])

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  ...feedbackIcons,
  neutral: null,
}

type ToastItemProps = ToastItem & {
  // Stable callbacks from the provider — safe to use as useCallback deps
  onDismiss: (id: string) => void
  onRemoveById: (id: string) => void
}

const ToastItemComponent = memo(function ToastItem({
  id,
  title,
  description,
  variant = 'neutral',
  duration = 5000,
  open,
  onDismiss,
  onRemoveById,
}: ToastItemProps) {
  const icon = ICONS[variant]

  // Per-id stable handlers derived from the stable parent callbacks
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) onDismiss(id)
  }, [id, onDismiss])

  // Keep onRemoveById in a ref so the timeout fallback always reads the latest
  // version without restarting when the provider re-renders
  const onRemoveRef = useRef(onRemoveById)
  onRemoveRef.current = onRemoveById

  const removedRef = useRef(false)
  const handleRemove = useCallback(() => {
    if (removedRef.current) return
    removedRef.current = true
    onRemoveRef.current(id)
  }, [id])

  // Fallback: under prefers-reduced-motion some browsers fire animationend with
  // animationName='' (0ms duration), which EXIT_ANIMATIONS.has() misses. A short
  // timeout after open becomes false ensures the item is always removed from state.
  useEffect(() => {
    if (!open) {
      // 450ms > --duration-transition (400ms) so the animation always completes first.
      const timerId = setTimeout(handleRemove, TOAST_REMOVE_DELAY_MS)
      return () => clearTimeout(timerId)
    }
  }, [open, handleRemove])

  return (
    <RadixToast.Root
      className={`toast${variant !== 'neutral' ? ` toast--${variant}` : ''}`}
      open={open}
      onOpenChange={handleOpenChange}
      duration={duration}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && EXIT_ANIMATIONS.has(e.animationName)) handleRemove() }}
    >
      {icon && <span className="toast__icon" aria-hidden="true">{icon}</span>}
      <div className="toast__content">
        <RadixToast.Title className="toast__title">{title}</RadixToast.Title>
        {description && (
          <RadixToast.Description className="toast__body">{description}</RadixToast.Description>
        )}
      </div>
      <RadixToast.Close asChild>
        <button type="button" className="toast__close" aria-label="Close notification">
          <XIcon size={14} weight="regular" aria-hidden="true" />
        </button>
      </RadixToast.Close>
    </RadixToast.Root>
  )
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((options: ToastOptions): string => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    setToasts(prev => [...prev, { ...options, id, open: true }])
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, open: false } : t))
  }, [])

  // Stable remove callback — passed as onRemoveById so ToastItem can memoize
  // its own per-id handler without reconstructing on every provider render
  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <RadixToast.Provider swipeDirection={SWIPE_DIRECTION}>
        {children}
        {toasts.map(t => (
          <ToastItemComponent
            key={t.id}
            {...t}
            onDismiss={dismiss}
            onRemoveById={remove}
          />
        ))}
        <RadixToast.Viewport className="toast__viewport" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
