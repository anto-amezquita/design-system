import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './VisuallyHidden.css'

type VisuallyHiddenOwnProps = {
  /** `span` (default) for text inside a line; `div` for a block, like a hidden heading's wrapper. */
  as?: 'span' | 'div'
  children: React.ReactNode
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type VisuallyHiddenProps = React.HTMLAttributes<HTMLElement> & VisuallyHiddenOwnProps

/**
 * Text screen readers announce but sighted users don't see: a label for an
 * icon-only control, "(opens in a new tab)", a heading that names a region.
 * It stays in the accessibility tree, unlike `display: none` or `hidden`.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden({
  as: Tag = 'span',
  className,
  children,
  ...rest
}, ref) {
  return (
    <Tag {...rest} ref={ref as React.Ref<HTMLDivElement>} className={cn('visually-hidden', className)}>
      {children}
    </Tag>
  )
})

VisuallyHidden.displayName = 'VisuallyHidden'
