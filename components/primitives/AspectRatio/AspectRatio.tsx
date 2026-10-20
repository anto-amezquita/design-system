import { forwardRef } from 'react'
import { cn } from '../../../lib/cn'
import './AspectRatio.css'

/** Common ratios by name, width / height. Portrait ones put the smaller number first. */
export type AspectRatioPreset = '1/1' | '4/3' | '3/2' | '16/9' | '21/9' | '3/4' | '9/16'

type AspectRatioOwnProps = {
  /**
   * Width over height: a preset like `'16/9'`, or a number like `1.85`.
   * Default `'16/9'`. A value that isn't a positive number falls back to 1/1.
   */
  ratio?: AspectRatioPreset | number
  /**
   * How an `img`, `video` or `picture` child fills the box: `cover` (default)
   * crops to fill it, `contain` shows all of it with space around.
   */
  fit?: 'cover' | 'contain'
  /** Round the corners with the brand's image radius. */
  rounded?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & AspectRatioOwnProps

function toNumber(ratio: AspectRatioPreset | number): number {
  const n = typeof ratio === 'number' ? ratio : (([w, h]) => w / h)(ratio.split('/').map(Number))
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Keeps its content at a fixed width-to-height ratio as the width changes:
 * images, video, embeds, maps. The space is held before the media loads, so
 * the page doesn't jump.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio({
  ratio = '16/9',
  fit = 'cover',
  rounded = false,
  className,
  style,
  ...rest
}, ref) {
  return (
    <div
      {...rest}
      ref={ref}
      style={{ aspectRatio: toNumber(ratio), ...style }}
      className={cn('aspect-ratio', `aspect-ratio--${fit}`, rounded && 'aspect-ratio--rounded', className)}
    />
  )
})

AspectRatio.displayName = 'AspectRatio'
