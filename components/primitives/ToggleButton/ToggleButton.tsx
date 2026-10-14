'use client'

import { forwardRef } from 'react'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { cn } from '../../../lib/cn'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import './ToggleButton.css'

type ToggleButtonOwnProps = {
  /** What the toggle turns on, e.g. "Bold" or "Show grid". It stays the same in both states; `aria-pressed` carries the state. */
  label: string
  /** An icon beside the label, or on its own with `hideLabel`. */
  icon?: React.ReactNode
  /** Show only the icon, as a square; `label` becomes the accessible name. Needs `icon`. */
  hideLabel?: boolean
  /** Controlled pressed state. Pair with `onPressedChange`. */
  pressed?: boolean
  /** Starting state when uncontrolled. Default `false`. */
  defaultPressed?: boolean
  /** Called with the new state on every press. */
  onPressedChange?: (pressed: boolean) => void
  /** Icon-only size, as on IconButton. Ignored with a visible label. */
  size?: 'md' | 'sm'
  disabled?: boolean
}

// decisions/0007: native attributes reach the element.
type ToggleButtonProps = Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'aria-pressed' | 'onClick'> & ToggleButtonOwnProps & {
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

/**
 * A button that stays on or off: bold in an editor, a grid overlay, mute.
 * Built on Button, so each brand's shape carries over: off looks like
 * `secondary` (outline), on like `primary` (filled). The fill is the state,
 * so it reads without relying on colour alone.
 */
export const ToggleButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ToggleButtonProps>(function ToggleButton({
  label,
  icon,
  hideLabel = false,
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  size = 'md',
  disabled = false,
  onClick,
  className,
  ...rest
}, ref) {
  const [pressed, isControlled, setPressed] = useUncontrolledValue<boolean>(pressedProp, defaultPressed, false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    const next = !pressed
    if (!isControlled) setPressed(next)
    onPressedChange?.(next)
  }

  const shared = {
    ...rest,
    ref,
    disabled,
    onClick: handleClick,
    'aria-pressed': pressed,
    variant: pressed ? ('primary' as const) : ('secondary' as const),
    className: cn('toggle-button', pressed && 'toggle-button--pressed', className),
  }

  if (hideLabel && icon) {
    return <IconButton {...shared} icon={icon} label={label} size={size} />
  }

  return (
    <Button {...shared} icon={icon}>
      {label}
    </Button>
  )
})

ToggleButton.displayName = 'ToggleButton'
