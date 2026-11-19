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
  /**
   * Make the whole row a button, for a row that does something rather than
   * going somewhere: opening a Dialog or a Drawer, selecting. The title
   * becomes a `<button>`, named by the title and stretched over the row like
   * `href`'s link, and buttons in `trailing` stay their own targets. With
   * `href` too, the row stays a link and this runs on the link's click.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  /** With `href`: this row is the page you're on (`aria-current="page"`). */
  current?: boolean
  /** `default` padding, or `compact` for dense lists. */
  size?: 'default' | 'compact'
  /** `li` (default, inside a List) or `div`. */
  as?: 'li' | 'div'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the row.
// onClick is the row's own (it goes on the link or button), not the <li>'s.
type ItemProps = Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children' | 'onClick'> & ItemOwnProps

/**
 * One row in a List: optional leading media, a title and a description,
 * and trailing metadata or actions. Optionally the whole row is a link
 * (`href`) or a button (`onClick`).
 */
export const Item = forwardRef<HTMLElement, ItemProps>(function Item({
  title,
  description,
  leading,
  trailing,
  href,
  onClick,
  current = false,
  size = 'default',
  as: Tag = 'li',
  className,
  ...rest
}, ref) {
  const mode = href ? 'link' : onClick ? 'button' : null
  return (
    <Tag
      {...rest}
      ref={ref as React.Ref<HTMLLIElement & HTMLDivElement>}
      className={cn('item', `item--${size}`, mode && 'item--interactive', mode === 'link' && 'item--link', mode === 'link' && current && 'item--current', className)}
    >
      {leading && <span className="item__leading">{leading}</span>}
      <span className="item__body">
        {mode === 'link' && (
          <a className="item__title item__action" href={href} onClick={onClick} aria-current={current ? 'page' : undefined}>{title}</a>
        )}
        {mode === 'button' && (
          <button type="button" className="item__title item__action item__button" onClick={onClick}>{title}</button>
        )}
        {mode === null && <span className="item__title">{title}</span>}
        {description && <span className="item__description">{description}</span>}
      </span>
      {trailing && <span className="item__trailing">{trailing}</span>}
    </Tag>
  )
})

Item.displayName = 'Item'
