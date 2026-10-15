'use client'

import { forwardRef, useEffect, useId, useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { Field } from '../Field'
import { Input } from '../Input'
import { InputAddon } from '../InputGroup'
import { IconButton } from '../IconButton'
import { Calendar, type DateRange } from '../Calendar'
import { datePattern } from '../DatePicker'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { FieldContext } from '../../../lib/field'
import { addDays, compareDays, formatShortDate, parseTypedDate, toISODate } from '../../../lib/date'
import '../InputGroup/InputGroup.css'
import './DateRangePicker.css'

export type CompleteRange = { start: Date; end: Date }

type DateRangePickerOwnProps = {
  /** The question, e.g. "Stay" or "Report period". It's the group's legend. */
  label: string
  /** Names of the two fields, read with the label. */
  startLabel?: string
  endLabel?: string
  /** Shown under the fields. Defaults to the format to type. */
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  value?: CompleteRange | null
  defaultValue?: CompleteRange | null
  /** Called with a complete, valid range, or `null` when both fields are cleared. */
  onValueChange?: (range: CompleteRange | null) => void
  min?: Date
  max?: Date
  /** Unavailable days. A range that crosses one is refused, with the day named. */
  isDateDisabled?: (date: Date) => boolean
  locale?: string
  showWeekNumbers?: boolean
  /** Submits `<name>-start` and `<name>-end` as yyyy-mm-dd. */
  name?: string
  id?: string
}

type DateRangePickerProps = Omit<React.HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange' | 'id'> & DateRangePickerOwnProps

/**
 * A start and an end date: a stay, a report period, leave. Two typed fields
 * in the locale's format, joined into one shape, and Calendar's range mode
 * in a Popover. Refuses an end before the start and ranges that cross an
 * unavailable day, and says which.
 */
export const DateRangePicker = forwardRef<HTMLElement, DateRangePickerProps>(function DateRangePicker({
  label,
  startLabel = 'Start date',
  endLabel = 'End date',
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
  const generatedId = useId()
  const baseId = id ?? generatedId
  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<CompleteRange | null>(defaultValue)
  const value = controlled ? valueProp : inner
  const show = (d?: Date | null) => (d ? formatShortDate(d, locale) : '')
  const [startText, setStartText] = useState(() => show(value?.start))
  const [endText, setEndText] = useState(() => show(value?.end))
  const [problem, setProblem] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  // Calendar's own value while choosing: the first end can be on its own.
  const [draft, setDraft] = useState<DateRange | null>(value)

  useEffect(() => {
    setStartText(show(value?.start))
    setEndText(show(value?.end))
    setDraft(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.start?.getTime(), value?.end?.getTime(), locale])

  const long = (d: Date) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

  /** The first reason a range can't be used, in words, or null. */
  const why = (start: Date, end: Date): string | null => {
    if (compareDays(end, start) < 0) return 'The end date is before the start date.'
    if (min && compareDays(start, min) < 0) return `Start on ${long(min)} or later.`
    if (max && compareDays(end, max) > 0) return `End on ${long(max)} or earlier.`
    if (isDateDisabled) {
      for (let d = start; compareDays(d, end) <= 0; d = addDays(d, 1)) {
        if (isDateDisabled(d)) return `The dates include ${long(d)}, which isn't available.`
      }
    }
    return null
  }

  const commit = (next: CompleteRange | null) => {
    if (!controlled) setInner(next)
    const same = next?.start.getTime() === value?.start.getTime() && next?.end.getTime() === value?.end.getTime()
    if (!same) onValueChange?.(next)
  }

  const readTyped = () => {
    const s = parseTypedDate(startText, locale)
    const e = parseTypedDate(endText, locale)
    const example = formatShortDate(new Date(2026, 9, 15), locale)
    if (s === undefined || e === undefined) {
      return setProblem(`Enter ${s === undefined ? 'the start' : 'the end'} date like ${example}.`)
    }
    if (s === null && e === null) { setProblem(null); return commit(null) }
    if (s === null || e === null) return setProblem(null) // half done: wait for the other field
    const reason = why(s, e)
    if (reason) return setProblem(reason)
    setProblem(null)
    commit({ start: s, end: e })
    setStartText(show(s))
    setEndText(show(e))
  }

  const fieldProps = (which: 'start' | 'end') => ({
    'aria-label': which === 'start' ? startLabel : endLabel,
    placeholder: datePattern(locale),
    inputMode: 'numeric' as const,
    autoComplete: 'off',
    onBlur: readTyped,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') readTyped()
      if (event.key === 'ArrowDown' && event.altKey) { event.preventDefault(); setOpen(true) }
    },
  })

  // Each field gets its own id, and the group's hint or error as its description,
  // so a screen reader hears the problem on the field itself, not only on the fieldset.
  const invalid = Boolean(error || problem)
  const fieldContext = (which: 'start' | 'end') => ({
    id: `${baseId}-${which}`,
    describedBy: `${baseId}-message`,
    invalid,
    required: Boolean(required),
    disabled,
  })

  const chosen = value ? `, ${long(value.start)} to ${long(value.end)} chosen` : ''

  return (
    <Popover open={open} onOpenChange={o => { setOpen(o); if (!o) setDraft(value) }}>
      <Field
        {...rest}
        ref={ref}
        id={baseId}
        group
        label={label}
        hint={hint ?? datePattern(locale)}
        error={error ?? problem ?? undefined}
        required={required}
        disabled={disabled}
        className={cn('date-range-picker', invalid && 'input-group--error', className)}
      >
        <PopoverAnchor asChild>
          <div className="input-group__row">
            <FieldContext.Provider value={fieldContext('start')}>
              <Input {...fieldProps('start')} value={startText} onChange={t => { setStartText(t); setProblem(null) }} />
            </FieldContext.Provider>
            <InputAddon aria-hidden="true">–</InputAddon>
            <FieldContext.Provider value={fieldContext('end')}>
              <Input {...fieldProps('end')} value={endText} onChange={t => { setEndText(t); setProblem(null) }} />
            </FieldContext.Provider>
            <PopoverTrigger asChild>
              <IconButton variant="secondary" icon={<CalendarBlankIcon />} label={`Choose ${label}${chosen}`} disabled={disabled} />
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
      </Field>
      {name && (
        <>
          <input type="hidden" name={`${name}-start`} value={value ? toISODate(value.start) : ''} />
          <input type="hidden" name={`${name}-end`} value={value ? toISODate(value.end) : ''} />
        </>
      )}
      <PopoverContent aria-label={label} align="end" className="date-range-picker__popover">
        <Calendar
          mode="range"
          label={label}
          autoFocus
          locale={locale}
          showWeekNumbers={showWeekNumbers}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          value={draft}
          onValueChange={range => {
            setDraft(range)
            if (range.end) {
              const reason = why(range.start, range.end)
              setStartText(show(range.start))
              setEndText(show(range.end))
              if (reason) { setProblem(reason); return }
              setProblem(null)
              commit({ start: range.start, end: range.end })
              setOpen(false)
            } else {
              setStartText(show(range.start))
              setEndText('')
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
})

DateRangePicker.displayName = 'DateRangePicker'
