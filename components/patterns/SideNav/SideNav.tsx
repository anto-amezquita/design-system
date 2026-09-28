'use client'

import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from 'react'
import { CaretDownIcon, ListIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { mergeRefs } from '../../../lib/mergeRefs'
import { mediaQuery } from '../../../lib/breakpoints'
import {
  groupContainsHref,
  isCurrentHref,
  isNavGroup,
  type NavGroup,
  type NavItem,
  type NavLink,
  type NavLinkComponent,
} from '../../../lib/navigation'
import { Button } from '../../primitives/Button'
import { Drawer } from '../../composition/Drawer'
import { Tooltip, TooltipProvider } from '../../composition/Tooltip'
import './SideNav.css'

// ── Provider ─────────────────────────────────────────────────────────

type SideNavContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  /** id of the <nav> inside the drawer — SideNavTrigger's aria-controls. */
  drawerNavId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SideNavContext = createContext<SideNavContextValue | null>(null)

function useSideNavContext(part: string): SideNavContextValue {
  const context = useContext(SideNavContext)
  if (!context) {
    throw new Error(
      `[SideNav] <${part}> must be inside <SideNavProvider>. Wrap the part of your layout that holds both the header (with <SideNavTrigger>) and <SideNav>.`,
    )
  }
  return context
}

type SideNavProviderProps = {
  /** Your layout: at least the header holding `SideNavTrigger`, and `SideNav` itself. Wrapping the whole page shell (SkipLink and `<main>` included) is fine. */
  children: React.ReactNode
}

/** Holds the mobile drawer's open state, shared by `SideNavTrigger` (in your header) and `SideNav`. */
export function SideNavProvider({ children }: SideNavProviderProps) {
  const [open, setOpen] = useState(false)
  const drawerNavId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Focus goes back to the trigger when the drawer closes. Radix's modal
  // Dialog restores focus only to its own Dialog.Trigger, and SideNavTrigger
  // lives in the header, outside Drawer — so without this, focus falls to
  // <body> and a keyboard user starts again from the top of the page.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open])

  // The drawer only exists below breakpoint.desktop. If the viewport grows
  // past it while the drawer is open (a rotated tablet, a resized window),
  // close it rather than leave a modal over a layout that no longer needs it.
  useEffect(() => {
    if (!open) return
    const query = window.matchMedia(mediaQuery('desktop'))
    const closeIfDesktop = () => {
      if (query.matches) setOpen(false)
    }
    closeIfDesktop()
    query.addEventListener('change', closeIfDesktop)
    return () => query.removeEventListener('change', closeIfDesktop)
  }, [open])

  return (
    <SideNavContext.Provider value={{ open, setOpen, drawerNavId, triggerRef }}>
      {children}
    </SideNavContext.Provider>
  )
}

// ── Trigger ──────────────────────────────────────────────────────────

type SideNavTriggerProps = {
  /** Accessible name for the icon-only hamburger button. Defaults to "Open navigation". The button opens SideNav's drawer, and hides itself from 1024px up, where the inline SideNav or the header's NavigationMenu takes over. */
  'aria-label'?: string
  className?: string
}

/** The hamburger button that opens SideNav's drawer. Place it in your header; it hides itself from breakpoint.desktop (1024px) up. */
export const SideNavTrigger = forwardRef<HTMLButtonElement, SideNavTriggerProps>(function SideNavTrigger(
  { 'aria-label': ariaLabel = 'Open navigation', className },
  ref,
) {
  const { open, setOpen, drawerNavId, triggerRef } = useSideNavContext('SideNavTrigger')
  return (
    <Button
      ref={mergeRefs<HTMLButtonElement | HTMLAnchorElement>(ref as React.Ref<HTMLButtonElement | HTMLAnchorElement>, triggerRef as React.Ref<HTMLButtonElement | HTMLAnchorElement>)}
      variant="ghost"
      className={cn('side-nav-trigger', className)}
      icon={<ListIcon weight="regular" />}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={drawerNavId}
      onClick={() => setOpen(true)}
    >
      {null}
    </Button>
  )
})

// ── Lists (shared by the inline nav and the drawer) ──────────────────

type ListContext = {
  currentHref?: string
  LinkComponent: NavLinkComponent
  /** Icon rail: icons only, each label in a Tooltip. Inline only. */
  rail: boolean
  onNavigate?: () => void
}

function NavLinkRow({ link, ctx }: { link: NavLink; ctx: ListContext }) {
  const { LinkComponent, currentHref, rail, onNavigate } = ctx
  const current = isCurrentHref(link.href, currentHref)
  const anchor = (
    <LinkComponent
      href={link.href}
      className="side-nav__link"
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
    >
      {link.icon && <span className="side-nav__icon" aria-hidden="true">{link.icon}</span>}
      <span className="side-nav__label">{link.label}</span>
    </LinkComponent>
  )
  return <li>{rail ? <Tooltip content={link.label} side="right">{anchor}</Tooltip> : anchor}</li>
}

function NavGroupRow({ group, ctx }: { group: NavGroup; ctx: ListContext }) {
  const active = groupContainsHref(group, ctx.currentHref)
  const [expanded, setExpanded] = useState(active)
  const listId = useId()

  // Navigating to a page inside a closed group opens it, so the current
  // link is never hidden.
  useEffect(() => {
    if (active) setExpanded(true)
  }, [active])

  const toggle = (
    <button
      type="button"
      className={cn('side-nav__toggle', active && 'side-nav__toggle--active')}
      aria-expanded={expanded}
      aria-controls={listId}
      onClick={() => setExpanded(value => !value)}
    >
      {group.icon && <span className="side-nav__icon" aria-hidden="true">{group.icon}</span>}
      <span className="side-nav__label">{group.label}</span>
      <CaretDownIcon className="side-nav__chevron" weight="regular" aria-hidden="true" />
    </button>
  )

  return (
    <li>
      {ctx.rail ? <Tooltip content={group.label} side="right">{toggle}</Tooltip> : toggle}
      <ul id={listId} className="side-nav__sublist" hidden={!expanded}>
        {group.items.map(link => <NavLinkRow key={link.id} link={link} ctx={ctx} />)}
      </ul>
    </li>
  )
}

function NavList({ items, ctx }: { items: NavItem[]; ctx: ListContext }) {
  return (
    <ul className="side-nav__list">
      {items.map(item =>
        isNavGroup(item)
          ? <NavGroupRow key={item.id} group={item} ctx={ctx} />
          : <NavLinkRow key={item.id} link={item} ctx={ctx} />,
      )}
    </ul>
  )
}

// Every item the rail would show needs an icon: top-level items, and the
// links inside groups (they show in the rail when their group is open).
function everyItemHasIcon(items: NavItem[]): boolean {
  return items.every(item => item.icon && (!isNavGroup(item) || item.items.every(link => link.icon)))
}

// Drawer (via Radix Dialog) focuses its close button on open; SideNav wants
// the first link instead, without changing Drawer. This child's effect runs
// before the dialog's focus scope mounts, and the scope leaves focus alone
// when it's already inside, so focusing here wins.
function DrawerNav({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('a[href], button')?.focus()
  }, [])
  return (
    <nav ref={ref} id={id} aria-label={label} className="side-nav side-nav--drawer">
      {children}
    </nav>
  )
}

