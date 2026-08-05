import { cn } from '@/lib/cn'
import './Tag.css'

type TagProps = {
  variant?: 'default' | 'accent' | 'muted'
  children: React.ReactNode
  /** Accessible label for the outer clickable element. Required when onClick is set and children is not a plain string. */
  label?: string
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
}

export function Tag({ variant = 'default', children, label, icon, removable, onRemove, onClick }: TagProps) {
  if (process.env.NODE_ENV !== 'production' && removable && !onRemove) {
    console.warn('[Tag] `removable` is true but `onRemove` is not provided — the remove button will not render.')
  }
  if (process.env.NODE_ENV !== 'production' && onClick && typeof children !== 'string' && !label) {
    console.warn('[Tag] `onClick` is set but `children` is not a plain string and no `label` prop was provided. Pass a `label` prop to give the interactive element an accessible name.')
  }
  const cls = cn('tag', variant !== 'default' && `tag--${variant}`)

  const inner = (
    <>
      {icon && <span className="tag__icon" aria-hidden="true">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          className="tag__remove"
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
        >
          ×
        </button>
      )}
    </>
  )

  if (onClick) {
    // Use span+role instead of <button> so the removable <button> inside stays valid HTML
    if (removable && onRemove) {
      return (
        <span
          role="button"
          tabIndex={0}
          className={cls}
          aria-label={label ?? (typeof children === 'string' ? children : undefined)}
          onClick={onClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onClick() } }}
        >
          {inner}
        </span>
      )
    }
    return (
      <button type="button" className={cls} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return <span className={cls}>{inner}</span>
}
