'use client'

import { forwardRef } from 'react'
import { Button } from '../Button'
import { cn } from '../../../lib/cn'
import './IconButton.css'

type IconButtonOwnProps = {
  /** The icon. It's hidden from screen readers; `label` names the action. */
  icon: React.ReactNode
  /** The action's name, e.g. "Close" or "Search". Required: it is the only name a screen reader gets. */
  label: string
  /** Emphasis, as on Button. Defaults to `ghost`, the usual weight for a toolbar or card action. */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** `md` (default) is a 44px square. `sm` draws a smaller square for dense rows; its hit area still reaches 44px. */
  size?: 'md' | 'sm'
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  disabled?: boolean
  /** Shows a spinner in place of the icon and blocks the action, as on Button. */
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** Renders an `<a>`, for an action that navigates. */
  href?: string
}

// decisions/0007: native attributes reach the element; Button narrows onClick and type itself.
type IconButtonProps = Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'type' | 'children' | 'aria-label'> & IconButtonOwnProps

/**
 * A Button with an icon and no visible label. Built on Button, so variants,
 * focus ring, loading and disabled behave the same. No expressive motion:
 * the hover wipe needs room a 44px square doesn't have.
 */
export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}, ref) {
  return (
    <Button
      {...rest}
      ref={ref}
      variant={variant}
      aria-label={label}
      className={cn('icon-button', size === 'sm' && 'icon-button--sm', className)}
    >
      <span className="icon-button__icon" aria-hidden="true">{icon}</span>
    </Button>
  )
})

IconButton.displayName = 'IconButton'
