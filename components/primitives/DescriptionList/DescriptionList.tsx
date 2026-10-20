import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './DescriptionList.css'

export type DescriptionListEntry = {
  /** The label: "Status", "Created", "Licence". */
  term: React.ReactNode
  /** Its value. An array gives the term several values ("Authors": two names), each its own `dd`. */
  description: React.ReactNode | React.ReactNode[]
  /** A stable key, when the term isn't a plain string. */
  id?: string
}

type DescriptionListOwnProps = {
  /** The pairs, in order. */
  items: DescriptionListEntry[]
  /**
   * `inline` (default): term and value side by side, falling back to stacked
   * when the list is narrower than 30rem. `stacked`: term above its value.
   */
  layout?: 'inline' | 'stacked'
  /** A line between pairs. */
  divided?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the dl.
type DescriptionListProps = Omit<React.HTMLAttributes<HTMLDListElement>, 'children'> & DescriptionListOwnProps

/**
 * Labelled values, like the details panel of a file or an order: a `dl`
 * of terms and their descriptions, side by side or stacked.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList({
  items,
  layout = 'inline',
  divided = false,
  className,
  ...rest
}, ref) {
  return (
    <dl
      {...rest}
      ref={ref}
      className={cn('description-list', `description-list--${layout}`, divided && 'description-list--divided', className)}
    >
      {items.map((entry, i) => {
        const values = Array.isArray(entry.description) ? entry.description : [entry.description]
        return (
          // A div per pair is valid inside a dl (HTML allows it) and lets
          // each pair be laid out and divided as one row.
          <div key={entry.id ?? (typeof entry.term === 'string' ? entry.term : i)} className="description-list__group">
            <dt className="description-list__term">{entry.term}</dt>
            {values.map((value, j) => <dd key={j} className="description-list__description">{value}</dd>)}
          </div>
        )
      })}
    </dl>
  )
})

DescriptionList.displayName = 'DescriptionList'
