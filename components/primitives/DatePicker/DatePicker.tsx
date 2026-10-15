'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { InputGroup } from '../InputGroup'
import { Input } from '../Input'
import { IconButton } from '../IconButton'
import { Calendar } from '../Calendar'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { compareDays, dateOrder, formatShortDate, parseTypedDate, toISODate } from '../../../lib/date'
import './DatePicker.css'

type DatePickerOwnProps = {
  label: string
  /** Shown under the field. When left out, it shows the format to type, e.g. "dd.mm.åååå". */
  hint?: string
  /** An error from your own validation. Typed dates that can't be read, or fall outside the limits, get their own message. */
  error?: string
  required?: boolean
  disabled?: boolean
  value?: Date | null
  defaultValue?: Date | null
  /** Called with a valid, allowed date, or `null` when cleared. */
  onValueChange?: (date: Date | null) => void
  min?: Date
  max?: Date
  isDateDisabled?: (date: Date) => boolean
  /** Format, order and calendar names. Defaults to the browser's locale. */
  locale?: string
  showWeekNumbers?: boolean
  /** Submits the date as yyyy-mm-dd under this name. */
  name?: string
  id?: string
}

type DatePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & DatePickerOwnProps

const PLACEHOLDER: Record<string, Record<'day' | 'month' | 'year', string>> = {
  da: { day: 'dd', month: 'mm', year: 'åååå' },
  es: { day: 'dd', month: 'mm', year: 'aaaa' },
  default: { day: 'dd', month: 'mm', year: 'yyyy' },
}

/** "dd.mm.åååå" in Danish, "mm/dd/yyyy" in the US: the format to type, in the reader's language. */
export function datePattern(locale?: string) {
  const lang = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale).language
  const words = PLACEHOLDER[lang] ?? PLACEHOLDER.default
  const sample = formatShortDate(new Date(2026, 9, 15), locale)
  const sep = sample.match(/\D+/)?.[0] ?? '/'
  return dateOrder(locale).map(t => words[t]).join(sep)
}

/**
 * A date typed or picked. Typing is the main way in (quickest for dates far
 * from today, like a birthday); the calendar button opens Calendar in a
 * Popover for dates near today. Reads the locale's order and separators,
 * and says plainly when a typed date can't be used.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker({
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
  isDateDisabled,
  locale,
  showWeekNumbers,
  name,
  id,
  className,
  ...rest
}, ref) {
  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<Date | null>(defaultValue)
  const value = controlled ? valueProp : inner
  const [text, setText] = useState(() => (value ? formatShortDate(value, locale) : ''))
  const [problem, setProblem] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const pattern = useMemo(() => datePattern(locale), [locale])

  // Show outside changes (controlled value) in the field.
  useEffect(() => {
    setText(value ? formatShortDate(value, locale) : '')
  }, [value, locale])

  const long = (d: Date) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

  const why = (d: Date) =>
    min && compareDays(d, min) < 0 ? `Choose ${long(min)} or later.`
      : max && compareDays(d, max) > 0 ? `Choose ${long(max)} or earlier.`
        : isDateDisabled?.(d) ? `${long(d)} isn't available. Choose another date.`
          : null

  const commit = (d: Date | null) => {
    if (!controlled) setInner(d)
    if (d?.getTime() !== value?.getTime()) onValueChange?.(d)
  }

  const readTyped = () => {
    const d = parseTypedDate(text, locale)
    if (d === null) { setProblem(null); return commit(null) }
    if (d === undefined) return setProblem(`Enter a date like ${formatShortDate(new Date(2026, 9, 15), locale)}.`)
    const reason = why(d)
    if (reason) return setProblem(reason)
    setProblem(null)
    commit(d)
    setText(formatShortDate(d, locale))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup
          {...rest}
          ref={ref}
          id={id}
          label={label}
          hint={hint ?? pattern}
          error={error ?? problem ?? undefined}
          required={required}
          disabled={disabled}
          className={cn('date-picker', className)}
        >
          <Input
            value={text}
            placeholder={pattern}
            inputMode="numeric"
            autoComplete="off"
            onChange={next => { setText(next); setProblem(null) }}
            onBlur={readTyped}
            onKeyDown={event => {
              if (event.key === 'Enter') readTyped()
              // Alt+ArrowDown opens the calendar, as on a native date field.
              if (event.key === 'ArrowDown' && event.altKey) { event.preventDefault(); setOpen(true) }
            }}
          />
          <PopoverTrigger asChild>
            <IconButton
              variant="secondary"
              icon={<CalendarBlankIcon />}
              label={value ? `Choose ${label}, ${long(value)} chosen` : `Choose ${label}`}
              disabled={disabled}
            />
          </PopoverTrigger>
        </InputGroup>
      </PopoverAnchor>
      {name && <input type="hidden" name={name} value={value ? toISODate(value) : ''} />}
      <PopoverContent aria-label={label} align="end" className="date-picker__popover">
        <Calendar
          label={label}
          autoFocus
          locale={locale}
          showWeekNumbers={showWeekNumbers}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          value={value}
          onValueChange={d => {
            setProblem(null)
            commit(d)
            setText(formatShortDate(d, locale))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
})

DatePicker.displayName = 'DatePicker'
