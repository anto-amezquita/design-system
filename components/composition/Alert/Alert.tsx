'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { feedbackIcons, type FeedbackVariant } from '../../../lib/feedbackIcons'
import './Alert.css'

type AlertVariant = FeedbackVariant

type AlertProps = {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  /**
   * Set to false only for alerts that are present at initial server-render time,
   * where content is already parsed by screen readers via normal document reading.
   * For alerts mounted dynamically in response to user actions, always leave this
   * as true — setting live=false on a dynamically-mounted alert makes it invisible
   * to screen readers entirely. Defaults to true.
   */
  live?: boolean
}

export function Alert({ variant = 'info', title, children, dismissible = false, onDismiss, icon, live = true }: AlertProps) {
  const instanceId = useId()
  // Internal state is intentional: dismissed/dismissing gate the exit animation,
  // and the parent unmounting before animationend would kill the animation early.
  // onDismiss lets the parent react to the lifecycle without owning the timing.
  const [dismissed, setDismissed] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  // SSR guard: aria-live on a server-rendered node fires no announcement because the
  // live region already exists when the AT parses the document. Adding aria-live after
  // hydration means the AT sees the attribute appear on an existing element and will
  // announce its content.
  //
  // role="region" is intentionally omitted from live alerts — combining role="region"
  // with aria-live on the same element causes NVDA+Chrome to announce the content
  // twice: once via the live region and once during virtual-buffer refresh of the new
  // landmark. Static alerts (live=false) keep role="region" since they are navigation
  // landmarks only and are never announced via aria-live.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  const onDismissFiredRef = useRef(false)

  // Updated synchronously in handleDismiss so the [] cleanup below can always
  // read the correct value — even if the component unmounts before React commits
  // the setDismissing(true) state update and runs post-render effects.
  const dismissingRef = useRef(false)

  // If the parent unmounts while the exit animation is in-flight, animationend
  // never fires. The cleanup here ensures onDismiss is still called as a fallback.
  //
  // Empty deps: this cleanup only registers once. In React 18 Strict Mode, it fires
  // during the synthetic unmount at initial mount — but at that point dismissingRef
  // is still false, so the guard prevents a premature call. Real unmount calls it
  // only when dismissingRef is already true (i.e., the user clicked dismiss).
  useEffect(() => {
    return () => {
      if (dismissingRef.current && !onDismissFiredRef.current) {
        onDismissFiredRef.current = true
        onDismissRef.current?.()
      }
    }
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    dismissingRef.current = true
    // Safari iOS may not fire animationend for zero-duration animations under
    // reduced-motion. Skip the animation entirely and dismiss synchronously.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!onDismissFiredRef.current) {
        onDismissFiredRef.current = true
        onDismissRef.current?.()
      }
      setDismissed(true)
      return
    }
    setDismissing(true)
  }

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target === e.currentTarget && dismissing && e.animationName === 'alert-exit') {
      setDismissed(true)
      if (!onDismissFiredRef.current) {
        onDismissFiredRef.current = true
        onDismissRef.current?.()
      }
    }
  }

  const ariaLive = live && mounted
    ? (variant === 'error' || variant === 'warning') ? 'assertive' as const : 'polite' as const
    : undefined
  const ariaAtomic = (live && mounted) ? true : undefined
  // Unique fallback prevents multiple untitled alerts sharing the same aria-label (WCAG 4.1.2).
  const regionLabel = title ?? `Alert ${instanceId}`
  const iconNode = icon !== undefined ? icon : feedbackIcons[variant]

  return (
    <div
      role={!live ? 'region' : undefined}
      aria-label={!live ? regionLabel : undefined}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={`alert alert--${variant}${dismissing ? ' alert--dismissing' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {iconNode && (
        <span className="alert__icon" aria-hidden="true">{iconNode}</span>
      )}

      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__body">{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          className="alert__close"
          aria-label="Dismiss alert"
          onClick={handleDismiss}
        >
          <XIcon size={16} weight="regular" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
