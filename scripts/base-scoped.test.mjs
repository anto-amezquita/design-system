/**
 * base-scoped.css: base under [data-brand="base"], for a part of a page that
 * wears another brand (decisions/0023). Unlike a brand's scoped file it holds
 * every token, not overrides: inside another brand's scope, any token could
 * hold that brand's value. lib/brand-scope.test.ts checks the cascade.
 */

import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const css = name => readFileSync(`styles/brands/${name}.css`, 'utf8')
const selectorsOf = source => [...source.matchAll(/^([^{}\n/][^{}]*)\{/gm)].map(([, s]) => s.split(',').map(p => p.trim()))
const declared = source => new Set([...source.matchAll(/^\s+(--[\w-]+): (?!initial;)/gm)].map(([, name]) => name))
const resets = source => new Set([...source.matchAll(/^\s+(--[\w-]+): initial;/gm)].map(([, name]) => name))

describe('base-scoped.css', () => {
  it('has a dark block, then a light block', () => {
    const blocks = selectorsOf(css('base-scoped'))
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual([
      '[data-brand="base"][data-mode="dark"]',
      '[data-brand="base"] [data-mode="dark"]',
      '[data-mode="dark"] [data-brand="base"]',
    ])
    expect(blocks[1]).toEqual([
      '[data-brand="base"]',
      '[data-brand="base"][data-mode="light"]',
      '[data-brand="base"] [data-mode="light"]',
    ])
  })

  it('never targets :root', () => {
    expect(css('base-scoped')).not.toContain(':root')
  })

  const [dark, light] = css('base-scoped').split(/\n(?=\[data-brand="base"\],)/)

  it('declares every token base-light.css does, in both blocks', () => {
    const all = declared(css('base-light'))
    expect(declared(light)).toEqual(all)
    expect(declared(dark)).toEqual(all)
  })

  // A token only a brand adds (portfolio's --color-accent-glow) would inherit
  // the page's brand value inside a base panel; `initial` makes it undefined.
  it('resets every token a brand adds that base lacks, in both blocks', () => {
    const inBase = declared(css('base-light'))
    const brandFiles = readdirSync('styles/brands').filter(f => f.endsWith('.css') && !f.startsWith('base-'))
    const added = new Set(brandFiles.flatMap(f => [...declared(css(f.replace(/\.css$/, '')))]).filter(n => !inBase.has(n)))
    expect(added.size).toBeGreaterThan(0)
    expect(resets(light)).toEqual(added)
    expect(resets(dark)).toEqual(added)
  })
})
