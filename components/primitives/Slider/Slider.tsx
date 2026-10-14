'use client'

import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/cn'
import { useUncontrolledValue } from '../../../lib/useUncontrolledValue'
import './Slider.css'

type SliderOwnProps = {
  /** What the value is, e.g. "Volume". Required: it's the input's accessible name. Shown above the track unless `hideLabel`. */
  label: string
  /** Keep the label for screen readers only, when the context already says it. */
  hideLabel?: boolean
  /** Help text under the track, linked with `aria-describedby`. */
  hint?: string
  /** Controlled value. Pair with `onValueChange`. */
  value?: number
  /** Starting value when uncontrolled. Defaults to `min`. */
  defaultValue?: number
  /** Called on every change, while dragging and on each key press. */
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Show the current value beside the label. */
  showValue?: boolean
  /** Turns the number into words, for the visible value and for screen readers (`aria-valuetext`): `v => \`${v}%\``. */
  formatValue?: (value: number) => string
  disabled?: boolean
  /** Submits the value with a form under this name. */
  name?: string
  id?: string
}

// decisions/0007: native input attributes reach the <input>; the value props are our own.
type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'children'> & SliderOwnProps

/**
 * One value from a range, by dragging or with the keyboard: volume, a
 * price limit, opacity. A native range input underneath, so arrow keys,
 * Page Up / Down and Home / End work, and screen readers announce it as a
 * slider. The track fills up to the thumb.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider({
  label,
  hideLabel = false,
  hint,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  formatValue,
  disabled = false,
  name,
  id: idProp,
  className,
  style,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`

  const [value, isControlled, setValue] = useUncontrolledValue<number>(valueProp, defaultValue ?? min, min)
  const clamped = Math.min(Math.max(value, min), max)
  const fill = max > min ? ((clamped - min) / (max - min)) * 100 : 0
  const text = formatValue ? formatValue(clamped) : String(clamped)

  return (
    <div className={cn('slider', disabled && 'slider--disabled', className)}>
      <div className={cn('slider__header', hideLabel && 'slider__header--hidden')}>
        <label htmlFor={id} className="slider__label">{label}</label>
        {showValue && <output htmlFor={id} className="slider__value" aria-hidden="true">{text}</output>}
      </div>
      <input
        {...rest}
        ref={ref}
        id={id}
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-valuetext={formatValue ? text : undefined}
        aria-describedby={hint ? hintId : undefined}
        className="slider__input"
        style={{ ...style, '--slider-fill': `${fill}%` } as React.CSSProperties}
        onChange={event => {
          const next = Number(event.target.value)
          if (!isControlled) setValue(next)
          onValueChange?.(next)
        }}
      />
      {hint && <p id={hintId} className="slider__hint">{hint}</p>}
    </div>
  )
})

Slider.displayName = 'Slider'
