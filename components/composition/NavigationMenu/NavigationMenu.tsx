'use client'

import { forwardRef } from 'react'
import * as RadixNav from '@radix-ui/react-navigation-menu'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import {
  groupContainsHref,
  isCurrentHref,
  isNavGroup,
  type NavItem,
  type NavLinkComponent,
} from '../../../lib/navigation'
import './NavigationMenu.css'

type NavigationMenuOwnProps = {
  /** The header's navigation. Each item is a link `{ id, label, href, icon? }` or a group `{ id, label, icon?, items: NavLink[] }`, which renders as a dropdown of links. Two levels at most. Type it with `import type { NavItem } from '@amezquita/design-system/components/composition/NavigationMenu'`. Pass the same array to SideNav's `headerItems` so the links are in the mobile drawer, since NavigationMenu hides itself below 1024px. */
  items: NavItem[]
  /** Your router's current pathname. An exact match sets `aria-current="page"` on that link and marks its group active. */
  currentHref?: string
  /** Component to render links with, called with `href` (a string), `className`, `aria-current`, `onClick` and `children`. `next/link` can be passed as-is (`LinkComponent={NextLink}`); another router's Link must forward its ref and pass those props through to the `<a>`. Defaults to a plain `<a>`. */
  LinkComponent?: NavLinkComponent
  /** Names the `<nav>` landmark. Defaults to "Main"; give each `<nav>` on a page a different name. */
  'aria-label'?: string
}

// Native attributes pass through to the <nav> (decisions/0006, 0007).
// defaultValue and dir collide with Radix Root's own, narrower props.
type NavigationMenuProps = Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'defaultValue' | 'dir'> & NavigationMenuOwnProps

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  { items, currentHref, LinkComponent = 'a', 'aria-label': ariaLabel = 'Main', className, ...rest },
  ref,
) {
  return (
    <RadixNav.Root
      {...rest}
      ref={ref}
      aria-label={ariaLabel}
      className={cn('navigation-menu', className)}
    >
      <RadixNav.List className="navigation-menu__list">
        {items.map(item => {
          if (!isNavGroup(item)) {
            const current = isCurrentHref(item.href, currentHref)
            return (
              <RadixNav.Item key={item.id} className="navigation-menu__item">
                {/* Radix sets aria-current="page" and data-active from `active`. */}
                <RadixNav.Link asChild active={current}>
                  <LinkComponent href={item.href} className="navigation-menu__link">
                    {item.icon && <span className="navigation-menu__icon" aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </LinkComponent>
                </RadixNav.Link>
              </RadixNav.Item>
            )
          }

          const active = groupContainsHref(item, currentHref)
          return (
            <RadixNav.Item key={item.id} value={item.id} className="navigation-menu__item">
              <RadixNav.Trigger
                className={cn('navigation-menu__trigger', active && 'navigation-menu__trigger--active')}
              >
                {item.icon && <span className="navigation-menu__icon" aria-hidden="true">{item.icon}</span>}
                {item.label}
                <CaretDownIcon className="navigation-menu__chevron" weight="regular" aria-hidden="true" />
              </RadixNav.Trigger>
              {/* No shared Viewport: each group's content renders inside its own item. */}
              <RadixNav.Content className="navigation-menu__content">
                <ul className="navigation-menu__sublist">
                  {item.items.map(link => (
                    <li key={link.id}>
                      <RadixNav.Link asChild active={isCurrentHref(link.href, currentHref)}>
                        <LinkComponent href={link.href} className="navigation-menu__sublink">
                          {link.icon && <span className="navigation-menu__icon" aria-hidden="true">{link.icon}</span>}
                          {link.label}
                        </LinkComponent>
                      </RadixNav.Link>
                    </li>
                  ))}
                </ul>
              </RadixNav.Content>
            </RadixNav.Item>
          )
        })}
      </RadixNav.List>
    </RadixNav.Root>
  )
})

NavigationMenu.displayName = 'NavigationMenu'
