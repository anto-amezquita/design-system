'use client'

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { InputGroup } from '../InputGroup'
import { Input } from '../Input'
import { Tag } from '../Tag'
import { VisuallyHidden } from '../VisuallyHidden'
import { Popover, PopoverAnchor, PopoverContent } from '../../composition/Popover'
import { cn } from '../../../lib/cn'
import { normalize, rankMatches } from '../../../lib/match'
import { Highlight } from '../../../lib/highlight'
import '../Combobox/Combobox.css'
import '../MultiSelect/MultiSelect.css'
import './TagInput.css'

type TagInputOwnProps = {
  label: string
  /** Shown under the field, before "Separate with commas or press Enter." */
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** The tags, in the order they were added. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  /** Offered as people type. Anything else can still be added. */
  suggestions?: string[]
  /** Return a reason to refuse a tag, e.g. "Enter an email address like name@example.com." */
  validate?: (tag: string) => string | undefined
  /** The most tags allowed. */
  max?: number
  placeholder?: string
  /** Submits each tag under this name. */
  name?: string
  id?: string
}

type TagInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'id'> & TagInputOwnProps

/** Splits pasted or typed text into tags: commas, semicolons and new lines. */
export function splitTags(text: string): string[] {
  return text.split(/[,;\n]/).map(t => t.trim()).filter(Boolean)
}

