import { describe, expect, test } from 'vitest'
import { formatTime, parseTypedTime, timeSlots, uses12Hour } from './time'

describe('time helpers', () => {
  test.each([
    ['14:30', '14:30'], ['14.30', '14:30'], ['1430', '14:30'], ['9', '09:00'], ['0930', '09:30'],
    ['2:30 pm', '14:30'], ['2pm', '14:00'], ['12am', '00:00'], ['12 pm', '12:00'], ['7 a', '07:00'],
    ['', null], ['25:00', undefined], ['14:75', undefined], ['13pm', undefined], ['noon', undefined],
  ])('%j → %s', (text, expected) => {
    expect(parseTypedTime(text)).toBe(expected)
  })

  test('clock and format follow the locale', () => {
    expect(uses12Hour('en-US')).toBe(true)
    expect(uses12Hour('da-DK')).toBe(false)
    expect(formatTime('14:30', 'da-DK')).toBe('14.30')
    expect(formatTime('14:30', 'en-GB')).toBe('14:30')
    expect(formatTime('14:30', 'en-US')).toBe('2:30 PM')
  })

  test('slots', () => {
    expect(timeSlots(30, '08:00', '10:00')).toEqual(['08:00', '08:30', '09:00', '09:30', '10:00'])
    expect(timeSlots(15)).toHaveLength(96)
  })
})
