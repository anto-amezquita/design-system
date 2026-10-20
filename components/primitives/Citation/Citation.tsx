import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Citation.css'

type CitationOwnProps = {
  /** Where it links: the source's URL, or `#source-2` for a list of sources on the page. */
  href: string
  /** The source's title. It names the link for screen readers and shows as a tooltip. */
  title: string
  /** The number shown: `1` for the first source. Give this or `source`. */
  index?: number
  /** A short source name shown instead of a number: "Wikipedia", "docs.claude.com". Give this or `index`. */
  source?: string
  /** Open in a new tab, and say so to screen readers. Default `false`. */
  external?: boolean
}

/** The marker needs something to show: a number or a source name, not both. */
type CitationMarker = { index: number; source?: never } | { source: string; index?: never }

// decisions/0007: typed against the native attributes so `...rest` reaches the link.
type CitationProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'title' | 'children' | 'target'> & CitationOwnProps & CitationMarker

/**
 * A small link from a claim to where it came from: a numbered marker
 * (`1`) or a source chip (`Wikipedia`), as in AI answers and articles.
 */
export const Citation = forwardRef<HTMLAnchorElement, CitationProps>(function Citation({
  href,
  title,
  index,
  source,
  external = false,
  className,
  rel,
  ...rest
}, ref) {
  const shown = index !== undefined ? String(index) : source!
  // One aria-label rather than hidden text around the marker: the chip is a
  // flex box, and accessible-name rules put a space between flex items
  // ("Source 1 : …"). The visible text stays inside the name (WCAG 2.5.3),
  // so "click source 1" works with speech input.
  const name = `Source ${shown}: ${title}${external ? ' (opens in a new tab)' : ''}`
  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      title={title}
      aria-label={name}
      target={external ? '_blank' : undefined}
      rel={external ? cn('noopener noreferrer', rel) : rel}
      className={cn('citation', index !== undefined ? 'citation--number' : 'citation--source', className)}
    >
      {shown}
    </a>
  )
})

Citation.displayName = 'Citation'
