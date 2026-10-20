'use client'

import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { IconButton } from '../IconButton'
import { ScrollArea } from '../ScrollArea'
import { VisuallyHidden } from '../VisuallyHidden'
import './CodeBlock.css'

type CodeBlockOwnProps = {
  /** The code, as plain text. Leading and trailing blank lines are trimmed. */
  code: string
  /** Shown in the header and used to name the block: "tsx", "css", "bash". */
  language?: string
  /** Shown in the header instead of the language, and used to name the block: "Button.tsx". */
  filename?: string
  /** A Copy button in the header. Default `true`. */
  copyable?: boolean
  /** Numbers in the margin. They're not selectable and not read out. */
  lineNumbers?: boolean
  /** Lines to mark, 1-based: `[3, 4]`. Marked with a bar as well as a tint, and announced. */
  highlight?: number[]
  /** Wrap long lines instead of scrolling sideways. Default `false`, so indentation stays readable. */
  wrap?: boolean
  /** Height limit before it scrolls vertically too: a CSS length or pixels. */
  maxHeight?: string | number
}

// decisions/0007: typed against the native attributes so `...rest` reaches the figure.
type CodeBlockProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & CodeBlockOwnProps

const COPIED_MS = 2000

/**
 * A block of code in the monospace face, with an optional header (filename
 * or language), a Copy button, line numbers and highlighted lines. Long
 * lines scroll sideways in a keyboard-reachable ScrollArea. No syntax
 * colouring: the system has no highlighter dependency.
 */
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock({
  code,
  language,
  filename,
  copyable = true,
  lineNumbers = false,
  highlight = [],
  wrap = false,
  maxHeight,
  className,
  ...rest
}, ref) {
  const text = code.replace(/^\s*\n/, '').replace(/\n\s*$/, '')
  const lines = text.split('\n')
  const marked = new Set(highlight)
  const name = filename ?? language
  const [copied, setCopied] = useState(false)
  const nameId = useId()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      // Clipboard blocked (permissions, insecure context): leave the button as it was.
    }
  }

  return (
    // The name sits in the header beside the Copy button, where a figcaption
    // can't go (it has to be the figure's first or last child), so the figure
    // is named with aria-labelledby instead.
    <figure {...rest} ref={ref} aria-labelledby={name ? nameId : undefined} className={cn('code-block', className)}>
      {(name || copyable) && (
        <div className="code-block__header">
          {name && <span id={nameId} className="code-block__name">{name}</span>}
          {copyable && (
            <IconButton
              className="code-block__copy"
              icon={copied ? <CheckIcon /> : <CopyIcon />}
              label={copied ? 'Copied' : name ? `Copy ${name}` : 'Copy code'}
              size="sm"
              onClick={copy}
            />
          )}
          <VisuallyHidden role="status">{copied ? 'Copied to clipboard' : ''}</VisuallyHidden>
        </div>
      )}
      <ScrollArea
        label={name ? `Code: ${name}` : 'Code'}
        orientation={wrap ? 'vertical' : maxHeight !== undefined ? 'both' : 'horizontal'}
        maxHeight={maxHeight}
        className="code-block__scroll"
      >
        <pre className={cn('code-block__pre', wrap && 'code-block__pre--wrap', lineNumbers && 'code-block__pre--numbered')}>
          <code className={language ? `language-${language}` : undefined}>
            {lines.map((line, i) => {
              const n = i + 1
              const on = marked.has(n)
              return (
                // Block-level lines copy as separate lines, so no "\n" is added. A
                // highlighted line's text is a <mark>, which some screen readers
                // announce, and which, unlike hidden text, adds nothing when the
                // code is selected and copied by hand.
                <span key={i} className={cn('code-block__line', on && 'code-block__line--highlight')}>
                  {lineNumbers && <span className="code-block__number" aria-hidden="true">{n}</span>}
                  {on
                    ? <mark className="code-block__text">{line || ' '}</mark>
                    : <span className="code-block__text">{line || ' '}</span>}
                </span>
              )
            })}
          </code>
        </pre>
      </ScrollArea>
    </figure>
  )
})

CodeBlock.displayName = 'CodeBlock'
