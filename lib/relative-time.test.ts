import { describe, expect, test } from 'vitest'
import { formatRelative, nextTick, relativeParts } from './relative-time'

const now = new Date(2026, 9, 20, 11, 30, 0) // Tue 20 Oct 2026, 11:30
const at = (d: number, h: number, m = 0, s = 0) => new Date(2026, 9, d, h, m, s)
const say = (date: Date, locale = 'en-GB', from = now) => {
  const p = relativeParts(date, from)
  return p ? formatRelative(p, locale) : null
}

describe('relativeParts', () => {
  test('under 45 seconds either way is now', () => {
    expect(say(at(20, 11, 29, 30))).toBe('now')
    expect(say(at(20, 11, 30, 40))).toBe('now')
  })

  test('minutes, past and future', () => {
    expect(say(at(20, 11, 25))).toBe('5 minutes ago')
    expect(say(at(20, 11, 31))).toBe('in 1 minute')
    expect(say(at(20, 10, 50))).toBe('40 minutes ago')
  })

  test('hours within the same day', () => {
    expect(say(at(20, 10, 0))).toBe('2 hours ago')
    expect(say(at(20, 14, 30))).toBe('in 3 hours')
  })

  test('calendar days: late last night is yesterday the next morning', () => {
    const morning = new Date(2026, 9, 20, 8, 0)
    expect(say(at(19, 9, 0), 'en-GB', morning)).toBe('yesterday')
    expect(say(at(21, 18, 0))).toBe('tomorrow')
    expect(say(at(17, 12, 0))).toBe('3 days ago')
  })

  test('within six hours stays in hours even across midnight', () => {
    const justAfter = new Date(2026, 9, 21, 0, 30)
    expect(say(at(20, 23, 0), 'en-GB', justAfter)).toBe('2 hours ago')
  })

  test('past the limit there is no relative form', () => {
    expect(relativeParts(at(10, 12), now)).toBeNull()
    expect(relativeParts(at(10, 12), now, 14)).toEqual({ value: -10, unit: 'day' })
  })

  test('other locales get their own words', () => {
    expect(say(at(19, 12), 'da-DK')).toBe('i går')
    expect(say(at(19, 12), 'es-PE')).toBe('ayer')
  })
})

describe('nextTick', () => {
  test('fast near now, slower further away', () => {
    expect(nextTick(at(20, 11, 20), now)).toBe(15_000)
    expect(nextTick(at(20, 8, 0), now)).toBe(60_000)
    expect(nextTick(at(17, 8, 0), now)).toBe(3_600_000)
  })
})
