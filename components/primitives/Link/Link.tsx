import { forwardRef } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import './Link.css'

type LinkVariant = 'inline' | 'standalone'

type LinkOwnProps = {
  /** `'inline'` is underlined, for links inside running text. `'standalone'` has no underline until hover or focus, for links that stand on their own (a list of links, a "Read more"). */
  variant?: LinkVariant
  /** Opens in a new tab: sets `target="_blank"` and `rel="noopener noreferrer"`, and adds an icon plus visually hidden "(opens in a new tab)". Not detected from `href` — set it where you mean it. */
  external?: boolean
  /** Render your router's link instead of `<a>`, keeping Link's styling: `<Link asChild><NextLink href="/about">About</NextLink></Link>`. The child must be a single element that renders an `<a>`. */
  asChild?: boolean
  children: React.ReactNode
}

// Native anchor attributes pass through (decisions/0006, 0007): href, onClick,
// aria-*, data-*, and anything a Radix Slot injects when Link is itself
// composed via asChild.
type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & LinkOwnProps

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'inline', external = false, asChild = false, className, children, rel, target, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'a'
  const externalProps = external
    ? {
        target: '_blank',
        // Keeps any rel tokens the consumer passed (e.g. "external", "me").
        rel: cn('noopener noreferrer', rel),
      }
    : { target, rel }

  return (
    <Comp
      {...rest}
      {...externalProps}
      ref={ref}
      className={cn('link', variant === 'standalone' && 'link--standalone', className)}
    >
      <Slottable>{children}</Slottable>
      {external && (
        <>
          <ArrowUpRightIcon className="link__icon" weight="regular" aria-hidden="true" />
          <span className="link__hint">(opens in a new tab)</span>
        </>
      )}
    </Comp>
  )
})

Link.displayName = 'Link'
