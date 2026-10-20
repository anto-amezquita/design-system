import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './List.css'

type ListOwnProps = {
  /**
   * `none` (default): a list of things in an interface (files, people,
   * settings), no markers. `bullet` and `number`: a list in running text.
   * `number` renders an `ol`.
   */
  marker?: 'none' | 'bullet' | 'number'
  /** A line between items, in the default border colour. */
  divided?: boolean
  /** Space between items, by the brand's spacing roles. Default `none` (Items bring their own padding). */
  gap?: 'none' | 'tight' | 'inline' | 'element'
  /** Force an ordered list without numbers shown: steps, a ranking. Implied by `marker="number"`. */
  ordered?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the list.
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & ListOwnProps

/**
 * A list, read as one: screen readers announce how many items it has. Put
 * Items in it for rows, or plain `li`s for text.
 */
export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(function List({
  marker = 'none',
  divided = false,
  gap = 'none',
  ordered = false,
  className,
  role,
  ...rest
}, ref) {
  const Tag = marker === 'number' || ordered ? 'ol' : 'ul'
  return (
    <Tag
      {...rest}
      // Safari drops list semantics once markers are removed; role="list" puts them back.
      role={role ?? (marker === 'none' ? 'list' : undefined)}
      ref={ref as React.Ref<HTMLUListElement & HTMLOListElement>}
      className={cn('list', `list--marker-${marker}`, `list--gap-${gap}`, divided && 'list--divided', className)}
    />
  )
})

List.displayName = 'List'
