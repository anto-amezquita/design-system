import { useCallback, useRef } from 'react'

/**
 * Shared focus-restore logic for non-modal sheet-like overlays (Dialog, Drawer).
 *
 * Radix Dialog does not restore focus on close when modal={false}. This hook
 * keeps a ref to the trigger element and manually refocuses it via onCloseAutoFocus.
 *
 * Usage:
 *   const { triggerRef, onCloseAutoFocus } = useSheetFocusRestore(modal, trigger, 'Dialog')
 *   <BaseSheet triggerRef={triggerRef} onCloseAutoFocus={onCloseAutoFocus} ... />
 */
export function useSheetFocusRestore(
  modal: boolean | undefined,
  trigger: React.ReactElement | undefined,
  displayName: string,
) {
  const triggerRef = useRef<HTMLElement | null>(null)

  const onCloseAutoFocus = useCallback((e: Event) => {
    if (modal === false) {
      if (triggerRef.current) {
        e.preventDefault()
        triggerRef.current.focus()
      } else if (process.env.NODE_ENV !== 'production') {
        if (trigger) {
          console.warn(
            `[${displayName}] modal={false} focus-restore failed: trigger does not forward its ref. Wrap it in React.forwardRef or restore focus manually via onOpenChange.`,
          )
        } else {
          console.warn(
            `[${displayName}] modal={false} with no trigger: focus will not be restored on close. Pass a trigger element or call focus() manually in onOpenChange.`,
          )
        }
      }
    }
  // modal and displayName are stable across the component's lifetime; trigger
  // identity may change but does not affect the focus-restore outcome.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  return { triggerRef: triggerRef as React.Ref<HTMLButtonElement>, onCloseAutoFocus }
}
