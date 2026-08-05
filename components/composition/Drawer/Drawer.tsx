'use client'

import { cn } from '@/lib/cn'
import { useSheetFocusRestore } from '@/hooks/useSheetFocusRestore'
import { BaseSheet } from '../BaseSheet'
import './Drawer.css'

type DrawerSide = 'right' | 'left' | 'bottom'
type DrawerSize = 'sm' | 'md' | 'lg' | 'full'

type DrawerProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  // Must be a single DOM element — React.Fragment is not supported (Radix asChild).
  trigger?: React.ReactElement
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  side?: DrawerSide
  size?: DrawerSize
  modal?: boolean
  /** Call e.preventDefault() to prevent the drawer from closing on outside click. */
  onPointerDownOutside?: (e: Event) => void
  /** Call e.preventDefault() to prevent the drawer from closing on Escape key. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void
}

export function Drawer({
  open,
  onOpenChange,
  defaultOpen,
  trigger,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  modal = true,
  onPointerDownOutside,
  onEscapeKeyDown,
}: DrawerProps) {
  const { triggerRef, onCloseAutoFocus } = useSheetFocusRestore(modal, trigger, 'Drawer')

  const contentClass = cn(
    'drawer__content',
    side !== 'right' && `drawer__content--${side}`,
    size !== 'md' && `drawer__content--${size}`,
  )

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      modal={modal}
      trigger={trigger}
      triggerRef={triggerRef}
      contentClassName={contentClass}
      overlayClassName={modal !== false ? 'drawer__overlay' : undefined}
      blockName="drawer"
      closeLabel="Close drawer"
      title={title}
      description={description}
      footer={footer}
      onPointerDownOutside={onPointerDownOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      {children}
    </BaseSheet>
  )
}
