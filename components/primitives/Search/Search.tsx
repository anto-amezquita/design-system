'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Input } from '../Input'
import { Button } from '../Button'
import { Kbd } from '../Kbd'
import { Spinner } from '../Spinner'
import { cn } from '../../../lib/cn'
import './Search.css'

type SearchOwnProps = {
  /** What is searched, e.g. "Search components". Names the landmark and the field. Default "Search". */
  label?: string
  placeholder?: string
  /** Controlled query. Pair with `onValueChange`. */
  value?: string
  defaultValue?: string
  /** Every change, for search-as-you-type. */
  onValueChange?: (query: string) => void
  /** Enter or the submit button: run the search. */
  onSearch?: (query: string) => void
  /** Show a Search button after the field. Without it, Enter still submits. */
  showSubmit?: boolean
  /**
   * One key that moves focus to the field from anywhere on the page, like
   * "/" on many sites. Shown as a Kbd hint while the field is empty and
   * unfocused; ignored while someone types in another field.
   */
  shortcut?: string
  /** Results are on their way: a spinner replaces the shortcut hint and the field is `aria-busy`. */
  loading?: boolean
  disabled?: boolean
  name?: string
}

// decisions/0007: native attributes reach the <form>.
type SearchProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'role' | 'defaultValue'> & SearchOwnProps

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/**
 * A site or list search: a `role="search"` landmark around Input's search
 * mode. Enter searches, Escape clears, and an optional shortcut key jumps
 * to it from anywhere.
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search({
  label = 'Search',
  placeholder,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSearch,
  showSubmit = false,
  shortcut,
  loading = false,
  disabled = false,
  name = 'q',
  className,
  ...rest
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const controlled = valueProp !== undefined
  const [inner, setInner] = useState(defaultValue)
  const query = controlled ? valueProp : inner
  const [focused, setFocused] = useState(false)

  const change = (next: string) => {
    if (!controlled) setInner(next)
    onValueChange?.(next)
  }

  // The shortcut: from anywhere, unless the person is typing somewhere else.
  useEffect(() => {
    if (!shortcut || disabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut, disabled])

  const suffix = loading
    ? <Spinner size="sm" label="Searching" />
    : shortcut && !focused && query === ''
      ? <Kbd>{shortcut}</Kbd>
      : undefined

  return (
    <form
      {...rest}
      role="search"
      aria-label={label}
      className={cn('search', className)}
      onSubmit={event => {
        event.preventDefault()
        onSearch?.(query)
      }}
    >
      <Input
        ref={inputRef}
        search
        searchLabel={label}
        type="search"
        name={name}
        placeholder={placeholder}
        value={query}
        onChange={change}
        clearable
        disabled={disabled}
        suffix={suffix}
        aria-busy={loading || undefined}
        aria-keyshortcuts={shortcut}
        enterKeyHint="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={event => {
          // Escape clears first; a second Escape leaves the field.
          if (event.key === 'Escape') {
            if (query !== '') {
              event.preventDefault()
              change('')
            } else {
              inputRef.current?.blur()
            }
          }
        }}
        className="search__input"
      />
      {showSubmit && (
        <Button type="submit" variant="secondary" disabled={disabled}>
          Search
        </Button>
      )}
    </form>
  )
})

Search.displayName = 'Search'
