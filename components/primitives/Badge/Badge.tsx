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
  /**
   * `span` (default) for a label, or `button` for a pill that does
   * something: a real `<button type="button">`, in the tab order, with hover
   * and focus states and a target grown to 24px. Use `button` when the Badge
   * opens a Dialog or Drawer as its `trigger`. A dot can't be a button; its
   * 8px target is too small.
   */
  as?: 'span' | 'button'
}

// `DotBadgeProps`/`OtherBadgeProps` stay plain object aliases, unchanged —
// the doc generator's decomposeProps only resolves a union branch into a
// prop-table row when it's a bare identifier pointing at exactly that shape
// (decisions/0006's Alternatives section, decisions/0007). The native-attrs
// intersection is added at the *outer* union instead, parenthesized the same
// way Button's `Omit<...> & ButtonOwnProps` does it — the union still
// resolves to two clean rows, and the `Omit<...>` part surfaces as its own
// "Also accepts all props of" note rather than silently breaking the table.
// `role` explicitly excluded (code review, 2026-09-14): Badge always
// computes its own role (`role="img"` when labeled, `undefined` otherwise —
// a deliberate a11y decision, not a passthrough candidate) and writes it in
// JSX after `{...rest}`, so a consumer-supplied `role` was silently
// discarded when it was admitted through the native-attrs intersection.
// Badge doesn't support overriding its own role; the type now says so.
// The ref is HTMLElement since `as="button"` (G2): a `<span>` by default, a
// `<button>` when asked. A RefObject<HTMLSpanElement> still type-checks.
type BadgeProps = (DotBadgeProps | OtherBadgeProps) & Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-label' | 'role'>

export const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge(props, ref) {
  const {
    variant = 'neutral',
    shape = 'status',
    children,
    'aria-label': ariaLabel,
    className,
    ...rest
  } = props
  // `as` only exists on the non-dot shape; take it out so it never reaches the DOM.
  const { as = 'span', ...attributes } = rest as typeof rest & { as?: 'span' | 'button' }
  const classes = cn(
    'badge',
    variant !== 'neutral' && `badge--${variant}`,
    shape !== 'status' && `badge--${shape}`,
    as === 'button' && shape !== 'dot' && 'badge--button',
    className,
  )

  if (shape === 'dot') {
    return <span {...attributes} ref={ref as React.Ref<HTMLSpanElement>} className={classes} role="img" aria-label={ariaLabel} />
  }

  // A real button: Dialog's and Drawer's `asChild` trigger props (onClick,
  // aria-expanded, aria-controls, data-state, the ref) land on it, and the
  // keyboard reaches it. Its name comes from its text, or aria-label.
  // type="button" goes last so a Badge inside a form never submits it.
  if (as === 'button') {
    return (
      <button {...attributes} ref={ref as React.Ref<HTMLButtonElement>} className={classes} aria-label={ariaLabel} type="button">
        {children}
      </button>
    )
  }

  // aria-label is ignored on role="generic" (plain <span>). Add role="img" when an
  // accessible label is provided so ATs announce it correctly.
  return (
    <span {...attributes} ref={ref as React.Ref<HTMLSpanElement>} className={classes} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'
