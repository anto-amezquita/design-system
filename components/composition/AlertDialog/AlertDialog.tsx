'use client'

import * as RadixAlertDialog from '@radix-ui/react-alert-dialog'
import { cn } from '../../../lib/cn'
import '../Dialog/Dialog.css'

type AlertDialogSize = 'sm' | 'md' | 'lg'

type AlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  /** Rendered inside AlertDialog.Cancel (asChild) — must be a single focusable element. Radix auto-focuses this on open, per the Radix Alert Dialog convention of defaulting focus to the least-destructive option. */
  cancel: React.ReactElement
  /** Rendered inside AlertDialog.Action (asChild) — must be a single focusable element. Should read visually distinct from `cancel` — see the Radix Alert Dialog docs' own guidance on this. */
  action: React.ReactElement
  size?: AlertDialogSize
  /**
   * Forwarded to Radix's onCloseAutoFocus. AlertDialog is always modal, so
   * Radix restores focus to whatever was focused before IT opened — which,
   * for a follow-up confirmation opened after some other dialog already
   * closed, is often nothing useful. Pass this to manually restore focus
   * somewhere specific instead (e.g. Dialog's own trigger, captured via its
   * `triggerRef` prop before that Dialog closed).
   */
  onCloseAutoFocus?: (e: Event) => void
}

/**
 * Confirmation gate for an action the user must explicitly accept or
 * decline — distinct from Dialog: real `alertdialog` role, no dismiss via
 * outside click or a free-floating close button, forces a Cancel/Action
 * choice.
 *
 * Deliberately reuses Dialog's own CSS classes and tokens rather than
 * duplicating them — visually this is the same box as Dialog with a
 * different behavioral contract underneath, not a new visual design. See
 * `../Dialog/Dialog.css` for the token list actually consumed here.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  cancel,
  action,
  size = 'md',
  onCloseAutoFocus,
}: AlertDialogProps) {
  const contentClass = cn(
    'dialog__content',
    size !== 'md' && `dialog__content--${size}`,
  )

  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="dialog__overlay" />
        <RadixAlertDialog.Content
          className={contentClass}
          {...(!description && { 'aria-describedby': undefined })}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div className="dialog__header">
            <RadixAlertDialog.Title className="dialog__title">{title}</RadixAlertDialog.Title>
          </div>

          {description && (
            <RadixAlertDialog.Description className="dialog__description">
              {description}
            </RadixAlertDialog.Description>
          )}

          {children && <div className="dialog__body">{children}</div>}

          <div className="dialog__footer">
            <RadixAlertDialog.Cancel asChild>{cancel}</RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>{action}</RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  )
}
