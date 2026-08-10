import { cn } from '../../../lib/cn'
import './Label.css'

type LabelProps = {
  htmlFor?: string
  required?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function Label({ htmlFor, required, disabled, children, className }: LabelProps) {
  const classes = cn('label', required && 'label--required', disabled && 'label--disabled', className)

  return (
    <label className={classes} htmlFor={htmlFor}>
      {children}
    </label>
  )
}
