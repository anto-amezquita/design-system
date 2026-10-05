import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Breadcrumb.css'

type BreadcrumbItem = {
  label: string
  href?: string
}

// Native <nav> attributes pass through (decisions/0007). `children` is left
// out: the trail is built from `items`.
type BreadcrumbProps = Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> & {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  /** Names the `<nav>` landmark. Defaults to "Breadcrumb"; give each breadcrumb on a page a different name. */
  'aria-label'?: string
  /** Component to render internal links with — pass your router's Link (e.g. next/link) to get client-side navigation. Defaults to a plain <a>, which works anywhere with a full navigation. */
  LinkComponent?: React.ElementType<{ href: string; className?: string; children?: React.ReactNode }>
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator = '/', className, 'aria-label': ariaLabel = 'Breadcrumb', LinkComponent = 'a', ...rest },
  ref,
) {
  if (items.length === 0) return null
  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel} className={cn('breadcrumb', className)}>
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.href ?? ''}-${index}`} className="breadcrumb__item">
              {isLast ? (
                // Last item is always a plain span — linking to the current page is redundant
                // and aria-current="page" on a link suppresses navigation in some ATs (JAWS).
                <span className="breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  {item.href ? (
                    <LinkComponent href={item.href} className="breadcrumb__link">
                      {item.label}
                    </LinkComponent>
                  ) : (
                    <span className="breadcrumb__label">
                      {item.label}
                    </span>
                  )}
                  <span className="breadcrumb__separator" aria-hidden="true">
                    {separator}
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
