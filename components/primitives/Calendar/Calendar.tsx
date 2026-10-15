'use client'

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { IconButton } from '../IconButton'
import { cn } from '../../../lib/cn'
import {
  addDays, addMonths, clampDay, compareDays, firstDayOfWeek, isoWeek, isSameDay,
  monthGrid, startOfDay, startOfMonth,
} from '../../../lib/date'
import './Calendar.css'

export type DateRange = { start: Date; end: Date | null }

type CommonProps = {
  /** Names the calendar for screen readers, e.g. "Delivery date". The month and year are added. */
  label?: string
  /** Earliest choosable day. */
  min?: Date
  /** Latest choosable day. */
  max?: Date
  /** Days that can't be chosen: closed days, booked dates. Still reachable with the keyboard, announced as unavailable. */
  isDateDisabled?: (date: Date) => boolean
  /** Month and day names, and the first day of the week. Defaults to the browser's locale. */
  locale?: string
  /** Override the first day of the week (0 = Sunday, 1 = Monday). */
  weekStartsOn?: number
  /** ISO week numbers in a first column, as Danish calendars show them. */
  showWeekNumbers?: boolean
  /** The month to open on when nothing is chosen. Defaults to today's. */
  defaultMonth?: Date
  /** Focus the chosen (or today's) day on mount, e.g. when opened in a popover. */
  autoFocus?: boolean
}

type SingleProps = CommonProps & {
  mode?: 'single'
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date) => void
}

type RangeProps = CommonProps & {
  mode: 'range'
  value?: DateRange | null
  defaultValue?: DateRange | null
  /** Called on each press: first with `{ start, end: null }`, then with both ends. */
  onValueChange?: (range: DateRange) => void
}

type CalendarProps = (SingleProps | RangeProps) & Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

