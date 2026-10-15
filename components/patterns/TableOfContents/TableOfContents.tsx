'use client'

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../../lib/cn'
import './TableOfContents.css'

export type TableOfContentsItem = {
  /** The id of the heading or section it links to. */
  id: string
  label: string
  /** Sub-sections, shown indented. */
  children?: TableOfContentsItem[]
}

type TableOfContentsOwnProps = {
  items: TableOfContentsItem[]
  /** Names the navigation. Defaults to "On this page". */
  'aria-label'?: string
  /** Shown above the list. Defaults to the aria-label; pass `null` for none. */
  title?: string | null
  /** How far below the top of the view a heading counts as reached, in px. Default 96, under a typical sticky header. */
  offset?: number
  /** The scrolling element, if the page doesn't scroll as a whole. */
  root?: HTMLElement | null
  /** Set it yourself instead of following the scroll. */
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
}

type TableOfContentsProps = Omit<React.HTMLAttributes<HTMLElement>, 'aria-label' | 'title'> & TableOfContentsOwnProps

const flatten = (items: TableOfContentsItem[]): string[] => items.flatMap(i => [i.id, ...flatten(i.children ?? [])])

/**
 * Builds items from the headings inside an element: h2s at the top level,
 * h3s under the h2 before them. Headings need ids. Pass a selector for
 * other levels, e.g. "h2, h3, h4".
 */
export function headingsToItems(container: ParentNode, selector = 'h2, h3'): TableOfContentsItem[] {
  const out: TableOfContentsItem[] = []
  const stack: Array<{ level: number; item: TableOfContentsItem }> = []
  for (const h of container.querySelectorAll<HTMLElement>(selector)) {
    if (!h.id) continue
    const level = Number(h.tagName.slice(1)) || 2
    const item: TableOfContentsItem = { id: h.id, label: h.textContent?.trim() ?? h.id }
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
    const parent = stack[stack.length - 1]
    if (parent) (parent.item.children ??= []).push(item)
    else out.push(item)
    stack.push({ level, item })
  }
  return out
}

/**
 * The sections of a long page, as links, with the one being read marked:
 * docs, articles, policies. A nav landmark with a nested list; the current
 * link has aria-current="location" and an accent bar, not just a colour.
 * It follows the scroll, and a click marks the target straight away.
 */
export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(function TableOfContents({
  items,
  'aria-label': ariaLabel = 'On this page',
  title,
  offset = 96,
  root = null,
  activeId: activeProp,
  onActiveChange,
  className,
  ...rest
}, ref) {
  const ids = useMemo(() => flatten(items), [items])
  const [spied, setSpied] = useState<string | null>(null)
  const active = activeProp !== undefined ? activeProp : spied
  const last = useRef<string | null>(null)
  const report = useCallback((next: string | null) => {
    if (next === last.current) return
    last.current = next
    onActiveChange?.(next)
  }, [onActiveChange])

  const pick = useCallback(() => {
    const view = root ? root.getBoundingClientRect() : { top: 0, bottom: window.innerHeight }
    const scroller = root ?? document.scrollingElement ?? document.documentElement
    const atEnd = Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight - 1
    let current: string | null = null
    for (const id of ids) {
      const el = document.getElementById(id)
      if (!el) continue
      const top = el.getBoundingClientRect().top - view.top
      // At the very end, a short last section can't scroll up to the offset; count it once it's in view.
      if (top <= offset || (atEnd && top < view.bottom - view.top)) current = id
    }
    return current ?? null
  }, [ids, offset, root])

  useEffect(() => {
    if (activeProp !== undefined) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const next = pick()
        setSpied(next)
        report(next)
      })
    }
    update()
    const target: HTMLElement | Window = root ?? window
    target.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      target.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [activeProp, pick, root, report])

  const heading = title === undefined ? ariaLabel : title

  const renderList = (list: TableOfContentsItem[], depth: number) => (
    <ul className={cn('toc__list', depth > 0 && 'toc__list--nested')}>
      {list.map(item => (
        <li key={item.id} className="toc__item">
          <a
            href={`#${item.id}`}
            className="toc__link"
            aria-current={item.id === active ? 'location' : undefined}
            onClick={() => {
              if (activeProp === undefined) setSpied(item.id)
              report(item.id)
            }}
          >
            {item.label}
          </a>
          {item.children?.length ? renderList(item.children, depth + 1) : null}
        </li>
      ))}
    </ul>
  )

  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel} className={cn('toc', className)}>
      {/* A label for the eye; the nav is already named by aria-label, so it isn't a heading in the outline. */}
      {heading && <p className="toc__title" aria-hidden="true">{heading}</p>}
      {renderList(items, 0)}
    </nav>
  )
})

TableOfContents.displayName = 'TableOfContents'
