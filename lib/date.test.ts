import { describe, expect, test } from 'vitest'
import { addMonths, firstDayOfWeek, isoWeek, monthGrid, clampDay } from './date'

describe('date helpers', () => {
  test('addMonths keeps the day where it can', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28))
    expect(addMonths(new Date(2028, 0, 31), 1)).toEqual(new Date(2028, 1, 29))
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 15))
    expect(addMonths(new Date(2026, 2, 31), -1)).toEqual(new Date(2026, 1, 28))
  })

  test('ISO week numbers, including the year edges', () => {
    expect(isoWeek(new Date(2026, 9, 15))).toBe(42)
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1) // Thursday
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53) // Friday, still week 53 of 2026
    expect(isoWeek(new Date(2024, 11, 30))).toBe(1) // Monday, already week 1 of 2025
  })

  test('first day of the week follows the locale', () => {
    expect(firstDayOfWeek('da-DK')).toBe(1)
    expect(firstDayOfWeek('en-US')).toBe(0)
  })

  test('monthGrid: October 2026 from Monday starts with 3 blanks and has 5 rows', () => {
    const grid = monthGrid(new Date(2026, 9, 1), 1)
    expect(grid).toHaveLength(5)
    expect(grid[0].slice(0, 4).map(d => d?.getDate() ?? null)).toEqual([null, null, null, 1])
    expect(grid.flat().filter(Boolean)).toHaveLength(31)
  })

  test('clampDay', () => {
    const min = new Date(2026, 9, 10), max = new Date(2026, 9, 20)
    expect(clampDay(new Date(2026, 9, 1), min, max)).toEqual(min)
    expect(clampDay(new Date(2026, 9, 30), min, max)).toEqual(max)
  })
})

import { dateOrder, formatShortDate, parseTypedDate, toISODate } from './date'

describe('typed dates', () => {
  test('order and short format follow the locale', () => {
    expect(dateOrder('da-DK')).toEqual(['day', 'month', 'year'])
    expect(dateOrder('en-US')).toEqual(['month', 'day', 'year'])
    expect(formatShortDate(new Date(2026, 9, 5), 'da-DK')).toBe('05.10.2026')
    expect(formatShortDate(new Date(2026, 9, 5), 'en-US')).toBe('10/05/2026')
    expect(toISODate(new Date(2026, 9, 5))).toBe('2026-10-05')
  })

  test.each([
    ['15.10.2026', 'da-DK', new Date(2026, 9, 15)],
    ['15/10/26', 'da-DK', new Date(2026, 9, 15)],
    ['15 10 2026', 'da-DK', new Date(2026, 9, 15)],
    ['10/15/2026', 'en-US', new Date(2026, 9, 15)],
    ['2026-10-15', 'en-US', new Date(2026, 9, 15)],
    ['', 'da-DK', null],
    ['31.02.2026', 'da-DK', undefined],
    ['15.10', 'da-DK', undefined],
    ['soon', 'da-DK', undefined],
  ])('%j (%s)', (text, locale, expected) => {
    expect(parseTypedDate(text, locale)).toEqual(expected)
  })
})
