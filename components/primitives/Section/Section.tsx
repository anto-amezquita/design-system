import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Section.css'

type SectionOwnProps = {
  /**
   * How wide the content gets, centred: `text` (a readable line, 45rem in the
   * base theme), `media` (60rem), `wide` (80rem), `page` (default, 90rem) or
   * `full` (no limit). The background always runs edge to edge.
   */
  width?: 'text' | 'media' | 'wide' | 'page' | 'full'
  /**
   * Space above and below: `section` (default; grows with the viewport),
   * `component` for a tighter band, `none` when the parent spaces sections.
   */
  spacing?: 'none' | 'component' | 'section'
  /**
   * Background: `default` (none, the page shows through) or `subtle` (the
   * secondary surface) to set a band apart. For a dark band on a light page,
   * wrap the Section in ThemeScope instead, so every component inside switches too.
   */
  tone?: 'default' | 'subtle'
  /**
   * `section` (default), or `header`, `footer`, `main`, `article`, `aside`,
   * `div`. A `section` is only a landmark once it has a name: pass
   * `aria-labelledby` pointing at its heading.
   */
  as?: 'section' | 'header' | 'footer' | 'main' | 'article' | 'aside' | 'div'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type SectionProps = React.HTMLAttributes<HTMLElement> & SectionOwnProps

/**
 * A band of a page: edge-to-edge background, consistent space above and
 * below, and content centred at a set width with the page gutter.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section({
  width = 'page',
  spacing = 'section',
  tone = 'default',
  as: Tag = 'section',
  className,
  children,
  ...rest
}, ref) {
  return (
    <Tag
      {...rest}
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      className={cn('section', `section--spacing-${spacing}`, `section--tone-${tone}`, className)}
    >
      <div className={cn('section__inner', `section__inner--${width}`)}>{children}</div>
    </Tag>
  )
})

Section.displayName = 'Section'
