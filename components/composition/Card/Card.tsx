'use client'

import './Card.css'

type CardProps = {
  variant?: 'default' | 'ghost'
  interactive?: boolean
  horizontal?: boolean
  compact?: boolean
  featured?: boolean
  children: React.ReactNode
  onClick?: () => void
  'aria-label'?: string
}

type CardTitleProps = {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function Card({ variant = 'default', interactive, horizontal, compact, featured, children, onClick, 'aria-label': ariaLabel }: CardProps) {
  // isInteractive: controls hover styles (card--interactive CSS class)
  // isClickable: requires an onClick handler — enables ARIA role, tabIndex, keyboard activation
  const isInteractive = interactive ?? Boolean(onClick)
  const isClickable = Boolean(onClick)

  const classNames = ['card']
  if (variant !== 'default') classNames.push(`card--${variant}`)
  if (isInteractive) classNames.push('card--interactive')
  if (isClickable) classNames.push('card--clickable')
  if (horizontal) classNames.push('card--horizontal')
  if (compact) classNames.push('card--compact')
  if (featured) classNames.push('card--featured')

  function handleClick(e: React.MouseEvent) {
    // Don't trigger the card action when an inner interactive element (button, link,
    // role="button") was the actual target — prevents double-invocation when cards
    // contain their own interactive children.
    const inner = (e.target as Element).closest('button, a, [role="button"]')
    if (inner && inner !== e.currentTarget) return
    onClick!()
  }

  if (isClickable) {
    return (
      <button
        type="button"
        className={classNames.join(' ')}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={classNames.join(' ')}>
      {children}
    </div>
  )
}

export function CardMedia({ children }: { children: React.ReactNode }) {
  return <div className="card__media">{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card__footer">{children}</div>
}

export function CardTitle({ children, as: Tag = 'h3' }: CardTitleProps) {
  return <Tag className="card__title">{children}</Tag>
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="card__description">{children}</p>
}
