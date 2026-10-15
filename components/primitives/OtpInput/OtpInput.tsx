'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Field } from '../Field'
import { useField } from '../../../lib/field'
import { cn } from '../../../lib/cn'
import './OtpInput.css'

type OtpInputOwnProps = {
  /** What the code is, e.g. "Verification code". */
  label: string
  /** Where the code comes from: "We sent it to +45 •• •• •• 12." */
  hint?: string
  error?: string
  /** Number of characters. Default 6. */
  length?: number
  /** `numeric` (default) keeps digits only and brings up the number pad; `alphanumeric` keeps letters too, uppercased. */
  mode?: 'numeric' | 'alphanumeric'
  value?: string
  defaultValue?: string
  onValueChange?: (code: string) => void
  /** Called once the last character is in, e.g. to submit straight away. */
  onComplete?: (code: string) => void
  disabled?: boolean
  name?: string
  autoFocus?: boolean
}

type OtpInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> & OtpInputOwnProps

/**
 * A short code sent by text or email. One real input (so paste, SMS
 * autofill and screen readers all work as usual) with the boxes drawn
 * behind it. Label, hint and error come from Field.
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput({
  label,
  hint,
  error,
  length = 6,
  mode = 'numeric',
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onComplete,
  disabled = false,
  name,
  autoFocus,
  className,
  ...rest
}, ref) {
  return (
    <Field {...rest} label={label} hint={hint} error={error} disabled={disabled} className={cn('otp-input', className)}>
      <OtpBoxes
        ref={ref}
        length={length}
        mode={mode}
        value={valueProp}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onComplete={onComplete}
        name={name}
        autoFocus={autoFocus}
      />
    </Field>
  )
})

OtpInput.displayName = 'OtpInput'

type OtpBoxesProps = Pick<OtpInputOwnProps, 'length' | 'mode' | 'value' | 'defaultValue' | 'onValueChange' | 'onComplete' | 'name' | 'autoFocus'>

const OtpBoxes = forwardRef<HTMLInputElement, OtpBoxesProps>(function OtpBoxes(
  { length = 6, mode = 'numeric', value: valueProp, defaultValue = '', onValueChange, onComplete, name, autoFocus },
  ref,
) {
  const field = useField()
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const clean = (raw: string) =>
    (mode === 'numeric' ? raw.replace(/\D/g, '') : raw.replace(/[^a-z0-9]/gi, '').toUpperCase()).slice(0, length)

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState(() => clean(defaultValue))
  const code = controlled ? clean(valueProp) : inner
  const [focused, setFocused] = useState(false)
  const [caret, setCaret] = useState(code.length)

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? code.length)

  // The box that shows where the next character goes.
  const active = Math.min(caret, length - 1)

  return (
    <div className={cn('otp-input__boxes', field?.invalid && 'otp-input__boxes--error')} style={{ '--otp-length': length } as React.CSSProperties}>
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('otp-input__box', focused && i === active && 'otp-input__box--active', code[i] && 'otp-input__box--filled')}
        >
          {code[i] ?? ''}
        </span>
      ))}
      <input
        ref={inputRef}
        id={field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        disabled={field?.disabled}
        name={name}
        className="otp-input__native"
        value={code}
        // Lets the phone offer the code from the SMS, and password managers fill it.
        autoComplete="one-time-code"
        inputMode={mode === 'numeric' ? 'numeric' : 'text'}
        pattern={mode === 'numeric' ? `\\d{${length}}` : undefined}
        // No maxLength: the browser would cut "482 913" before the space is
        // dropped, losing the last digit. clean() trims to `length` instead.
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        onFocus={() => { setFocused(true); syncCaret() }}
        onBlur={() => setFocused(false)}
        onSelect={syncCaret}
        onKeyUp={syncCaret}
        onChange={event => {
          const next = clean(event.target.value)
          if (!controlled) setInner(next)
          onValueChange?.(next)
          setCaret(event.target.selectionStart ?? next.length)
          if (next.length === length && code.length !== length) onComplete?.(next)
        }}
      />
    </div>
  )
})
