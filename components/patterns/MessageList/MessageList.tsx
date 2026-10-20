'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDownIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { Button } from '../../primitives/Button'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import './MessageList.css'

type MessageListOwnProps = {
  /** Names the conversation for screen readers: "Conversation with Assistant". */
  label: string
  /** The messages, oldest first: ChatMessages, or any `article` elements. */
  children: React.ReactNode
  /**
   * Read each new message aloud once it's complete (not while it streams):
   * "Assistant: …". Your own messages aren't read back. Default `true`.
   */
  announce?: boolean
  /** The button that returns to the newest message when you've scrolled up. Default "Jump to latest". */
  jumpLabel?: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type MessageListProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & MessageListOwnProps

/** How close to the bottom still counts as "at the bottom", in px: about one line. */
const NEAR_BOTTOM = 24

const articlesIn = (feed: HTMLElement | null) =>
  feed ? Array.from(feed.querySelectorAll<HTMLElement>(':scope > article')) : []

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** "Assistant: the text", from a ChatMessage, or the article's text otherwise. */
function spoken(article: HTMLElement) {
  const author = article.querySelector('.chat-message__author')?.textContent
  const content = article.querySelector('.chat-message__content')?.textContent ?? article.textContent ?? ''
  return author ? `${author}: ${content.trim()}` : content.trim()
}

/**
 * A conversation's messages in a scrolling list that follows the newest one,
 * unless you've scrolled up to read; then a button says how many new
 * messages are waiting. It's a WAI-ARIA feed: Page Up and Page Down move
 * between messages, and each finished reply is read aloud once.
 */
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList({
  label,
  children,
  announce = true,
  jumpLabel = 'Jump to latest',
  className,
  ...rest
}, ref) {
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const feed = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => root.current!)

  const following = useRef(true)
  const [atBottom, setAtBottom] = useState(true)
  const [unseen, setUnseen] = useState(0)
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const active = useRef<number | null>(null)
  const known = useRef(new WeakSet<HTMLElement>())
  const spokenSet = useRef(new WeakSet<HTMLElement>())

  const toBottom = useCallback((smooth: boolean) => {
    const el = scroller.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' })
  }, [])

  // Feed semantics on each article: its position, the set size, and one
  // tab stop (roving), the newest unless the reader has moved.
  const syncArticles = useCallback(() => {
    const list = articlesIn(feed.current)
    const current = active.current ?? list.length - 1
    list.forEach((article, i) => {
      article.setAttribute('aria-posinset', String(i + 1))
      article.setAttribute('aria-setsize', String(list.length))
      article.tabIndex = i === current ? 0 : -1
    })
    setBusy(list.some(a => a.getAttribute('aria-busy') === 'true'))
  }, [])

  // History already on the page when the list mounts is known: not new, not read aloud.
  useLayoutEffect(() => {
    for (const article of articlesIn(feed.current)) {
      known.current.add(article)
      spokenSet.current.add(article)
    }
    syncArticles()
    toBottom(false)
  }, [syncArticles, toBottom])

  useEffect(() => {
    const el = feed.current
    if (!el) return
    const observer = new MutationObserver(() => {
      syncArticles()
      let fresh = 0
      let mine = false
      for (const article of articlesIn(el)) {
        const own = article.classList.contains('chat-message--user')
        if (!known.current.has(article)) {
          known.current.add(article)
          if (own) mine = true
          else fresh++
        }
        if (!spokenSet.current.has(article) && article.getAttribute('aria-busy') !== 'true') {
          spokenSet.current.add(article)
          if (announce && !own) setAnnouncement(spoken(article))
        }
      }
      // Your own message always brings you back down: you've just sent it.
      if (mine) following.current = true
      if (following.current) toBottom(!mine)
      else if (fresh) setUnseen(n => n + fresh)
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-busy'] })
    // A reply that grows (streaming text, an image loading) keeps the view at the bottom.
    const resize = new ResizeObserver(() => {
      if (following.current) toBottom(false)
    })
    resize.observe(el)
    return () => {
      observer.disconnect()
      resize.disconnect()
    }
  }, [announce, syncArticles, toBottom])

  const onScroll = () => {
    const el = scroller.current!
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM
    following.current = bottom
    setAtBottom(bottom)
    if (bottom) setUnseen(0)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const list = articlesIn(feed.current)
    const from = list.findIndex(a => a === (event.target as HTMLElement))
    if (from === -1) return
    const to = { PageDown: from + 1, PageUp: from - 1, Home: 0, End: list.length - 1 }[event.key]
    if (to === undefined) return
    event.preventDefault()
    list[Math.max(0, Math.min(list.length - 1, to))]?.focus()
  }

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const index = articlesIn(feed.current).indexOf(event.target as HTMLElement)
    if (index === -1) return
    active.current = index
    syncArticles()
  }

  const jump = () => {
    following.current = true
    setUnseen(0)
    toBottom(true)
    const list = articlesIn(feed.current)
    active.current = null
    syncArticles()
    list[list.length - 1]?.focus({ preventScroll: true })
  }

  return (
    <div {...rest} ref={root} className={cn('message-list', className)}>
      <div ref={scroller} className="message-list__scroller" onScroll={onScroll}>
        <div
          ref={feed}
          role="feed"
          aria-label={label}
          aria-busy={busy || undefined}
          className="message-list__feed"
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        >
          {children}
        </div>
      </div>
      {!atBottom && (
        <Button
          // Primary: it floats over messages, so it needs a solid fill to read.
          className="message-list__jump"
          icon={<ArrowDownIcon />}
          onClick={jump}
        >
          {unseen > 0 ? `${unseen} new ${unseen === 1 ? 'message' : 'messages'}` : jumpLabel}
        </Button>
      )}
      <VisuallyHidden as="div" role="status">{announcement}</VisuallyHidden>
    </div>
  )
})

MessageList.displayName = 'MessageList'
