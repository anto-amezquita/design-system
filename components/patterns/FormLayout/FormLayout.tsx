'use client'

import { forwardRef, useEffect, useId, useRef } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import './FormLayout.css'

/* ── FormLayout ─────────────────────────────────────────────────────────── */

type FormLayoutProps = React.FormHTMLAttributes<HTMLFormElement> & {
  /** `form` (default) or `div`, when the form element lives elsewhere. */
  as?: 'form' | 'div'
}

/**
 * The frame of a form: consistent space between fields, sections and the
 * actions, at a readable width. Put Fields, Inputs, FormSections, FormRows
 * and FormActions inside.
 */
export const FormLayout = forwardRef<HTMLFormElement, FormLayoutProps>(function FormLayout(
  { as: Tag = 'form', className, ...rest },
  ref,
) {
  return <Tag {...(rest as React.HTMLAttributes<HTMLElement>)} ref={ref as React.Ref<HTMLFormElement & HTMLDivElement>} className={cn('form-layout', className)} />
})

FormLayout.displayName = 'FormLayout'

/* ── FormSection ────────────────────────────────────────────────────────── */

type FormSectionProps = Omit<React.HTMLAttributes<HTMLElement>, 'title'> & {
  /** The section's heading. Names the section, so screen-reader users can jump to it. */
  title: string
  /** A line under the heading: what this part is for. */
  description?: string
  /** Heading element. Default `h2`; pick the level that fits the page outline. */
  headingLevel?: 2 | 3 | 4
}

/** A titled part of a long form: "Contact details", "Delivery". */
export const FormSection = forwardRef<HTMLElement, FormSectionProps>(function FormSection(
  { title, description, headingLevel = 2, className, children, ...rest },
  ref,
) {
  const id = useId()
  const Heading = `h${headingLevel}` as const
  return (
    <section {...rest} ref={ref} aria-labelledby={`${id}-title`} className={cn('form-section', className)}>
      <div className="form-section__header">
        <Heading id={`${id}-title`} className="form-section__title">{title}</Heading>
        {description && <p className="form-section__description">{description}</p>}
      </div>
      {children}
    </section>
  )
})

FormSection.displayName = 'FormSection'

/* ── FormRow ────────────────────────────────────────────────────────────── */

type FormRowProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Fields side by side when there is room: 2 (default) or 3. They stack in a narrow container. */
  columns?: 2 | 3
}

/** Short fields that belong together on one line: first and last name, postcode and city. */
export const FormRow = forwardRef<HTMLDivElement, FormRowProps>(function FormRow(
  { columns = 2, className, style, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cn('form-row', className)}
      style={{ ...style, '--form-row-columns': columns } as React.CSSProperties}
    />
  )
})

FormRow.displayName = 'FormRow'

/* ── FormActions ────────────────────────────────────────────────────────── */

type FormActionsProps = React.HTMLAttributes<HTMLDivElement>

/** The buttons that end the form. Put the main action last. */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cn('form-actions', className)} />
})

FormActions.displayName = 'FormActions'

/* ── FormErrorSummary ───────────────────────────────────────────────────── */

export type FormError = {
  /** The id of the field with the problem; the link moves focus there. */
  id: string
  /** The same message the field shows. */
  message: string
}

type FormErrorSummaryProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  errors: FormError[]
  /** Default: "There is a problem" or "There are 3 problems". */
  title?: string
  /** Take focus when it appears or the errors change, so it's read straight after a failed submit. Default `true`. */
  focusOnChange?: boolean
}

/**
 * The list of problems after a failed submit, at the top of the form. It
 * takes focus so screen readers read it at once, and each item links to
 * its field. Renders nothing when there are no errors.
 */
export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(function FormErrorSummary(
  { errors, title, focusOnChange = true, className, ...rest },
  ref,
) {
  const id = useId()
  const own = useRef<HTMLDivElement>(null)
  const key = errors.map(e => `${e.id}:${e.message}`).join('|')

  useEffect(() => {
    if (focusOnChange && errors.length > 0) own.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, focusOnChange])

  if (errors.length === 0) return null

  const heading = title ?? (errors.length === 1 ? 'There is a problem' : `There are ${errors.length} problems`)

  return (
    <div
      {...rest}
      ref={node => {
        own.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      role="region"
      className={cn('form-error-summary', className)}
    >
      <h2 id={`${id}-title`} className="form-error-summary__title">
        <WarningCircleIcon weight="fill" aria-hidden="true" className="form-error-summary__icon" />
        {heading}
      </h2>
      <ul className="form-error-summary__list">
        {errors.map(error => (
          <li key={error.id}>
            <a
              href={`#${error.id}`}
              className="form-error-summary__link"
              onClick={event => {
                // Focus the field itself (a plain #link only scrolls to it in some browsers).
                const field = document.getElementById(error.id)
                if (field) {
                  event.preventDefault()
                  field.focus()
                  field.scrollIntoView({ block: 'center' })
                }
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
})

FormErrorSummary.displayName = 'FormErrorSummary'
