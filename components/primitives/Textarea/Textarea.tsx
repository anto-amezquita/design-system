'use client'

import { useId } from 'react'
import { useUncontrolledValue } from '@/lib/useUncontrolledValue'
import { cn } from '@/lib/cn'
import './Textarea.css'

type TextareaProps = {
  id?: string
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
  rows?: number
  maxLength?: number
  characterCount?: boolean
  required?: boolean
  'aria-label'?: string
}

export function Textarea({
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
}: TextareaProps) {
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
          className="textarea-field__textarea"
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
}
