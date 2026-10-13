/**
 * Tests for scripts/brands.mjs: which folders count as brands, their order,
 * and the axis list every resolver builds from them.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { axisNames, listBrands, loadBrands } from './brands.mjs'

let dir

function brandsDir(names) {
  dir = mkdtempSync(join(tmpdir(), 'brands-'))
  for (const name of names) {
    mkdirSync(join(dir, name))
    writeFileSync(join(dir, name, 'tokens.json'), JSON.stringify({ 'color-accent-default': { $value: `#${name.length}00000` } }))
    writeFileSync(join(dir, name, 'dark.json'), JSON.stringify({}))
  }
  writeFileSync(join(dir, 'README.md'), 'not a brand')
  return dir
}

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true })
  dir = undefined
})

describe('listBrands', () => {
  it('lists every folder but base, sorted, and ignores files', () => {
    expect(listBrands(brandsDir(['zeta', 'base', 'alpha']))).toEqual(['alpha', 'zeta'])
  })

  it('finds the brands this repo ships', () => {
    expect(listBrands()).toContain('portfolio')
    expect(listBrands()).not.toContain('base')
  })
})

describe('loadBrands', () => {
  it('reads each brand’s light and dark overrides', () => {
    const [brand] = loadBrands(brandsDir(['solo']))
    expect(brand.name).toBe('solo')
    expect(brand.light['color-accent-default'].$value).toBe('#400000')
    expect(brand.dark).toEqual({})
  })
})

describe('axisNames', () => {
  it('puts base first, then each brand’s light and dark', () => {
    expect(axisNames(['alpha', 'zeta'])).toEqual(['base-light', 'base-dark', 'alpha-light', 'alpha-dark', 'zeta-light', 'zeta-dark'])
  })

  it('accepts loaded brands as well as names', () => {
    expect(axisNames([{ name: 'alpha' }])).toEqual(['base-light', 'base-dark', 'alpha-light', 'alpha-dark'])
  })
})
