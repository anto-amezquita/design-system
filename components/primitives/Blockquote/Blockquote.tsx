import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Blockquote.css'

type BlockquoteOwnProps = {
  /** The quoted words. Plain text, or paragraphs for a longer quote. */
  children: React.ReactNode
  /** Who said or wrote it: "Dieter Rams". */
  attribution?: React.ReactNode
  /** The work it comes from: a book, talk or article title. Rendered in a `cite`. */
  source?: React.ReactNode
  /** URL of the source, for the `cite` attribute (read by tools, not shown). */
  cite?: string
  /** `default` for a quote in running text; `pull` for a large quote that breaks up a long page. */
  size?: 'default' | 'pull'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the blockquote.
type BlockquoteProps = Omit<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, 'children'> & BlockquoteOwnProps

/**
 * A quotation set apart from the text around it, with who said it and
 * where, as HTML intends: the attribution sits outside the quote, in a
 * figure caption, so it isn't read as part of the quoted words.
 */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote({
  children,
  attribution,
  source,
  cite,
  size = 'default',
  className,
  ...rest
}, ref) {
  const quote = (
    <blockquote
      {...rest}
      ref={ref}
      cite={cite}
      className={cn('blockquote', `blockquote--${size}`, className)}
    >
      {children}
    </blockquote>
  )

  if (!attribution && !source) return quote

  return (
    <figure className={cn('blockquote-figure', `blockquote-figure--${size}`)}>
      {quote}
      <figcaption className="blockquote-figure__caption">
        {attribution}
        {attribution && source && ', '}
        {source && <cite className="blockquote-figure__source">{source}</cite>}
      </figcaption>
    </figure>
  )
})

Blockquote.displayName = 'Blockquote'
