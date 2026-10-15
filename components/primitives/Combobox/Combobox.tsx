'use client'

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { CaretDownIcon, XIcon } from '@phosphor-icons/react'
import { InputGroup } from '../InputGroup'
import { Input } from '../Input'
import { IconButton } from '../IconButton'
import { Spinner } from '../Spinner'
import { VisuallyHidden } from '../VisuallyHidden'
import { Popover, PopoverAnchor, PopoverContent } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { normalize, rankMatches } from '../../../lib/match'
import { Highlight } from '../../../lib/highlight'
import './Combobox.css'

export type ComboboxOption = {
  value: string
  /** What's shown and matched. Defaults to `value`. */
  label?: string
  /** A second, quieter line: a region, an email, a code. Also matched. */
  description?: string
  disabled?: boolean
}

type ComboboxOwnProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Strings, or objects with a label and description. */
  options: Array<string | ComboboxOption>
  /** The chosen option's `value`, or the typed text when `allowCustom`. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Called as people type. Use it to fetch options; pair with `loading` and `filter={false}`. */
  onInputChange?: (text: string) => void
  /** Accept typed text that isn't in the list ("Other: …"). Off by default. */
  allowCustom?: boolean
  /** `false` when the options are already filtered, for example by a server. */
  filter?: boolean
  /** Shows "Loading…" in the list and tells screen readers. */
  loading?: boolean
  /** Shown when nothing matches. Gets the typed text. */
  emptyMessage?: (text: string) => string
  placeholder?: string
  /** Submits the value. */
  name?: string
  id?: string
}

type ComboboxProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & ComboboxOwnProps

const toOption = (o: string | ComboboxOption): ComboboxOption => (typeof o === 'string' ? { value: o } : o)
const labelOf = (o: ComboboxOption) => o.label ?? o.value

