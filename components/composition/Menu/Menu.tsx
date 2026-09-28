'use client'

import { Fragment } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '../../../lib/cn'
import './Menu.css'

type MenuItemVariant = 'default' | 'destructive'

type MenuItem = {
  /** Stable React key. */
  id: string
  label: string
  /** Runs when the item is chosen by click, Enter or Space. The menu closes afterwards. */
  onSelect?: () => void
  disabled?: boolean
  /** `'destructive'` colours the item as a warning, for deletes and other actions that can't be undone. */
  variant?: MenuItemVariant
  /** Decorative leading icon; the label stays the accessible name. */
  icon?: React.ReactNode
}

type MenuGroup = {
  /** Optional heading shown above the group's items. */
  label?: string
  items: MenuItem[]
}

type MenuAlign = 'start' | 'center' | 'end'
type MenuSide = 'top' | 'right' | 'bottom' | 'left'

type MenuProps = {
  /** The element that opens the menu. Must be a single element that forwards its ref — `Button` does. React.Fragment is not supported (Radix asChild). */
  trigger: React.ReactElement
  /** Items in groups; a separator is drawn between groups. One group with no label is a plain list. */
  groups: MenuGroup[]
  align?: MenuAlign
  side?: MenuSide
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name for the menu itself, when the trigger's label isn't enough context. */
  'aria-label'?: string
  className?: string
}

export function Menu({
  trigger,
  groups,
  align = 'start',
  side = 'bottom',
  open,
  defaultOpen,
  onOpenChange,
  'aria-label': ariaLabel,
  className,
}: MenuProps) {
  return (
    // Non-modal: Radix's modal mode sets aria-hidden on everything outside
    // the menu, trigger included, which leaves a focusable element inside an
    // aria-hidden region (axe: aria-hidden-focus). A menu is a transient
    // popup, not a dialog; outside clicks and Escape still close it, and
    // focus still moves into it and back to the trigger.
    <RadixMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={false}>
      <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          className={cn('menu', className)}
          align={align}
          side={side}
          sideOffset={4}
          aria-label={ariaLabel}
        >
          {groups.map((group, groupIndex) => (
            <Fragment key={group.label ?? groupIndex}>
              {groupIndex > 0 && <RadixMenu.Separator className="menu__separator" />}
              <RadixMenu.Group className="menu__group">
                {group.label && <RadixMenu.Label className="menu__label">{group.label}</RadixMenu.Label>}
                {group.items.map(item => (
                  <RadixMenu.Item
                    key={item.id}
                    className={cn('menu__item', item.variant === 'destructive' && 'menu__item--destructive')}
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                  >
                    {item.icon && <span className="menu__icon" aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </RadixMenu.Item>
                ))}
              </RadixMenu.Group>
            </Fragment>
          ))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  )
}
