'use client'

import { forwardRef, useId } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from '../../../lib/cn'
import './Checkbox.css'

type CheckedState = boolean | 'indeterminate'

type CheckboxOwnProps = {
  label?: string
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  'aria-label'?: string
}

// Same pattern AccordionTrigger already established for a Radix-wrapped
// component: type against the real Radix primitive's own props
// (`React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>`), not a
// hand-written list — `onCheckedChange`/`checked`/`defaultChecked` are
// redeclared as own props purely so this file's JSDoc/doc-gen output states
// them explicitly, not because their signature differs from Radix's own.
// `children`/`asChild` explicitly excluded (code review, 2026-09-14): both
// are part of RadixCheckbox.Root's own prop type, so widening to it without
// omitting them let TypeScript admit either — but Checkbox always renders
// its own fixed check/indeterminate icon as Root's children (below), so a
// consumer's `children` is silently discarded, and `asChild` would try to
// merge Root's behavior onto that same fixed icon markup instead of a real
// interactive element, breaking it. Checkbox doesn't support either; the
// type now says so.
type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>,
  'onCheckedChange' | 'checked' | 'defaultChecked' | 'children' | 'asChild'
> & CheckboxOwnProps

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox({
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
  className,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  if (process.env.NODE_ENV !== 'production' && label == null && !ariaLabel) {
    console.warn('[Checkbox] Either label or aria-label is required. A Checkbox without an accessible name violates WCAG 4.1.2.')
  }

  const rootClass = cn('checkbox', disabled && 'checkbox--disabled')

  return (
    <div className={rootClass}>
      <RadixCheckbox.Root
        {...rest}
        ref={ref}
        className={cn('checkbox__root', className)}
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
})

Checkbox.displayName = 'Checkbox'
