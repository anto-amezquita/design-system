'use client'

import { useId } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from '../../../lib/cn'
import './Checkbox.css'

type CheckedState = boolean | 'indeterminate'

type CheckboxProps = {
  id?: string
  label?: string
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  'aria-label'?: string
}

export function Checkbox({
  id: idProp,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  required = false,
  name,
  value,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  if (process.env.NODE_ENV !== 'production' && label == null && !ariaLabel) {
    console.warn('[Checkbox] Either label or aria-label is required. A Checkbox without an accessible name violates WCAG 4.1.2.')
  }

  const rootClass = cn('checkbox', disabled && 'checkbox--disabled')

  return (
    <div className={rootClass}>
      <RadixCheckbox.Root
        className="checkbox__root"
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        aria-label={!label ? ariaLabel : undefined}
      >
        <RadixCheckbox.Indicator className="checkbox__indicator" forceMount>
          <svg
            className="checkbox__icon checkbox__icon--check"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg
            className="checkbox__icon checkbox__icon--indeterminate"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label && (
        <label className="checkbox__label" htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  )
}
