/**
 * The generated portfolio CSS: portfolio-scoped.css carries the
 * [data-brand="portfolio"] scope, and the existing files keep their :root
 * selectors, so nothing changes for consumers who load them
 * (decisions/0001, 2026-10-01 amendment). lib/brand-scope.test.ts checks the
 * cascade itself in a browser.
 */

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const css = name => readFileSync(`styles/brands/${name}.css`, 'utf8')
const selectorsOf = source => [...source.matchAll(/^([^{}\n/][^{}]*)\{/gm)].map(([, s]) => s.split(',').map(p => p.trim()))

describe('portfolio-scoped.css', () => {
  const blocks = selectorsOf(css('portfolio-scoped'))

  it('has a dark block, then a light block', () => {
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual([
      '[data-brand="portfolio"][data-mode="dark"]',
      '[data-brand="portfolio"] [data-mode="dark"]',
      '[data-mode="dark"] [data-brand="portfolio"]',
    ])
    expect(blocks[1]).toEqual([
      '[data-brand="portfolio"]',
      '[data-brand="portfolio"][data-mode="light"]',
      '[data-brand="portfolio"] [data-mode="light"]',
    ])
  })

  it('never targets :root', () => {
    expect(css('portfolio-scoped')).not.toContain(':root')
  })

  // Both blocks need every token either file sets: a light panel in a dark page
  // still matches the dark block through its ancestor, so a token missing from
  // the light block would keep its dark value.
  it('declares every token portfolio-light.css or portfolio-dark.css does, in both blocks', () => {
    const declared = source => new Set([...source.matchAll(/^\s+(--[\w-]+):/gm)].map(([, name]) => name))
    const [dark, light] = css('portfolio-scoped').split(/\n(?=\[data-brand="portfolio"\],)/)
    const union = new Set([...declared(css('portfolio-light')), ...declared(css('portfolio-dark'))])
    expect(declared(light)).toEqual(union)
    expect(declared(dark)).toEqual(union)
  })
})

describe('the unscoped portfolio files', () => {
  it('keep :root and [data-mode] selectors', () => {
    expect(selectorsOf(css('portfolio-light'))).toEqual([[':root', '[data-mode="light"]']])
    expect(selectorsOf(css('portfolio-dark'))).toEqual([['[data-mode="dark"]']])
  })
})
