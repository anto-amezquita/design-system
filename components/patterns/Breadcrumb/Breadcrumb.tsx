import { cn } from '@/lib/cn'
import './Breadcrumb.css'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  /** Component to render internal links with — pass your router's Link (e.g. next/link) to get client-side navigation. Defaults to a plain <a>, which works anywhere with a full navigation. */
  LinkComponent?: React.ElementType<{ href: string; className?: string; children?: React.ReactNode }>
}

export function Breadcrumb({ items, separator = '/', className, LinkComponent = 'a' }: BreadcrumbProps) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Breadcrumb" className={cn('breadcrumb', className)}>
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
}
