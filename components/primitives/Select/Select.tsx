'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { CaretDownIcon } from '@phosphor-icons/react'
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
  /** Renders the dropdown open on mount, uncontrolled. Story/testing use
      only — lets a visual-testing tool (Chromatic) capture the portal-mounted
      content without a click, since Radix closes the select on any window
      blur (see SelectContent's `window.addEventListener('blur', close)`),
      which a screenshot tool's own capture step can trigger. */
  defaultOpen?: boolean
  /** Required: the trigger is a combobox, which gets no accessible name from
      its content — without this, screen readers announce an unnamed control. */
  'aria-label': string
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
  defaultOpen,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
      name={name}
      defaultOpen={defaultOpen}
    >
      <RadixSelect.Trigger className="select__trigger" aria-label={ariaLabel}>
        <span className="select__value">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon className="select__icon">
          <CaretDownIcon size={16} weight="regular" aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className="select__content" position="popper" sideOffset={4}>
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
