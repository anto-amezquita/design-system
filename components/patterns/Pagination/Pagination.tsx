'use client'

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import './Pagination.css'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  compact?: boolean
  className?: string
  /** Accessible name for the nav landmark — override when a page renders more than one pagination. */
  label?: string
}

function getPageItems(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1]

  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  // Only show an ellipsis when it hides more than one page; otherwise show the page directly.
  if (rangeStart > 3) {
    pages.push('ellipsis-start')
  } else {
    for (let i = 2; i < rangeStart; i++) pages.push(i)
  }
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
  if (rangeEnd < total - 2) {
    pages.push('ellipsis-end')
  } else {
    for (let i = rangeEnd + 1; i < total; i++) pages.push(i)
  }

  pages.push(total)
  return pages
}

export function Pagination({ currentPage, totalPages, onPageChange, compact = false, className, label = 'Pagination' }: PaginationProps) {
  if (totalPages <= 1) return null

  const cls = cn('pagination', compact && 'pagination--compact', className)
  const pages = getPageItems(currentPage, totalPages)

  return (
    <nav aria-label={compact ? `${label}, page ${currentPage} of ${totalPages}` : label} className={cls}>
      <button
        type="button"
        className="pagination__button pagination__button--nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <CaretLeftIcon size={16} weight="regular" aria-hidden="true" />
      </button>

      {!compact && pages.map((page) =>
        page === 'ellipsis-start' || page === 'ellipsis-end' ? (
          <span key={page} className="pagination__ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={cn('pagination__button', page === currentPage && 'pagination__button--active')}
            onClick={page !== currentPage ? () => onPageChange(page) : undefined}
            disabled={page === currentPage}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination__button pagination__button--nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <CaretRightIcon size={16} weight="regular" aria-hidden="true" />
      </button>
    </nav>
  )
}
