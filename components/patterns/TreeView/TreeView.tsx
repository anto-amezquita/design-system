'use client'

import { forwardRef, useId, useMemo, useRef, useState } from 'react'
import { CaretRightIcon, CheckIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import './TreeView.css'

export type TreeNode = {
  /** Unique in the whole tree. */
  id: string
  /** What the row says, and its name for screen readers and typing to find it. */
  label: string
  /** An icon before the label (a folder, a file), hidden from screen readers. */
  icon?: React.ReactNode
  /** Child nodes. A node with `children` (even empty) is a branch that opens and closes. */
  children?: TreeNode[]
  /** Shown and reachable, but it can't be selected or activated. */
  disabled?: boolean
}

type TreeViewOwnProps = {
  /** The nodes at the top level. */
  items: TreeNode[]
  /** Names the tree: "Files", "Components". */
  'aria-label': string
  /**
   * `none` (default): rows are activated (`onAction`), not selected.
   * `single`: one selected row. `multiple`: any number, with a tick each.
   */
  selectionMode?: 'none' | 'single' | 'multiple'
  /** Controlled selection (ids). Pair with `onSelectedChange`. */
  selected?: string[]
  /** Uncontrolled starting selection. */
  defaultSelected?: string[]
  onSelectedChange?: (ids: string[]) => void
  /** Controlled open branches (ids). Pair with `onExpandedChange`. */
  expanded?: string[]
  /** Uncontrolled starting open branches. */
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Called when a row is activated with Enter or a click: open a file, go to a page. */
  onAction?: (node: TreeNode) => void
}

// decisions/0007: typed against the native attributes so `...rest` reaches the tree.
type TreeViewProps = Omit<React.HTMLAttributes<HTMLUListElement>, 'aria-label' | 'role'> & TreeViewOwnProps

type Visible = { node: TreeNode; level: number; parent: string | null }

const isBranch = (node: TreeNode) => node.children !== undefined

/** Every node, keyed by id, with its parent: to walk up from any row. */
function index(items: TreeNode[]) {
  const parents = new Map<string, string | null>()
  const nodes = new Map<string, TreeNode>()
  const walk = (list: TreeNode[], parent: string | null) => {
    for (const node of list) {
      nodes.set(node.id, node)
      parents.set(node.id, parent)
      if (node.children) walk(node.children, node.id)
    }
  }
  walk(items, null)
  return { parents, nodes }
}

/** The rows on screen, in order: the nodes whose ancestors are all open. */
function visibleRows(items: TreeNode[], open: Set<string>) {
  const rows: Visible[] = []
  const walk = (list: TreeNode[], level: number, parent: string | null) => {
    for (const node of list) {
      rows.push({ node, level, parent })
      if (node.children && open.has(node.id)) walk(node.children, level + 1, node.id)
    }
  }
  walk(items, 1, null)
  return rows
}

function useControllable(value: string[] | undefined, initial: string[], onChange?: (v: string[]) => void) {
  const [inner, setInner] = useState(initial)
  const current = value ?? inner
  const set = (next: string[]) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set] as const
}

