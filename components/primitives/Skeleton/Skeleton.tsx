import './Skeleton.css'

type SkeletonVariant = 'text' | 'circle' | 'rect'

type SkeletonProps = {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  lines?: number
  // Pass a label (e.g. "Loading…") on ONE skeleton per loading context to announce the
  // loading state to screen readers. Omit on additional skeletons in the same region to
  // avoid multiple identical announcements.
  label?: string
}

function toSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

export function Skeleton({ variant = 'text', width, height, lines = 1, label }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    const groupStyle: React.CSSProperties = {}
    if (width !== undefined) groupStyle.width = toSize(width)
    return (
      <div className="skeleton-group" style={Object.keys(groupStyle).length ? groupStyle : undefined}>
        {label && <span role="status" className="skeleton__sr-label">{label}</span>}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton--text"
            aria-hidden="true"
            style={i === lines - 1 ? { width: '75%' } : undefined}
          />
        ))}
      </div>
    )
  }

  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = toSize(width)
  if (height !== undefined) style.height = toSize(height)

  if (!label) {
    return (
      <div
        className={`skeleton skeleton--${variant}`}
        style={Object.keys(style).length ? style : undefined}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="skeleton__container">
      <span role="status" className="skeleton__sr-label">{label}</span>
      <div
        className={`skeleton skeleton--${variant}`}
        style={Object.keys(style).length ? style : undefined}
        aria-hidden="true"
      />
    </div>
  )
}
