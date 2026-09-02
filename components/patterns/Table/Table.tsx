'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../../../lib/cn'
import './Table.css'

type TableProps = {
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  className?: string
  /** Accessible name for the scroll region — override when a page has more than one table. */
  scrollLabel?: string
  children: React.ReactNode
}

export function Table({ striped = false, bordered = false, compact = false, className, scrollLabel = 'Table', children }: TableProps) {
  const cls = cn('table', striped && 'table--striped', bordered && 'table--bordered', compact && 'table--compact', className)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // The wrapper only needs to be a keyboard-reachable scroll region when the
  // table actually overflows — otherwise it's an inert extra Tab stop.
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const checkOverflow = () => setScrollable(el.scrollWidth > el.clientWidth)
    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="table__wrapper"
      role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? scrollLabel : undefined}
      tabIndex={scrollable ? 0 : undefined}
    >
      <table className={cls}>
        {children}
      </table>
    </div>
  )
}

type TableHeadProps = React.ComponentPropsWithoutRef<'thead'>

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <thead
      className={cn('table__head', className)}
      {...props}
    />
  )
}

type TableBodyProps = React.ComponentPropsWithoutRef<'tbody'>

export function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn('table__body', className)}
      {...props}
    />
  )
}

type TableFootProps = React.ComponentPropsWithoutRef<'tfoot'>

export function TableFoot({ className, ...props }: TableFootProps) {
  return (
    <tfoot
      className={cn('table__foot', className)}
      {...props}
    />
  )
}

type TableRowProps = React.ComponentPropsWithoutRef<'tr'>

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn('table__row', className)}
      {...props}
    />
  )
}

type TableHeaderProps = React.ComponentPropsWithoutRef<'th'> & {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
  /** Accessible column name for the sort button. Defaults to children when it is a string. */
  sortLabel?: string
}

export function TableHeader({
  className,
  sortable,
  sortDirection,
  onSort,
  sortLabel,
  children,
  ...props
}: TableHeaderProps) {
  const cls = cn(
    'table__header',
    sortable && 'table__header--sortable',
    sortDirection === 'asc' && 'table__header--sort-asc',
    sortDirection === 'desc' && 'table__header--sort-desc',
    className,
  )

  const ariaSort = sortable
    ? sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : 'none'
    : undefined

  const colName = sortLabel ?? (typeof children === 'string' ? children : undefined)
  const directionSuffix = sortDirection === 'asc' ? ', sorted ascending' : sortDirection === 'desc' ? ', sorted descending' : ''
  // Fallback to 'Sort column' when children is a complex node and sortLabel is absent,
  // to prevent the sort button from having no accessible name (WCAG 4.1.2).
  const btnAriaLabel = colName ? `Sort by ${colName}${directionSuffix}` : sortable ? 'Sort column' : undefined

  return (
    <th
      className={cls}
      scope="col"
      aria-sort={ariaSort}
      {...props}
    >
      {sortable ? (
        <button type="button" className="table__header-btn" onClick={onSort} aria-label={btnAriaLabel}>
          <span className="table__header-content">
            {children}
            <span className="table__sort-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path className="table__sort-arrow table__sort-arrow--up" d="M6 2L9 5H3L6 2Z" />
                <path className="table__sort-arrow table__sort-arrow--down" d="M6 10L3 7H9L6 10Z" />
              </svg>
            </span>
          </span>
        </button>
      ) : (
        <span className="table__header-content">{children}</span>
      )}
    </th>
  )
}

type TableCellProps = React.ComponentPropsWithoutRef<'td'>

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn('table__cell', className)}
      {...props}
    />
  )
}

type TableCaptionProps = React.ComponentPropsWithoutRef<'caption'>

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      className={cn('table__caption', className)}
      {...props}
    />
  )
}
