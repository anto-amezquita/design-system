'use client'

import { Children, cloneElement, isValidElement } from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'
import './Avatar.css'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
}

type AvatarGroupProps = {
  children: React.ReactNode
  max?: number
  size?: AvatarSize
  'aria-label'?: string
}

export function Avatar({ src, alt, fallback, size = 'md' }: AvatarProps) {
  if (process.env.NODE_ENV !== 'production' && src && alt === undefined) {
    console.warn('[Avatar] Provide an alt description when src is set, or pass alt="" to mark the image as decorative.')
  }
  const initials = fallback ?? (alt ? alt.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?')

  return (
    <RadixAvatar.Root className={`avatar avatar--${size}`}>
      {src && <RadixAvatar.Image className="avatar__image" src={src} alt={alt ?? ''} loading="lazy" decoding="async" />}
      <RadixAvatar.Fallback className="avatar__fallback" delayMs={src ? 600 : 0}>
        {initials}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}

export function AvatarGroup({ children, max = 5, size = 'md', 'aria-label': ariaLabel = 'User avatars' }: AvatarGroupProps) {
  const all = Children.toArray(children)
  const clampedMax = Math.max(0, max)
  const visible = all.slice(0, clampedMax)
  const overflow = Math.max(0, all.length - clampedMax)

  const sizedVisible = visible.map((child, i) =>
    // Preserve the caller's key when present; fall back to index only for keyless children.
    isValidElement<AvatarProps>(child) ? cloneElement(child, { key: child.key ?? i, size }) : child
  )

  const groupLabel = overflow > 0
    ? `${ariaLabel}, ${overflow} more not shown`
    : ariaLabel

  return (
    <div className="avatar-group" role="group" aria-label={groupLabel}>
      {sizedVisible}
      {overflow > 0 && (
        <div className={`avatar avatar--${size} avatar-group__overflow`} aria-hidden="true">
          +{overflow}
        </div>
      )}
    </div>
  )
}
