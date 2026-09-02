import { useState, useEffect, useRef } from 'react'

/**
 * Bridges controlled and uncontrolled modes for a single piece of state — text inputs by
 * default, but generic so a dual-mode object value (e.g. DataTable's `filters`) can reuse
 * the same controlled/uncontrolled dance instead of a parallel hand-rolled version.
 *
 * Initialised from `value` (when present at mount) so that a controlled → uncontrolled
 * switch does not revert to `defaultValue`. For components that need to switch modes
 * mid-use, reset via a `key` prop instead — React does not support runtime mode switching.
 *
 * Returns [currentValue, isControlled, setInternalValue]
 */
export function useUncontrolledValue<T = string>(
  value: T | undefined,
  defaultValue?: T,
  empty: T = '' as T
): [T, boolean, (v: T) => void] {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? empty)
  const isControlled = value !== undefined
  const currentValue = isControlled ? (value ?? empty) : internalValue

  useEffect(() => {
    if (isControlled) {
      const next = value ?? empty
      setInternalValue(prev => (prev === next ? prev : next))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isControlled])

  const prevIsControlledRef = useRef(isControlled)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && prevIsControlledRef.current !== isControlled) {
      const from = prevIsControlledRef.current ? 'controlled' : 'uncontrolled'
      const to = isControlled ? 'controlled' : 'uncontrolled'
      console.warn(
        `[useUncontrolledValue] Component switched from ${from} to ${to} mid-use. ` +
        'The displayed value may be stale. Reset the component via the key prop instead.'
      )
    }
    prevIsControlledRef.current = isControlled
  }, [isControlled])

  return [currentValue, isControlled, setInternalValue]
}
