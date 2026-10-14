import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './ButtonGroup.css'

type ButtonGroupOwnProps = {
  /** Buttons or IconButtons that act on the same thing. */
  children: React.ReactNode
  /** Names the group for screen readers, e.g. "Text alignment". Recommended when the buttons alone don't say what they act on. */
  label?: string
  /** Join the buttons into one shape: shared edges, round corners only at the ends. Default `false`: separate buttons with a gap. */
  attached?: boolean
  orientation?: 'horizontal' | 'vertical'
}

// decisions/0007: native attributes reach the element.
type ButtonGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'> & ButtonGroupOwnProps

/**
 * Related actions kept together: Undo / Redo, zoom out / in, a pager.
 * A `role="group"` around Buttons; each button stays its own Tab stop,
 * because each is its own action. For one choice from several, use
 * SegmentedControl instead.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({
  children,
  label,
  attached = false,
  orientation = 'horizontal',
  className,
  ...rest
}, ref) {
  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={label}
      className={cn(
        'button-group',
        `button-group--${orientation}`,
        attached && 'button-group--attached',
        className,
      )}
    >
      {children}
    </div>
  )
})

ButtonGroup.displayName = 'ButtonGroup'