/**
 * Free-text values as tags: keywords, email addresses, ingredients. Enter
 * or a comma adds what's typed; a pasted list is split; Backspace in the
 * empty field removes the last tag. Duplicates, `validate` failures and
 * going over `max` get their own reason, and the refused text stays in the
 * field to fix. With `suggestions`, it's a combobox like Combobox.
 */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(function TagInput({
  label,
  hint,
  error,
  required,
  disabled = false,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  suggestions,
  validate,
  max,
  placeholder,
  name,
  id,
  className,
  ...rest
}, ref) {
  const baseId = useId()
  const listId = `${baseId}-list`
  const summaryId = `${baseId}-tags`
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const tagsRef = useRef<HTMLUListElement>(null)

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState<string[]>(defaultValue)
  const value = controlled ? valueProp : inner

  const [text, setText] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const has = (t: string, list = value) => list.some(v => normalize(v) === normalize(t))
  const shown = useMemo(
    () => (suggestions && text.trim() ? rankMatches(suggestions.filter(s => !has(s)), text, s => s) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestions, text, value],
  )
  const listOpen = open && shown.length > 0

  useEffect(() => {
    if (listOpen && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [listOpen, active])

  const commit = (next: string[]) => {
    if (!controlled) setInner(next)
    onValueChange?.(next)
  }

  const count = (n: number) => `${n} ${n === 1 ? 'tag' : 'tags'}`

  /** Adds what it can; returns the text it refused, so it stays in the field. */
  const add = (candidates: string[]) => {
    const next = [...value]
    const refused: string[] = []
    let reason: string | null = null
    for (const t of candidates) {
      if (has(t, next)) { reason ??= `“${t}” is already added.`; continue }
      const invalid = validate?.(t)
      if (invalid) { refused.push(t); reason ??= invalid; continue }
      if (max !== undefined && next.length >= max) { refused.push(t); reason ??= `You can add up to ${max}.`; continue }
      next.push(t)
    }
    const added = next.slice(value.length)
    if (added.length) {
      commit(next)
      setAnnouncement(`${added.length === 1 ? added[0] : count(added.length)} added, ${count(next.length)}`)
    }
    setProblem(reason)
    setText(refused.join(', '))
    setOpen(false)
    setActive(-1)
  }

  const remove = (t: string, focusAfter: 'next' | 'field') => {
    const at = value.indexOf(t)
    const next = value.filter(v => v !== t)
    commit(next)
    setProblem(null)
    setAnnouncement(`${t} removed, ${count(next.length)}`)
    if (focusAfter === 'field' || next.length === 0) return inputRef.current?.focus()
    requestAnimationFrame(() => {
      tagsRef.current?.querySelectorAll<HTMLButtonElement>('.tag__remove')[Math.min(at, next.length - 1)]?.focus()
    })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        if (listOpen && active >= 0) { event.preventDefault(); add([shown[active]]) }
        else if (text.trim()) { event.preventDefault(); add(splitTags(text)) }
        break
      case ',':
      case ';':
        event.preventDefault()
        if (text.trim()) add(splitTags(text))
        break
      case 'Backspace':
        if (!text && value.length) { event.preventDefault(); remove(value[value.length - 1], 'field') }
        break
      case 'ArrowDown':
        if (shown.length) {
          event.preventDefault()
          setOpen(true)
          setActive(a => Math.min(shown.length - 1, a + 1))
        }
        break
      case 'ArrowUp':
        if (listOpen) { event.preventDefault(); setActive(a => Math.max(0, a - 1)) }
        break
      case 'Escape':
        if (listOpen) { event.preventDefault(); setOpen(false); setActive(-1) }
        break
    }
  }

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text')
    if (!/[,;\n]/.test(pasted)) return
    event.preventDefault()
    add(splitTags(text + pasted))
  }

  const how = 'Separate with commas or press Enter.'
  const limit = max !== undefined ? `Up to ${max}.` : undefined
  const summary = value.length ? `${count(value.length)}: ${value.join(', ')}.` : 'No tags yet.'
  const combobox = suggestions
    ? {
        role: 'combobox' as const,
        'aria-expanded': listOpen,
        'aria-controls': listId,
        'aria-autocomplete': 'list' as const,
        'aria-activedescendant': listOpen && active >= 0 ? `${listId}-${active}` : undefined,
      }
    : {}

  return (
    <div {...rest} ref={ref} className={cn('tag-input', className)}>
      <Popover open={listOpen} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <InputGroup
            id={id}
            label={label}
            hint={[hint, how, limit].filter(Boolean).join(' ')}
            error={error ?? problem ?? undefined}
            required={required}
            disabled={disabled}
            className="tag-input__group"
          >
            <Input
              ref={inputRef}
              {...combobox}
              aria-describedby={summaryId}
              autoComplete="off"
              enterKeyHint="enter"
              placeholder={placeholder}
              value={text}
              onChange={t => { setText(t); setProblem(null); setAnnouncement(''); setOpen(true); setActive(-1) }}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={() => { if (!listOpen && text.trim()) add(splitTags(text)) }}
            />
          </InputGroup>
        </PopoverAnchor>
        {suggestions && (
          <PopoverContent
            role="presentation"
            align="start"
            sideOffset={4}
            className="combobox__popover"
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
            onEscapeKeyDown={e => e.preventDefault()}
            onInteractOutside={e => { if ((e.target as Element).closest?.('.tag-input__group')) e.preventDefault() }}
          >
            <ul ref={listRef} id={listId} role="listbox" aria-label={`${label} suggestions`} tabIndex={-1} className="combobox__list">
              {shown.map((s, i) => (
                <li
                  key={s}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  className={cn('combobox__option', i === active && 'combobox__option--active')}
                  onPointerDown={e => e.preventDefault()}
                  onClick={() => add([s])}
                  onPointerMove={() => setActive(i)}
                >
                  <span className="combobox__option-label"><Highlight text={s} query={text} /></span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        )}
      </Popover>

      <VisuallyHidden id={summaryId}>{summary}</VisuallyHidden>
      <VisuallyHidden role="status">
        {listOpen ? `${shown.length} ${shown.length === 1 ? 'suggestion' : 'suggestions'}` : announcement}
      </VisuallyHidden>

      {value.length > 0 && (
        <ul ref={tagsRef} className="multi-select__tags" aria-label={label}>
          {value.map(t => (
            <li key={t}>
              {disabled ? <Tag>{t}</Tag> : <Tag removable onRemove={() => remove(t, 'next')}>{t}</Tag>}
            </li>
          ))}
          {value.length > 1 && !disabled && (
            <li>
              <button type="button" className="multi-select__clear" onClick={() => {
                commit([]); setProblem(null); setAnnouncement('All removed, 0 tags'); inputRef.current?.focus()
              }}>
                Remove all
              </button>
            </li>
          )}
        </ul>
      )}
      {name && value.map(t => <input key={t} type="hidden" name={name} value={t} />)}
    </div>
  )
})

TagInput.displayName = 'TagInput'
