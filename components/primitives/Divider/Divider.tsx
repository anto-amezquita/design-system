import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Divider.css'

type DividerOwnProps = {
  /** Direction of the line. A vertical Divider stretches to its row's height. */
  orientation?: 'horizontal' | 'vertical'
  /**
   * `true` when the line only decorates: it renders `role="none"` and screen
   * readers skip it. Leave `false` (the default) when it separates groups of
   * content a reader should hear as separate; it then renders
   * `role="separator"`.
   */
  decorative?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type DividerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & DividerOwnProps

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({
  orientation = 'horizontal',
  decorative = false,
  className,
  ...rest
}, ref) {
  // A separator is horizontal by default, so aria-orientation is only needed for vertical.
  const semantics = decorative
    ? { role: 'none' as const }
    : {
        role: 'separator' as const,
        'aria-orientation': orientation === 'vertical' ? ('vertical' as const) : undefined,
      }

  return (
    <div
      {...rest}
      {...semantics}
      ref={ref}
      className={cn('divider', `divider--${orientation}`, className)}
    />
  )
})

Divider.displayName = 'Divider'
