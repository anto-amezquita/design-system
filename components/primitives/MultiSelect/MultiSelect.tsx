'use client'

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react'
import { InputGroup } from '../InputGroup'
import { Input } from '../Input'
import { IconButton } from '../IconButton'
import { Tag } from '../Tag'
import { VisuallyHidden } from '../VisuallyHidden'
import type { ComboboxOption } from '../Combobox/Combobox'
import { Highlight } from '../../../lib/highlight'
import { Popover, PopoverAnchor, PopoverContent } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { rankMatches } from '../../../lib/match'
import '../Combobox/Combobox.css'
import './MultiSelect.css'

export type MultiSelectOption = ComboboxOption

type MultiSelectOwnProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  options: Array<string | MultiSelectOption>
  /** The chosen options' values, in the order they were chosen. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  /** The most that can be chosen. Other options become unavailable once it's reached. */
  max?: number
  /** Shown when nothing matches. Gets the typed text. */
  emptyMessage?: (text: string) => string
  placeholder?: string
  /** Submits each value under this name, like a `<select multiple>`. */
  name?: string
  id?: string
}

type MultiSelectProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & MultiSelectOwnProps

const toOption = (o: string | MultiSelectOption): MultiSelectOption => (typeof o === 'string' ? { value: o } : o)
const labelOf = (o: MultiSelectOption) => o.label ?? o.value

