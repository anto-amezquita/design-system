'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '../../../lib/cn'
import { mergeRefs } from '../../../lib/mergeRefs'
import { SkipLink } from '../../primitives/SkipLink'
import './AppShell.css'

type AppShellOwnProps = {
  /** The page's header, usually a TopNav (which renders the `header` landmark itself). */
  header?: React.ReactNode
  /**
   * Section navigation, usually a SideNav: a column beside the content from
   * 1024px up, its own drawer below. Wrap the AppShell in SideNavProvider so
   * the header's SideNavTrigger can open that drawer.
   */
  sidebar?: React.ReactNode
  /** Secondary content beside the main content from 1024px up (details, activity), after it below. */
  aside?: React.ReactNode
  /** Names the aside landmark. Required with `aside`, so screen readers can tell it apart. */
  asideLabel?: string
  /** Footer content. AppShell renders the `footer` landmark around it, so don't pass a `footer` element. */
  footer?: React.ReactNode
  /** A MobileNav. The main content gets room at the bottom below 1024px so the bar doesn't cover it. */
  bottomNav?: React.ReactNode
  /** The page's content, inside `main`. */
  children: React.ReactNode
  /** `id` of the `main` element, which the skip link jumps to. Default `main-content`. */
  mainId?: string
  /** Text of the skip link. Default "Skip to main content". */
  skipLinkLabel?: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type AppShellProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & AppShellOwnProps

/**
 * The frame of an app's pages: a skip link, the header, section navigation,
 * the main content, an optional aside, the footer and a bottom bar, in the
 * right landmarks and laid out per breakpoint. It arranges the navigation
 * components; it doesn't replace them.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell({
  header,
  sidebar,
  aside,
  asideLabel,
  footer,
  bottomNav,
  children,
  mainId = 'main-content',
  skipLinkLabel,
  className,
  style,
  ...rest
}, ref) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Two measurements handed to CSS, because neither height is known until
  // the components render (and both change when they wrap or hide):
  // - a sticky header covers the top of a sticky sidebar unless the sidebar
  //   starts below it;
  // - a fixed bottom bar (MobileNav) covers the end of the page unless the
  //   page leaves room for it. It hides itself from 1024px, so its height
  //   drops to 0 there and the room goes with it.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const headerEl = root.querySelector<HTMLElement>(':scope > .app-shell__header > *')
    const barEl = root.querySelector<HTMLElement>(':scope > .app-shell__bottom-nav > *')
    const update = () => {
      const headerSticky = headerEl && getComputedStyle(headerEl).position === 'sticky'
      root.style.setProperty('--app-shell-header-offset', headerSticky ? `${headerEl.getBoundingClientRect().height}px` : '0px')
      const barFixed = barEl && getComputedStyle(barEl).position === 'fixed'
      root.style.setProperty('--app-shell-bottom-offset', barFixed ? `${barEl.getBoundingClientRect().height}px` : '0px')
    }
    update()
    const observer = new ResizeObserver(update)
    if (headerEl) observer.observe(headerEl)
    if (barEl) observer.observe(barEl)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [header, bottomNav])

  if (process.env.NODE_ENV !== 'production' && aside && !asideLabel) {
    console.warn('[AppShell] `aside` needs an `asideLabel` to name its landmark.')
  }

  return (
    <div
      {...rest}
      ref={mergeRefs(rootRef, ref)}
      style={style}
      className={cn(
        'app-shell',
        Boolean(sidebar) && 'app-shell--sidebar',
        Boolean(aside) && 'app-shell--aside',
        Boolean(bottomNav) && 'app-shell--bottom-nav',
        className,
      )}
    >
      <SkipLink targetId={mainId}>{skipLinkLabel}</SkipLink>
      {header && <div className="app-shell__header">{header}</div>}
      <div className="app-shell__body">
        {sidebar && <div className="app-shell__sidebar">{sidebar}</div>}
        {/* tabIndex={-1}: the skip link moves focus here, not just the scroll position. */}
        <main id={mainId} tabIndex={-1} className="app-shell__main">{children}</main>
        {aside && <aside className="app-shell__aside" aria-label={asideLabel}>{aside}</aside>}
      </div>
      {footer && <footer className="app-shell__footer">{footer}</footer>}
      {bottomNav && <div className="app-shell__bottom-nav">{bottomNav}</div>}
    </div>
  )
})

AppShell.displayName = 'AppShell'
