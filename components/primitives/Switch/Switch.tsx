'use client'

import { useId } from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@/lib/cn'
import './Switch.css'

type SwitchProps = {
  id?: string
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  'aria-label'?: string
}

export function Switch({
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
}: SwitchProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  if (process.env.NODE_ENV !== 'production' && label == null && !ariaLabel) {
    console.warn('[Switch] Either label or aria-label is required. A Switch without an accessible name violates WCAG 4.1.2.')
  }

  return (
    <div className={cn('switch', disabled && 'switch--disabled')}>
      <RadixSwitch.Root
        className="switch__track"
        id={id}
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        aria-label={!label ? ariaLabel : undefined}
      >
        <RadixSwitch.Thumb className="switch__thumb" />
      </RadixSwitch.Root>
      {label && (
        <label className="switch__label" htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  )
}
