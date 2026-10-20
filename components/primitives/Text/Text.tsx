import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Text.css'

type TextElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'small' | 'figcaption' | 'li' | 'dd' | 'dt'

type TextOwnProps = {
  /**
   * Type role: `body` (default) for running text, `small` for supporting
   * text (hints, metadata), `caption` for the smallest labels (figure
   * captions, timestamps). Each is the brand's own size and line height.
   */
  size?: 'body' | 'small' | 'caption'
  /**
   * `primary` (default), `secondary` for less important text (still 4.5:1 on
   * the page surfaces), or `inherit` to take the colour of the parent, like
   * text inside a Button or Alert.
   */
  tone?: 'primary' | 'secondary' | 'inherit'
  /** Weight role: `body` (default) or `label`, a little heavier, for a term or a value that should stand out. */
  weight?: 'body' | 'label'
  /**
   * Cut the text off with an ellipsis after this many lines (`true` = 1).
   * The full text stays in the page for screen readers and copying; show it
   * somewhere else too (a tooltip, a detail page) if sighted users need it.
   */
  truncate?: boolean | number
  /** Element to render. `p` (default); `span` inside a line; `strong`/`em` when the emphasis is meaning, not style. */
  as?: TextElement
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type TextProps = React.HTMLAttributes<HTMLElement> & TextOwnProps

/**
 * Body text in the brand's type roles: body, small and caption, with a tone
 * and weight. For headings, use Heading.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text({
  size = 'body',
  tone = 'primary',
  weight = 'body',
  truncate = false,
  as: Tag = 'p',
  className,
  style,
  ...rest
}, ref) {
  const lines = truncate === true ? 1 : typeof truncate === 'number' && truncate > 0 ? Math.round(truncate) : 0
  return (
    <Tag
      {...rest}
      ref={ref as React.Ref<HTMLParagraphElement & HTMLLIElement>}
      style={lines > 1 ? ({ '--text-lines': lines, ...style } as React.CSSProperties) : style}
      className={cn(
        'text',
        `text--${size}`,
        `text--tone-${tone}`,
        weight === 'label' && 'text--weight-label',
        lines === 1 && 'text--truncate',
        lines > 1 && 'text--clamp',
        className,
      )}
    />
  )
})

Text.displayName = 'Text'
