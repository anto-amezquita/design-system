import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Heading.css'

type HeadingLevel = 1 | 2 | 3 | 4 | 5
type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type HeadingOwnProps = {
  /** Visual size, H1 (largest) to H5 (smallest). Decoupled from `as` — see that prop. For a real `<h6>`, use `as="h6"` with `level={5}`. */
  level: HeadingLevel
  /**
   * Semantic tag to render. Defaults to matching `level` (`level={2}` renders
   * an `<h2>`). Set explicitly when the visual size and the correct place in
   * the document outline diverge — e.g. a visually small `H1` that must stay
   * a real `<h1>` for SEO/screen-reader navigation, or a large `H2` nested
   * under a page's actual `<h1>`.
   */
  as?: HeadingElement
  /**
   * Font weight role (decisions/0010). `'heading'` (default) is semibold —
   * right for standalone headings. `'title'` is bold, for title text in
   * compact container chrome (a Card, Dialog or Drawer header sitting next
   * to buttons or a close control), where a small title needs the extra
   * weight to hold its own.
   */
  weight?: 'heading' | 'title'
  children: React.ReactNode
}

// decisions/0007: typed against the real native attributes type so `...rest`
// (data-*, aria-*, onClick from an asChild composition, etc.) reaches the
// rendered element instead of being silently dropped. No prop here collides
// with HTMLAttributes, so no Omit is needed (contrast Button.tsx, which
// narrows onClick/type and must Omit them).
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & HeadingOwnProps

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({
  level,
  as,
  weight = 'heading',
  children,
  className: classNameProp,
  ...rest
}, ref) {
  const Tag = as ?? (`h${level}` as HeadingElement)
  const className = cn('heading', `heading--h${level}`, weight === 'title' && 'heading--title', classNameProp)

  return (
    <Tag {...rest} ref={ref} className={className}>
      {children}
    </Tag>
  )
})

Heading.displayName = 'Heading'
