import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Badge.css'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info'

type DotBadgeProps = {
  variant?: BadgeVariant
  shape: 'dot'
  'aria-label': string
  children?: never
}

type OtherBadgeProps = {
  variant?: BadgeVariant
  shape?: 'status' | 'count'
  children?: React.ReactNode
  'aria-label'?: string
}

// `DotBadgeProps`/`OtherBadgeProps` stay plain object aliases, unchanged —
// the doc generator's decomposeProps only resolves a union branch into a
// prop-table row when it's a bare identifier pointing at exactly that shape
// (decisions/0006's Alternatives section, decisions/0007). The native-attrs
// intersection is added at the *outer* union instead, parenthesized the same
// way Button's `Omit<...> & ButtonOwnProps` does it — the union still
// resolves to two clean rows, and the `Omit<...>` part surfaces as its own
// "Also accepts all props of" note rather than silently breaking the table.
type BadgeProps = (DotBadgeProps | OtherBadgeProps) & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'aria-label'>

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  variant = 'neutral',
  shape = 'status',
  children,
  'aria-label': ariaLabel,
  className,
  ...rest
}, ref) {
  const classes = cn(
    'badge',
    variant !== 'neutral' && `badge--${variant}`,
    shape !== 'status' && `badge--${shape}`,
    className,
  )

  if (shape === 'dot') {
    return <span {...rest} ref={ref} className={classes} role="img" aria-label={ariaLabel} />
  }

  // aria-label is ignored on role="generic" (plain <span>). Add role="img" when an
  // accessible label is provided so ATs announce it correctly.
  return (
    <span {...rest} ref={ref} className={classes} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'
