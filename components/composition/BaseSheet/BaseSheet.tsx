'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { XIcon } from '@phosphor-icons/react'

export type BaseSheetProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  modal?: boolean
  /** Must be a single DOM element — React.Fragment is not supported (Radix asChild). */
  trigger?: React.ReactElement
  triggerRef?: React.Ref<HTMLButtonElement>
  contentClassName: string
  /** CSS class for the overlay. Pass undefined to suppress the overlay entirely. */
  overlayClassName?: string
  onCloseAutoFocus?: (e: Event) => void
  /** Called on pointer-down outside the content — call e.preventDefault() to prevent close. */
  onPointerDownOutside?: (e: Event) => void
  /** Called when Escape is pressed — call e.preventDefault() to prevent close. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  /** BEM block prefix — drives all inner class names (e.g. "dialog" → dialog__header) */
  blockName: string
  closeLabel: string
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function BaseSheet({
  open,
  onOpenChange,
  defaultOpen,
  modal,
  trigger,
  triggerRef,
  contentClassName,
  overlayClassName,
  onCloseAutoFocus,
  onPointerDownOutside,
  onEscapeKeyDown,
  blockName,
  closeLabel,
  title,
  description,
  children,
  footer,
}: BaseSheetProps) {
  const b = (element: string) => `${blockName}__${element}`

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
      {trigger && (
        <RadixDialog.Trigger asChild ref={triggerRef}>
          {trigger}
        </RadixDialog.Trigger>
      )}

      <RadixDialog.Portal>
        {overlayClassName && <RadixDialog.Overlay className={overlayClassName} />}
        <RadixDialog.Content
          className={contentClassName}
          {...(!description && { 'aria-describedby': undefined })}
          onCloseAutoFocus={onCloseAutoFocus}
          onPointerDownOutside={onPointerDownOutside}
          onEscapeKeyDown={onEscapeKeyDown}
        >
          <div className={b('header')}>
            <RadixDialog.Title className={b('title')}>{title}</RadixDialog.Title>
            <RadixDialog.Close className={b('close')} aria-label={closeLabel}>
              <XIcon size={16} weight="regular" aria-hidden="true" />
            </RadixDialog.Close>
          </div>

          {description && (
            <RadixDialog.Description className={b('description')}>
              {description}
            </RadixDialog.Description>
          )}

          <div className={b('body')}>{children}</div>

          {footer && <div className={b('footer')}>{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
