'use client'

import { useEffect, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import { IconButton } from '../../primitives/IconButton'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useThemeScopeAttributes } from '../../../lib/theme-scope'
import { cn } from '../../../lib/cn'
import './Lightbox.css'

export type LightboxImage = {
  src: string
  /** What the image shows. Required: it's the image's name for screen readers. */
  alt: string
  /** Shown under the image. */
  caption?: string
  /** Intrinsic size, so the space is kept while the image loads. */
  width?: number
  height?: number
  /** A smaller version for LightboxGallery's thumbnails. Defaults to `src`. */
  thumbnail?: string
}

type LightboxProps = {
  images: LightboxImage[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Which image shows, from 0. */
  index: number
  onIndexChange: (index: number) => void
  /** Names the dialog. Default "Images". */
  title?: string
  /** Words for other languages. */
  labels?: { previous?: string; next?: string; close?: string; of?: string }
}

/**
 * Images large, one at a time, over the page: a product's photos, a
 * portfolio piece. A modal dialog on the brand's own surface. Previous and
 * next buttons, the arrow keys, Home and End, and a swipe move through the
 * images, wrapping at the ends; each change is announced. Escape closes it
 * and focus goes back to what opened it.
 */
export function Lightbox({ images, open, onOpenChange, index, onIndexChange, title = 'Images', labels = {} }: LightboxProps) {
  const scope = useThemeScopeAttributes()
  const returnTo = useRef<HTMLElement | null>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const { previous = 'Previous image', next = 'Next image', close = 'Close', of = 'of' } = labels
  const count = images.length
  const at = Math.min(Math.max(index, 0), Math.max(count - 1, 0))
  const image = images[at]
  // Announced on change, not on open: the dialog's own name and the image cover that.
  const [announce, setAnnounce] = useState('')

  const go = (to: number) => {
    if (count < 2) return
    const n = (to + count) % count
    onIndexChange(n)
    setAnnounce(`${n + 1} ${of} ${count}: ${images[n].caption ?? images[n].alt}`)
  }

  useEffect(() => { if (!open) setAnnounce('') }, [open])

  if (!image) return null

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Content
          {...scope}
          className="lightbox"
          aria-describedby={undefined}
          onOpenAutoFocus={() => { returnTo.current = document.activeElement as HTMLElement | null }}
          onCloseAutoFocus={e => {
            const el = returnTo.current
            if (el && el.isConnected && el !== document.body) { e.preventDefault(); el.focus() }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1) }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1) }
            else if (e.key === 'Home') { e.preventDefault(); go(0) }
            else if (e.key === 'End') { e.preventDefault(); go(count - 1) }
          }}
          onPointerDown={e => { if (e.pointerType === 'touch') swipe.current = { x: e.clientX, y: e.clientY } }}
          onPointerUp={e => {
            const s = swipe.current
            swipe.current = null
            if (!s) return
            const dx = e.clientX - s.x
            // A clear sideways swipe, not a scroll or a tap.
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? at + 1 : at - 1)
          }}
        >
          <div className="lightbox__bar">
            <RadixDialog.Title className="lightbox__title">
              {title}
              {count > 1 && <span className="lightbox__count">{at + 1} {of} {count}</span>}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <IconButton variant="secondary" icon={<XIcon />} label={close} />
            </RadixDialog.Close>
          </div>
          <figure className="lightbox__stage">
            <img
              key={image.src}
              className="lightbox__image"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              draggable={false}
            />
            {image.caption && <figcaption className="lightbox__caption">{image.caption}</figcaption>}
          </figure>
          {count > 1 && (
            <>
              <IconButton variant="secondary" icon={<CaretLeftIcon />} label={previous} className="lightbox__nav lightbox__nav--prev" onClick={() => go(at - 1)} />
              <IconButton variant="secondary" icon={<CaretRightIcon />} label={next} className="lightbox__nav lightbox__nav--next" onClick={() => go(at + 1)} />
            </>
          )}
          <VisuallyHidden role="status">{announce}</VisuallyHidden>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

type LightboxGalleryProps = {
  images: LightboxImage[]
  /** Names the gallery and the dialog. */
  title: string
  labels?: LightboxProps['labels']
  className?: string
}

/**
 * Thumbnails that open a Lightbox at the one chosen. Each thumbnail is a
 * button named "Open <alt>", and focus returns to it on close.
 */
export function LightboxGallery({ images, title, labels, className }: LightboxGalleryProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  return (
    <>
      <ul className={cn('lightbox-gallery', className)} aria-label={title}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" className="lightbox-gallery__thumb" onClick={() => { setIndex(i); setOpen(true) }}>
              <img src={img.thumbnail ?? img.src} alt="" width={img.width} height={img.height} loading="lazy" />
              <VisuallyHidden>Open {img.alt}</VisuallyHidden>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} title={title} labels={labels} />
    </>
  )
}