/**
 * Several values from a long list, found by typing. A combobox over a
 * multi-selectable listbox: the list stays open while you pick, Enter or a
 * click adds or removes, and the chosen items sit below the field as tags
 * with their own Remove buttons. Backspace in the empty field removes the
 * last one. Each change is announced.
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect({
  label,
  hint,
  error,
  required,
  disabled = false,
  options: optionsProp,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  max,
  emptyMessage = text => (text.trim() ? `No matches for “${text.trim()}”` : 'No options'),
  placeholder,
  name,
  id,
  className,
  ...rest
}, ref) {
  const baseId = useId()
  const listId = `${baseId}-list`
  const summaryId = `${baseId}-chosen`
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const tagsRef = useRef<HTMLUListElement>(null)
  const options = useMemo(() => optionsProp.map(toOption), [optionsProp])

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<string[]>(defaultValue)
  const value = controlled ? valueProp : inner
  const chosen = new Set(value)

  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [announcement, setAnnouncement] = useState('')

  const shown = useMemo(() => rankMatches(options, text, o => `${labelOf(o)} ${o.description ?? ''}`), [options, text])
  const full = max !== undefined && value.length >= max
  const unavailable = (o: MultiSelectOption) => Boolean(o.disabled) || (full && !chosen.has(o.value))
  const nameOf = (v: string) => { const o = options.find(x => x.value === v); return o ? labelOf(o) : v }

  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const commit = (next: string[]) => {
    if (!controlled) setInner(next)
    onValueChange?.(next)
  }

  const countText = (n: number) => `${n} chosen`

  const toggle = (o: MultiSelectOption) => {
    if (chosen.has(o.value)) {
      const next = value.filter(v => v !== o.value)
      commit(next)
      setAnnouncement(`${labelOf(o)} removed, ${countText(next.length)}`)
    } else {
      if (unavailable(o)) return
      const next = [...value, o.value]
      commit(next)
      setAnnouncement(`${labelOf(o)} added, ${countText(next.length)}`)
    }
    // Clear the search so the next pick starts from the whole list, on the same option.
    if (text) {
      setText('')
      setActive(options.indexOf(o))
    }
  }

  const remove = (v: string, focusAfter: 'next' | 'field') => {
    const at = value.indexOf(v)
    const next = value.filter(x => x !== v)
    commit(next)
    setAnnouncement(`${nameOf(v)} removed, ${countText(next.length)}`)
    if (focusAfter === 'field' || next.length === 0) return inputRef.current?.focus()
    // Keep the keyboard in the tag list: the tag that took its place, or the new last one.
    requestAnimationFrame(() => {
      const buttons = tagsRef.current?.querySelectorAll<HTMLButtonElement>('button')
      buttons?.[Math.min(at, next.length - 1)]?.focus()
    })
  }

  const step = (from: number, dir: 1 | -1) => {
    for (let i = from; i >= 0 && i < shown.length; i += dir) if (!shown[i].disabled) return i
    return -1
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) { setOpen(true); setActive(event.altKey ? -1 : step(0, 1)) }
        else setActive(a => { const n = step(a + 1, 1); return n >= 0 ? n : a })
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) { setOpen(true); setActive(event.altKey ? -1 : step(shown.length - 1, -1)) }
        else if (event.altKey) setOpen(false)
        else setActive(a => { const n = step(a - 1, -1); return n >= 0 ? n : a })
        break
      case 'Enter':
        if (open && active >= 0 && shown[active]) { event.preventDefault(); toggle(shown[active]) }
        break
      case 'Escape':
        if (open) { event.preventDefault(); setOpen(false); setActive(-1) }
        else if (text) { event.preventDefault(); setText('') }
        break
      case 'Backspace':
        if (!text && value.length) { event.preventDefault(); remove(value[value.length - 1], 'field') }
        break
      case 'Tab':
        if (open) { setOpen(false); setText('') }
        break
    }
  }

  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined
  const resultCount = shown.length === 0 ? emptyMessage(text) : `${shown.length} ${shown.length === 1 ? 'result' : 'results'}`
  const fullHint = max !== undefined ? `You can choose up to ${max}.` : undefined
  const summary = value.length ? `${countText(value.length)}: ${value.map(nameOf).join(', ')}.` : 'None chosen.'

  return (
    <div {...rest} ref={ref} className={cn('multi-select', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <InputGroup
            id={id}
            label={label}
            hint={[hint, fullHint].filter(Boolean).join(' ') || undefined}
            error={error}
            required={required}
            disabled={disabled}
            className="multi-select__group"
          >
            <Input
              ref={inputRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              aria-describedby={summaryId}
              autoComplete="off"
              placeholder={placeholder}
              value={text}
              onChange={t => { setText(t); setOpen(true); setActive(-1); setAnnouncement('') }}
              onKeyDown={onKeyDown}
              onClick={() => !disabled && !open && (setOpen(true), setActive(-1))}
            />
            <IconButton
              variant="secondary"
              icon={<CaretDownIcon />}
              label={`${label} options`}
              aria-expanded={open}
              aria-controls={listId}
              tabIndex={-1}
              disabled={disabled}
              onClick={() => { setOpen(o => !o); inputRef.current?.focus() }}
            />
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          role="presentation"
          align="start"
          sideOffset={4}
          className="combobox__popover"
          onOpenAutoFocus={e => e.preventDefault()}
          onCloseAutoFocus={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
          onInteractOutside={e => {
            if ((e.target as Element).closest?.('.multi-select__group')) e.preventDefault()
            else setText('')
          }}
        >
          {shown.length === 0 && <div className="combobox__message">{emptyMessage(text)}</div>}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            tabIndex={-1}
            hidden={shown.length === 0}
            className="combobox__list"
          >
            {shown.map((o, i) => {
              const on = chosen.has(o.value)
              const off = unavailable(o)
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={on}
                  aria-disabled={off || undefined}
                  className={cn(
                    'combobox__option multi-select__option',
                    i === active && 'combobox__option--active',
                    on && 'multi-select__option--chosen',
                    off && 'combobox__option--disabled',
                  )}
                  onPointerDown={e => e.preventDefault()}
                  onClick={() => toggle(o)}
                  onPointerMove={() => !o.disabled && setActive(i)}
                >
                  <span className="multi-select__check" aria-hidden="true">{on && <CheckIcon weight="bold" />}</span>
                  <span className="multi-select__text">
                    <span className="combobox__option-label"><Highlight text={labelOf(o)} query={text} /></span>
                    {o.description && (
                      <span className="combobox__option-description"><Highlight text={o.description} query={text} /></span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <VisuallyHidden id={summaryId}>{summary}</VisuallyHidden>
      {/* The count while typing; what changed after a pick. */}
      <VisuallyHidden role="status">{open ? (announcement || resultCount) : announcement}</VisuallyHidden>

      {value.length > 0 && (
        <ul ref={tagsRef} className="multi-select__tags" aria-label={`Chosen ${label.toLowerCase()}`}>
          {value.map(v => (
            <li key={v}>
              {disabled
                ? <Tag>{nameOf(v)}</Tag>
                : <Tag removable onRemove={() => remove(v, 'next')}>{nameOf(v)}</Tag>}
            </li>
          ))}
          {value.length > 1 && !disabled && (
            <li>
              <button type="button" className="multi-select__clear" onClick={() => {
                commit([]); setAnnouncement('All removed, 0 chosen'); inputRef.current?.focus()
              }}>
                Remove all
              </button>
            </li>
          )}
        </ul>
      )}
      {name && value.map(v => <input key={v} type="hidden" name={name} value={v} />)}
    </div>
  )
})

MultiSelect.displayName = 'MultiSelect'
