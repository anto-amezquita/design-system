'use client'

import { cn } from '../../../lib/cn'
import { mergeRefs } from '../../../lib/mergeRefs'
import { useSheetFocusRestore } from '../../../hooks/useSheetFocusRestore'
import { BaseSheet } from '../BaseSheet'
import './Dialog.css'

type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

type DialogControlledProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultOpen?: never
  // Must be a single DOM element — React.Fragment is not supported (Radix asChild).
  trigger?: React.ReactElement
  /**
   * Optional external ref onto the trigger's DOM node, merged with Dialog's
   * own internal one. Useful when a consumer needs the trigger element for
   * something beyond this Dialog's own lifecycle — e.g. restoring focus
   * there after a separate follow-up AlertDialog (opened once this Dialog
   * has already closed) finishes. Dialog's own focus-restore-on-close
   * (modal={false} case) keeps working unaffected either way.
   */
  triggerRef?: React.Ref<HTMLButtonElement>
}

type DialogUncontrolledProps = {
  open?: never
  onOpenChange?: never
  defaultOpen?: boolean
  // Must be a single DOM element — React.Fragment is not supported (Radix asChild).
  trigger?: React.ReactElement
  /** See DialogControlledProps.triggerRef. */
  triggerRef?: React.Ref<HTMLButtonElement>
}

type DialogProps = (DialogControlledProps | DialogUncontrolledProps) & {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: DialogSize
  scrollable?: boolean
  modal?: boolean
  /** Call e.preventDefault() to prevent the dialog from closing on outside click. */
  onPointerDownOutside?: (e: Event) => void
  /** Call e.preventDefault() to prevent the dialog from closing on Escape key. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void
}

export function Dialog({ open, onOpenChange, defaultOpen, trigger, triggerRef: externalTriggerRef, title, description, children, footer, size = 'md', scrollable = false, modal, onPointerDownOutside, onEscapeKeyDown }: DialogProps) {
  const { triggerRef: internalTriggerRef, onCloseAutoFocus } = useSheetFocusRestore(modal, trigger, 'Dialog')
  const triggerRef = mergeRefs(internalTriggerRef, externalTriggerRef)

  const contentClass = cn(
    'dialog__content',
    size !== 'md' && `dialog__content--${size}`,
    scrollable && 'dialog__content--scrollable',
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
      overlayClassName={modal !== false ? 'dialog__overlay' : undefined}
      blockName="dialog"
      closeLabel="Close dialog"
      onPointerDownOutside={onPointerDownOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onCloseAutoFocus={onCloseAutoFocus}
      title={title}
      description={description}
      footer={footer}
    >
      {children}
    </BaseSheet>
  )
}
