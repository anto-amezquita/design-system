import { Button } from '../../primitives/Button'
import { cn } from '@/lib/cn'
import './EmptyState.css'

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }
  level?: 2 | 3 | 4 | 5 | 6
  compact?: boolean
  className?: string
}

export function EmptyState({ icon, title, description, action, level = 3, compact = false, className }: EmptyStateProps) {
  const cls = cn('empty-state', compact && 'empty-state--compact', className)

  const Heading = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <div className={cls}>
      {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
      <Heading className="empty-state__title">{title}</Heading>
      {description && <p className="empty-state__body">{description}</p>}
      {action && (
        <div className="empty-state__action">
          <Button variant={action.variant ?? 'secondary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
