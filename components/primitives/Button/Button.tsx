'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Spinner } from '../Spinner'
import { cn } from '../../../lib/cn'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'

type ButtonMotion = 'functional' | 'expressive'

type ButtonOwnProps = {
  /** How much emphasis the action gets. `primary` (default) for the one main action in a view, `secondary` for actions beside it, `ghost` for low-emphasis actions, `link` for an action that should read as text. */
  variant?: ButtonVariant
  /** The label. Name the action ("Save changes"), not the element ("Click here"). */
  children: React.ReactNode
  /** Runs on click. It doesn't run on a disabled or loading Button, or on an internal link that `onNavigate` handles. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  /** Blocks the action. A `<button>` gets the native `disabled` attribute and leaves the tab order; an `<a>` gets `aria-disabled`, loses its `href` and is removed from the tab order. */
  disabled?: boolean
  /** Shows a spinner over the label and blocks the action like `disabled`, with `aria-busy` set. The label stays in place, invisible, so the Button keeps its width and the layout doesn't jump. */
  loading?: boolean
  /** Stretches the Button to the width of its container. Meant for narrow layouts and stacked forms. */
  fullWidth?: boolean
  /** The native button type. Defaults to `'button'`, so a Button inside a form doesn't submit it by accident; set `'submit'` for the form's main action. Ignored when `href` is set. */
  type?: 'button' | 'submit' | 'reset'
  /** An icon beside the label, hidden from screen readers; the label carries the meaning. For an icon-only Button, also set `aria-label`. */
  icon?: React.ReactNode
  /** Which side of the label the icon goes on. Defaults to `'start'`. An icon at `'end'` takes the arrow's place, so `arrow` is ignored then. */
  iconPosition?: 'start' | 'end'
  /** Trailing arrow after the label. Off by default — turn it on for a call to action that leads somewhere. Ignored on the `link` variant, while loading, and when an icon sits at the end. */
  arrow?: boolean
  /** `'expressive'` adds the hover wipe and glow, and loads GSAP on demand. Left at `'functional'`, hover is a plain background change and no animation code is fetched. See decisions/0016. */
  motion?: ButtonMotion
  /** An accessible name for when the visible label isn't enough, e.g. an icon-only Button. */
  'aria-label'?: string
  /** Renders an `<a>` instead of a `<button>`, for an action that navigates. */
  href?: string
  /** A colour passed to `onNavigate` along with the link, for a route transition that needs one. Does nothing on its own. */
  curtainColor?: string
  /** Called instead of a plain navigation when set and the link is internal — lets host apps inject route-transition behavior (e.g. a page-curtain animation) without Button depending on any specific router or transition system. Omit for a plain internal navigation. */
  onNavigate?: (href: string, curtainColor?: string) => void
}

