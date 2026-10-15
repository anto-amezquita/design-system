'use client'

import { Children, forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react'
import { CaretLeftIcon, CaretRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { IconButton } from '../../primitives/IconButton'
import { cn } from '../../../lib/cn'
import './Carousel.css'

type CarouselOwnProps = {
  /** What the slides are, e.g. "Featured projects". Required: it names the carousel for screen readers. */
  label: string
  /** CarouselSlide elements. */
  children: React.ReactNode
  /** How many slides show at once: 1 (default), 2 or 3. Narrow screens can override `--carousel-per-view` in CSS. */
  perView?: 1 | 2 | 3
  /** Starting slide (0-based) when uncontrolled. */
  defaultIndex?: number
  /** Controlled slide index. The carousel scrolls to it when it changes. Pair with `onIndexChange`. */
  index?: number
  /** Called when the first visible slide changes, by button, dot, swipe or keyboard. */
  onIndexChange?: (index: number) => void
  /**
   * Rotate on its own. Off by default. When on, a pause button comes first,
   * rotation stops while the pointer or focus is inside, and it never starts
   * when the user has asked for reduced motion (WCAG 2.2.2).
   */
  autoplay?: boolean
  /** Milliseconds per slide while rotating. Defaults to the `--carousel-autoplay-interval` token (6 s). */
  interval?: number
  /** Show the position dots. Default `true`. */
  showDots?: boolean
}

// decisions/0007: native attributes reach the <section>.
type CarouselProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & CarouselOwnProps

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A row of slides shown a few at a time, with previous / next buttons and
 * position dots. Built on CSS scroll-snap, so swiping and trackpads work
 * natively. Follows the WAI-ARIA carousel pattern: a named region, slides
 * as "slide n of N" groups, slides out of view made inert, and a polite
 * status that says which slide is showing after a user moves it.
 */
export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel({
  label,
  children,
  perView = 1,
  defaultIndex = 0,
  index: indexProp,
  onIndexChange,
  autoplay = false,
  interval,
  showDots = true,
  className,
  style,
  ...rest
}, ref) {
  const slides = Children.toArray(children)
  const count = slides.length
  const lastIndex = Math.max(0, count - perView)
  const trackId = useId()

  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const [current, setCurrent] = useState(() => Math.min(indexProp ?? defaultIndex, lastIndex))
  const [announce, setAnnounce] = useState(false)
  const [playing, setPlaying] = useState(autoplay)
  const [held, setHeld] = useState(false) // pointer or focus inside: rotation waits
  const currentRef = useRef(current)
  currentRef.current = current

  const slideEls = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[]

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    const target = slideEls()[Math.min(Math.max(i, 0), lastIndex)]
    if (!track || !target) return
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex])

  // A user move: scroll there and announce the slide once it lands.
  const go = useCallback((i: number) => {
    setAnnounce(true)
    scrollToIndex(i)
  }, [scrollToIndex])

  // Under reduced motion it never rotates, so the button offers Play, not Pause.
  // Checked after mount: the server can't know the preference.
  useEffect(() => {
    if (autoplay && prefersReducedMotion()) setPlaying(false)
  }, [autoplay])

  // Starting position, without animation.
  useEffect(() => {
    if (current > 0) scrollToIndex(current, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Controlled: follow the prop.
  useEffect(() => {
    if (indexProp !== undefined && indexProp !== currentRef.current) scrollToIndex(indexProp)
  }, [indexProp, scrollToIndex])

  // The scroll position is the truth: buttons, swipes and keys all end up here.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const first = slideEls()[0]
        const second = slideEls()[1]
        if (!first) return
        const stepWidth = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
        const at = Math.min(Math.round(Math.abs(track.scrollLeft) / stepWidth), lastIndex)
        if (at !== currentRef.current) {
          setCurrent(at)
          onIndexChange?.(at)
        }
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex, onIndexChange])

  // Rotation. Never under reduced motion; waits while held or the tab is hidden.
  useEffect(() => {
    if (!autoplay || !playing || held || count <= perView) return
    const ms = interval ?? (parseFloat(getComputedStyle(rootRef.current!).getPropertyValue('--carousel-autoplay-interval')) || 6000)
    const id = window.setInterval(() => {
      if (document.hidden) return
      setAnnounce(false)
      scrollToIndex(currentRef.current >= lastIndex ? 0 : currentRef.current + 1)
    }, ms)
    return () => window.clearInterval(id)
  }, [autoplay, playing, held, count, perView, interval, lastIndex, scrollToIndex])

  const visible = (i: number) => i >= current && i < current + perView
  const rotating = autoplay && playing && !held

  return (
    <section
      {...rest}
      ref={node => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      aria-label={label}
      aria-roledescription="carousel"
      className={cn('carousel', className)}
      style={{ ...style, '--carousel-per-view': perView } as React.CSSProperties}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false)
      }}
    >
      <div
        ref={trackRef}
        id={trackId}
        className="carousel__track"
        // Arrow keys on the track move by a slide; Tab still reaches the controls.
        tabIndex={0}
        role="group"
        aria-label="Slides"
        onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
            const forward = (event.key === 'ArrowRight') !== rtl
            go(currentRef.current + (forward ? 1 : -1))
          }
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="carousel__slide"
            inert={!visible(i) || undefined}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="carousel__controls">
        {autoplay && (
          <IconButton
            variant="ghost"
            size="sm"
            className="carousel__rotation"
            label={playing ? 'Pause slides' : 'Play slides'}
            icon={playing ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
            onClick={() => setPlaying(p => !p)}
          />
        )}
        <IconButton
          variant="secondary"
          size="sm"
          label="Previous slide"
          icon={<CaretLeftIcon />}
          aria-controls={trackId}
          disabled={current === 0}
          onClick={() => go(current - 1)}
        />
        {showDots && lastIndex > 0 && (
          <div className="carousel__dots">
            {Array.from({ length: lastIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                className="carousel__dot"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                aria-controls={trackId}
                onClick={() => go(i)}
              />
            ))}
          </div>
        )}
        <IconButton
          variant="secondary"
          size="sm"
          label="Next slide"
          icon={<CaretRightIcon />}
          aria-controls={trackId}
          disabled={current >= lastIndex}
          onClick={() => go(current + 1)}
        />
      </div>

      {/* Polite while people move it; silent while it rotates on its own (WAI-ARIA carousel pattern). */}
      <div className="carousel__status" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
        {announce ? `Slide ${current + 1} of ${count}` : ''}
      </div>
    </section>
  )
})

Carousel.displayName = 'Carousel'

type CarouselSlideProps = React.HTMLAttributes<HTMLDivElement>

/** One slide. Any content: an image, a Card, a quote. */
export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cn('carousel-slide', className)} />
})

CarouselSlide.displayName = 'CarouselSlide'
