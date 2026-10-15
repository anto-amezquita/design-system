'use client'

import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { FieldContext, type FieldContextValue } from '../../../lib/field'
import '../Field/Field.css'
import './InputGroup.css'

type InputGroupOwnProps = {
  /** The visible label. It names the Input inside. */
  label: string
  hint?: string
  /** Replaces the hint and marks the Input invalid. */
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
  /** An Input with no label of its own, plus InputAddons and Buttons before or after it. */
  children: React.ReactNode
}

// decisions/0007: native attributes reach the wrapper.
type InputGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'id'> & InputGroupOwnProps

/**
 * An Input joined to the text and buttons that belong to it: "https://"
 * before a domain, "kr." after a price, a Copy button at the end. One
 * shape, one label. Addon text is part of the Input's description, so a
 * screen reader hears "kr." too.
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  id: idProp,
  className,
  children,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const messageId = `${id}-message`
  const message = error || hint
  const invalid = Boolean(error)

  // Give each addon an id, so the Input can be described by its text.
  const addonIds: string[] = []
  const row = Children.map(children, (child, i) => {
    if (isValidElement(child) && child.type === InputAddon) {
      const addonId = `${id}-addon-${i}`
      addonIds.push(addonId)
      return cloneElement(child as React.ReactElement<{ id?: string }>, { id: addonId })
    }
    return child
  })

  const context: FieldContextValue = {
    id,
    describedBy: [...addonIds, message ? messageId : undefined].filter(Boolean).join(' ') || undefined,
    invalid,
    required,
    disabled,
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cn('input-group', invalid && 'input-group--error', disabled && 'input-group--disabled', className)}
    >
      <label htmlFor={id} className="field__label input-group__label">
        {label}
        {/* The Input's `required` already announces it; the word is for sighted users. */}
        {required && <span className="field__required" aria-hidden="true">Required</span>}
      </label>
      <div className="input-group__row">
        <FieldContext.Provider value={context}>{row}</FieldContext.Provider>
      </div>
      {message && (
        <p id={messageId} className={cn('field__message', invalid && 'field__message--error')}>
          {invalid && <WarningCircleIcon className="field__message-icon" weight="fill" aria-hidden="true" />}
          {message}
        </p>
      )}
    </div>
  )
})

InputGroup.displayName = 'InputGroup'

type InputAddonProps = React.HTMLAttributes<HTMLSpanElement>

/** Text joined to the Input: a unit, a protocol, a currency. Read as part of the Input's description. */
export const InputAddon = forwardRef<HTMLSpanElement, InputAddonProps>(function InputAddon({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} className={cn('input-group__addon', className)} />
})

InputAddon.displayName = 'InputAddon'
