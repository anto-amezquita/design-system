'use client'

import { useId } from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { cn } from '../../../lib/cn'
import './Radio.css'

type RadioOption = {
  value: string
  label: string
  disabled?: boolean
}

type RadioGroupProps = {
  id?: string
  name?: string
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function RadioGroup({
  id: idProp,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RadioGroupProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  const groupClass = cn('radio-group', orientation === 'horizontal' && 'radio-group--horizontal')

  return (
    <RadixRadioGroup.Root
      className={groupClass}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation={orientation}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {options.map((option) => {
        const itemId = `${id}-${option.value}`
        const isDisabled = disabled || option.disabled

        return (
          <div
            key={option.value}
            className={cn('radio', isDisabled && 'radio--disabled')}
          >
            <RadixRadioGroup.Item
              className="radio__item"
              id={itemId}
              value={option.value}
              disabled={isDisabled}
            >
              <RadixRadioGroup.Indicator className="radio__indicator" />
            </RadixRadioGroup.Item>
            <label className="radio__label" htmlFor={itemId}>
              {option.label}
            </label>
          </div>
        )
      })}
    </RadixRadioGroup.Root>
  )
}
