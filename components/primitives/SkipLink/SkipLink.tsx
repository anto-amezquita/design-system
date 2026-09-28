import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './SkipLink.css'

const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable], [tabindex]'

type SkipLinkOwnProps = {
  /** The `id` of the element to jump to, without `#`. Defaults to `'main-content'`, so `<main id="main-content">` needs no prop here. */
  targetId?: string
  /** Defaults to "Skip to main content". */
  children?: React.ReactNode
}

// Native anchor attributes pass through (decisions/0006, 0007). `href` is
// built from `targetId`, so it isn't one of them.
type SkipLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & SkipLinkOwnProps

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { targetId = 'main-content', children = 'Skip to main content', className, onClick, ...rest },
  ref,
) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    const target = document.getElementById(targetId)
    if (!target) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[SkipLink] No element with id="${targetId}". Add it to your <main>, or pass targetId.`)
      }
      return
    }

    // A plain #hash jump scrolls but doesn't move focus to a non-focusable
    // element in every browser, so the next Tab would start from the top of
    // the page again. tabindex="-1" makes <main> focusable by script only,
    // without adding it to the tab order.
    event.preventDefault()
    if (!target.matches(FOCUSABLE)) target.setAttribute('tabindex', '-1')
    target.focus()
  }

  return (
    <a
      {...rest}
      ref={ref}
      href={`#${targetId}`}
      className={cn('skip-link', className)}
      onClick={handleClick}
    >
      {children}
    </a>
  )
})

SkipLink.displayName = 'SkipLink'
