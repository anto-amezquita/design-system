import { describe, expect, it } from 'vitest'
import { matchRange, matches, normalize, rankMatches } from './match'

describe('normalize', () => {
  it('drops case and accents', () => {
    expect(normalize('Perú')).toBe('peru')
    expect(normalize('São Paulo')).toBe('sao paulo')
  })
  it('keeps letters that are not accented forms', () => {
    expect(normalize('Ærø')).toBe('ærø')
  })
})

describe('matchRange', () => {
  it('finds the match in the original characters', () => {
    expect(matchRange('Perú', 'peru')).toEqual([0, 4])
    expect(matchRange('Bogotá', 'ota')).toEqual([3, 6])
  })
  it('prefers the start of a word', () => {
    expect(matchRange('Santander, Anholt', 'an')).toEqual([11, 13])
  })
  it('falls back to inside a word', () => {
    expect(matchRange('Santander', 'tan')).toEqual([3, 6])
  })
  it('returns null for no match or an empty query', () => {
    expect(matchRange('Lima', 'x')).toBeNull()
    expect(matchRange('Lima', '  ')).toBeNull()
  })
  it('treats regex characters as text', () => {
    expect(matches('C++ (2020)', '+ (')).toBe(true)
  })
})

describe('rankMatches', () => {
  const towns = ['Skanderborg', 'Aarhus', 'Silkeborg', 'Randers', 'Vejle']
  it('puts starts first, then word starts, then the rest, and drops non-matches', () => {
    expect(rankMatches(towns, 'r', t => t)).toEqual(['Randers', 'Skanderborg', 'Aarhus', 'Silkeborg'])
  })
  it('keeps everything for an empty query', () => {
    expect(rankMatches(towns, '', t => t)).toEqual(towns)
  })
})