/**
 * One value from a long list, found by typing: a country, a town, a
 * person. The WAI-ARIA combobox with list autocomplete: typing filters the
 * list, Arrow Down moves into it, Enter picks, Escape closes (and, when
 * already closed, clears). Focus stays in the field; the result count is
 * announced as it changes.
 */
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(function Combobox({
  label,
  hint,
  error,
  required,
  disabled = false,
  options: optionsProp,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onInputChange,
  allowCustom = false,
  filter = true,
  loading = false,
  emptyMessage = text => (text.trim() ? `No matches for “${text.trim()}”` : 'No options'),
  placeholder,
  name,
  id,
  className,
  ...rest
}, ref) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const options = useMemo(() => optionsProp.map(toOption), [optionsProp])

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<string | null>(defaultValue)
  const value = controlled ? valueProp : inner
  const show = (v: string | null) => {
    if (v === null) return ''
    const o = options.find(x => x.value === v)
    return o ? labelOf(o) : v
  }

  const [text, setText] = useState(() => show(value))
  // The query is what was typed. Opening the list on a chosen value shows everything, not just that one.
  const [query, setQuery] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  useEffect(() => { setText(show(value)) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options])

  const shown = useMemo(
    () => (filter ? rankMatches(options, query, o => `${labelOf(o)} ${o.description ?? ''}`) : options),
    [filter, options, query],
  )

  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, active])

  const commit = (v: string | null) => {
    if (!controlled) setInner(v)
    if (v !== value) onValueChange?.(v)
  }

  const pick = (o: ComboboxOption) => {
    if (o.disabled) return
    setProblem(null)
    commit(o.value)
    setText(labelOf(o))
    setQuery('')
    setOpen(false)
  }

  // On Enter, Tab or leaving the field: settle what was typed.
  const settle = () => {
    const typed = text.trim()
    if (!typed) { setProblem(null); return commit(null) }
    if (typed === show(value)) return setProblem(null)
    const exact = options.find(o => !o.disabled && normalize(labelOf(o)) === normalize(typed))
    if (exact) { setProblem(null); commit(exact.value); return setText(labelOf(exact)) }
    if (allowCustom) { setProblem(null); return commit(typed) }
    setProblem(`Choose ${label.toLowerCase()} from the list, or clear the field.`)
  }

  const enabledIndex = (from: number, dir: 1 | -1) => {
    for (let i = from; i >= 0 && i < shown.length; i += dir) if (!shown[i].disabled) return i
    return -1
  }

  const openList = (at: 'chosen' | 'first' | 'last' | 'none') => {
    setOpen(true)
    const chosen = shown.findIndex(o => o.value === value)
    if (at === 'chosen') setActive(chosen >= 0 ? chosen : enabledIndex(0, 1))
    else if (at === 'first') setActive(enabledIndex(0, 1))
    else if (at === 'last') setActive(enabledIndex(shown.length - 1, -1))
    else setActive(-1)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openList(event.altKey ? 'none' : 'chosen')
        else setActive(a => { const n = enabledIndex(a + 1, 1); return n >= 0 ? n : a })
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList(event.altKey ? 'none' : 'last')
        else if (event.altKey) setOpen(false)
        else setActive(a => { const n = enabledIndex(a - 1, -1); return n >= 0 ? n : a })
        break
      case 'Enter':
        if (open && active >= 0 && shown[active]) { event.preventDefault(); pick(shown[active]) }
        else { if (open) event.preventDefault(); setOpen(false); settle() }
        break
      case 'Escape':
        if (open) { event.preventDefault(); setOpen(false); setActive(-1) }
        else if (text) { event.preventDefault(); clear(false) }
        break
      case 'Tab':
        if (open) { setOpen(false); settle() }
        break
    }
  }

  const clear = (refocus = true) => {
    setText('')
    setQuery('')
    setProblem(null)
    commit(null)
    onInputChange?.('')
    if (refocus) inputRef.current?.focus()
  }

  const onType = (t: string) => {
    setText(t)
    setQuery(t)
    setProblem(null)
    onInputChange?.(t)
    setOpen(true)
    setActive(-1)
  }

  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined
  const status = !open ? '' : loading ? 'Loading…' : shown.length === 0 ? emptyMessage(query)
    : `${shown.length} ${shown.length === 1 ? 'result' : 'results'}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup
          {...rest}
          ref={ref}
          id={id}
          label={label}
          hint={hint}
          error={error ?? problem ?? undefined}
          required={required}
          disabled={disabled}
          className={cn('combobox', className)}
        >
          <Input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            autoComplete="off"
            placeholder={placeholder}
            value={text}
            onChange={onType}
            onBlur={() => { if (!open) settle() }}
            onKeyDown={onKeyDown}
            onClick={() => !disabled && !open && openList('chosen')}
          />
          {text && !disabled && (
            <IconButton variant="secondary" icon={<XIcon />} label={`Clear ${label}`} onClick={() => clear()} className="combobox__clear" />
          )}
          {/* Out of the tab order, as in the WAI-ARIA example: the keyboard opens the list from the field. */}
          <IconButton
            variant="secondary"
            icon={<CaretDownIcon />}
            label={`${label} options`}
            aria-expanded={open}
            aria-controls={listId}
            tabIndex={-1}
            disabled={disabled}
            className="combobox__toggle"
            onClick={() => { if (open) setOpen(false); else { openList('chosen'); inputRef.current?.focus() } }}
          />
        </InputGroup>
      </PopoverAnchor>
      <VisuallyHidden role="status">{status}</VisuallyHidden>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <PopoverContent
        role="presentation"
        align="start"
        sideOffset={4}
        className="combobox__popover"
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        // The field handles Escape: first press closes, a second one clears.
        onEscapeKeyDown={e => e.preventDefault()}
        onInteractOutside={e => {
          if ((e.target as Element).closest?.('.combobox')) e.preventDefault()
          else settle()
        }}
      >
        {loading && (
          <div className="combobox__message"><span aria-hidden="true" className="combobox__spinner"><Spinner size="sm" /></span> Loading…</div>
        )}
        {!loading && shown.length === 0 && <div className="combobox__message">{emptyMessage(query)}</div>}
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          hidden={loading || shown.length === 0}
          className="combobox__list"
        >
          {shown.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={cn(
                'combobox__option',
                i === active && 'combobox__option--active',
                o.value === value && 'combobox__option--selected',
                o.disabled && 'combobox__option--disabled',
              )}
              onPointerDown={e => e.preventDefault()}
              onClick={() => pick(o)}
              onPointerMove={() => !o.disabled && setActive(i)}
            >
              <span className="combobox__option-label"><Highlight text={labelOf(o)} query={query} /></span>
              {o.description && (
                <span className="combobox__option-description"><Highlight text={o.description} query={query} /></span>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
})

Combobox.displayName = 'Combobox'
