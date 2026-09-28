/**
 * Drift test: lib/breakpoints.ts is a hand-written copy of the `breakpoint.*`
 * tokens (decisions/0018). Polaris's own tracker records exactly this kind of
 * JS/CSS copy drifting by hand, so the copy is tied to the source here.
 */

import { describe, expect, test } from 'vitest'
import globalTokens from '../tokens/global.json'
import { BREAKPOINTS, mediaQuery } from './breakpoints'

describe('lib/breakpoints', () => {
  test('matches the breakpoint tokens in tokens/global.json, both ways', () => {
    const fromTokens = Object.fromEntries(
      Object.entries(globalTokens.breakpoint).map(([name, token]) => {
        const match = /^(\d+)px$/.exec(token.$value)
        if (!match) throw new Error(`breakpoint.${name} is not a px value: ${token.$value}`)
        return [name, Number(match[1])]
      }),
    )
    expect(BREAKPOINTS).toEqual(fromTokens)
  })

  test('mediaQuery writes the same min-width query component CSS uses', () => {
    expect(mediaQuery('desktop')).toBe('(min-width: 1024px)')
    expect(mediaQuery('tablet')).toBe('(min-width: 768px)')
  })
})
