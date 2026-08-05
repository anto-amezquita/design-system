'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../Table'
import { Pagination } from '../Pagination'
import { EmptyState } from '../EmptyState'
import { Checkbox } from '@/components/primitives/Checkbox'
import { cn } from '@/lib/cn'
import './DataTable.css'

type CheckedState = boolean | 'indeterminate'

export type Column<T> = {
  key: keyof T & string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: T[keyof T & string], row: T) => React.ReactNode
}

type SortState = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[]
  data: T[]
  // Explicit key controlling when data resets (sort/selection/page cleared). Pass a
  // stable string (e.g. a query ID or ISO timestamp) to avoid resets when the data
  // array reference changes but the content has not. When omitted, resets on reference
  // inequality — callers should memoize their data array to avoid spurious resets.
  dataKey?: string
  // Row identity function — used as the React key. Required when rows have no .id field
  // and the table is sortable, to avoid full row remounts on sort. Falls back to row.id,
  // then to position index (which causes remounts on sort and should be avoided).
  getRowKey?: (row: T) => string
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  pageSize?: number
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  className?: string
  // Override when a page renders more than one DataTable — both default to a
  // literal string, and two unlabeled instances on one page collide as
  // duplicate landmarks under axe's landmark-unique rule.
  scrollLabel?: string
  paginationLabel?: string
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function sortData<T extends Record<string, unknown>>(data: T[], sort: SortState): T[] {
  if (!sort.key || !sort.direction) return data
  const key = sort.key
  return [...data].sort((a, b) => {
    const cmp = collator.compare(String(a[key] ?? ''), String(b[key] ?? ''))
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  dataKey,
  getRowKey,
  selectable = false,
  onSelectionChange,
  pageSize = 10,
  striped = false,
  bordered = false,
  compact = false,
  className,
  scrollLabel,
  paginationLabel,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // Assigned during render (not in an effect) so any effect that reads it always sees
  // the latest version without an ordering dependency on a sync effect.
  const onSelectionChangeRef = useRef(onSelectionChange)
  onSelectionChangeRef.current = onSelectionChange

  const sorted = useMemo(() => sortData(data, sort), [data, sort])
  // Kept in a ref so deferred selection callbacks always read the committed sort order,
  // not the stale closure from the render in which the handler was called.
  const sortedRef = useRef(sorted)
  sortedRef.current = sorted
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(sorted.length / safePageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * safePageSize
  const pageData = sorted.slice(pageStart, pageStart + safePageSize)

  // Reset sort, selection, and page when data identity changes. Identity is determined
  // by dataKey when provided (content-based), or reference equality otherwise.
  const prevDataRef = useRef<T[] | undefined>(undefined)
  const prevDataKeyRef = useRef<string | undefined>(undefined)
  const dataResetMountedRef = useRef(false)
  useEffect(() => {
    if (!dataResetMountedRef.current) {
      dataResetMountedRef.current = true
      prevDataRef.current = data
      prevDataKeyRef.current = dataKey
      return
    }
    const keyChanged = dataKey !== undefined
      ? dataKey !== prevDataKeyRef.current
      : data !== prevDataRef.current
    if (!keyChanged) return
    prevDataRef.current = data
    prevDataKeyRef.current = dataKey
    setSort({ key: null, direction: null })
    setSelectedIndices(new Set())
    setCurrentPage(1)
    onSelectionChangeRef.current?.([])
  }, [data, dataKey])

  // Reset to page 1 when pageSize changes — safePage clamps the render correctly
  // but the stale currentPage state would snap back to the old page if totalPages
  // later grows to cover it again (e.g. pageSize reduced then increased).
  const pageSizeEffectMountedRef = useRef(false)
  useEffect(() => {
    if (!pageSizeEffectMountedRef.current) { pageSizeEffectMountedRef.current = true; return }
    setCurrentPage(1)
  }, [safePageSize])

  // Deferred callback fired after selectedIndices state commits, so callers
  // receive the notification only after React has applied the new state.
  const pendingSelectionCallbackRef = useRef<(() => void) | null>(null)
  const selectionEffectMountedRef = useRef(false)
  useEffect(() => {
    if (!selectionEffectMountedRef.current) {
      selectionEffectMountedRef.current = true
      return
    }
    if (pendingSelectionCallbackRef.current) {
      pendingSelectionCallbackRef.current()
      pendingSelectionCallbackRef.current = null
    }
  }, [selectedIndices])

  function cycleSort(key: string) {
    setSort(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
    // Use a functional updater so the size check reads committed state, not the
    // stale closure value — avoids dropping the deselect callback when a sort
    // and a selection update are batched together in React 18.
    setSelectedIndices(prev => {
      if (prev.size > 0) {
        pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.([])
        return new Set()
      }
      return prev
    })
    setCurrentPage(1)
  }

  const pageIndices = pageData.map((_, i) => pageStart + i)
  const allPageSelected = pageIndices.length > 0 && pageIndices.every(i => selectedIndices.has(i))
  const somePageSelected = pageIndices.some(i => selectedIndices.has(i)) && !allPageSelected

  function handleSelectAll(checked: CheckedState) {
    if (checked === true || checked === 'indeterminate') {
      const next = new Set(selectedIndices)
      pageIndices.forEach(i => next.add(i))
      setSelectedIndices(next)
      // Capture rows from the current render's sorted array — not from sortedRef
      // which may advance if a sort commits between setState and the effect firing.
      const rows = [...next].map(i => sorted[i])
      pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.(rows)
    } else {
      // Deselect clears all pages so callers never receive a partial result
      setSelectedIndices(new Set())
      pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.([])
    }
  }

  function handleSelectRow(globalIndex: number, checked: CheckedState) {
    const next = new Set(selectedIndices)
    if (checked === true) {
      next.add(globalIndex)
    } else {
      next.delete(globalIndex)
    }
    setSelectedIndices(next)
    // Capture from current render's sorted — same reason as handleSelectAll above.
    const rows = [...next].map(i => sorted[i])
    pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.(rows)
  }

  return (
    <div className={cn('data-table', className)}>
      <Table striped={striped} bordered={bordered} compact={compact} scrollLabel={scrollLabel}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableHeader className="data-table__select-col">
                <Checkbox
                  checked={somePageSelected ? 'indeterminate' : allPageSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label={allPageSelected ? 'Deselect all rows' : 'Select all rows on this page'}
                />
              </TableHeader>
            )}
            {columns.map(col => (
              <TableHeader
                key={col.key}
                sortable={col.sortable}
                sortDirection={sort.key === col.key ? sort.direction : null}
                onSort={col.sortable ? () => cycleSort(col.key) : undefined}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {pageData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="data-table__empty"
              >
                <EmptyState title="No data" compact />
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row, localIndex) => {
              const globalIndex = pageStart + localIndex
              const isSelected = selectedIndices.has(globalIndex)
              const idField = (row as Record<string, unknown>).id
              const rowKey = getRowKey
                ? getRowKey(row)
                : idField != null
                  ? String(idField)
                  : String(globalIndex)
              return (
                <TableRow
                  key={rowKey}
                  className={isSelected ? 'table__row--selected' : undefined}
                >
                  {selectable && (
                    <TableCell className="data-table__select-col">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(globalIndex, checked)}
                        aria-label={`Select row ${globalIndex + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {(totalPages > 1 || selectedIndices.size > 0) && (
        <div className="data-table__footer">
          <span className="data-table__count" aria-live="polite" aria-atomic="true">
            {selectedIndices.size > 0 ? `${selectedIndices.size} selected · ` : ''}
            {sorted.length} {sorted.length === 1 ? 'row' : 'rows'}
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              label={paginationLabel}
            />
          )}
        </div>
      )}
    </div>
  )
}
