import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import { VisuallyHidden } from '../VisuallyHidden'
import './StatusDot.css'

type Status = 'neutral' | 'info' | 'success' | 'warning' | 'error'

type StatusDotBaseProps = {
  /**
   * What the dot means, by role, so each brand sets the colour: `neutral`
   * (default: offline, draft, idle), `info`, `success` (online, live,
   * passing), `warning` (away, degraded), `error` (failed, down).
   */
  status?: Status
  /** A slow pulse, for something live or in progress. Off for anyone who prefers reduced motion. */
  pulse?: boolean
  /** The words shown next to the dot: "Online". Give this or `label`. */
  children?: React.ReactNode
  /** Words read to screen readers only, when there's no room to show them. Give this or `children`; never for an error. */
  label?: string
}

/*
  Colour alone can't carry the status (WCAG 1.4.1), so every StatusDot has
  words: either visible text as children, or a `label` screen readers read
  when the words are elsewhere (an Avatar's corner, a table cell headed "Status").
*/
/** Words are required: shown (`children`) or read (`label`), not both. */
type StatusDotWords = { children: React.ReactNode; label?: never } | { label: string; children?: never }

type StatusDotProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> & StatusDotBaseProps & StatusDotWords

/**
 * A small coloured dot that marks a status, always with words: shown next
 * to it, or read to screen readers.
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot({
  status = 'neutral',
  pulse = false,
  label,
  children,
  className,
  ...rest
}, ref) {
  return (
    <span
      {...rest}
      ref={ref}
      className={cn('status-dot', `status-dot--${status}`, pulse && 'status-dot--pulse', className)}
    >
      <span className="status-dot__dot" aria-hidden="true" />
      {children !== undefined
        ? <span className="status-dot__text">{children}</span>
        : <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  )
})

StatusDot.displayName = 'StatusDot'
