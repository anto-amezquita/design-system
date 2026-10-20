'use client'

import { createContext, forwardRef, useContext, useId } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import { Grid } from '../Grid'
import './SelectableCard.css'

type GroupContext = {
  type: 'single' | 'multiple'
  name: string
  selected: string[]
  toggle: (value: string, checked: boolean) => void
  disabled: boolean
  required: boolean
}

const SelectableCardContext = createContext<GroupContext | null>(null)

/* ── SelectableCardGroup ────────────────────────────────────────────────── */

type SelectableCardGroupProps = Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> & {
  /** The question the cards answer: "Plan", "Where should we ship it?". Rendered as the fieldset's legend. */
  legend: React.ReactNode
  /** `single` (default): pick one, radios underneath. `multiple`: pick any, checkboxes underneath. */
  type?: 'single' | 'multiple'
  /** Form field name. Generated when left out. */
  name?: string
  /** Controlled selection: the chosen values. Pair with `onValueChange`. */
  value?: string[]
  /** Uncontrolled starting selection. */
  defaultValue?: string[]
  /** Called with the new selection. */
  onValueChange?: (value: string[]) => void
  /** Side by side: as many as fit with each at least 256px wide (Grid's `md`). Default `false`: one per row. */
  columns?: boolean
  /** With `single`, a choice is required to submit the form. */
  required?: boolean
  children: React.ReactNode
}

/**
 * A question answered by choosing cards: a `fieldset` whose `legend` is the
 * question, with native radios (`single`) or checkboxes (`multiple`) under
 * the cards, so arrow keys, forms and `required` work as usual.
 */
export const SelectableCardGroup = forwardRef<HTMLFieldSetElement, SelectableCardGroupProps>(function SelectableCardGroup({
  legend,
  type = 'single',
  name,
  value,
  defaultValue,
  onValueChange,
  columns = false,
  required = false,
  disabled = false,
  className,
  children,
  ...rest
}, ref) {
  const autoName = useId()
  const [selected, isControlled, setSelected] = useUncontrolledValue<string[]>(value, defaultValue, [])

  const toggle = (v: string, checked: boolean) => {
    const next = type === 'single'
      ? [v]
      : checked ? [...selected.filter(s => s !== v), v] : selected.filter(s => s !== v)
    if (!isControlled) setSelected(next)
    onValueChange?.(next)
  }

  return (
    <fieldset {...rest} ref={ref} disabled={disabled} className={cn('selectable-card-group', className)}>
      <legend className="selectable-card-group__legend">{legend}</legend>
      <SelectableCardContext.Provider value={{ type, name: name ?? autoName, selected, toggle, disabled, required }}>
        {columns
          ? <Grid minItemWidth="md" gap="inline">{children}</Grid>
          : <div className="selectable-card-group__stack">{children}</div>}
      </SelectableCardContext.Provider>
    </fieldset>
  )
})

SelectableCardGroup.displayName = 'SelectableCardGroup'

/* ── SelectableCard ─────────────────────────────────────────────────────── */

type SelectableCardProps = Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'title'> & {
  /** The value this card stands for, unique in its group. */
  value: string
  /** The choice's name: "Pro". It's the radio's or checkbox's label. */
  title: React.ReactNode
  /** A line or two under the title, read as the control's description. */
  description?: React.ReactNode
  /** A short detail at the end of the title row: a price, a delivery time. */
  meta?: React.ReactNode
  /** This card can't be chosen. */
  disabled?: boolean
}

/** One choice in a SelectableCardGroup. The whole card is the control's label, so clicking anywhere on it chooses it. */
export const SelectableCard = forwardRef<HTMLLabelElement, SelectableCardProps>(function SelectableCard({
  value,
  title,
  description,
  meta,
  disabled: disabledProp = false,
  className,
  ...rest
}, ref) {
  const group = useContext(SelectableCardContext)
  if (!group) throw new Error('SelectableCard must be inside a SelectableCardGroup')
  const id = useId()
  const checked = group.selected.includes(value)
  const disabled = disabledProp || group.disabled

  return (
    <label
      {...rest}
      ref={ref}
      htmlFor={`${id}-input`}
      className={cn(
        'selectable-card',
        `selectable-card--${group.type}`,
        checked && 'selectable-card--checked',
        disabled && 'selectable-card--disabled',
        className,
      )}
    >
      <input
        id={`${id}-input`}
        className="selectable-card__input"
        type={group.type === 'single' ? 'radio' : 'checkbox'}
        name={group.name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={group.type === 'single' && group.required}
        // Named by the title (and meta, e.g. the price), described by the
        // description, rather than by everything the label contains.
        aria-labelledby={meta ? `${id}-title ${id}-meta` : `${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        onChange={event => group.toggle(value, event.target.checked)}
      />
      <span className="selectable-card__header">
        <span id={`${id}-title`} className="selectable-card__title">{title}</span>
        {meta && <span id={`${id}-meta`} className="selectable-card__meta">{meta}</span>}
        <span className="selectable-card__indicator" aria-hidden="true">
          {checked && <CheckIcon weight="bold" className="selectable-card__check" />}
        </span>
      </span>
      {description && <span id={`${id}-description`} className="selectable-card__description">{description}</span>}
    </label>
  )
})

SelectableCard.displayName = 'SelectableCard'
