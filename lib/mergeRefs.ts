/**
 * Merges multiple refs (object refs, callback refs, or null/undefined) into
 * a single callback ref React can attach to one element.
 *
 * Needed because Dialog computes its own internal triggerRef (via
 * useSheetFocusRestore, for the modal={false} focus-restore case) but a
 * consumer may also need direct access to the same trigger DOM node — e.g.
 * to manually restore focus there after a completely separate dialog (an
 * AlertDialog opened as a follow-up confirmation) closes. React only
 * accepts one ref per element, so both refs need to update from a single
 * merged callback.
 */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') {
        ref(value)
      } else {
        (ref as React.RefObject<T | null>).current = value
      }
    }
  }
}
