'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { InputGroup, InputAddon } from '../InputGroup'
import { Input } from '../Input'
import { IconButton } from '../IconButton'
import { cn } from '../../../lib/cn'
import './NumberInput.css'

type NumberInputOwnProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Controlled value; `null` is empty. Pair with `onValueChange`. */
  value?: number | null
  /** Starting value when uncontrolled. Empty by default. */
  defaultValue?: number | null
  /** Called with the number (or `null` when cleared) on each valid change. */
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Arrow keys and the − / + buttons move by this. Default 1. */
  step?: number
  /** Page Up / Page Down move by this. Default `step * 10`. */
  largeStep?: number
  /** Number formatting on blur, e.g. `{ maximumFractionDigits: 2 }`. */
  formatOptions?: Intl.NumberFormatOptions
  /** Locale for formatting, e.g. "da-DK" shows 1,5. Defaults to the browser's. Typing accepts either decimal mark. */
  locale?: string
  /** Text joined after the field and read with it: "kr.", "kg", "%". */
  unit?: string
  /** Hide the − / + buttons; the keyboard still steps. */
  hideSteppers?: boolean
  name?: string
  placeholder?: string
  id?: string
}

type NumberInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & NumberInputOwnProps

/**
 * Read what someone typed, forgiving about separators: "1,5" and "1.5" are
 * both one and a half, whatever the locale. With both marks ("1.234,5" or
 * "1,234.5") the last one is the decimal; a mark used more than once
 * ("1.000.000") groups thousands. `null` for empty, `NaN` for not a number.
 */
export function parseNumber(text: string): number | null {
  let t = text.trim().replace(/[\s\u00a0\u202f']/g, '').replace(/[−–]/g, '-')
  if (t === '') return null
  const lastDot = t.lastIndexOf('.')
  const lastComma = t.lastIndexOf(',')
  if (lastDot > -1 && lastComma > -1) {
    const decimal = lastDot > lastComma ? '.' : ','
    const group = decimal === '.' ? ',' : '.'
    t = t.split(group).join('').replace(decimal, '.')
  } else {
    const mark = lastDot > -1 ? '.' : lastComma > -1 ? ',' : null
    if (mark) {
      const count = t.split(mark).length - 1
      t = count > 1 ? t.split(mark).join('') : t.replace(mark, '.')
    }
  }
  return /^-?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN
}

const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length

/**
 * A number typed or stepped: a quantity, an amount, a percentage. The
 * WAI-ARIA spinbutton pattern on a text input, so it accepts the reader's
 * own decimal comma, doesn't change on scroll, and steps with arrows,
 * Page Up / Down and Home / End. Built from InputGroup: label, hint, error,
 * unit and − / + buttons come with it.
 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(function NumberInput({
  label,
  hint,
  error,
  required,
  disabled = false,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep,
  formatOptions,
  locale,
  unit,
  hideSteppers = false,
  name,
  placeholder,
  id,
  className,
  ...rest
}, ref) {
  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<number | null>(defaultValue)
  const value = controlled ? valueProp : inner

  const format = useMemo(() => {
    const f = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20, ...formatOptions })
    return (n: number | null) => (n === null ? '' : f.format(n))
  }, [locale, formatOptions])

  const [text, setText] = useState(() => format(value))
  const [notANumber, setNotANumber] = useState(false) // shown after blur, cleared on the next edit
  const editing = useRef(false)

  // Show outside changes (controlled value, steps) unless the person is mid-typing.
  useEffect(() => {
    if (!editing.current) setText(format(value))
  }, [value, format])

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  // Round to the step's precision, so 0.1 + 0.2 lands on 0.3.
  const tidy = (n: number) => Number(n.toFixed(Math.max(decimalsOf(step), decimalsOf(n) > 10 ? 10 : decimalsOf(n))))

  const commit = (n: number | null) => {
    if (!controlled) setInner(n)
    if (n !== value) onValueChange?.(n)
  }

  const stepBy = (delta: number) => {
    if (disabled) return
    const base = value ?? (delta > 0 ? (min ?? 0) - delta : (max ?? 0) - delta)
    const next = clamp(tidy(base + delta))
    editing.current = false
    commit(next)
    setText(format(next))
  }

  const atMin = value !== null && min !== undefined && value <= min
  const atMax = value !== null && max !== undefined && value >= max

  return (
    <InputGroup
      {...rest}
      ref={ref}
      id={id}
      label={label}
      hint={hint}
      error={error ?? (notANumber ? 'Enter a number.' : undefined)}
      required={required}
      disabled={disabled}
      className={cn('number-input', className)}
    >
      {!hideSteppers && (
        <IconButton
          variant="secondary"
          className="number-input__step"
          icon={<MinusIcon />}
          label={`Decrease ${label}`}
          // Steppers are for pointers; the keyboard steps with arrows (WAI-ARIA spinbutton).
          tabIndex={-1}
          disabled={disabled || atMin}
          onClick={() => stepBy(-step)}
        />
      )}
      <Input
        role="spinbutton"
        inputMode="decimal"
        autoComplete="off"
        name={name}
        placeholder={placeholder}
        value={text}
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={value === null ? undefined : `${format(value)}${unit ? ` ${unit}` : ''}`}
        className="number-input__input"
        onChange={next => {
          editing.current = true
          setNotANumber(false)
          setText(next)
          const n = parseNumber(next)
          if (n === null || !Number.isNaN(n)) commit(n)
        }}
        onBlur={() => {
          editing.current = false
          const n = parseNumber(text)
          if (n === null) return setText('')
          if (Number.isNaN(n)) return setNotANumber(true) // keep what they typed, and say why
          const next = clamp(n)
          commit(next)
          setText(format(next))
        }}
        onKeyDown={event => {
          const big = largeStep ?? step * 10
          const moves: Record<string, () => void> = {
            ArrowUp: () => stepBy(step),
            ArrowDown: () => stepBy(-step),
            PageUp: () => stepBy(big),
            PageDown: () => stepBy(-big),
            ...(min !== undefined && { Home: () => { commit(min); setText(format(min)) } }),
            ...(max !== undefined && { End: () => { commit(max); setText(format(max)) } }),
          }
          const move = moves[event.key]
          if (move) {
            event.preventDefault()
            move()
          }
        }}
      />
      {unit && <InputAddon>{unit}</InputAddon>}
      {!hideSteppers && (
        <IconButton
          variant="secondary"
          className="number-input__step"
          icon={<PlusIcon />}
          label={`Increase ${label}`}
          tabIndex={-1}
          disabled={disabled || atMax}
          onClick={() => stepBy(step)}
        />
      )}
    </InputGroup>
  )
})

NumberInput.displayName = 'NumberInput'
