import { useCallback, useRef } from 'react'

// Typed here rather than through @types/node, so a project on TypeScript 6+
// compiles this shipped source without Node types. Module-scoped, so it never
// clashes with @types/node; bundlers still replace process.env.NODE_ENV inline.
declare const process: { env: { NODE_ENV?: string } }

/**
 * Shared focus-restore logic for sheet-like overlays (Dialog, Drawer).
 *
 * Two gaps in Radix Dialog's own restore, both closed here:
 *
 * - With `modal={false}`, Radix doesn't restore focus on close. This keeps a
 *   ref to the trigger and refocuses it.
 * - With no `trigger` at all (a controlled sheet opened from an Item row, a
 *   menu item, a keyboard shortcut), Radix focuses the trigger it doesn't
 *   have and focus falls to `<body>`, in either mode. This remembers what had
 *   focus when the sheet opened and gives focus back to it on close (G3, the
 *   Item that opens a Dialog).
 *
 * With a trigger and the default modal, Radix's own restore runs unchanged.
 *
 * Usage:
 *   const { triggerRef, onOpenAutoFocus, onCloseAutoFocus } = useSheetFocusRestore(modal, trigger, 'Dialog')
 *   <BaseSheet triggerRef={triggerRef} onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus} ... />
 */
export function useSheetFocusRestore(
  modal: boolean | undefined,
  trigger: React.ReactElement | undefined,
  displayName: string,
) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  // Runs as the content mounts, before Radix moves focus into it, so the
  // active element is still whatever opened the sheet. Doesn't prevent
  // Radix's own open focus.
  const onOpenAutoFocus = useCallback(() => {
    const active = document.activeElement
    returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null
  }, [])

  const onCloseAutoFocus = useCallback((e: Event) => {
    const opener = returnTo.current
    returnTo.current = null

    if (!trigger) {
      if (opener?.isConnected) {
        e.preventDefault()
        opener.focus()
      } else if (modal === false && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[${displayName}] modal={false} with no trigger: nothing had focus when it opened, so focus can't go back anywhere. Pass a trigger element or call focus() manually in onOpenChange.`,
        )
      }
      return
    }

    if (modal === false) {
      if (triggerRef.current) {
        e.preventDefault()
        triggerRef.current.focus()
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[${displayName}] modal={false} focus-restore failed: trigger does not forward its ref. Wrap it in React.forwardRef or restore focus manually via onOpenChange.`,
        )
      }
    }
  // modal and displayName are stable across the component's lifetime; only
  // whether there is a trigger matters, not its identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, !trigger])

  return { triggerRef: triggerRef as React.Ref<HTMLButtonElement>, onOpenAutoFocus, onCloseAutoFocus }
}
