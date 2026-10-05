/**
 * A dark brand file only overrides tokens the light layers define. A name
 * that exists only in a dark file has no light value, never reaches
 * token-reference.json, tokens.json, the registry or the MCP tools, and ends
 * up as an unread variable in the dark CSS.
 *
 * 28 such tokens (checkbox-*, radio-*, textarea-* colours) sat in the dark
 * files from decisions/0005's collapse on 2026-09-08, which removed their
 * light definitions but not their dark overrides, until 1.3.3 deleted them.
 */

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

function names(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (key.startsWith('$')) return []
    const name = prefix ? `${prefix}-${key}` : key
    return value && typeof value === 'object' && !('$value' in value) ? names(value, name) : [name]
  })
}

const reference = new Set(JSON.parse(readFileSync('tokens/token-reference.json', 'utf8')).tokens.map(t => t.name))

describe('dark brand files only override tokens that exist in light', () => {
  it.each(['tokens/brands/base/dark.json', 'tokens/brands/portfolio/dark.json'])('%s', file => {
    const darkOnly = names(JSON.parse(readFileSync(file, 'utf8'))).filter(n => !reference.has(n))
    expect(darkOnly).toEqual([])
  })
})
