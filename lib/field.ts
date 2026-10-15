import { createContext, useContext } from 'react'

/**
 * What a Field tells the control inside it. Controls that render their own
 * element deep down (Select's trigger) read this with `useField()` instead
 * of relying on Field to clone props onto them.
 */
export type FieldContextValue = {
  /** The id the control should carry, so the Field's <label htmlFor> names it. */
  id: string
  /** Space-separated ids of the hint or error text, for aria-describedby. */
  describedBy?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** The surrounding Field's wiring, or null outside a Field. */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext)
}
