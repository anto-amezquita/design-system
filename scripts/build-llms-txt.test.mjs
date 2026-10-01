/**
 * Tests for the MCP section of llms.txt / llms-full.txt: the tool list comes
 * from scripts/mcp-server.mjs's own registrations, so it can't drift from
 * what the server actually serves.
 */

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { firstSentence } from './build-llms-txt.mjs'
import { TOOLS } from './mcp-server.mjs'

describe('MCP tool list', () => {
  it('llms.txt lists exactly the tools the server registers, in order', () => {
    const llms = readFileSync('llms.txt', 'utf8')
    const section = llms.slice(llms.indexOf('## MCP server'))
    const listed = [...section.matchAll(/^- `(\w+)`:/gm)].map(([, name]) => name)
    expect(listed).toEqual(TOOLS.map(tool => tool.name))
  })

  it('llms-full.txt carries every tool’s full description', () => {
    const full = readFileSync('llms-full.txt', 'utf8')
    for (const tool of TOOLS) {
      expect(full).toContain(`### ${tool.name}\n\n${tool.description}`)
    }
  })
})

describe('firstSentence', () => {
  it('stops at the first full stop', () => {
    expect(firstSentence('Get one token. Call search_tokens first.')).toBe('Get one token.')
  })

  it('doesn’t stop at "e.g."', () => {
    expect(firstSentence('List components (e.g. Button). More.')).toBe('List components (e.g. Button).')
  })

  it('returns text with no full stop unchanged', () => {
    expect(firstSentence('No full stop here')).toBe('No full stop here')
  })
})
