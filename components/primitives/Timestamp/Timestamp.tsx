'use client'

import { forwardRef, useEffect, useState } from 'react'
import { cn } from '../../../lib/cn'
import { formatRelative, nextTick, relativeParts } from '../../../lib/relative-time'
import './Timestamp.css'

type TimestampOwnProps = {
  /** The moment: a Date, an ISO string or epoch milliseconds. */
  date: Date | string | number
  /**
   * `relative` (default): "5 minutes ago", "yesterday", switching to a date
   * after `relativeLimitDays`. `date`: "20 Oct 2026". `datetime`:
   * "20 Oct 2026, 11:30". `time`: "11:30".
   */
  format?: 'relative' | 'date' | 'datetime' | 'time'
  /** Locale for the words and the date order. Default: the browser's. */
  locale?: string
  /** With `relative`: past this many calendar days, show the date instead. Default 7. */
  relativeLimitDays?: number
  /** With `relative`: keep the text current while the page is open. Default `true`. */
  live?: boolean
}

// decisions/0007: typed against the native attributes so `...rest` reaches the element.
type TimestampProps = Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'> & TimestampOwnProps

const toDate = (d: Date | string | number) => (d instanceof Date ? d : new Date(d))

/**
 * A moment in time as people say it: "5 minutes ago", "yesterday", or a
 * date. It's a `time` element with the exact moment in `dateTime` for
 * machines, and the full date and time as its tooltip.
 */
export const Timestamp = forwardRef<HTMLTimeElement, TimestampProps>(function Timestamp({
  date,
  format = 'relative',
  locale,
  relativeLimitDays = 7,
  live = true,
  className,
  title,
  ...rest
}, ref) {
  const moment = toDate(date)
  const [now, setNow] = useState(() => new Date())
  const valid = !Number.isNaN(moment.getTime())

  // Re-render as the relative words change: every 15 s near now, every minute
  // within a day, hourly after that. Nothing runs for absolute formats.
  useEffect(() => {
    if (!valid || format !== 'relative' || !live) return
    const id = setTimeout(() => setNow(new Date()), nextTick(moment, now))
    return () => clearTimeout(id)
  }, [valid, format, live, moment.getTime(), now])

  if (!valid) {
    return <time {...rest} ref={ref} className={cn('timestamp', className)}>—</time>
  }

  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(moment)
  const absolute = (style: 'date' | 'datetime' | 'time') =>
    new Intl.DateTimeFormat(locale, {
      ...(style !== 'time' && { day: 'numeric', month: 'short', year: 'numeric' }),
      ...(style !== 'date' && { hour: '2-digit', minute: '2-digit' }),
    }).format(moment)

  let text: string
  if (format === 'relative') {
    const parts = relativeParts(moment, now, relativeLimitDays)
    text = parts ? formatRelative(parts, locale) : absolute('date')
  } else {
    text = absolute(format)
  }

  return (
    <time
      {...rest}
      ref={ref}
      dateTime={moment.toISOString()}
      title={title ?? full}
      // Relative text depends on the clock, so the server's render and the
      // first client render can differ by a few seconds; the client's wins.
      suppressHydrationWarning
      className={cn('timestamp', className)}
    >
      {text}
    </time>
  )
})

Timestamp.displayName = 'Timestamp'
