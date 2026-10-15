'use client'

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ClockIcon } from '@phosphor-icons/react'
import { InputGroup } from '../InputGroup'
import { Input } from '../Input'
import { Popover, PopoverAnchor, PopoverContent } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { formatTime, parseTypedTime, timeSlots, toMinutes, uses12Hour } from '../../../lib/time'
import './TimePicker.css'

type TimePickerOwnProps = {
  label: string
  /** Shown under the field. Defaults to an example, e.g. "For example 14.30". */
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** "HH:mm", 24-hour, the same as a native time input. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (time: string | null) => void
  /** Earliest time, "HH:mm". */
  min?: string
  /** Latest time, "HH:mm". */
  max?: string
  /** Minutes between the suggested times in the list. Default 15. Typed times can fall between them. */
  step?: number
  /** 12- or 24-hour clock and separators. Defaults to the browser's locale. */
  locale?: string
  /** Submits the time as "HH:mm". */
  name?: string
  id?: string
}

type TimePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & TimePickerOwnProps

/**
 * A time of day, typed or picked from a list of slots. The WAI-ARIA
 * combobox pattern: focus stays in the field, Arrow Down opens the list
 * and moves through it, Enter picks, Escape closes. Typing is forgiving
 * ("1430", "2pm", "9") and the display follows the locale's clock.
 */
export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker({
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
  step = 15,
  locale,
  name,
  id,
  className,
  ...rest
}, ref) {
  const listId = useId()
  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<string | null>(defaultValue)
  const value = controlled ? valueProp : inner
  const show = (t: string | null) => (t ? formatTime(t, locale) : '')
  const [text, setText] = useState(() => show(value))
  const [problem, setProblem] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  const slots = useMemo(() => timeSlots(step, min, max), [step, min, max])
  const example = formatTime('14:30', locale)

  useEffect(() => { setText(show(value)) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale])

  // The slot nearest the chosen (or typed) time, so the list opens where it matters.
  const nearest = (t: string | null) => {
    if (!t) return Math.max(0, slots.findIndex(s => s >= '08:00'))
    const n = toMinutes(t)
    let best = 0
    slots.forEach((s, i) => { if (Math.abs(toMinutes(s) - n) < Math.abs(toMinutes(slots[best]) - n)) best = i })
    return best
  }

  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, active])

  const commit = (t: string | null) => {
    if (!controlled) setInner(t)
    if (t !== value) onValueChange?.(t)
  }

  const pick = (t: string) => {
    setProblem(null)
    commit(t)
    setText(show(t))
    setOpen(false)
  }

  const readTyped = () => {
    const t = parseTypedTime(text)
    if (t === null) { setProblem(null); return commit(null) }
    if (t === undefined) return setProblem(`Enter a time like ${example}.`)
    if (min && t < min) return setProblem(`Choose ${show(min)} or later.`)
    if (max && t > max) return setProblem(`Choose ${show(max)} or earlier.`)
    setProblem(null)
    commit(t)
    setText(show(t))
  }

  const openAt = (index: number) => { setOpen(true); setActive(index) }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const last = slots.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openAt(nearest(parseTypedTime(text) ?? value))
        else setActive(a => Math.min(last, a + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openAt(nearest(parseTypedTime(text) ?? value))
        else setActive(a => Math.max(0, a - 1))
        break
      case 'PageDown':
        if (open) { event.preventDefault(); setActive(a => Math.min(last, a + Math.round(60 / step))) }
        break
      case 'PageUp':
        if (open) { event.preventDefault(); setActive(a => Math.max(0, a - Math.round(60 / step))) }
        break
      case 'Home':
        if (open) { event.preventDefault(); setActive(0) }
        break
      case 'End':
        if (open) { event.preventDefault(); setActive(last) }
        break
      case 'Enter':
        if (open && active >= 0) { event.preventDefault(); pick(slots[active]) }
        else readTyped()
        break
      case 'Escape':
        if (open) { event.preventDefault(); setOpen(false) }
        break
    }
  }

  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup
          {...rest}
          ref={ref}
          id={id}
          label={label}
          hint={hint ?? `For example ${example}`}
          error={error ?? problem ?? undefined}
          required={required}
          disabled={disabled}
          className={cn('time-picker', className)}
        >
          {/* Decorative: a plain span, not an InputAddon, so it isn't added to the field's description. */}
          <span aria-hidden="true" className="input-group__addon time-picker__icon"><ClockIcon /></span>
          <Input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="none"
            aria-activedescendant={activeId}
            inputMode={uses12Hour(locale) ? 'text' : 'numeric'}
            autoComplete="off"
            placeholder={example}
            value={text}
            onChange={t => { setText(t); setProblem(null) }}
            onBlur={() => { if (!open) readTyped() }}
            onKeyDown={onKeyDown}
            onClick={() => !disabled && !open && openAt(nearest(parseTypedTime(text) ?? value))}
          />
        </InputGroup>
      </PopoverAnchor>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <PopoverContent
        // The panel is only a frame; the scrolling list inside is the listbox.
        role="presentation"
        align="start"
        sideOffset={4}
        className="time-picker__popover"
        // Focus stays in the field: that's the combobox pattern.
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        onInteractOutside={e => {
          // A click on the field itself shouldn't close and reopen the list.
          if ((e.target as Element).closest?.('.time-picker')) e.preventDefault()
          else readTyped()
        }}
      >
        {/* tabIndex -1: the keyboard works from the field (aria-activedescendant), but
            a scrolling region must be focusable (axe: scrollable-region-focusable). */}
        <ul ref={listRef} id={listId} role="listbox" aria-label={label} tabIndex={-1} className="time-picker__list">
          {slots.map((slot, i) => (
            <li
              key={slot}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={slot === value}
              className={cn('time-picker__option', i === active && 'time-picker__option--active', slot === value && 'time-picker__option--selected')}
              // Keep focus in the field while clicking an option.
              onPointerDown={e => e.preventDefault()}
              onClick={() => pick(slot)}
              onPointerMove={() => setActive(i)}
            >
              {show(slot)}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
})

TimePicker.displayName = 'TimePicker'
