/**
 * Relative time for Timestamp: "now", "5 minutes ago", "in 2 hours",
 * "yesterday", "in 3 days", from Intl.RelativeTimeFormat, so every locale
 * gets its own words. Days count calendar days, not 24-hour blocks: 23:50
 * yesterday is "yesterday" at 00:10, not "20 minutes ago" turned into hours.
 */

import { compareDays } from './date'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export type RelativeParts = { value: number; unit: Intl.RelativeTimeFormatUnit }

/**
 * The value and unit to say, or `null` once it's further than `limitDays`
 * calendar days away (then show a date instead: "3 weeks ago" is vaguer
 * than "29 Sept").
 */
export function relativeParts(date: Date, now: Date, limitDays = 7): RelativeParts | null {
  const diff = date.getTime() - now.getTime()
  const abs = Math.abs(diff)
  const sign = diff < 0 ? -1 : 1

  if (abs < 45 * SECOND) return { value: 0, unit: 'second' }
  if (abs < 45 * MINUTE) return { value: sign * Math.max(1, Math.round(abs / MINUTE)), unit: 'minute' }

  const days = Math.round(compareDays(date, now) / DAY)
  if (days === 0 || abs < 6 * HOUR) return { value: sign * Math.max(1, Math.round(abs / HOUR)), unit: 'hour' }
  if (Math.abs(days) > limitDays) return null
  return { value: days, unit: 'day' }
}

/** Formats relative parts in a locale, with "now", "yesterday" and "tomorrow" where the language has them. */
export function formatRelative(parts: RelativeParts, locale?: string): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(parts.value, parts.unit)
}

/** How long until the relative text could change, so a live Timestamp re-renders no more than it needs to. */
export function nextTick(date: Date, now: Date): number {
  const abs = Math.abs(date.getTime() - now.getTime())
  if (abs < 45 * MINUTE) return 15 * SECOND
  if (abs < DAY) return MINUTE
  return HOUR
}
