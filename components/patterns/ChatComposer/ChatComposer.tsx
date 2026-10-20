'use client'

import { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { PaperPlaneRightIcon, StopIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { IconButton } from '../../primitives/IconButton'
import { Kbd } from '../../primitives/Kbd'
import './ChatComposer.css'

type ChatComposerOwnProps = {
  /** Called with the message (trimmed) when it's sent with Enter or the Send button. */
  onSubmit: (message: string) => void
  /** The text field's name for screen readers; it isn't shown. Default "Message". */
  label?: string
  /** Shown in the empty field: "Ask about tokens…". */
  placeholder?: string
  /** Controlled text. Pair with `onValueChange`, and clear it yourself after `onSubmit`. */
  value?: string
  /** Uncontrolled starting text. The field clears itself after sending. */
  defaultValue?: string
  /** Called on every change. */
  onValueChange?: (value: string) => void
  /**
   * `streaming`: a reply is arriving. Send becomes Stop (`onStop`), and Enter
   * doesn't send, so a draft can be written in the meantime.
   */
  status?: 'idle' | 'streaming'
  /** Called by the Stop button while `streaming`. */
  onStop?: () => void
  /** The field grows with the text up to this many lines, then scrolls. Default 8. */
  maxRows?: number
  /**
   * The line under the field. Default: how Enter and Shift + Enter work, as
   * keycaps. `null` hides it (on a touch-only screen, say).
   */
  hint?: React.ReactNode
  /** Controls at the start of the bar, such as an Attach IconButton. */
  actions?: React.ReactNode
  /** Above the text: what's attached, such as removable Tags. */
  attachments?: React.ReactNode
  /** The whole composer can't be used (the conversation is closed, say). */
  disabled?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the form.
type ChatComposerProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> & ChatComposerOwnProps

/**
 * Where a message is written and sent. The field grows with the text,
 * Enter sends and Shift + Enter starts a new line (never mid-composition in
 * an input method), and while a reply streams in Send becomes Stop.
 */
export const ChatComposer = forwardRef<HTMLFormElement, ChatComposerProps>(function ChatComposer({
  onSubmit,
  label = 'Message',
  placeholder,
  value: controlled,
  defaultValue = '',
  onValueChange,
  status = 'idle',
  onStop,
  maxRows = 8,
  hint,
  actions,
  attachments,
  disabled = false,
  className,
  ...rest
}, ref) {
  const id = useId()
  const fieldId = `${id}-field`
  const hintId = `${id}-hint`
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = controlled ?? uncontrolled
  const field = useRef<HTMLTextAreaElement>(null)
  const streaming = status === 'streaming'
  const empty = value.trim() === ''

  // Grow with the text: measure the content, cap it at maxRows lines, and
  // scroll beyond that. Runs before paint, so the field never flickers.
  const resize = useCallback(() => {
    const el = field.current
    if (!el) return
    const style = getComputedStyle(el)
    const line = parseFloat(style.lineHeight)
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const max = line * maxRows + padding
    el.style.blockSize = 'auto'
    const height = Math.min(el.scrollHeight, max)
    el.style.blockSize = `${height}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [maxRows])

  useLayoutEffect(resize, [value, resize])

  const change = (next: string) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const send = () => {
    if (disabled || streaming || empty) return
    onSubmit(value.trim())
    if (controlled === undefined) setUncontrolled('')
    field.current?.focus()
  }

  const showHint = hint !== null
  const hintContent = hint ?? (
    <><Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line</>
  )

  return (
    <form
      {...rest}
      ref={ref}
      className={cn('chat-composer', disabled && 'chat-composer--disabled', className)}
      aria-label={rest['aria-label'] ?? label}
      onSubmit={event => {
        event.preventDefault()
        send()
      }}
    >
      <div
        className="chat-composer__box"
        // The whole box reads as the field: a click on its padding or the
        // empty bar puts the caret in the text.
        onMouseDown={event => {
          const target = event.target as HTMLElement
          if (target === event.currentTarget || target.classList.contains('chat-composer__bar') || target.classList.contains('chat-composer__actions')) {
            event.preventDefault()
            field.current?.focus()
          }
        }}
      >
        {attachments && <div className="chat-composer__attachments">{attachments}</div>}
        <textarea
          ref={field}
          id={fieldId}
          className="chat-composer__field"
          rows={1}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label}
          aria-describedby={showHint ? hintId : undefined}
          onChange={event => change(event.target.value)}
          onKeyDown={event => {
            // isComposing: Enter confirms a word in a Japanese, Chinese or
            // Korean input method; it must not send the message too.
            if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
            event.preventDefault()
            send()
          }}
        />
        <div className="chat-composer__bar">
          <div className="chat-composer__actions">{actions}</div>
          {streaming ? (
            <IconButton
              icon={<StopIcon weight="fill" />}
              label="Stop the reply"
              variant="secondary"
              size="sm"
              onClick={() => onStop?.()}
              disabled={disabled}
            />
          ) : (
            <IconButton
              icon={<PaperPlaneRightIcon weight="fill" />}
              label="Send"
              variant="primary"
              size="sm"
              type="submit"
              disabled={disabled || empty}
            />
          )}
        </div>
      </div>
      {showHint && <p id={hintId} className="chat-composer__hint">{hintContent}</p>}
    </form>
  )
})

ChatComposer.displayName = 'ChatComposer'
