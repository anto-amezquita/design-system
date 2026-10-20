'use client'

import { forwardRef, useId } from 'react'
import {
  CheckCircleIcon,
  CircleDashedIcon,
  CircleNotchIcon,
  HandIcon,
  ProhibitIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { Button } from '../../primitives/Button'
import { CodeBlock } from '../../primitives/CodeBlock'
import { Collapsible } from '../../primitives/Collapsible'
import { Icon } from '../../primitives/Icon'
import './ToolCall.css'

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error' | 'awaiting-approval' | 'denied'

type ToolCallOwnProps = {
  /** The tool's name as the model calls it: `search_tokens`. Shown in the monospace face. */
  name: string
  /** What the call does, in words: "Search the tokens for “radius”". Default: the name. */
  title?: string
  /**
   * `pending` (queued), `running`, `success`, `error`, `awaiting-approval`
   * (shows Allow and Deny) or `denied`. Each has its own icon and word, not
   * colour alone.
   */
  status: ToolCallStatus
  /** The arguments: an object (shown as JSON) or a string. */
  input?: unknown
  /** The result: an object (shown as JSON) or a string. */
  output?: unknown
  /** Why it failed, shown in the details with `status="error"`. */
  error?: string
  /** How long it took, in milliseconds, shown after it finishes. */
  durationMs?: number
  /** Called by Allow while `awaiting-approval`. */
  onApprove?: () => void
  /** Called by Deny while `awaiting-approval`. */
  onDeny?: () => void
  /** Show the input and output on first render. Default `false`. */
  defaultOpen?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the wrapper.
type ToolCallProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & ToolCallOwnProps

const STATUS: Record<ToolCallStatus, { word: string; icon: PhosphorIcon }> = {
  pending: { word: 'Waiting', icon: CircleDashedIcon },
  running: { word: 'Running', icon: CircleNotchIcon },
  success: { word: 'Done', icon: CheckCircleIcon },
  error: { word: 'Failed', icon: WarningCircleIcon },
  'awaiting-approval': { word: 'Needs your approval', icon: HandIcon },
  denied: { word: 'Denied', icon: ProhibitIcon },
}

const asText = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? String(value)

const seconds = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`

/**
 * A tool an assistant used, or wants to use: what it is, whether it's
 * running, done or failed, and its input and output behind a disclosure.
 * A call that needs permission asks with Allow and Deny.
 */
export const ToolCall = forwardRef<HTMLDivElement, ToolCallProps>(function ToolCall({
  name,
  title,
  status,
  input,
  output,
  error,
  durationMs,
  onApprove,
  onDeny,
  defaultOpen = false,
  className,
  ...rest
}, ref) {
  const id = useId()
  const { word, icon } = STATUS[status]
  const finished = status === 'success' || status === 'error'
  const awaiting = status === 'awaiting-approval'
  const label = title ?? name
  const hasDetails = input !== undefined || output !== undefined || (status === 'error' && error)

  const summary = (
    <span className="tool-call__summary">
      <Icon icon={icon} size="md" weight={status === 'success' || status === 'error' ? 'fill' : 'regular'} className="tool-call__icon" />
      <span className="tool-call__text">
        <span id={`${id}-title`} className="tool-call__title">{label}</span>
        <span className="tool-call__meta">
          {title && <code className="tool-call__name">{name}</code>}
          <span className="tool-call__status">
            {word}
            {finished && durationMs !== undefined && ` · ${seconds(durationMs)}`}
          </span>
        </span>
      </span>
    </span>
  )

  return (
    <div
      {...rest}
      ref={ref}
      className={cn('tool-call', `tool-call--${status}`, className)}
      aria-busy={status === 'running' || undefined}
    >
      {hasDetails ? (
        <Collapsible title={summary} defaultOpen={defaultOpen} className="tool-call__disclosure">
          <div className="tool-call__details">
            {input !== undefined && (
              <CodeBlock code={asText(input)} filename="Input" language={typeof input === 'string' ? undefined : 'json'} wrap />
            )}
            {status === 'error' && error && <p className="tool-call__error">{error}</p>}
            {output !== undefined && (
              <CodeBlock code={asText(output)} filename="Output" language={typeof output === 'string' ? undefined : 'json'} wrap maxHeight={320} />
            )}
          </div>
        </Collapsible>
      ) : (
        <div className="tool-call__row">{summary}</div>
      )}
      {awaiting && (
        <div className="tool-call__approval" role="group" aria-labelledby={`${id}-ask ${id}-title`}>
          <p id={`${id}-ask`} className="tool-call__ask">Allow this?</p>
          <div className="tool-call__actions">
            <Button onClick={onApprove}>Allow</Button>
            <Button variant="secondary" onClick={onDeny}>Deny</Button>
          </div>
        </div>
      )}
    </div>
  )
})

ToolCall.displayName = 'ToolCall'
