'use client'

import { forwardRef } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { cn } from '../../../lib/cn'
import { isCurrentHref, type NavLinkComponent } from '../../../lib/navigation'
import './MobileNav.css'

export type MobileNavItem = {
  id: string
  label: string
  href: string
  /** Shown above the label; decorative, the label is the name. */
  icon: React.ReactNode
  /** A count to show, e.g. unread messages. Read out after the label, in brackets: "Messages (3 unread)". */
  badge?: number
  /** How the count is read: `n => `${n} unread``. Default `n => `${n} new``. */
  badgeLabel?: (count: number) => string
}

type MobileNavOwnProps = {
  /** Three to five destinations. */
  items: MobileNavItem[]
  /** Your router's current pathname; that item gets aria-current="page". */
  currentHref?: string
  LinkComponent?: NavLinkComponent
  /** Names the navigation. Default "Main". */
  'aria-label'?: string
  /** Keep it on wide screens too. By default it hides from 1024px, where TopNav or SideNav takes over. */
  alwaysVisible?: boolean
}

type MobileNavProps = Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-label'> & MobileNavOwnProps

/**
 * The bar at the bottom of a small screen with an app's main places:
 * three to five, each an icon with a label that's always shown. The
 * current one has aria-current="page" and a filled pill, so it doesn't
 * rely on colour. Clears the phone's home indicator, and hides from
 * 1024px up unless asked not to.
 */
export const MobileNav = forwardRef<HTMLElement, MobileNavProps>(function MobileNav({
  items,
  currentHref,
  LinkComponent = 'a',
  'aria-label': ariaLabel = 'Main',
  alwaysVisible = false,
  className,
  ...rest
}, ref) {
  const Link = LinkComponent
  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel} className={cn('mobile-nav', alwaysVisible && 'mobile-nav--always', className)}>
      <ul className="mobile-nav__list">
        {items.map(item => {
          const current = isCurrentHref(item.href, currentHref)
          const count = item.badge && item.badge > 0 ? item.badge : 0
          return (
            <li key={item.id} className="mobile-nav__item">
              <Link href={item.href} className="mobile-nav__link" aria-current={current ? 'page' : undefined}>
                <span className="mobile-nav__icon" aria-hidden="true">
                  {item.icon}
                  {count > 0 && <span className="mobile-nav__badge">{count > 99 ? '99+' : count}</span>}
                </span>
                <span className="mobile-nav__label">{item.label}</span>
                {count > 0 && <VisuallyHidden> ({(item.badgeLabel ?? (n => `${n} new`))(count)})</VisuallyHidden>}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
})

MobileNav.displayName = 'MobileNav'
