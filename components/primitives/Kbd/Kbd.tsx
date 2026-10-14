import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './Kbd.css'

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type KbdProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
}

/**
 * A key the user presses, drawn as a keycap. Renders a native `<kbd>`.
 * For a combination, put one Kbd per key inside an outer `<kbd>`:
 * `<kbd><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></kbd>` (the HTML spec's form).
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ className, children, ...rest }, ref) {
  return (
    <kbd {...rest} ref={ref} className={cn('kbd', className)}>
      {children}
    </kbd>
  )
})

Kbd.displayName = 'Kbd'
