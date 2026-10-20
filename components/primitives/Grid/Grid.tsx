import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Grid.css'

/** The brand's spacing roles, smallest to largest. Each maps to a `--space-*-gap` token. */
export type GridGap = 'none' | 'tight' | 'inline' | 'element' | 'component' | 'section'

/** A value per breakpoint, mobile first: `base` below 768px, `tablet` from 768px, `desktop` from 1024px. Each one carries up. */
export type Responsive<T> = T | { base?: T; tablet?: T; desktop?: T }

type GridElement = 'div' | 'section' | 'ul' | 'ol'

type GridOwnProps = {
  /**
   * Fixed number of equal columns (1–12), or one per breakpoint:
   * `{ base: 1, tablet: 2, desktop: 4 }`. A breakpoint you leave out takes
   * the one below it. Default 1. Ignored when `minItemWidth` is set.
   */
  columns?: Responsive<number>
  /**
   * Let the content decide the columns instead: as many as fit with every
   * item at least this wide (`sm` 192px, `md` 256px, `lg` 320px in the
   * base theme). Works in any container, with no breakpoints.
   */
  minItemWidth?: 'sm' | 'md' | 'lg'
  /** Space between items, by role, so each brand sets the size. Default `element`. */
  gap?: GridGap
  /** Space between rows when it should differ from `gap`. */
  rowGap?: GridGap
  /** How items sit in their row. Default `stretch`: items in a row are the same height. */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /**
   * `div` (default), `section`, or `ul`/`ol` for a list of items (gets
   * `role="list"` back, since Safari drops list semantics once markers are removed).
   */
  as?: GridElement
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type GridProps = React.HTMLAttributes<HTMLElement> & GridOwnProps

function perBreakpoint<T>(value: Responsive<T> | undefined): { base?: T; tablet?: T; desktop?: T } {
  if (value === undefined) return {}
  if (typeof value === 'object' && value !== null) return value as { base?: T; tablet?: T; desktop?: T }
  return { base: value as T }
}

function clampColumns(n: number | undefined) {
  return n === undefined ? undefined : Math.min(12, Math.max(1, Math.round(n)))
}

/**
 * Lays items out in rows and columns with a token-driven gap: card lists,
 * dashboards, galleries. Fixed columns per breakpoint, or as many as fit.
 * For one direction, use Stack.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({
  columns,
  minItemWidth,
  gap = 'element',
  rowGap,
  align = 'stretch',
  as: Tag = 'div',
  className,
  style,
  role,
  ...rest
}, ref) {
  const isList = Tag === 'ul' || Tag === 'ol'
  const cols = perBreakpoint(columns)
  const vars = minItemWidth ? {} : {
    '--grid-columns': clampColumns(cols.base),
    '--grid-columns-tablet': clampColumns(cols.tablet),
    '--grid-columns-desktop': clampColumns(cols.desktop),
  }
  return (
    <Tag
      {...rest}
      role={role ?? (isList ? 'list' : undefined)}
      ref={ref as React.Ref<HTMLDivElement & HTMLUListElement & HTMLOListElement>}
      style={{ ...vars, ...style } as React.CSSProperties}
      className={cn(
        'grid',
        minItemWidth && `grid--auto grid--min-${minItemWidth}`,
        `grid--gap-${gap}`,
        rowGap && `grid--row-gap-${rowGap}`,
        `grid--align-${align}`,
        isList && 'grid--list',
        className,
      )}
    />
  )
})

Grid.displayName = 'Grid'

/* ── GridItem ───────────────────────────────────────────────────────────── */

type Span = number | 'full'

type GridItemProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * Columns this item takes: a number, `'full'` for the whole row, or one per
   * breakpoint: `{ base: 'full', desktop: 2 }`. Leave it out for one column.
   */
  span?: Responsive<Span>
  /** `div` (default), or `li` inside a Grid rendered as a list. */
  as?: 'div' | 'li' | 'article' | 'section'
}

function column(span: Span | undefined) {
  if (span === undefined) return undefined
  return span === 'full' ? '1 / -1' : `span ${Math.min(12, Math.max(1, Math.round(span)))}`
}

/** An item that spans more than one column of a Grid. Plain children work too; you only need GridItem to span. */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(function GridItem({
  span,
  as: Tag = 'div',
  className,
  style,
  ...rest
}, ref) {
  const s = perBreakpoint(span)
  const vars = {
    '--grid-item-column': column(s.base),
    '--grid-item-column-tablet': column(s.tablet),
    '--grid-item-column-desktop': column(s.desktop),
  }
  return (
    <Tag
      {...rest}
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      style={{ ...vars, ...style } as React.CSSProperties}
      className={cn('grid-item', className)}
    />
  )
})

GridItem.displayName = 'GridItem'
