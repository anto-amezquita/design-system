/**
 * Tests for scripts/build-fonts.mjs: which font-family stacks need a web font,
 * the Google Fonts link it builds, and the fail-loud path for a font it
 * doesn't know how to load.
 */

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { fontsForAxis, googleFontsHref, webFontFamily } from './build-fonts.mjs'

const token = (name, type, value) => ({ name, type, category: 'typography', resolved: { 'base-light': value } })

describe('webFontFamily', () => {
  it('returns the quoted first family', () => {
    expect(webFontFamily("'JetBrains Mono', monospace")).toBe('JetBrains Mono')
  })

  it('returns null for a system stack', () => {
    expect(webFontFamily("-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")).toBeNull()
  })
})

describe('googleFontsHref', () => {
  it('joins families into one css2 link', () => {
    expect(googleFontsHref([{ family: 'Schibsted Grotesk', weights: [400, 600] }])).toBe(
      'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;600&display=swap',
    )
  })

  it('returns null when there is nothing to load', () => {
    expect(googleFontsHref([])).toBeNull()
  })
})

describe('fontsForAxis', () => {
  it('takes weights from the font-weight tokens and skips system stacks', () => {
    const fonts = fontsForAxis(
      [
        token('font-family-base', 'fontFamily', '-apple-system, sans-serif'),
        token('font-family-mono', 'fontFamily', "'JetBrains Mono', monospace"),
        token('font-weight-body', 'fontWeight', '400'),
        token('font-weight-heading', 'fontWeight', '600'),
      ],
      'base-light',
    )
    expect(fonts.families).toEqual([{ family: 'JetBrains Mono', tokens: ['font-family-mono'], weights: [400, 600] }])
  })

  it('fails on a web font it doesn’t know how to load', () => {
    expect(() => fontsForAxis([token('font-family-base', 'fontFamily', "'Comic Neue', sans-serif")], 'base-light')).toThrow(
      /Comic Neue/,
    )
  })
})

describe('tokens/fonts.json', () => {
  const { brands } = JSON.parse(readFileSync('tokens/fonts.json', 'utf8'))

  it('base loads only its mono font; its text uses a system stack', () => {
    expect(brands.base.families.map(f => f.family)).toEqual(['JetBrains Mono'])
  })

  it('portfolio loads its own font plus base’s mono', () => {
    expect(brands.portfolio.families.map(f => f.family)).toEqual(['Schibsted Grotesk', 'JetBrains Mono'])
  })
})
