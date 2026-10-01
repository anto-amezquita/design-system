/**
 * Tests for tokens/token-reference.json's descriptions: every DTCG
 * $description on a source token reaches its entry, so the docs site and
 * agents read them from the reference rather than writing their own.
 */

import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const load = path => JSON.parse(readFileSync(path, 'utf8'))
const reference = new Map(load('tokens/token-reference.json').tokens.map(t => [t.name, t]))

const sources = {
  'tokens/brands/base/light.json': load('tokens/brands/base/light.json'),
  ...Object.fromEntries(
    readdirSync('tokens/components')
      .filter(f => f.endsWith('.json'))
      .map(f => [`tokens/components/${f}`, load(`tokens/components/${f}`)]),
  ),
}

describe('token-reference descriptions', () => {
  for (const [file, tokens] of Object.entries(sources)) {
    it(`carries every $description in ${file}`, () => {
      for (const [name, token] of Object.entries(tokens)) {
        expect(reference.get(name)?.description, name).toBe(token.$description ?? null)
      }
    })
  }

  it('prefers base’s description over portfolio’s for a token both define', () => {
    const portfolio = load('tokens/brands/portfolio/tokens.json')
    const base = sources['tokens/brands/base/light.json']
    for (const name of Object.keys(portfolio)) {
      const expected = base[name]?.$description ?? portfolio[name].$description ?? null
      expect(reference.get(name)?.description, name).toBe(expected)
    }
  })
})