/**
 * A month of days to choose one date or a range. The WAI-ARIA date grid:
 * one Tab stop, arrows move by day and week, Page Up / Down by month
 * (with Shift, by year), Home / End to the ends of the week, Enter or
 * Space to choose. Names and the first weekday come from the locale.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    label, min, max, isDateDisabled, locale, weekStartsOn, showWeekNumbers = false,
    defaultMonth, autoFocus = false, mode = 'single', value: valueProp, defaultValue,
    onValueChange, className, ...rest
  } = props as CommonProps & {
    mode?: 'single' | 'range'
    value?: Date | DateRange | null
    defaultValue?: Date | DateRange | null
    onValueChange?: (v: Date | DateRange) => void
  } & Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

  const range = mode === 'range'
  const headingId = useId()
  const gridRef = useRef<HTMLTableElement>(null)
  const today = useMemo(() => startOfDay(new Date()), [])
  const weekStart = weekStartsOn ?? firstDayOfWeek(locale)

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<Date | DateRange | null>(defaultValue ?? null)
  const value = controlled ? valueProp : inner
  const single = !range ? (value as Date | null) : null
  const span = range ? (value as DateRange | null) : null

  const anchor = single ?? span?.start ?? defaultMonth ?? today
  const [focused, setFocused] = useState(() => clampDay(anchor, min, max))
  const [hovered, setHovered] = useState<Date | null>(null)
  const moveFocus = useRef(autoFocus)

  // Put DOM focus on the focused day after a keyboard move (not on every render).
  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  }, [focused])

  const fmt = useMemo(() => ({
    monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    full: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
  }), [locale])

  // Seven weekday names starting at weekStart (2026-01-04 is a Sunday).
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 0, 4 + ((weekStart + i) % 7)))
  const weeks = monthGrid(focused, weekStart)

  const unavailable = (d: Date) =>
    (min && compareDays(d, min) < 0) || (max && compareDays(d, max) > 0) || Boolean(isDateDisabled?.(d))

  const go = (d: Date, viaKeyboard = true) => {
    moveFocus.current = viaKeyboard
    setFocused(clampDay(d, min, max))
  }

  const choose = (d: Date) => {
    if (unavailable(d)) return
    let next: Date | DateRange
    if (!range) next = d
    else if (!span || span.end) next = { start: d, end: null }
    else next = compareDays(d, span.start) < 0 ? { start: d, end: span.start } : { start: span.start, end: d }
    if (!controlled) setInner(next)
    onValueChange?.(next)
    setFocused(d)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const k = event.key
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -((focused.getDay() - weekStart + 7) % 7)),
      End: () => addDays(focused, 6 - ((focused.getDay() - weekStart + 7) % 7)),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    }
    if (getComputedStyle(event.currentTarget).direction === 'rtl') {
      ;[moves.ArrowLeft, moves.ArrowRight] = [moves.ArrowRight, moves.ArrowLeft]
    }
    if (moves[k]) {
      event.preventDefault()
      go(moves[k]())
    } else if (k === 'Enter' || k === ' ') {
      event.preventDefault()
      choose(focused)
    }
  }

  // Range preview: while one end is chosen, the pointer or keyboard focus shows the other.
  const pendingEnd = span && !span.end ? (hovered ?? focused) : null
  const rangeEnds = span
    ? (() => {
        const other = span.end ?? pendingEnd ?? span.start
        return compareDays(other, span.start) < 0 ? [other, span.start] : [span.start, other]
      })()
    : null

  const prevDisabled = min ? !(compareDays(addDays(startOfMonth(focused), -1), min) >= 0) : false
  const nextDisabled = max ? !(compareDays(startOfMonth(addMonths(focused, 1)), max) <= 0) : false

  return (
    <div {...rest} ref={ref} className={cn('calendar', className)}>
      <div className="calendar__header">
        <IconButton
          size="sm"
          variant="ghost"
          icon={<CaretLeftIcon />}
          label="Previous month"
          disabled={prevDisabled}
          onClick={() => go(addMonths(focused, -1), false)}
        />
        <h2 id={headingId} className="calendar__title" aria-live="polite">
          {fmt.monthYear.format(focused)}
        </h2>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<CaretRightIcon />}
          label="Next month"
          disabled={nextDisabled}
          onClick={() => go(addMonths(focused, 1), false)}
        />
      </div>

      <table
        ref={gridRef}
        role="grid"
        // aria-labelledby would win over aria-label, so a label gets the month added by hand.
        aria-labelledby={label ? undefined : headingId}
        aria-label={label ? `${label}, ${fmt.monthYear.format(focused)}` : undefined}
        aria-multiselectable={range || undefined}
        className={cn('calendar__grid', showWeekNumbers && 'calendar__grid--weeks')}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHovered(null)}
      >
        <thead>
          <tr>
            {showWeekNumbers && <th scope="col" className="calendar__weeknum"><abbr title="Week">Wk</abbr></th>}
            {weekdays.map(d => (
              <th key={d.getDay()} scope="col" className="calendar__weekday">
                <abbr title={fmt.weekdayLong.format(d)}>{fmt.weekdayShort.format(d)}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {showWeekNumbers && (
                <th scope="row" className="calendar__weeknum">{isoWeek(week.find(Boolean)!)}</th>
              )}
              {week.map((day, i) => {
                if (!day) return <td key={i} className="calendar__blank" />
                const isFocused = isSameDay(day, focused)
                const isToday = isSameDay(day, today)
                const off = unavailable(day)
                const inRange = rangeEnds && compareDays(day, rangeEnds[0]) >= 0 && compareDays(day, rangeEnds[1]) <= 0
                const isStart = rangeEnds && isSameDay(day, rangeEnds[0])
                const isEnd = rangeEnds && isSameDay(day, rangeEnds[1])
                const selected = range
                  ? Boolean(span && (isSameDay(day, span.start) || isSameDay(day, span.end) || (span.end && inRange)))
                  : isSameDay(day, single)
                return (
                  <td
                    key={i}
                    role="gridcell"
                    tabIndex={isFocused ? 0 : -1}
                    aria-selected={selected}
                    aria-disabled={off || undefined}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={fmt.full.format(day)}
                    className={cn(
                      'calendar__day',
                      // Filled: the chosen day, or a range's two ends. The days between sit on the band.
                      (range ? Boolean(isStart || isEnd) && Boolean(span) : selected) && 'calendar__day--selected',
                      isToday && 'calendar__day--today',
                      off && 'calendar__day--disabled',
                      inRange && !(isStart && isEnd) && 'calendar__day--in-range',
                      isStart && !isEnd && 'calendar__day--range-start',
                      isEnd && !isStart && 'calendar__day--range-end',
                      range && span && !span.end && inRange && 'calendar__day--preview',
                    )}
                    onClick={() => { setFocused(day); choose(day) }}
                    onPointerEnter={() => range && setHovered(day)}
                    onFocus={() => { if (!isFocused) setFocused(day) }}
                  >
                    {/* The plain number: Intl writes "15." in Danish, which reads oddly in a grid.
                        The cell's name carries the full, localised date. */}
                    <span className="calendar__day-number" aria-hidden="true">{day.getDate()}</span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

Calendar.displayName = 'Calendar'