// ── SideNav ──────────────────────────────────────────────────────────

type SideNavLayout = 'sidebar' | 'drawer-only'

type SideNavOwnProps = {
  /** The section's navigation. Each item is a link `{ id, label, href, icon? }` or a group `{ id, label, icon?, items: NavLink[] }`, which renders as a collapsible section. Two levels at most. Type it with `import type { NavItem } from '@amezquita/design-system/components/patterns/SideNav'`. */
  items: NavItem[]
  /** The same array you pass NavigationMenu. Shown only in the mobile drawer, above `items` with a separator, so header links stay reachable below 1024px. */
  headerItems?: NavItem[]
  /** Your router's current pathname. An exact match sets `aria-current="page"`; a group holding the current link starts open. */
  currentHref?: string
  /** Component to render links with, called with `href` (a string), `className`, `aria-current`, `onClick` and `children`. `next/link` can be passed as-is (`LinkComponent={NextLink}`); another router's Link must pass those props through to the `<a>` and forward its ref (the collapsed rail's tooltips need it). Defaults to a plain `<a>`. */
  LinkComponent?: NavLinkComponent
  /** `'sidebar'` (default) shows the nav inline from 1024px up and in a drawer below. `'drawer-only'` renders nothing inline — for a site whose only desktop navigation is the header (NavigationMenu). */
  layout?: SideNavLayout
  /** Icon rail: icons only, each label in a tooltip. Inline only; the drawer is always expanded. SideNav has no toggle of its own — drive this from your own control (e.g. a Button in the sidebar's header). Needs an `icon` on every item; without one, SideNav warns in development and renders expanded. */
  collapsed?: boolean
  /** Names the inline `<nav>` landmark. Defaults to "Section". */
  'aria-label'?: string
  /** Heading of the mobile drawer. Defaults to "Navigation". */
  drawerTitle?: string
}

// Native attributes pass through to the inline <nav> (decisions/0006, 0007).
type SideNavProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & SideNavOwnProps

export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav(
  {
    items,
    headerItems,
    currentHref,
    LinkComponent = 'a',
    layout = 'sidebar',
    collapsed = false,
    'aria-label': ariaLabel = 'Section',
    drawerTitle = 'Navigation',
    className,
    ...rest
  },
  ref,
) {
  const { open, setOpen, drawerNavId } = useSideNavContext('SideNav')
  const canRail = everyItemHasIcon(items)
  const rail = collapsed && canRail

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && collapsed && !canRail) {
      console.warn(
        '[SideNav] collapsed is set, but not every item has an icon, so the rail would show blank buttons. Rendering expanded instead. Add an `icon` to every item (and to every link inside a group) to use the collapsed rail.',
      )
    }
  }, [collapsed, canRail])

  // A router link that swallows onClick still navigates, and the new
  // currentHref closes the drawer here.
  useEffect(() => {
    setOpen(false)
  }, [currentHref, setOpen])

  const inlineContext: ListContext = { currentHref, LinkComponent, rail }
  const drawerContext: ListContext = { currentHref, LinkComponent, rail: false, onNavigate: () => setOpen(false) }

  const inlineList = <NavList items={items} ctx={inlineContext} />

  return (
    <>
      {layout === 'sidebar' && (
        <nav
          {...rest}
          ref={ref}
          aria-label={ariaLabel}
          className={cn('side-nav', 'side-nav--inline', rail && 'side-nav--collapsed', className)}
        >
          {rail ? <TooltipProvider>{inlineList}</TooltipProvider> : inlineList}
        </nav>
      )}
      <Drawer open={open} onOpenChange={setOpen} side="left" size="sm" title={drawerTitle}>
        <DrawerNav id={drawerNavId} label={drawerTitle}>
          {headerItems && headerItems.length > 0 && <NavList items={headerItems} ctx={drawerContext} />}
          {headerItems && headerItems.length > 0 && items.length > 0 && <hr className="side-nav__separator" />}
          {items.length > 0 && <NavList items={items} ctx={drawerContext} />}
        </DrawerNav>
      </Drawer>
    </>
  )
})

SideNav.displayName = 'SideNav'
