import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Stack.css'

/** The brand's spacing roles, smallest to largest. Each maps to a `--space-*-gap` token. */
export type StackGap = 'none' | 'tight' | 'inline' | 'element' | 'component' | 'section'

type StackOwnProps = {
  /** `vertical` (default) lays children in a column; `horizontal` in a row. */
  direction?: 'vertical' | 'horizontal'
  /**
   * Space between children, by role rather than pixels, so each brand sets the
   * real size: `tight` (a label and its hint), `inline` (an icon and its text,
   * buttons in a row), `element` (default: items in a group), `component`
   * (form fields, cards), `section` (page sections; grows with the viewport).
   */
  gap?: StackGap
  /** Cross-axis alignment. Default `stretch`. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Main-axis distribution. Default `start`. */
  justify?: 'start' | 'center' | 'end' | 'between'
  /** Let a horizontal Stack wrap onto more lines when it runs out of room. */
  wrap?: boolean
  /**
   * The element to render. `div` (default), or a semantic one when the stack
   * is that thing: `ul`/`ol` for a list (gets `role="list"` back, since Safari
   * drops list semantics once markers are removed), `section`, `nav`, etc.
   */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav' | 'main' | 'ul' | 'ol' | 'span'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type StackProps = React.HTMLAttributes<HTMLElement> & StackOwnProps

/**
 * Lays its children out in one direction with a consistent, token-driven gap.
 * The layout primitive under most compositions: use it instead of margins on
 * children, so spacing lives in one place and follows the brand.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack({
  direction = 'vertical',
  gap = 'element',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Tag = 'div',
  className,
  role,
  ...rest
}, ref) {
  const isList = Tag === 'ul' || Tag === 'ol'
  return (
    <Tag
      {...rest}
      role={role ?? (isList ? 'list' : undefined)}
      ref={ref as React.Ref<HTMLDivElement & HTMLUListElement & HTMLOListElement>}
      className={cn(
        'stack',
        `stack--${direction}`,
        `stack--gap-${gap}`,
        `stack--align-${align}`,
        `stack--justify-${justify}`,
        wrap && 'stack--wrap',
        isList && 'stack--list',
        className,
      )}
    />
  )
})

Stack.displayName = 'Stack'