// `HTMLAttributes<HTMLElement>` rather than `ButtonHTMLAttributes` /
// `AnchorHTMLAttributes` on purpose: Button renders either a <button> or an
// <a> depending on `href`, so an element-specific attribute type would be
// wrong for one branch or the other. HTMLAttributes covers what both
// branches actually need to receive from Radix's Slot when composed via
// asChild — aria-*, data-*, id, and the event handlers a Trigger injects —
// without claiming support for anchor- or button-only attributes this
// component doesn't forward 1:1 (e.g. `type`, which Button narrows itself).
// `onClick` and `type` are own props with narrower signatures than the
// native ones, so they're omitted here to avoid a collision; see Input.tsx
// for the same pattern applied to a single-element component.
type ButtonProps = Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'type'> & ButtonOwnProps

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  icon,
  iconPosition = 'start',
  arrow = false,
  motion = 'functional',
  'aria-label': ariaLabel,
  href,
  curtainColor,
  onNavigate,
  className: classNameProp,
  ...rest
}, ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const elementRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  useImperativeHandle(ref, () => elementRef.current as HTMLButtonElement | HTMLAnchorElement)

  const isLink = variant === 'link'
  const isDisabled = disabled || loading
  const isExpressive = motion === 'expressive'

  // decisions/0007: classNameProp merged in last, closing the gap 0006 left
  // open — {...rest} below no longer carries className (destructured out
  // above), so this is the only place it can still get lost.
  const className = cn(
    'button',
    variant !== 'primary' && `button--${variant}`,
    isExpressive && 'button--expressive',
    fullWidth && 'button--full-width',
    loading && 'button--loading',
    disabled && !loading && 'button--disabled',
    classNameProp,
  )

  useEffect(() => {
    if (!isExpressive) return
    if (isLink || isDisabled) {
      if (pathRef.current) {
        pathRef.current.setAttribute('d', 'M 0 105 Q 50 105 100 105 L 100 105 L 0 105 Z')
      }
      if (glowRef.current) glowRef.current.style.opacity = '0'
      return
    }
    const svg = svgRef.current
    const path = pathRef.current
    const glow = glowRef.current
    if (!svg || !path || !glow) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const container = svg.parentElement as HTMLElement
    if (!container) return

    const style = getComputedStyle(container)
    function parseDuration(prop: string, fallback = 0.3): number {
      const raw = style.getPropertyValue(prop).trim()
      const val = parseFloat(raw) / (raw.endsWith('ms') ? 1000 : 1)
      return Number.isFinite(val) && val > 0 ? val : fallback
    }
    const durEnter = parseDuration('--button-wipe-duration-enter')
    const durCurve = parseDuration('--button-wipe-duration-curve')
    const durExit = parseDuration('--button-wipe-duration-exit')
    const durCurveOut = parseDuration('--button-wipe-duration-curve-out')

    const state = { topY: 105, curveAmp: 0, curveX: 50 }
    let buttonRect = container.getBoundingClientRect()

    function drawPath() {
      const { topY, curveX, curveAmp } = state
      path!.setAttribute(
        'd',
        `M 0 ${topY} Q ${curveX} ${topY - curveAmp} 100 ${topY} L 100 105 L 0 105 Z`
      )
      const peakX = curveX / 2 + 25
      const peakY = topY - curveAmp
      glow!.style.left = `${(peakX / 100) * buttonRect.width}px`
      glow!.style.top = `${(peakY / 100) * buttonRect.height}px`
      glow!.style.opacity = String(curveAmp / 40)
    }

    drawPath()

    // decisions/0016: GSAP is fetched here rather than imported at the top of
    // the file, so it only enters the bundle graph of a consumer that renders
    // an expressive Button. lib/motion comes along in the same chunk — it
    // registers the 'expand' CustomEase the wipe eases on.
    let cancelled = false
    let detach: (() => void) | undefined

    void Promise.all([import('gsap'), import('../../../lib/motion')]).then(
      ([{ default: gsap }, { ease }]) => {
        if (cancelled) return

        let tl: ReturnType<typeof gsap.timeline> | null = null

        function onEnter(e: MouseEvent) {
          if (tl) tl.kill()
          buttonRect = container.getBoundingClientRect()
          state.curveX = ((e.clientX - buttonRect.left) / buttonRect.width) * 100

          container.classList.add('button--hovering')

          tl = gsap.timeline({ onUpdate: drawPath, onComplete: drawPath })
            .to(state, { topY: -5, duration: durEnter, ease: ease.out }, 0)
            .to(state, { curveAmp: 40, duration: durCurve, ease: ease.expand }, 0)
            .to(state, { curveAmp: 0, duration: durCurve, ease: ease.out }, durCurve)
        }

        function onLeave() {
          if (tl) tl.kill()
          container.classList.remove('button--hovering')
          drawPath()

          tl = gsap.timeline({ onUpdate: drawPath, onComplete: drawPath })
            .to(state, { topY: 105, duration: durExit, ease: ease.in }, 0)
            .to(state, { curveAmp: 28, duration: durCurveOut, ease: ease.expand }, 0)
            .to(state, { curveAmp: 0, duration: durCurveOut, ease: ease.out }, durCurveOut)
        }

        container.addEventListener('mouseenter', onEnter)
        container.addEventListener('mouseleave', onLeave)

        detach = () => {
          container.removeEventListener('mouseenter', onEnter)
          container.removeEventListener('mouseleave', onLeave)
          if (tl) tl.kill()
        }
      }
    )

    return () => {
      cancelled = true
      detach?.()
      container.classList.remove('button--hovering')
    }
  }, [isExpressive, isLink, isDisabled])

  const arrowNode = (
    <span className="button__arrow" aria-hidden="true">
      <ArrowRightIcon size={14} weight="regular" />
    </span>
  )

  const label = (
    <span className={`button__label${loading ? ' button__label--hidden' : ''}`}>
      {icon && iconPosition === 'start' && (
        <span className="button__icon" aria-hidden="true">{icon}</span>
      )}
      {children}
      {isLink || loading ? null : (
        icon && iconPosition === 'end' ? (
          <span className="button__icon" aria-hidden="true">{icon}</span>
        ) : arrow ? arrowNode : null
      )}
    </span>
  )

  const content = (
    <>
      {isExpressive && !isLink && (
        <>
          <svg
            className="button__wipe"
            ref={svgRef}
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path ref={pathRef} />
          </svg>
          <span className="button__glow" aria-hidden="true" ref={glowRef} />
        </>
      )}
      {loading && (
        <span className="button__spinner" aria-hidden="true">
          <Spinner size="sm" />
        </span>
      )}
      {label}
    </>
  )

  if (href) {
    const internal = href.startsWith('/') && !href.startsWith('//') && !href.includes('#') && !/^(https?:\/\/|mailto:|tel:)/.test(href)
    return (
      <a
        {...rest}
        ref={elementRef}
        className={className}
        href={isDisabled ? undefined : href}
        tabIndex={isDisabled ? -1 : undefined}
        aria-label={ariaLabel}
        aria-busy={loading ? true : undefined}
        aria-disabled={isDisabled ? true : undefined}
        onClick={
          isDisabled
            ? (e) => e.preventDefault()
            : internal && onNavigate
              ? (e) => { e.preventDefault(); onNavigate(href, curtainColor) }
              : onClick
        }
      >
        {content}
      </a>
    )
  }

  return (
    <button
      {...rest}
      ref={elementRef}
      className={className}
      onClick={onClick}
      disabled={isDisabled}
      type={type}
      aria-label={ariaLabel}
      aria-busy={loading ? true : undefined}
    >
      {content}
    </button>
  )
})

Button.displayName = 'Button'