/**
 * Nested items that open and close: files and folders, a component
 * library, an outline. It follows the WAI-ARIA tree pattern: one Tab stop,
 * arrow keys to move, open and close, Home and End, and typing a letter to
 * jump to a row.
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView({
  items,
  'aria-label': ariaLabel,
  selectionMode = 'none',
  selected: selectedProp,
  defaultSelected = [],
  onSelectedChange,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  onAction,
  className,
  ...rest
}, ref) {
  const [selected, setSelected] = useControllable(selectedProp, defaultSelected, onSelectedChange)
  const [expanded, setExpanded] = useControllable(expandedProp, defaultExpanded, onExpandedChange)
  const open = useMemo(() => new Set(expanded), [expanded])
  const { nodes } = useMemo(() => index(items), [items])
  const rows = useMemo(() => visibleRows(items, open), [items, open])
  const [focusId, setFocusId] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLLIElement>())
  const typed = useRef({ text: '', at: 0 })
  const baseId = useId()
  const labelId = (id: string) => `${baseId}-${id.replace(/\s+/g, '-')}`

  // The one Tab stop: the row last focused if it's still on screen, else the
  // first selected row on screen, else the first row.
  const visibleIds = new Set(rows.map(r => r.node.id))
  const tabStop =
    (focusId && visibleIds.has(focusId) && focusId) ||
    rows.find(r => selected.includes(r.node.id))?.node.id ||
    rows[0]?.node.id

  const focus = (id: string | undefined) => {
    if (!id) return
    setFocusId(id)
    refs.current.get(id)?.focus()
  }

  const toggle = (id: string, to = !open.has(id)) => {
    if (to === open.has(id)) return
    setExpanded(to ? [...expanded, id] : expanded.filter(e => e !== id))
  }

  const activate = (node: TreeNode, event: { shiftKey?: boolean } = {}) => {
    if (node.disabled) return
    if (selectionMode === 'single') setSelected([node.id])
    else if (selectionMode === 'multiple') {
      setSelected(selected.includes(node.id) ? selected.filter(s => s !== node.id) : [...selected, node.id])
    }
    if (!event.shiftKey) onAction?.(node)
  }

  const onKeyDown = (event: React.KeyboardEvent, row: Visible) => {
    const { node } = row
    const at = rows.findIndex(r => r.node.id === node.id)
    const branch = isBranch(node)
    const isOpen = open.has(node.id)
    let handled = true
    switch (event.key) {
      case 'ArrowDown': focus(rows[at + 1]?.node.id); break
      case 'ArrowUp': focus(rows[at - 1]?.node.id); break
      case 'Home': focus(rows[0]?.node.id); break
      case 'End': focus(rows[rows.length - 1]?.node.id); break
      case 'ArrowRight':
        if (branch && !isOpen) toggle(node.id, true)
        else if (branch && node.children!.length) focus(node.children![0].id)
        break
      case 'ArrowLeft':
        if (branch && isOpen) toggle(node.id, false)
        else focus(row.parent ?? undefined)
        break
      case 'Enter':
        if (selectionMode === 'none' && branch && !onAction) toggle(node.id)
        else activate(node)
        break
      case ' ':
        if (selectionMode === 'multiple') activate(node, { shiftKey: true })
        else if (selectionMode === 'single') activate(node)
        else if (branch) toggle(node.id)
        else activate(node)
        break
      case '*': {
        // Open every branch beside this one, as the pattern asks.
        const siblings = row.parent ? nodes.get(row.parent)!.children! : items
        setExpanded([...new Set([...expanded, ...siblings.filter(isBranch).map(s => s.id)])])
        break
      }
      default:
        handled = false
        // Type to find: the next row whose label starts with what's been typed.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = Date.now()
          typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + event.key.toLowerCase(), at: now }
          const find = (query: string) => {
            const order = [...rows.slice(at + (query.length === 1 ? 1 : 0)), ...rows.slice(0, at + 1)]
            return order.find(r => r.node.label.toLowerCase().startsWith(query))
          }
          let match = find(typed.current.text)
          // Nothing starts with the run typed so far: start a new run with this key.
          if (!match && typed.current.text.length > 1) {
            typed.current.text = event.key.toLowerCase()
            match = find(typed.current.text)
          }
          if (match) {
            focus(match.node.id)
            handled = true
          }
        }
    }
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const renderLevel = (list: TreeNode[], level: number, parent: string | null): React.ReactNode =>
    list.map((node, i) => {
      const branch = isBranch(node)
      const isOpen = branch && open.has(node.id)
      const isSelected = selected.includes(node.id)
      const row: Visible = { node, level, parent }
      return (
        <li
          key={node.id}
          ref={el => { if (el) refs.current.set(node.id, el); else refs.current.delete(node.id) }}
          role="treeitem"
          // Named by its own label only; from content, a branch would also take its children's.
          aria-labelledby={labelId(node.id)}
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={branch ? isOpen : undefined}
          aria-selected={selectionMode === 'none' ? undefined : isSelected}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.id === tabStop ? 0 : -1}
          className={cn('tree-view__item', isSelected && selectionMode !== 'none' && 'tree-view__item--selected')}
          onKeyDown={event => onKeyDown(event, row)}
          onFocus={event => {
            if (event.target === event.currentTarget) setFocusId(node.id)
          }}
        >
          <div
            className="tree-view__row"
            // Indent by level; the row, not the item, carries it so the
            // hover and selection fill reach the start edge.
            style={{ paddingInlineStart: `calc(${level - 1} * var(--space-component-gap) + var(--space-tight-gap))` }}
            onClick={event => {
              focus(node.id)
              if (branch && (event.target as HTMLElement).closest('.tree-view__toggle')) {
                toggle(node.id)
                return
              }
              if (branch && selectionMode === 'none' && !onAction) toggle(node.id)
              else activate(node, { shiftKey: false })
            }}
          >
            {branch ? (
              <span className="tree-view__toggle" aria-hidden="true">
                <CaretRightIcon weight="bold" className="tree-view__caret" />
              </span>
            ) : (
              <span className="tree-view__spacer" aria-hidden="true" />
            )}
            {selectionMode === 'multiple' && (
              <span className="tree-view__check" aria-hidden="true">{isSelected && <CheckIcon weight="bold" />}</span>
            )}
            {node.icon && <span className="tree-view__icon" aria-hidden="true">{node.icon}</span>}
            <span id={labelId(node.id)} className="tree-view__label">{node.label}</span>
          </div>
          {branch && isOpen && node.children!.length > 0 && (
            <ul role="group" className="tree-view__group">
              {renderLevel(node.children!, level + 1, node.id)}
            </ul>
          )}
        </li>
      )
    })

  return (
    <ul
      {...rest}
      ref={ref}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cn('tree-view', className)}
    >
      {renderLevel(items, 1, null)}
    </ul>
  )
})

TreeView.displayName = 'TreeView'
