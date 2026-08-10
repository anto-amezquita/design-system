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

type BadgeProps = DotBadgeProps | OtherBadgeProps

export function Badge({ variant = 'neutral', shape = 'status', children, 'aria-label': ariaLabel }: BadgeProps) {
  const classes = cn('badge', variant !== 'neutral' && `badge--${variant}`, shape !== 'status' && `badge--${shape}`)

  if (shape === 'dot') {
    return <span className={classes} role="img" aria-label={ariaLabel} />
  }

  // aria-label is ignored on role="generic" (plain <span>). Add role="img" when an
  // accessible label is provided so ATs announce it correctly.
  return (
    <span className={classes} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
      {children}
    </span>
  )
}
