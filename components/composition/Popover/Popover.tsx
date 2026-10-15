'use client'

import { forwardRef, useId } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { XIcon } from '@phosphor-icons/react'
import { IconButton } from '../../primitives/IconButton'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import { cn } from '../../../lib/cn'
import './Popover.css'

/** The Popover's state. Controlled with `open` + `onOpenChange`, or uncontrolled with `defaultOpen`. */
export const Popover = RadixPopover.Root

/**
 * The control that opens it. Use `asChild` with a Button or IconButton, so
 * it keeps that component's look; `aria-expanded` and `aria-controls` are
 * set for you.
 */
export const PopoverTrigger = RadixPopover.Trigger

/** Positions the Popover against something other than its trigger, e.g. a whole field. */
export const PopoverAnchor = RadixPopover.Anchor

/** Any element inside that should close the Popover, e.g. a "Done" button. */
export const PopoverClose = RadixPopover.Close

type PopoverContentProps = Omit<React.ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'title'> & {
  /** A heading that names the Popover. Without it, pass `aria-label`. */
  title?: string
  /** A close button in the corner. Escape and clicking outside close it either way. */
  showClose?: boolean
  /** A small arrow pointing at the trigger. */
  showArrow?: boolean
}

/**
 * Content shown next to its trigger, without blocking the page: a date
 * picker, a filter panel, a short form. A non-modal dialog (Radix): focus
 * moves in on open and back to the trigger on close; Escape and a click
 * outside close it; it follows a surrounding ThemeScope (decisions/0021).
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { title, showClose = false, showArrow = false, className, children, sideOffset = 8, collisionPadding = 16, ...rest },
  ref,
) {
  const scope = useThemeScopeAttributes()
  const titleId = useId()
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        {...scope}
        {...rest}
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        aria-labelledby={title ? titleId : rest['aria-labelledby']}
        className={cn('popover', className)}
      >
        {(title || showClose) && (
          <div className="popover__header">
            {title && <h2 id={titleId} className="popover__title">{title}</h2>}
            {showClose && (
              <RadixPopover.Close asChild>
                <IconButton size="sm" variant="ghost" icon={<XIcon />} label="Close" className="popover__close" />
              </RadixPopover.Close>
            )}
          </div>
        )}
        {children}
        {showArrow && <RadixPopover.Arrow className="popover__arrow" width={16} height={8} />}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
})

PopoverContent.displayName = 'PopoverContent'
