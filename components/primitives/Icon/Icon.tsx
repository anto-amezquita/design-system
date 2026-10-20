import { forwardRef } from 'react'
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import './Icon.css'

type IconOwnProps = {
  /** The icon component, from `@phosphor-icons/react`: `icon={BellIcon}`. */
  icon: PhosphorIcon
  /**
   * The brand's icon sizes: `xs` (12px in the base theme), `sm` (16), `md`
   * (default, 20), `lg` (24), `xl` (32). Next to text, `sm` sits with small
   * text and `md` with body text.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Phosphor weight. Default `regular`; `bold` or `fill` to match heavier text or show a selected state. */
  weight?: IconWeight
  /**
   * Colour. `current` (default) takes the text colour around it, which is
   * right inside buttons, links and alerts. The others are for an icon on
   * its own: `primary`, `secondary`, `accent`, `error`, each at least 3:1
   * on the page surfaces.
   */
  tone?: 'current' | 'primary' | 'secondary' | 'accent' | 'error'
  /**
   * Name the icon when it carries meaning nothing else on screen gives
   * ("Warning", "Verified"). It then reads as an image with that name.
   * Leave it out when it decorates text that says the same thing: the icon
   * is hidden from screen readers.
   */
  label?: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type IconProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'role'> & IconOwnProps

/**
 * A Phosphor icon at one of the brand's icon sizes and colours, hidden from
 * screen readers unless it's given a name.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon({
  icon: Glyph,
  size = 'md',
  weight = 'regular',
  tone = 'current',
  label,
  className,
  ...rest
}, ref) {
  const semantics = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }
  return (
    <span
      {...rest}
      {...semantics}
      ref={ref}
      className={cn('icon', `icon--${size}`, `icon--tone-${tone}`, className)}
    >
      <Glyph weight={weight} size="100%" aria-hidden="true" focusable="false" />
    </span>
  )
})

Icon.displayName = 'Icon'
