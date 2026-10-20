'use client'

import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { Button } from '../../primitives/Button'
import { DescriptionList } from '../../primitives/DescriptionList'
import { Icon } from '../../primitives/Icon'
import { Input } from '../../primitives/Input'
import { SelectableCard, SelectableCardGroup } from '../../primitives/SelectableCard'
import './PromptForm.css'

export type PromptQuestion = {
  /** Unique within the form; the key of this question's answer. */
  id: string
  /** The question, as a full sentence: "Which framework is the app in?" */
  question: string
  /** The choices. Each can carry a description to help decide. */
  options: { value: string; label: string; description?: string }[]
  /** Pick any number instead of one. Default `false`. */
  multiple?: boolean
  /** Add an "Other" choice that asks for the answer in words. Default `true`. */
  allowOther?: boolean
}

/** Each question's id mapped to the chosen values; an "Other" answer is its text. */
export type PromptAnswers = Record<string, string[]>

type PromptFormOwnProps = {
  /** What the form is for, shown above the questions: "A few questions before I start". */
  title: string
  /** One to four questions, answered together. */
  questions: PromptQuestion[]
  /** Called with every answer once each question has one. The form then shows a summary. */
  onSubmit: (answers: PromptAnswers) => void
  /** Offer to go on without answering. The form then shows "Skipped". */
  onSkip?: () => void
  /** Show a form answered earlier (in a conversation's history) as its summary, not as a form. */
  answers?: PromptAnswers | 'skipped'
  /** The submit button's label. Default "Send answers". */
  submitLabel?: string
}

// decisions/0007: typed against the native attributes so `...rest` reaches the section.
type PromptFormProps = Omit<React.HTMLAttributes<HTMLElement>, 'onSubmit' | 'title'> & PromptFormOwnProps

const OTHER = '__other__'

/**
 * Questions an assistant asks before it goes on: each a set of choices,
 * one or several, with "Other" for an answer in words. Sent together, the
 * form becomes a summary of what was answered, so the conversation keeps
 * a record of it.
 */
export const PromptForm = forwardRef<HTMLElement, PromptFormProps>(function PromptForm({
  title,
  questions,
  onSubmit,
  onSkip,
  answers: answeredBefore,
  submitLabel = 'Send answers',
  className,
  ...rest
}, ref) {
  const id = useId()
  const titleId = `${id}-title`
  const [chosen, setChosen] = useState<Record<string, string[]>>({})
  const [other, setOther] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, { choice?: string; other?: string }>>({})
  const [done, setDone] = useState<PromptAnswers | 'skipped' | undefined>(answeredBefore)
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const justDone = useRef(false)

  // After sending or skipping, the form leaves the page; move focus to the
  // summary that replaces it, so keyboard and screen reader users aren't
  // dropped at the top of the document.
  useEffect(() => {
    if (done && justDone.current) {
      justDone.current = false
      summaryRef.current?.focus()
    }
  }, [done])

  const labelOf = (q: PromptQuestion, value: string) => q.options.find(o => o.value === value)?.label ?? value

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const found: typeof errors = {}
    const result: PromptAnswers = {}
    for (const q of questions) {
      const values = chosen[q.id] ?? []
      if (values.length === 0) {
        found[q.id] = { choice: q.multiple ? 'Choose at least one.' : 'Choose an answer.' }
        continue
      }
      const text = (other[q.id] ?? '').trim()
      if (values.includes(OTHER) && !text) {
        found[q.id] = { other: 'Write your answer, or choose another option.' }
        continue
      }
      result[q.id] = values.map(v => (v === OTHER ? text : v))
    }
    setErrors(found)
    const first = questions.find(q => found[q.id])
    if (first) {
      // Focus the first thing to fix: the question's first choice, or its "Other" text.
      const block = formRef.current?.querySelector<HTMLElement>(`[data-question="${CSS.escape(first.id)}"]`)
      const target = found[first.id].other
        ? block?.querySelector<HTMLElement>('input[type="text"]')
        : block?.querySelector<HTMLElement>('input')
      target?.focus()
      return
    }
    justDone.current = true
    setDone(result)
    onSubmit(result)
  }

  const skip = () => {
    justDone.current = true
    setDone('skipped')
    onSkip?.()
  }

  const header = <p id={titleId} className="prompt-form__title">{title}</p>

  if (done) {
    return (
      <section {...rest} ref={ref} className={cn('prompt-form', 'prompt-form--answered', className)} aria-labelledby={titleId}>
        <div ref={summaryRef} className="prompt-form__summary" tabIndex={-1}>
          {header}
          {done === 'skipped' ? (
            <p className="prompt-form__skipped">Skipped</p>
          ) : (
            <DescriptionList
              layout="stacked"
              items={questions.map(q => ({
                id: q.id,
                term: q.question,
                description: (done[q.id] ?? []).map(v => labelOf(q, v)).join(', ') || '—',
              }))}
            />
          )}
        </div>
      </section>
    )
  }

  return (
    <section {...rest} ref={ref} className={cn('prompt-form', className)} aria-labelledby={titleId}>
      {header}
      <form ref={formRef} className="prompt-form__form" onSubmit={submit} noValidate aria-labelledby={titleId}>
        {questions.map(q => {
          const values = chosen[q.id] ?? []
          const error = errors[q.id]
          const legendId = `${id}-${q.id}-legend`
          const errorId = `${id}-${q.id}-error`
          const showOther = values.includes(OTHER)
          return (
            // With "Other" open, a group named by the question puts its text field
            // in context; otherwise the fieldset already does, and a second group would be noise.
            <div
              key={q.id}
              className="prompt-form__question"
              data-question={q.id}
              role={showOther ? 'group' : undefined}
              aria-labelledby={showOther ? legendId : undefined}
            >
              <SelectableCardGroup
                legend={<span id={legendId}>{q.question}</span>}
                type={q.multiple ? 'multiple' : 'single'}
                value={values}
                onValueChange={next => {
                  setChosen(c => ({ ...c, [q.id]: next }))
                  if (error?.choice) setErrors(e => ({ ...e, [q.id]: {} }))
                }}
                aria-describedby={error?.choice ? errorId : undefined}
              >
                {q.options.map(o => (
                  <SelectableCard key={o.value} value={o.value} title={o.label} description={o.description} />
                ))}
                {q.allowOther !== false && <SelectableCard value={OTHER} title="Other" />}
              </SelectableCardGroup>
              {error?.choice && (
                <p id={errorId} className="prompt-form__error">
                  <Icon icon={WarningCircleIcon} size="sm" weight="fill" />
                  {error.choice}
                </p>
              )}
              {showOther && (
                <Input
                  label="Your answer"
                  value={other[q.id] ?? ''}
                  onChange={text => {
                    setOther(o => ({ ...o, [q.id]: text }))
                    if (error?.other) setErrors(e => ({ ...e, [q.id]: {} }))
                  }}
                  error={error?.other}
                />
              )}
            </div>
          )
        })}
        <div className="prompt-form__actions">
          <Button type="submit">{submitLabel}</Button>
          {onSkip && <Button variant="ghost" onClick={skip}>Skip</Button>}
        </div>
      </form>
    </section>
  )
})

PromptForm.displayName = 'PromptForm'
