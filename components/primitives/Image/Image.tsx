'use client'

import { forwardRef, useEffect, useId, useState } from 'react'
import { ImageBrokenIcon } from '@phosphor-icons/react'
import { cn } from '../../../lib/cn'
import { AspectRatio, type AspectRatioPreset } from '../AspectRatio'
import './Image.css'

type ImageOwnProps = {
  src: string
  /**
   * Required. What the image shows, for anyone who can't see it. Pass `""`
   * only when it's decoration and the text around it already says everything;
   * screen readers then skip it.
   */
  alt: string
  /**
   * Hold the image at a ratio (`'16/9'`, `'1/1'`, a number) whatever its
   * file's size. Leave it out to keep the file's own shape; then set `width`
   * and `height` so the browser can hold the space before it loads.
   */
  ratio?: AspectRatioPreset | number
  /** With `ratio`: `cover` (default) crops to fill, `contain` shows all of it. */
  fit?: 'cover' | 'contain'
  /** Round the corners with the brand's image radius. */
  rounded?: boolean
  /** A caption under the image. The image and caption render as a `figure`. */
  caption?: React.ReactNode
  /** `lazy` (default) waits until the image is near the screen; `eager` for the first image a page shows. */
  loading?: 'lazy' | 'eager'
}

// decisions/0007: typed against the native attributes so `...rest` reaches the img.
type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'children'> & ImageOwnProps

/**
 * An image with the system's loading, error and caption behaviour: space
 * held before it loads, a quiet fallback if it fails, and a required `alt`.
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image({
  src,
  alt,
  ratio,
  fit = 'cover',
  rounded = false,
  caption,
  loading = 'lazy',
  className,
  onError,
  width,
  height,
  ...rest
}, ref) {
  const [failed, setFailed] = useState(false)
  const captionId = useId()
  useEffect(() => setFailed(false), [src])

  const sized = ratio === undefined
  const media = failed ? (
    <span
      className={cn('image__fallback', sized && rounded && 'image--rounded', className)}
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      style={sized && width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      <ImageBrokenIcon className="image__fallback-icon" weight="regular" aria-hidden="true" focusable="false" />
    </span>
  ) : (
    <img
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={cn('image', sized && rounded && 'image--rounded', className)}
      onError={event => { setFailed(true); onError?.(event) }}
    />
  )

  const framed = sized ? media : (
    <AspectRatio ratio={ratio} fit={fit} rounded={rounded}>{media}</AspectRatio>
  )

  if (!caption) return framed
  return (
    // Browsers name a figure from its figcaption; aria-labelledby says so
    // explicitly, for tools that don't apply that rule.
    <figure className="image-figure" aria-labelledby={captionId}>
      {framed}
      <figcaption id={captionId} className="image-figure__caption">{caption}</figcaption>
    </figure>
  )
})

Image.displayName = 'Image'
