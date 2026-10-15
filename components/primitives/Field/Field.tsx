'use client'

import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { FieldContext, type FieldContextValue } from '../../../lib/field'
import './Field.css'

type FieldOwnProps = {
  /** The visible label. It names the control. */
  label: string
  /** Help text under the control, linked with `aria-describedby`. */
  hint?: string
  /** An error message. Replaces the hint, sets `aria-invalid`, and is linked the same way. */
  error?: string
  /** Marks the control required (`aria-required` / `required`) and shows "Required" beside the label. */
  required?: boolean
  disabled?: boolean
  /**
   * For a set of controls answered together (radio buttons, checkboxes, a
   * SegmentedControl): renders a <fieldset> with the label as its <legend>.
   * The children are left as they are.
   */
  group?: boolean
  /** The control id. Generated when left out. */
  id?: string
  /**
   * One control: an Input-like element, a native element, or a Select.
   * It gets `id`, `aria-describedby`, `aria-invalid`, `required` and
   * `disabled` unless it already sets them.
   */
  children: React.ReactNode
}

// decisions/0007: native attributes reach the wrapper.
type FieldProps = Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'id'> & FieldOwnProps

/**
 * Label, hint and error for any control, wired the way Input wires its own:
 * the label names the control, the hint or error describes it, and an error
 * marks it invalid. Use it for controls without a built-in label: Select, a
 * native element, a custom control, or (with `group`) a set of radios.
 */
export const Field = forwardRef<HTMLElement, FieldProps>(function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  group = false,
  id: idProp,
  className,
  children,
  ...rest
}, ref) {
  const generatedId = useId()
  // One element child: its own id wins, so the label still points at it.
  const only = !group && Children.count(children) === 1 && isValidElement(children) ? children : null
  const ownProps = (only?.props ?? {}) as Record<string, unknown>
  const id = (ownProps.id as string | undefined) ?? idProp ?? generatedId
  const messageId = `${id}-message`
  const message = error || hint
  const invalid = Boolean(error)

  const context: FieldContextValue = {
    id,
    describedBy: message ? messageId : undefined,
    invalid,
    required,
    disabled,
  }

  const requiredMark = required && (
    <span className="field__required">Required</span>
  )

  const messageNode = message && (
    <p id={messageId} className={cn('field__message', invalid && 'field__message--error')}>
      {invalid && <WarningCircleIcon className="field__message-icon" weight="fill" aria-hidden="true" />}
      {message}
    </p>
  )

  const classes = cn('field', invalid && 'field--error', disabled && 'field--disabled', className)

  if (group) {
    return (
      <fieldset
        {...rest}
        ref={ref as React.Ref<HTMLFieldSetElement>}
        className={cn(classes, 'field--group')}
        aria-describedby={context.describedBy}
        disabled={disabled}
      >
        <legend className="field__label">
          {label}
          {requiredMark}
        </legend>
        <FieldContext.Provider value={null}>{children}</FieldContext.Provider>
        {messageNode}
      </fieldset>
    )
  }

  // One element: wire it directly, without overriding what it already sets.
  const control = only
    ? cloneElement(only as React.ReactElement<Record<string, unknown>>, {
        id,
        'aria-describedby': [ownProps['aria-describedby'], context.describedBy].filter(Boolean).join(' ') || undefined,
        'aria-invalid': ownProps['aria-invalid'] ?? (invalid || undefined),
        required: ownProps.required ?? (required || undefined),
        disabled: ownProps.disabled ?? (disabled || undefined),
      })
    : children

  return (
    <div {...rest} ref={ref as React.Ref<HTMLDivElement>} className={classes}>
      <label htmlFor={id} className="field__label">
        {label}
        {requiredMark}
      </label>
      <FieldContext.Provider value={context}>{control}</FieldContext.Provider>
      {messageNode}
    </div>
  )
})

Field.displayName = 'Field'
