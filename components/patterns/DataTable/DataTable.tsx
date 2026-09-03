'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../Table'
import { Pagination } from '../Pagination'
import { EmptyState } from '../EmptyState'
import { Checkbox } from '../../primitives/Checkbox'
import { Input } from '../../primitives/Input'
import { Select } from '../../primitives/Select'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import { cn } from '../../../lib/cn'
import './DataTable.css'

type CheckedState = boolean | 'indeterminate'

export type Column<T> = {
  key: keyof T & string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: T[keyof T & string], row: T) => React.ReactNode
  // Narrow, per-field filter, rendered in a second header row when at least one column
  // sets this. Generic and data-driven — for app-specific global filters (date range,
  // category) use DataTable's own `renderToolbar` slot instead, not this.
  filterable?: boolean
  filterType?: 'text' | 'select'
  // Required when filterType is 'select' — DataTable warns in development if missing.
  filterOptions?: { value: string; label: string }[]
}

type SortState = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

// Column filter values, keyed by column `key`. An absent or '' entry means "no filter
// for that column" — same dual-mode shape `filters`/`onFiltersChange` below expose.
type FilterState = Record<string, string>

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[]
  data: T[]
  // Explicit key controlling when data resets (sort/selection/page cleared). Pass a
  // stable string (e.g. a query ID or ISO timestamp) to avoid resets when the data
  // array reference changes but the content has not. When omitted, resets on reference
  // inequality — callers should memoize their data array to avoid spurious resets.
  dataKey?: string
  // Row identity function. Drives two separate things: the React key for each row, and
  // (independently) the identity DataTable's selection state tracks across filtering —
  // without it, a selected row can only survive a filter round-trip via its `id` field.
  // Required when rows have no .id field and the table is sortable, to avoid full row
  // remounts on sort. Falls back to row.id, then to position index (which causes
  // remounts on sort and should be avoided).
  getRowKey?: (row: T) => string
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  // Column filter values, keyed by column key. Uncontrolled by default (DataTable owns
  // the state driving its own filter row); pass both to lift the state out — e.g. for
  // saved views.
  filters?: Record<string, string>
  onFiltersChange?: (filters: Record<string, string>) => void
  // Slot for app-level global filters (date range, category, market) DataTable has no
  // generic concept of. Rendered above the table exactly as returned — DataTable applies
  // no logic of its own to whatever's inside. Receives the row counts so the app doesn't
  // have to re-derive "12 of 340" itself.
  renderToolbar?: (filteredCount: number, totalCount: number) => React.ReactNode
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
const FILTER_ALL = '__datatable-filter-all__'

