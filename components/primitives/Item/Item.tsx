import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Item.css'

type ItemOwnProps = {
  /** The row's main text. With `href`, it's also the link's name. */
  title: React.ReactNode
  /** A line under the title: a file size, a role, a last message. */
  description?: React.ReactNode
  /** Before the text: an Avatar, an Icon, a thumbnail. */
  leading?: React.ReactNode
  /** After the text: metadata (a Timestamp, a Badge) or actions (an IconButton, a Switch). */
  trailing?: React.ReactNode
  /**
   * Make the whole row a link. The title becomes the link, stretched over
   * the row so the whole row is clickable, while buttons in `trailing` stay
   * their own targets, one Tab stop each.
   */
  href?: string
  /** With `href`: this row is the page you're on (`aria-current="page"`). */
  current?: boolean
  /** `default` padding, or `compact` for dense lists. */
  size?: 'default' | 'compact'
  /** `li` (default, inside a List) or `div`. */
  as?: 'li' | 'div'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the row.
type ItemProps = Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> & ItemOwnProps

/**
 * One row in a List: optional leading media, a title and a description,
 * and trailing metadata or actions. Optionally the whole row is a link.
 */
export const Item = forwardRef<HTMLElement, ItemProps>(function Item({
  title,
  description,
  leading,
  trailing,
  href,
  current = false,
  size = 'default',
  as: Tag = 'li',
  className,
  ...rest
}, ref) {
  return (
    <Tag
      {...rest}
      ref={ref as React.Ref<HTMLLIElement & HTMLDivElement>}
      className={cn('item', `item--${size}`, href && 'item--link', href && current && 'item--current', className)}
    >
      {leading && <span className="item__leading">{leading}</span>}
      <span className="item__body">
        {href
          ? <a className="item__title item__link" href={href} aria-current={current ? 'page' : undefined}>{title}</a>
          : <span className="item__title">{title}</span>}
        {description && <span className="item__description">{description}</span>}
      </span>
      {trailing && <span className="item__trailing">{trailing}</span>}
    </Tag>
  )
})

Item.displayName = 'Item'
