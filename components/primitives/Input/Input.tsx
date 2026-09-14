'use client'

import { forwardRef, useId } from 'react'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import { cn } from '../../../lib/cn'
import './Input.css'

// `children` excluded (same latent gap the code review flagged on Textarea,
// 2026-09-14): part of the native input attributes type via DOMAttributes,
// but <input> is a void element — passing children through `...rest` onto
// it is invalid DOM and React treats it as an error, not just a warning.
type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'defaultValue' | 'prefix' | 'type' | 'children'
> & {
  type?: 'text' | 'email' | 'password' | 'url' | 'search' | 'tel'
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onClear?: () => void
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  clearable?: boolean
  search?: boolean
  searchLabel?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  id: idProp,
  type = 'text',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onClear,
  disabled = false,
  error,
  hint,
  prefix,
  suffix,
  clearable = false,
  search = false,
  searchLabel = 'Search',
  'aria-label': ariaLabel,
  className,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  // Truthy error overrides hint; falsy error (including '') falls through to hint — consistent with fieldClass and aria-invalid.
  const hintText = error || hint
  const hasHint = Boolean(hintText)

  if (process.env.NODE_ENV !== 'production' && !label && !ariaLabel && !search) {
    console.warn('[Input] Provide a label, aria-label, or search prop so the input has an accessible name (WCAG 4.1.2).')
  }

  const [currentValue, isControlled, setInternalValue] = useUncontrolledValue(value, defaultValue)
  const showClear = clearable && !disabled && currentValue !== '' && (!isControlled || Boolean(onChange))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (!isControlled) setInternalValue(val)
    onChange?.(val)
  }

  function handleClear() {
    if (!isControlled) setInternalValue('')
    onChange?.('')
    onClear?.()
  }

  const resolvedPrefix = prefix !== undefined ? prefix : (search ? <MagnifyingGlassIcon size={16} aria-hidden="true" /> : null)

  const wrapperClass = cn(
    'input-field__wrapper',
    disabled && 'input-field__wrapper--disabled',
  )

  const fieldClass = cn(
    'input-field',
    error && 'input-field--error',
    search && 'input-field--search',
  )

  return (
    <div className={fieldClass}>
      {label && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={wrapperClass}>
        {resolvedPrefix && (
          <span className="input-field__prefix" aria-hidden="true">
            {resolvedPrefix}
          </span>
        )}
        <input
          {...rest}
          ref={ref}
          className={cn('input-field__input', className)}
          id={id}
          type={type}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={!label ? (ariaLabel ?? (search ? searchLabel : undefined)) : undefined}
          aria-describedby={hasHint ? hintId : undefined}
          aria-invalid={error ? true : undefined}
        />
        {suffix && (
          <span className="input-field__suffix" aria-hidden="true">
            {suffix}
          </span>
        )}
        {showClear && (
          <button
            className="input-field__clear"
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <XIcon size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      {hasHint && (
        <span className="input-field__hint" id={hintId}>
          {hintText}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'
