import { useState, useEffect, useRef } from 'react'

/**
 * Bridges controlled and uncontrolled modes for text inputs.
 *
 * Initialised from `value` (when present at mount) so that a controlled → uncontrolled
 * switch does not revert to `defaultValue`. For components that need to switch modes
 * mid-use, reset via a `key` prop instead — React does not support runtime mode switching.
 *
 * Returns [currentValue, isControlled, setInternalValue]
 */
export function useUncontrolledValue(
  value: string | undefined,
  defaultValue?: string
): [string, boolean, (v: string) => void] {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? (value ?? '') : internalValue

  useEffect(() => {
    if (isControlled) {
      const next = value ?? ''
      setInternalValue(prev => (prev === next ? prev : next))
    }
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
