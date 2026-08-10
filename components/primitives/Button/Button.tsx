'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ease } from '../../../lib/motion'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Spinner } from '../Spinner'
import { cn } from '../../../lib/cn'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'

type ButtonProps = {
  variant?: ButtonVariant
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'
  noArrow?: boolean
  'aria-label'?: string
  href?: string
  curtainColor?: string
  /** Called instead of a plain navigation when set and the link is internal — lets host apps inject route-transition behavior (e.g. a page-curtain animation) without Button depending on any specific router or transition system. Omit for a plain internal navigation. */
  onNavigate?: (href: string, curtainColor?: string) => void
}


export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  icon,
  iconPosition = 'start',
  noArrow = false,
  'aria-label': ariaLabel,
  href,
  curtainColor,
  onNavigate,
}: ButtonProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)

  const isLink = variant === 'link'
  const isDisabled = disabled || loading

  const className = cn(
    'button',
    variant !== 'primary' && `button--${variant}`,
    fullWidth && 'button--full-width',
    loading && 'button--loading',
    disabled && !loading && 'button--disabled',
  )

  useEffect(() => {
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

    let tl: gsap.core.Timeline | null = null

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

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      container.classList.remove('button--hovering')
      if (tl) tl.kill()
    }
  }, [isLink, isDisabled])

  const arrow = (
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
        ) : noArrow ? null : arrow
      )}
    </span>
  )

  const content = (
    <>
      {!isLink && (
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
              : undefined
        }
      >
        {content}
      </a>
    )
  }

  return (
    <button
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
}
