/**
 * Tests for scripts/build-theme-brands.mjs: which files count as a scoped
 * brand, the literal union the doc twins need, and the fail-loud path.
 */

import { describe, expect, it } from 'vitest'

import { scopedBrands, themeBrandsSource } from './build-theme-brands.mjs'

describe('scopedBrands', () => {
  it('takes one brand per *-scoped.css, ignoring the other brand files', () => {
    expect(scopedBrands(['base-light.css', 'base-dark.css', 'portfolio-light.css', 'portfolio-scoped.css'])).toEqual(['portfolio'])
  })

  it('sorts several', () => {
    expect(scopedBrands(['tv2-scoped.css', 'portfolio-scoped.css'])).toEqual(['portfolio', 'tv2'])
  })
})

describe('themeBrandsSource', () => {
  it('writes ThemeBrand as a plain literal union, which the doc twins can expand', () => {
    expect(themeBrandsSource(['portfolio', 'tv2'])).toContain("export type ThemeBrand = 'portfolio' | 'tv2'")
  })

  it('fails when there is no scoped brand at all', () => {
    expect(() => themeBrandsSource([])).toThrow(/scoped/)
  })
})
