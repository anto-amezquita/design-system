'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { CaretDownIcon } from '@phosphor-icons/react'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import { useField } from '../../../lib/field'
import './Select.css'

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectGroup = {
  label?: string
  options: SelectOption[]
}

type SelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  groups: SelectGroup[]
  /** The trigger is a combobox, which gets no accessible name from its
      content. Required on its own; inside a Field, the Field's label names
      it and this can be left out. */
  'aria-label'?: string
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  disabled = false,
  required = false,
  name,
  groups,
  'aria-label': ariaLabel,
}: SelectProps) {
  // Inside a Field: its <label htmlFor> names the trigger, its hint or error describes it.
  const field = useField()
  if (process.env.NODE_ENV !== 'production' && !field && !ariaLabel) {
    console.warn('[Select] Give it an aria-label, or put it in a Field, so the trigger has an accessible name (WCAG 4.1.2).')
  }
  // Content portals to <body>; this keeps a ThemeScope's brand and mode on it (decisions/0021).
  const scope = useThemeScopeAttributes()
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled || field?.disabled}
      required={required || field?.required}
      name={name}
    >
      <RadixSelect.Trigger
        className="select__trigger"
        id={field?.id}
        aria-label={ariaLabel}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
      >
        <span className="select__value">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon className="select__icon">
          <CaretDownIcon size={16} weight="regular" aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content {...scope} className="select__content" position="popper" sideOffset={4}>
          <RadixSelect.Viewport className="select__viewport">
            {groups.map((group, groupIndex) => (
              <RadixSelect.Group key={group.label ?? groupIndex}>
                {group.label && (
                  <RadixSelect.Label className="select__label">
                    {group.label}
                  </RadixSelect.Label>
                )}
                {group.options.map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={option.value}
                    className="select__item"
                    disabled={option.disabled}
                  >
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  </RadixSelect.Item>
                ))}
                {groupIndex < groups.length - 1 && (
                  <RadixSelect.Separator className="select__separator" />
                )}
              </RadixSelect.Group>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
