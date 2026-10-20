'use client'

import { forwardRef, useId } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { Icon } from '../../primitives/Icon'
import { Timestamp } from '../../primitives/Timestamp'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import './ChatMessage.css'

type ChatMessageOwnProps = {
  /**
   * Who wrote it. `user`: the person using the app, in a bubble on the end
   * side. `assistant`: the other side (a model or a person), as plain text
   * on the start side, the width of a reading column. `system`: a note
   * about the conversation ("Antonio joined"), small and centred, its
   * name read out but not shown. Named `role` like the messages in most
   * chat SDKs, so `role={message.role}` maps straight across.
   */
  role: 'user' | 'assistant' | 'system'
  /** The sender's name. Always read out; shown unless `continued`. */
  author: string
  /** An Avatar, beside user and assistant messages. */
  avatar?: React.ReactNode
  /** When it was sent, shown as a time beside the name (Timestamp). */
  timestamp?: Date | string | number
  /**
   * The next message from the same sender: name, time and avatar are hidden
   * from sight (still read out), and the content keeps its column.
   */
  continued?: boolean
  /**
   * `streaming`: the reply is still arriving; the message is `aria-busy`,
   * and with no content yet it shows a typing indicator.
   */
  status?: 'complete' | 'streaming'
  /** What the typing indicator says to screen readers. Default "Writing a reply". */
  streamingLabel?: string
  /** Why the message failed ("Not sent. Check your connection."), shown under it. */
  error?: string
  /** Controls for this message, such as Copy and Retry IconButtons, shown under it. */
  actions?: React.ReactNode
  /** The message: text, or rich content such as Markdown. */
  children?: React.ReactNode
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type ChatMessageProps = Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'role'> & ChatMessageOwnProps

/**
 * One message in a conversation: who wrote it, when, and what it says, with
 * room for a streaming reply, a failure and actions. Each message is an
 * `article` named by its sender and time, so screen reader users can move
 * message by message.
 */
export const ChatMessage = forwardRef<HTMLElement, ChatMessageProps>(function ChatMessage({
  role,
  author,
  avatar,
  timestamp,
  continued = false,
  status = 'complete',
  streamingLabel = 'Writing a reply',
  error,
  actions,
  children,
  className,
  ...rest
}, ref) {
  const id = useId()
  const headerId = `${id}-header`
  const errorId = `${id}-error`
  const streaming = status === 'streaming'
  const empty = children === undefined || children === null || children === ''
  const showAvatar = role !== 'system' && avatar !== undefined

  const header = (
    <>
      <span className="chat-message__author">{author}</span>
      {timestamp !== undefined && <Timestamp className="chat-message__time" date={timestamp} format="time" />}
    </>
  )

  return (
    <article
      {...rest}
      ref={ref}
      className={cn(
        'chat-message',
        `chat-message--${role}`,
        continued && 'chat-message--continued',
        showAvatar && 'chat-message--with-avatar',
        className,
      )}
      aria-labelledby={headerId}
      aria-describedby={error ? errorId : undefined}
      aria-busy={streaming || undefined}
    >
      {showAvatar && (
        // Continued: the avatar stays, invisible, so the content keeps its column at any avatar size.
        <div className="chat-message__avatar" aria-hidden="true">{avatar}</div>
      )}
      <div className="chat-message__body">
        {continued || role === 'system' ? (
          <VisuallyHidden id={headerId}>{header}</VisuallyHidden>
        ) : (
          <div id={headerId} className="chat-message__header">{header}</div>
        )}
        <div className="chat-message__content">
          {streaming && empty ? (
            <span className="chat-message__typing">
              <span className="chat-message__dot" aria-hidden="true" />
              <span className="chat-message__dot" aria-hidden="true" />
              <span className="chat-message__dot" aria-hidden="true" />
              <VisuallyHidden>{streamingLabel}</VisuallyHidden>
            </span>
          ) : children}
        </div>
        {error && (
          <p id={errorId} className="chat-message__error">
            <Icon icon={WarningCircleIcon} size="sm" />
            {error}
          </p>
        )}
        {actions && <div className="chat-message__actions">{actions}</div>}
      </div>
    </article>
  )
})

ChatMessage.displayName = 'ChatMessage'
