'use client'

import { forwardRef, useState } from 'react'
import { ListIcon } from '@phosphor-icons/react'
import { NavigationMenu } from '../../composition/NavigationMenu'
import { Drawer } from '../../composition/Drawer'
import { IconButton } from '../../primitives/IconButton'
import { cn } from '../../../lib/cn'
import { isCurrentHref, isNavGroup, type NavItem, type NavLinkComponent } from '../../../lib/navigation'
import './TopNav.css'

type TopNavOwnProps = {
  /** The logo or product name, usually a link home. Give an image logo its alt text. */
  brand: React.ReactNode
  /** The main navigation, the same shape as NavigationMenu's: links, and groups of links. */
  items: NavItem[]
  /** Your router's current pathname; that link gets aria-current="page". */
  currentHref?: string
  /** Component to render links with, as for NavigationMenu. Defaults to a plain `<a>`. */
  LinkComponent?: NavLinkComponent
  /** What sits at the end: search, a Command Palette button, the account menu. */
  actions?: React.ReactNode
  /** Stays at the top while the page scrolls. */
  sticky?: boolean
  /** Name of both navigations and the drawer's heading. Default "Main". */
  navLabel?: string
  /** Name of the button that opens the drawer on small screens. Default "Menu". */
  menuLabel?: string
}

type TopNavProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & TopNavOwnProps

/**
 * The bar across the top of an app or site: brand, main navigation,
 * actions. A `<header>` that holds NavigationMenu from 1024px up; below
 * that, a Menu button opens a Drawer with the same links, so there's one
 * list of items and one "Main" navigation on the page at a time.
 */
export const TopNav = forwardRef<HTMLElement, TopNavProps>(function TopNav({
  brand,
  items,
  currentHref,
  LinkComponent = 'a',
  actions,
  sticky = false,
  navLabel = 'Main',
  menuLabel = 'Menu',
  className,
  ...rest
}, ref) {
  const [open, setOpen] = useState(false)
  const Link = LinkComponent

  const link = (l: { id: string; label: string; href: string }) => {
    const current = isCurrentHref(l.href, currentHref)
    return (
      <li key={l.id}>
        <Link
          href={l.href}
          className="top-nav__drawer-link"
          aria-current={current ? 'page' : undefined}
          // Following a link closes the drawer, so the new page isn't covered.
          onClick={() => setOpen(false)}
        >
          {l.label}
        </Link>
      </li>
    )
  }

  return (
    <header {...rest} ref={ref} className={cn('top-nav', sticky && 'top-nav--sticky', className)}>
      <div className="top-nav__menu">
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="left"
          title={navLabel}
          trigger={<IconButton variant="ghost" icon={<ListIcon />} label={menuLabel} />}
        >
          <nav aria-label={navLabel} className="top-nav__drawer-nav">
            <ul className="top-nav__drawer-list">
              {items.map(item =>
                isNavGroup(item) ? (
                  <li key={item.id} className="top-nav__drawer-group">
                    <span className="top-nav__drawer-group-label" id={`top-nav-${item.id}`}>{item.label}</span>
                    <ul className="top-nav__drawer-list" aria-labelledby={`top-nav-${item.id}`}>{item.items.map(link)}</ul>
                  </li>
                ) : link(item),
              )}
            </ul>
          </nav>
        </Drawer>
      </div>
      <div className="top-nav__brand">{brand}</div>
      <NavigationMenu items={items} currentHref={currentHref} LinkComponent={LinkComponent} aria-label={navLabel} className="top-nav__nav" />
      {actions && <div className="top-nav__actions">{actions}</div>}
    </header>
  )
})

TopNav.displayName = 'TopNav'
