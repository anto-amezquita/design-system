import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/cn'
import './ProgressBar.css'

type ProgressBarOwnProps = {
  /** Progress so far, from 0 to `max`. Leave it out when the end can't be known yet: the bar turns indeterminate. */
  value?: number | null
  /** The value that means done. Default 100. */
  max?: number
  /** What is progressing, e.g. "Uploading photos". Always the accessible name; shown above the bar unless `hideLabel`. */
  label: string
  /** Keep the label for screen readers only, when the context already says it. */
  hideLabel?: boolean
  /** Show the percentage next to the label. Ignored while indeterminate. */
  showValue?: boolean
  /** Replaces the percentage, for screen readers and `showValue`, with words that fit better: "3 of 10 files". */
  valueText?: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type ProgressBarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & ProgressBarOwnProps

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar({
  value,
  max = 100,
  label,
  hideLabel = false,
  showValue = false,
  valueText,
  className,
  ...rest
}, ref) {
  const labelId = useId()
  const indeterminate = value == null || !Number.isFinite(value)
  const safeMax = max > 0 ? max : 100
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), safeMax)
  const percent = Math.round((clamped / safeMax) * 100)
  const shownValue = valueText ?? `${percent}%`

  return (
    <div {...rest} ref={ref} className={cn('progress-bar', indeterminate && 'progress-bar--indeterminate', className)}>
      <div className={cn('progress-bar__header', hideLabel && 'progress-bar__header--hidden')}>
        <span id={labelId} className="progress-bar__label">{label}</span>
        {showValue && !indeterminate && (
          <span className="progress-bar__value" aria-hidden="true">{shownValue}</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : valueText}
        aria-busy={indeterminate || undefined}
        className="progress-bar__track"
      >
        <div
          className="progress-bar__fill"
          style={indeterminate ? undefined : { inlineSize: `${(clamped / safeMax) * 100}%` }}
        />
      </div>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'
