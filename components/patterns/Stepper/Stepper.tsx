'use client'

import { forwardRef } from 'react'
import { CheckIcon, WarningIcon } from '@phosphor-icons/react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { cn } from '../../../lib/cn'
import './Stepper.css'

export type StepperStep = {
  /** Stable React key. */
  id: string
  label: string
  /** A short second line: what the step is about, or what's missing. */
  description?: string
  /** Marks a step that needs attention, e.g. a finished step with a missing field. */
  error?: boolean
  /** Makes a finished step a link back to it. Use with routing; otherwise use `onStepClick`. */
  href?: string
}

type Status = 'complete' | 'current' | 'upcoming' | 'error'

type StepperOwnProps = {
  steps: StepperStep[]
  /** Index of the current step, from 0. Steps before it are done; steps after it are still to come. Use `steps.length` when everything is done. */
  current: number
  /** Makes finished steps buttons that go back to them. Upcoming steps are never clickable. */
  onStepClick?: (index: number) => void
  orientation?: 'horizontal' | 'vertical'
  /** Names the list. Defaults to "Progress". */
  'aria-label'?: string
  /** Visually hidden words for each state, for other languages. */
  statusLabels?: Partial<Record<Status, string>>
}

type StepperProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label'> & StepperOwnProps

const DEFAULT_STATUS: Record<Status, string> = {
  complete: 'Completed',
  current: 'Current step',
  upcoming: 'Not started',
  error: 'Needs attention',
}

/**
 * Where someone is in a process with a fixed order: checkout, sign-up,
 * an application. An ordered list; the current step has
 * `aria-current="step"`, and each step's state is also said in words, so
 * it doesn't rely on colour or icons. Finished steps can lead back.
 * Horizontal ones show only the current label when narrow.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper({
  steps,
  current,
  onStepClick,
  orientation = 'horizontal',
  'aria-label': ariaLabel = 'Progress',
  statusLabels,
  className,
  ...rest
}, ref) {
  const words = { ...DEFAULT_STATUS, ...statusLabels }
  const statusOf = (i: number, step: StepperStep): Status =>
    step.error ? 'error' : i < current ? 'complete' : i === current ? 'current' : 'upcoming'

  return (
    // Not a nav landmark: it shows progress; going back is a convenience.
    <div {...rest} ref={ref} className={cn('stepper', `stepper--${orientation}`, className)}>
      <ol className="stepper__list" aria-label={ariaLabel}>
        {steps.map((step, i) => {
          const status = statusOf(i, step)
          // Only steps already reached can be revisited.
          const reachable = i < current
          const body = (
            <>
              <span className="stepper__indicator" aria-hidden="true">
                {status === 'complete' ? <CheckIcon weight="bold" /> : status === 'error' ? <WarningIcon weight="bold" /> : i + 1}
              </span>
              <span className="stepper__text">
                {/* The state sits inside the label, so names read "Address (Completed)". */}
                <span className="stepper__label">{step.label}<VisuallyHidden> ({words[status]})</VisuallyHidden></span>
                {step.description && <span className="stepper__description">{step.description}</span>}
              </span>
            </>
          )
          return (
            <li
              key={step.id}
              className={cn('stepper__step', `stepper__step--${status}`, i < current && 'stepper__step--passed')}
              aria-current={i === current ? 'step' : undefined}
            >
              {reachable && step.href ? (
                <a className="stepper__target" href={step.href}>{body}</a>
              ) : reachable && onStepClick ? (
                <button type="button" className="stepper__target" onClick={() => onStepClick(i)}>{body}</button>
              ) : (
                <span className="stepper__target">{body}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
})

Stepper.displayName = 'Stepper'
