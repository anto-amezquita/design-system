/**
 * Small, dependency-free date helpers for the calendar family. Dates are
 * plain `Date`s at local midnight; times of day are ignored.
 */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Add months, keeping the day where possible: 31 Jan + 1 month is 28/29 Feb, not 3 Mar. */
export function addMonths(d: Date, n: number) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last))
}

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

/** Negative, zero or positive, by day only. */
export const compareDays = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime()

export const clampDay = (d: Date, min?: Date, max?: Date) =>
  min && compareDays(d, min) < 0 ? startOfDay(min) : max && compareDays(d, max) > 0 ? startOfDay(max) : startOfDay(d)

/** First day of the week for a locale (0 = Sunday … 6 = Saturday). Monday in Denmark, Sunday in the US. */
export function firstDayOfWeek(locale?: string): number {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info) return info.firstDay % 7 // Intl uses 1 = Monday … 7 = Sunday
  } catch {
    // fall through
  }
  return 1
}

/** ISO 8601 week number: weeks start on Monday, week 1 holds the year's first Thursday. */
export function isoWeek(d: Date) {
  const day = startOfDay(d)
  const thursday = addDays(day, 3 - ((day.getDay() + 6) % 7))
  const firstThursday = new Date(thursday.getFullYear(), 0, 4)
  return 1 + Math.round((compareDays(thursday, firstThursday) / 86_400_000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7)
}

/** The weeks shown for a month: rows of 7 dates, `null` for days outside the month. */
export function monthGrid(month: Date, weekStart: number): (Date | null)[][] {
  const first = startOfMonth(month)
  const lead = (first.getDay() - weekStart + 7) % 7
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
  ]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}
