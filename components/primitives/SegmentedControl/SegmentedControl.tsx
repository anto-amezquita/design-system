'use client'

import { forwardRef } from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { cn } from '../../../lib/cn'
import './SegmentedControl.css'

export type SegmentedControlOption = {
  value: string
  /** Visible text. With `hideLabels`, it's the segment's accessible name instead. */
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

type SegmentedControlOwnProps = {
  /** Two to five choices; more than that belongs in a Select. */
  options: SegmentedControlOption[]
  /** The group's accessible name, e.g. "View". Required: the segments alone don't say what they choose. */
  label: string
  /** Controlled value. Pair with `onValueChange`. */
  value?: string
  /** Starting value when uncontrolled. Defaults to the first option, so one is always chosen. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Show only icons; each option's `label` becomes its accessible name. Every option needs an `icon`. */
  hideLabels?: boolean
  /** Stretch to the container's width, segments sharing it equally. */
  fullWidth?: boolean
  disabled?: boolean
  /** Submits the value with a form under this name. */
  name?: string
}

// decisions/0007: native attributes reach the group element.
type SegmentedControlProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'dir' | 'onChange'> & SegmentedControlOwnProps

/**
 * One choice from a few, shown side by side: a view switch, a time range.
 * A radio group underneath (Radix), so arrow keys move and choose, and Tab
 * enters and leaves the group as one stop. The chosen segment is filled with
 * the accent, the same "fill means on" as ToggleButton.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  hideLabels = false,
  fullWidth = false,
  disabled = false,
  name,
  className,
  ...rest
}, ref) {
  return (
    <RadixRadioGroup.Root
      {...rest}
      ref={ref}
      aria-label={label}
      orientation="horizontal"
      loop
      name={name}
      value={value}
      defaultValue={value === undefined ? (defaultValue ?? options[0]?.value) : undefined}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn('segmented-control', fullWidth && 'segmented-control--full-width', hideLabels && 'segmented-control--icons', className)}
    >
      {options.map(option => (
        <RadixRadioGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          aria-label={hideLabels ? option.label : undefined}
          className="segmented-control__item"
        >
          {option.icon && <span className="segmented-control__icon" aria-hidden="true">{option.icon}</span>}
          {!hideLabels && <span className="segmented-control__label">{option.label}</span>}
        </RadixRadioGroup.Item>
      ))}
    </RadixRadioGroup.Root>
  )
})

SegmentedControl.displayName = 'SegmentedControl'
