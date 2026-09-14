'use client'

import { forwardRef, useId } from 'react'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import { cn } from '../../../lib/cn'
import './Textarea.css'

type TextareaOwnProps = {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  hint?: string
  characterCount?: boolean
  'aria-label'?: string
}

// Same shape as Input.tsx: extend the real native element's attributes,
// only `Omit` the ones whose own-prop signature genuinely differs
// (`onChange` takes a value, not an event; `value`/`defaultValue` are
// redeclared alongside it so all three stay in sync as a group) — every
// other native attribute (`rows`, `maxLength`, `disabled`, `required`,
// `placeholder`, `className`, and everything decisions/0007 was written
// about — `onKeyDown`, `onBlur`, `ref`) passes through unchanged via `...rest`.
// `children` explicitly excluded (code review, 2026-09-14): part of the
// native textarea attributes type via DOMAttributes, but Textarea is a
// controlled component driven by `value`/`onChange` — a consumer-supplied
// `children` would land in `...rest` and get spread onto a controlled
// <textarea>, which triggers React's own dev warning and risks a hydration
// mismatch. Textarea doesn't support children; the type now says so.
type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'value' | 'defaultValue' | 'children'
> & TextareaOwnProps

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  id: idProp,
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  disabled = false,
  error,
  hint,
  rows = 3,
  maxLength,
  characterCount = false,
  required = false,
  'aria-label': ariaLabel,
  className,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const countId = `${id}-count`
  const hasHint = Boolean(error || hint)

  const [currentValue, isControlled, setInternalValue] = useUncontrolledValue(value, defaultValue)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    if (!isControlled) setInternalValue(val)
    onChange?.(val)
  }

  const fieldClass = cn(
    'textarea-field',
    error && 'textarea-field--error',
  )

  const wrapperClass = cn(
    'textarea-field__wrapper',
    disabled && 'textarea-field__wrapper--disabled',
  )

  const showCount = characterCount || maxLength !== undefined
  const describedBy = [hasHint ? hintId : '', showCount ? countId : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={fieldClass}>
      {label && (
        <label className="textarea-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={wrapperClass}>
        <textarea
          {...rest}
          ref={ref}
          className={cn('textarea-field__textarea', className)}
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-label={!label ? ariaLabel : undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {hasHint && (
        <span className="textarea-field__hint" id={hintId}>
          {error || hint}
        </span>
      )}
      {showCount && (
        <span className="textarea-field__count" id={countId} aria-live="polite" aria-atomic="true">
          {currentValue.length}{maxLength !== undefined ? `/${maxLength}` : ''}
        </span>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
