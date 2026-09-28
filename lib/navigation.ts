import type { ElementType, MouseEvent, ReactNode } from 'react'

/**
 * The navigation data NavigationMenu and SideNav share (decisions/0015,
 * specs/navigation-components-spec.md). The same array renders in the header
 * on wide screens and in the side nav's drawer on narrow ones.
 *
 * Two levels at most: a group holds links, and groups don't nest.
 */

/** A single destination. `id` is a stable React key; `href` is compared against `currentHref`. */
export type NavLink = { id: string; label: string; href: string; icon?: ReactNode }

/** A labelled set of links: a dropdown in NavigationMenu, a collapsible section in SideNav. */
export type NavGroup = { id: string; label: string; icon?: ReactNode; items: NavLink[] }

export type NavItem = NavLink | NavGroup

/**
 * The router-link slot, the same shape as Breadcrumb's `LinkComponent`: pass
 * your router's Link (e.g. next/link) for client-side navigation. Defaults to
 * a plain `<a>` in every component that takes it.
 */
export type NavLinkComponent = ElementType<{
  href: string
  className?: string
  children?: ReactNode
  'aria-current'?: 'page'
  onClick?: (event: MouseEvent<HTMLElement>) => void
}>

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'items' in item
}

/** Exact match only: `/docs` is not current on `/docs/intro`. */
export function isCurrentHref(href: string, currentHref: string | undefined): boolean {
  return currentHref !== undefined && href === currentHref
}

export function groupContainsHref(group: NavGroup, currentHref: string | undefined): boolean {
  return group.items.some(link => isCurrentHref(link.href, currentHref))
}
