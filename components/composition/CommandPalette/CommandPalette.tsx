'use client'

import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Kbd } from '../../primitives/Kbd'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import { rankMatches } from '../../../lib/match'
import { Highlight } from '../../../lib/highlight'
import { cn } from '../../../lib/cn'
import '../Dialog/Dialog.css'
import '../../primitives/Combobox/Combobox.css'
import './CommandPalette.css'

export type Command = {
  /** Stable React key. */
  id: string
  label: string
  /** A quieter second line. */
  description?: string
  /** Decorative; the label is the name. */
  icon?: React.ReactNode
  /** The shortcut that does the same outside the palette, one key per entry: `['Ctrl', 'B']`. */
  shortcut?: string[]
  /** Other words that should find it: "dark" for "Switch theme". Not shown. */
  keywords?: string[]
  disabled?: boolean
  /** Runs when chosen. The palette closes first, so focus is back on the page. */
  onSelect: () => void
}

export type CommandGroup = {
  /** Shown above the group and names it for screen readers. */
  label: string
  commands: Command[]
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandGroup[]
  /** Names the dialog for screen readers. Default "Command palette". */
  title?: string
  /** Names and fills the search field. Default "Search commands". */
  placeholder?: string
  /** Shown when nothing matches. Gets the typed text. */
  emptyMessage?: (text: string) => string
  /** The key hints under the list. `null` hides them. */
  hint?: React.ReactNode | null
}

const keyName = (k: string) => ({ Ctrl: 'Control', Cmd: 'Meta', '⌘': 'Meta', Opt: 'Alt', '⌥': 'Alt', '⇧': 'Shift', Del: 'Delete', Esc: 'Escape' } as Record<string, string>)[k] ?? k

/**
 * Every action in the app, one search away: Ctrl+K or ⌘K, type a few
 * letters, Enter. A modal dialog with a combobox over a grouped listbox:
 * focus stays in the search field, the top match is ready for Enter, the
 * arrows move (wrapping), and the result count is announced. Matching
 * ignores case and accents and also searches keywords.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  title = 'Command palette',
  placeholder = 'Search commands',
  emptyMessage = text => `No commands match “${text.trim()}”`,
  hint,
}: CommandPaletteProps) {
  const scope = useThemeScopeAttributes()
  const listId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  // What had focus before opening: a button, or anywhere for Ctrl+K. Focus goes back there.
  const returnTo = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  // Each open starts fresh.
  useEffect(() => { if (open) { setQuery(''); setActive(0) } }, [open])

  const shown = useMemo(
    () => groups
      .map(g => ({ ...g, commands: rankMatches(g.commands, query, c => [c.label, c.description, ...(c.keywords ?? [])].join(' ')) }))
      .filter(g => g.commands.length > 0),
    [groups, query],
  )
  const flat = useMemo(() => shown.flatMap(g => g.commands), [shown])
  const enabled = flat.map((c, i) => (c.disabled ? -1 : i)).filter(i => i >= 0)

  // The top enabled match is ready for Enter.
  useEffect(() => { setActive(enabled[0] ?? -1) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, groups])

  useEffect(() => {
    if (active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (c: Command) => {
    if (c.disabled) return
    onOpenChange(false)
    // After the dialog has handed focus back to the page.
    requestAnimationFrame(() => c.onSelect())
  }

  const move = (dir: 1 | -1) => {
    if (!enabled.length) return
    const at = enabled.indexOf(active)
    setActive(enabled[(at + dir + enabled.length) % enabled.length])
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
    else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); run(flat[active]) }
  }

  const count = flat.length
  const status = count === 0 ? emptyMessage(query) : `${count} ${count === 1 ? 'command' : 'commands'}`
  let index = -1

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay {...scope} className="dialog__overlay" />
        <RadixDialog.Content
          {...scope}
          className="command-palette"
          aria-describedby={undefined}
          onOpenAutoFocus={() => { returnTo.current = document.activeElement as HTMLElement | null }}
          onCloseAutoFocus={e => {
            const el = returnTo.current
            if (el && el.isConnected && el !== document.body) { e.preventDefault(); el.focus() }
          }}
        >
          <VisuallyHidden><RadixDialog.Title>{title}</RadixDialog.Title></VisuallyHidden>
          <div className="command-palette__search">
            <MagnifyingGlassIcon aria-hidden="true" className="command-palette__search-icon" />
            <input
              className="command-palette__input"
              role="combobox"
              aria-label={placeholder}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              placeholder={`${placeholder}…`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <VisuallyHidden role="status">{status}</VisuallyHidden>
          {count === 0 && <div className="command-palette__empty">{emptyMessage(query)}</div>}
          <div ref={listRef} id={listId} role="listbox" aria-label={title} hidden={count === 0} className="command-palette__list" tabIndex={-1}>
            {shown.map(group => {
              const groupId = `${listId}-g-${group.label}`
              return (
                <div key={group.label} role="group" aria-labelledby={groupId} className="command-palette__group">
                  <div id={groupId} role="presentation" className="command-palette__group-label">{group.label}</div>
                  {group.commands.map(c => {
                    index += 1
                    const i = index
                    return (
                      <div
                        key={c.id}
                        id={`${listId}-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        aria-disabled={c.disabled || undefined}
                        aria-keyshortcuts={c.shortcut?.map(keyName).join('+')}
                        className={cn(
                          'combobox__option command-palette__option',
                          i === active && 'combobox__option--active',
                          c.disabled && 'combobox__option--disabled',
                        )}
                        onPointerDown={e => e.preventDefault()}
                        onPointerMove={() => !c.disabled && setActive(i)}
                        onClick={() => run(c)}
                      >
                        {c.icon && <span className="command-palette__icon" aria-hidden="true">{c.icon}</span>}
                        <span className="command-palette__text">
                          <span className="combobox__option-label"><Highlight text={c.label} query={query} /></span>
                          {c.description && <span className="combobox__option-description">{c.description}</span>}
                        </span>
                        {c.shortcut && (
                          <kbd className="command-palette__shortcut" aria-hidden="true">
                            {c.shortcut.map((k, n) => <Fragment key={n}>{n > 0 && '+'}<Kbd>{k}</Kbd></Fragment>)}
                          </kbd>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          {hint !== null && (
            <div className="command-palette__hint">
              {hint ?? (<><span><Kbd>↑</Kbd> <Kbd>↓</Kbd> to move</span><span><Kbd>Enter</Kbd> to run</span><span><Kbd>Esc</Kbd> to close</span></>)}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

/**
 * Opens and closes the palette with Ctrl+K, or ⌘K on a Mac, from anywhere
 * on the page. Pass the setter from your open state; `key` changes the letter.
 */
export function useCommandPaletteShortcut(setOpen: React.Dispatch<React.SetStateAction<boolean>>, key = 'k') {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setOpen, key])
}
