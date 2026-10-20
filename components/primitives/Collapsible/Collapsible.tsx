'use client'

import { forwardRef, useId } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import './Collapsible.css'

type CollapsibleOwnProps = {
  /** The button's text: what opens. "Show details", "Shipping options". */
  title: React.ReactNode
  /** What shows and hides. */
  children: React.ReactNode
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean
  /** Open on first render when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called with the new state when the button is pressed. */
  onOpenChange?: (open: boolean) => void
  /**
   * `block` (default): a full-width row with the chevron at the end, for a
   * section of a page or a panel. `inline`: a text button in the accent
   * colour, for "Show more" under a paragraph.
   */
  variant?: 'block' | 'inline'
  /**
   * With `block`, wrap the button in a heading of this level, so the
   * section shows up in the page outline. Leave out when it isn't a section.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type CollapsibleProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> & CollapsibleOwnProps

/**
 * One section that shows and hides behind a button (the WAI-ARIA disclosure
 * pattern). For several related sections, use Accordion.
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible({
  title,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  variant = 'block',
  headingLevel,
  className,
  ...rest
}, ref) {
  const [open, isControlled, setOpen] = useUncontrolledValue<boolean>(openProp, defaultOpen, false)
  const panelId = useId()
  const state = open ? 'open' : 'closed'

  const toggle = () => {
    const next = !open
    if (!isControlled) setOpen(next)
    onOpenChange?.(next)
  }

  const button = (
    <button
      type="button"
      className="collapsible__trigger"
      aria-expanded={open}
      aria-controls={panelId}
      data-state={state}
      onClick={toggle}
    >
      <span className="collapsible__title">{title}</span>
      <CaretDownIcon className="collapsible__icon" aria-hidden="true" focusable="false" />
    </button>
  )
  const Heading = headingLevel && variant === 'block' ? (`h${headingLevel}` as const) : null

  return (
    <div {...rest} ref={ref} data-state={state} className={cn('collapsible', `collapsible--${variant}`, className)}>
      {Heading ? <Heading className="collapsible__heading">{button}</Heading> : button}
      <div id={panelId} className="collapsible__panel" data-state={state}>
        <div className="collapsible__clip"><div className="collapsible__content">{children}</div></div>
      </div>
    </div>
  )
})

Collapsible.displayName = 'Collapsible'