function sortData<T extends Record<string, unknown>>(data: T[], sort: SortState): T[] {
  if (!sort.key || !sort.direction) return data
  const key = sort.key
  return [...data].sort((a, b) => {
    const cmp = collator.compare(String(a[key] ?? ''), String(b[key] ?? ''))
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

function filterData<T extends Record<string, unknown>>(data: T[], columns: Column<T>[], filters: FilterState): T[] {
  const active = columns.filter(col => col.filterable && (filters[col.key] ?? '') !== '')
  if (active.length === 0) return data
  return data.filter(row =>
    active.every(col => {
      const cellValue = String(row[col.key] ?? '')
      const filterValue = filters[col.key] ?? ''
      return col.filterType === 'select'
        ? cellValue === filterValue
        : cellValue.toLowerCase().includes(filterValue.toLowerCase())
    })
  )
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  dataKey,
  getRowKey,
  selectable = false,
  onSelectionChange,
  filters,
  onFiltersChange,
  renderToolbar,
  pageSize = 10,
  striped = false,
  bordered = false,
  compact = false,
  className,
  scrollLabel,
  paginationLabel,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })
  // Selection is keyed by row identity (getRowKey ?? id ?? stable position in `data`),
  // not by position in the derived/sorted/filtered array — see layered-filtering-spec.md
  // open question 1. This is what lets a selected row survive being filtered out and
  // back in: its key just stops (then starts again) appearing in `pageKeys`.
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [currentFilters, isFiltersControlled, setInternalFilters] = useUncontrolledValue<FilterState>(filters, undefined, {})

  // Assigned during render (not in an effect) so any effect that reads it always sees
  // the latest version without an ordering dependency on a sync effect.
  const onSelectionChangeRef = useRef(onSelectionChange)
  onSelectionChangeRef.current = onSelectionChange

  const hasFilters = columns.some(col => col.filterable)
  const filtered = useMemo(() => filterData(data, columns, currentFilters), [data, columns, currentFilters])
  const sorted = useMemo(() => sortData(filtered, sort), [filtered, sort])
  // Kept in a ref so deferred selection callbacks always read the committed sort order,
  // not the stale closure from the render in which the handler was called.
  const sortedRef = useRef(sorted)
  sortedRef.current = sorted
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(sorted.length / safePageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * safePageSize
  const pageData = sorted.slice(pageStart, pageStart + safePageSize)

  // Row identity for selection, derived from the raw `data` prop (stable across both
  // sort and filter, since neither ever changes `data`'s own order) — deliberately kept
  // separate from the row's React `key` below, which stays position-in-`sorted`-based
  // to avoid changing existing reconciliation behavior for tables with no stable id.
  const { keyForRow, rowForKey } = useMemo(() => {
    const keyForRow = new Map<T, string>()
    const rowForKey = new Map<string, T>()
    data.forEach((row, i) => {
      const idField = (row as Record<string, unknown>).id
      const key = getRowKey ? getRowKey(row) : idField != null ? String(idField) : `__pos_${i}`
      keyForRow.set(row, key)
      rowForKey.set(key, row)
    })
    return { keyForRow, rowForKey }
  }, [data, getRowKey])

  function selectionKeyFor(row: T): string {
    return keyForRow.get(row) ?? String(data.indexOf(row))
  }

  function resolveSelectedRows(keys: Set<string>): T[] {
    const rows: T[] = []
    keys.forEach(k => {
      const row = rowForKey.get(k)
      if (row !== undefined) rows.push(row)
    })
    return rows
  }

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
    setSelectedKeys(new Set())
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

  // Reset to page 1 whenever the effective filters change — same reason and same shape
  // as the pageSize effect above. Fires for both an internal filter-row edit and an
  // external controlled `filters` prop update, so both paths get the reset uniformly.
  const filtersEffectMountedRef = useRef(false)
  useEffect(() => {
    if (!filtersEffectMountedRef.current) { filtersEffectMountedRef.current = true; return }
    setCurrentPage(1)
  }, [currentFilters])

  // Deferred callback fired after selectedKeys state commits, so callers
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
  }, [selectedKeys])

  function cycleSort(key: string) {
    setSort(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
    // Use a functional updater so the size check reads committed state, not the
    // stale closure value — avoids dropping the deselect callback when a sort
    // and a selection update are batched together in React 18. Sort still clears
    // selection unconditionally (unlike filtering) — preserved as-is; see
    // layered-filtering-spec.md open question 1 for why filtering doesn't.
    setSelectedKeys(prev => {
      if (prev.size > 0) {
        pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.([])
        return new Set()
      }
      return prev
    })
    setCurrentPage(1)
  }

  function updateFilter(colKey: string, value: string) {
    const next = { ...currentFilters, [colKey]: value }
    if (!isFiltersControlled) setInternalFilters(next)
    onFiltersChange?.(next)
  }

  const pageKeys = pageData.map(selectionKeyFor)
  const allPageSelected = pageKeys.length > 0 && pageKeys.every(k => selectedKeys.has(k))
  const somePageSelected = pageKeys.some(k => selectedKeys.has(k)) && !allPageSelected

  function handleSelectAll(checked: CheckedState) {
    if (checked === true || checked === 'indeterminate') {
      const next = new Set(selectedKeys)
      pageKeys.forEach(k => next.add(k))
      setSelectedKeys(next)
      const rows = resolveSelectedRows(next)
      pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.(rows)
    } else {
      // Deselect clears all pages so callers never receive a partial result
      setSelectedKeys(new Set())
      pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.([])
    }
  }

  function handleSelectRow(rowKey: string, checked: CheckedState) {
    const next = new Set(selectedKeys)
    if (checked === true) {
      next.add(rowKey)
    } else {
      next.delete(rowKey)
    }
    setSelectedKeys(next)
    const rows = resolveSelectedRows(next)
    pendingSelectionCallbackRef.current = () => onSelectionChangeRef.current?.(rows)
  }

  function renderFilterControl(col: Column<T>) {
    const filterValue = currentFilters[col.key] ?? ''
    if (col.filterType === 'select') {
      if (process.env.NODE_ENV !== 'production' && (!col.filterOptions || col.filterOptions.length === 0)) {
        console.warn(`[DataTable] Column "${col.key}" has filterType "select" but no filterOptions.`)
      }
      return (
        <Select
          aria-label={`Filter by ${col.label}`}
          value={filterValue === '' ? FILTER_ALL : filterValue}
          onValueChange={(value) => updateFilter(col.key, value === FILTER_ALL ? '' : value)}
          groups={[{ options: [{ value: FILTER_ALL, label: 'All' }, ...(col.filterOptions ?? [])] }]}
        />
      )
    }
    return (
      <Input
        search
        clearable
        aria-label={`Filter by ${col.label}`}
        placeholder={`Filter ${col.label.toLowerCase()}…`}
        value={filterValue}
        onChange={(value) => updateFilter(col.key, value)}
      />
    )
  }

  return (
    <div className={cn('data-table', className)}>
      {renderToolbar && (
        <div className="data-table__toolbar">
          {renderToolbar(sorted.length, data.length)}
        </div>
      )}
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
          {hasFilters && (
            <TableRow className="data-table__filter-row">
              {selectable && <TableCell className="data-table__select-col" />}
              {columns.map(col => (
                <TableCell key={col.key} className="data-table__filter-cell">
                  {col.filterable ? renderFilterControl(col) : null}
                </TableCell>
              ))}
            </TableRow>
          )}
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
              const selectionKey = selectionKeyFor(row)
              const isSelected = selectedKeys.has(selectionKey)
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
                        onCheckedChange={(checked) => handleSelectRow(selectionKey, checked)}
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

      {(totalPages > 1 || selectedKeys.size > 0) && (
        <div className="data-table__footer">
          <span className="data-table__count" aria-live="polite" aria-atomic="true">
            {selectedKeys.size > 0 ? `${selectedKeys.size} selected · ` : ''}
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
