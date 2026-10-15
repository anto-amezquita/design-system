'use client'

import { Fragment, cloneElement, isValidElement } from 'react'
import * as RadixContextMenu from '@radix-ui/react-context-menu'
import { Kbd } from '../../primitives/Kbd'
import { cn } from '../../../lib/cn'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import '../Menu/Menu.css'
import './ContextMenu.css'

export type ContextMenuItem = {
  /** Stable React key. */
  id: string
  label: string
  /** Runs when the item is chosen by click, Enter or Space. The menu closes afterwards. */
  onSelect?: () => void
  disabled?: boolean
  /** `'destructive'` colours the item as a warning, as in Menu. */
  variant?: 'default' | 'destructive'
  /** Decorative leading icon; the label stays the accessible name. */
  icon?: React.ReactNode
  /** The keyboard shortcut that does the same thing, one key per entry: `['Ctrl', 'C']`. Shown as keycaps and set as `aria-keyshortcuts`. */
  shortcut?: string[]
}

export type ContextMenuGroup = {
  /** Optional heading shown above the group's items. */
  label?: string
  items: ContextMenuItem[]
}

type ContextMenuProps = {
  /** The area that has the menu: a file row, a card, a canvas. One element; it's made focusable if it isn't already, so the keyboard can open the menu too. */
  children: React.ReactElement
  /** Items in groups; a separator is drawn between groups, as in Menu. */
  groups: ContextMenuGroup[]
  onOpenChange?: (open: boolean) => void
  /** Turns the menu off; right-click then gives the browser's own menu. */
  disabled?: boolean
  /** Names the menu, e.g. "Actions for report.pdf". */
  'aria-label'?: string
  className?: string
}

const NATIVELY_FOCUSABLE = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary'])

// aria-keyshortcuts uses the UI Events key names.
const keyName = (k: string) => ({ Ctrl: 'Control', Cmd: 'Meta', '⌘': 'Meta', Opt: 'Alt', '⌥': 'Alt', '⇧': 'Shift', Del: 'Delete', Esc: 'Escape' } as Record<string, string>)[k] ?? k

/**
 * The actions for one thing, opened where the pointer is: right-click, a
 * long press on touch, or Shift+F10 or the Menu key on the focused area.
 * Radix ContextMenu with Menu's look and item shape. A shortcut for the
 * whole page's actions, never the only way to reach one.
 */
export function ContextMenu({ children, groups, onOpenChange, disabled = false, 'aria-label': ariaLabel, className }: ContextMenuProps) {
  // Content portals to <body>; this keeps a ThemeScope's brand and mode on it (decisions/0021).
  const scope = useThemeScopeAttributes()

  // Shift+F10 and the Menu key fire the contextmenu event on the focused element, so the area must take focus.
  const props = isValidElement<{ tabIndex?: number }>(children) ? children.props : {}
  const focusable = typeof children.type === 'string' && NATIVELY_FOCUSABLE.has(children.type)
  const target = !focusable && props.tabIndex === undefined ? cloneElement(children as React.ReactElement<{ tabIndex?: number }>, { tabIndex: 0 }) : children

  return (
    // Non-modal, as Menu: modal mode hides the rest of the page with aria-hidden,
    // which leaves focusable elements inside it (axe: aria-hidden-focus).
    <RadixContextMenu.Root onOpenChange={onOpenChange} modal={false}>
      <RadixContextMenu.Trigger asChild disabled={disabled}>{target}</RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content {...scope} className={cn('menu context-menu', className)} aria-label={ariaLabel} collisionPadding={8}>
          {groups.map((group, groupIndex) => (
            <Fragment key={groupIndex}>
              {groupIndex > 0 && <RadixContextMenu.Separator className="menu__separator" />}
              <RadixContextMenu.Group className="menu__group">
                {group.label && <RadixContextMenu.Label className="menu__label">{group.label}</RadixContextMenu.Label>}
                {group.items.map(item => (
                  <RadixContextMenu.Item
                    key={item.id}
                    className={cn('menu__item', item.variant === 'destructive' && 'menu__item--destructive')}
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                    // Type-ahead matches the label, not the shortcut text.
                    textValue={item.label}
                    aria-keyshortcuts={item.shortcut?.map(keyName).join('+')}
                  >
                    {item.icon && <span className="menu__icon" aria-hidden="true">{item.icon}</span>}
                    {item.label}
                    {item.shortcut && (
                      // The shortcut is announced through aria-keyshortcuts; the keycaps are for sighted users.
                      <kbd className="context-menu__shortcut" aria-hidden="true">
                        {item.shortcut.map((k, i) => <Fragment key={i}>{i > 0 && '+'}<Kbd>{k}</Kbd></Fragment>)}
                      </kbd>
                    )}
                  </RadixContextMenu.Item>
                ))}
              </RadixContextMenu.Group>
            </Fragment>
          ))}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  )
}
