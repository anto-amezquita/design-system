import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './ScrollArea.css'

type ScrollAreaOwnProps = {
  /**
   * Names the area for screen readers ("Release notes", "Message history").
   * Required: a scrolling box has to be reachable with the keyboard, so it
   * takes focus, and a focusable region needs a name to be announced.
   */
  label: string
  /** Which way it scrolls. Default `vertical`. */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /** Height limit before it scrolls: a CSS length (`'20rem'`) or pixels (`320`). */
  maxHeight?: string | number
  children: React.ReactNode
}

// decisions/0007: typed against the native attributes so `...rest` reaches the region.
type ScrollAreaProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'tabIndex'> & ScrollAreaOwnProps

/**
 * A box that scrolls its content, with thin scrollbars in the brand's
 * colours and a focus ring, reachable and scrollable with the keyboard.
 * Native scrolling, so touch, trackpads and assistive tech work as usual.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({
  label,
  orientation = 'vertical',
  maxHeight,
  className,
  style,
  children,
  ...rest
}, ref) {
  return (
    <div
      {...rest}
      ref={ref}
      role="region"
      aria-label={label}
      // Focusable so keyboard users can scroll it with the arrow keys even
      // when nothing inside takes focus (WCAG 2.1.1; axe scrollable-region-focusable).
      tabIndex={0}
      style={maxHeight !== undefined ? { maxBlockSize: maxHeight, ...style } : style}
      className={cn('scroll-area', `scroll-area--${orientation}`, className)}
    >
      {children}
    </div>
  )
})

ScrollArea.displayName = 'ScrollArea'
