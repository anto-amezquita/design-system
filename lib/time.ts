/**
 * Times of day as "HH:mm" strings (24-hour), the same shape a native
 * <input type="time"> uses. Helpers for the TimePicker.
 */

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const fromMinutes = (n: number) =>
  `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`

/** Does the locale use a 12-hour clock with AM / PM? */
export const uses12Hour = (locale?: string) => {
  const options = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions() as Intl.ResolvedDateTimeFormatOptions & { hourCycle?: string }
  return options.hourCycle?.startsWith('h1') ?? false
}

/** "14.30" in Danish, "14:30" in British English, "2:30 PM" in US English. */
export function formatTime(t: string, locale?: string) {
  const [h, m] = t.split(':').map(Number)
  return new Intl.DateTimeFormat(locale, { hour: uses12Hour(locale) ? 'numeric' : '2-digit', minute: '2-digit' })
    .format(new Date(2026, 0, 1, h, m))
}

/**
 * Read a typed time, forgiving about how it's written: "14:30", "14.30",
 * "1430", "9", "2:30 pm", "2pm", "12am". Returns "HH:mm", `null` for empty,
 * or `undefined` when it isn't a time.
 */
export function parseTypedTime(text: string): string | null | undefined {
  const t = text.trim().toLowerCase().replace(/\s+/g, '')
  if (!t) return null
  const match = t.match(/^(\d{1,2})(?:[:.h]?(\d{2}))?(am|pm|a|p)?$/)
  if (!match) return undefined
  let h = Number(match[1])
  const m = Number(match[2] ?? 0)
  const suffix = match[3]
  if (m > 59) return undefined
  if (suffix) {
    if (h < 1 || h > 12) return undefined
    if (suffix.startsWith('p') && h !== 12) h += 12
    if (suffix.startsWith('a') && h === 12) h = 0
  }
  if (h > 23) return undefined
  return fromMinutes(h * 60 + m)
}

/** The slots offered in the list: every `step` minutes from `min` to `max`. */
export function timeSlots(step = 15, min = '00:00', max = '23:59') {
  const out: string[] = []
  for (let n = toMinutes(min); n <= toMinutes(max); n += step) out.push(fromMinutes(n))
  return out
}
