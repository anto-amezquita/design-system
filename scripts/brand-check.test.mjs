/**
 * Tests for the brand contract and its check (brand/, decisions/0028): each
 * rule fires on the brand it's meant to stop and stays quiet on a working one,
 * every brand in tokens/brands passes, and the command's exit codes hold.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { checkBrand, checkContrast } from '../brand/check.mjs'
import { loadSystem } from '../brand/contract.mjs'
import { makeResolver } from '../lib/resolve-token.mjs'
import { renderBrandContract } from './build-brand-contract.mjs'
import { listBrands } from './brands.mjs'
import { EXCEPTIONS } from './check-brands.mjs'

const system = loadSystem()
const color = $value => ({ $value, $type: 'color' })
let dir

function brand(light, dark) {
  dir = mkdtempSync(join(tmpdir(), 'brand-'))
  writeFileSync(join(dir, 'tokens.json'), JSON.stringify(light))
  if (dark) writeFileSync(join(dir, 'dark.json'), JSON.stringify(dark))
  return dir
}

const check = (light, dark, options = {}) => checkBrand(brand(light, dark), { name: 'acme', system, ...options })
const rules = result => result.failures.map(f => `${f.rule}:${f.token}`)

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true })
  dir = undefined
})

describe('checkBrand', () => {
  it('passes an empty brand, which is base', () => {
    const result = check({})
    expect(result.failures).toEqual([])
    expect(result.contrast.modes).toEqual(['acme-light', 'acme-dark'])
    expect(result.contrast.checked).toBeGreaterThan(0)
  })

  it('refuses a system token a brand may not set, and suggests the prefix', () => {
    const result = check({ 'space-component-gap': { $value: '48px', $type: 'dimension' } })
    expect(rules(result)).toEqual(['not-settable:space-component-gap'])
    expect(result.failures[0].fix).toContain('acme-space-component-gap')
  })

  it('names the nearest real token for a typo', () => {
    const result = check({ 'color-accent-defualt': color('#123456') })
    expect(rules(result)).toEqual(['unknown-token:color-accent-defualt'])
    expect(result.failures[0].message).toContain('color-accent-default')
  })

  it("allows the brand's own prefixed tokens in both files", () => {
    expect(check({ 'acme-signal': color('#e0a640') }, { 'acme-signal': color('#f0b95f') }).failures).toEqual([])
  })

  it('refuses nested groups, the shape Ajar has today', () => {
    expect(rules(check({ semantic: { surface: { paper: '#fff' } } }))).toEqual(['not-flat:semantic'])
  })

  it('checks $type against the system', () => {
    expect(rules(check({ 'border-radius-component': color('#000000') }))).toEqual(['wrong-type:border-radius-component'])
    expect(rules(check({ 'border-radius-component': { $value: '12px' } }))).toEqual(['missing-type:border-radius-component'])
  })

  it('refuses references that resolve to nothing', () => {
    const result = check({ 'color-accent-default': color('{color.nope-500}'), 'color-accent-hover': color('{color-nope}') })
    expect(rules(result).filter(r => r.startsWith('unresolved-reference'))).toEqual(['unresolved-reference:color-accent-default', 'unresolved-reference:color-accent-hover'])
  })

  // The leak rule's fix is "set it in dark.json too". That has to be possible:
  // a token base changes per mode is lighting, so a dark file may set it.
  it('lets dark.json set every settable token that base changes per mode', () => {
    const changing = []
    for (const token of system.settable.keys()) {
      const leaks = rules(check({ [token]: { $value: '#123456', $type: system.settable.get(token).type } }))
      if (!leaks.includes(`light-leaks-into-dark:${token}`)) continue
      changing.push(token)
      const both = { [token]: { $value: '#123456', $type: system.settable.get(token).type } }
      expect(rules(check(both, both)), token).not.toContain(`dark-not-lighting:${token}`)
    }
    // Without this the loop passes on nothing if the leak rule stops firing.
    expect(changing).toEqual(expect.arrayContaining(['card-border-color', 'color-skeleton-base', 'color-text-primary']))
  })

  it('accepts primitive and semantic references', () => {
    expect(check({ 'color-accent-default': color('{color.warm-800}'), 'color-accent-hover': color('{color-neutral-900}') },
      { 'color-accent-default': color('{color.warm-100}') }).failures).toEqual([])
  })

  it('refuses a light literal that would leak into dark mode, where it also fails contrast', () => {
    const result = check({ 'color-text-primary': color('#111111') })
    expect(rules(result)).toContain('light-leaks-into-dark:color-text-primary')
    const contrast = result.failures.filter(f => f.rule === 'contrast')
    expect(contrast.length).toBeGreaterThan(0)
    expect(contrast.every(f => f.mode === 'acme-dark')).toBe(true)
  })

  // Base changes these between modes through a reference ({color-neutral-200}
  // and the like), not by setting them in base/dark.json, so comparing raw
  // values missed them. A light literal still wins in dark mode.
  it('refuses a light literal on a token base changes per mode through a reference', () => {
    for (const token of ['color-skeleton-base', 'color-accent-text', 'card-border-color']) {
      expect(token in system.baseDark).toBe(false)
      expect(rules(check({ [token]: color('#eeeeee') }))).toContain(`light-leaks-into-dark:${token}`)
    }
  })

  it('lets a light literal through on a token that is the same in both modes', () => {
    // Base gives color-border-strong one value in light and dark, so a light
    // literal has nothing to leak over.
    const light = makeResolver({ ...system.components, ...system.baseLight }, system.global)
    const dark = makeResolver({ ...system.components, ...system.baseLight, ...system.baseDark }, system.global)
    expect(light('color-border-strong')).toBe(dark('color-border-strong'))
    expect(rules(check({ 'color-border-strong': color('#6b6b6b') }))).not.toContain('light-leaks-into-dark:color-border-strong')
    expect(check({ 'font-family-reading': { $value: "'Fraunces', serif", $type: 'fontFamily' } }).failures).toEqual([])
  })

  it('refuses a colour that is not hex, since the contrast check would skip it', () => {
    const light = { 'color-text-primary': color('rgb(240, 240, 240)') }
    const result = check(light, light)
    expect(rules(result).filter(r => r.startsWith('not-hex'))).toEqual(['not-hex:color-text-primary', 'not-hex:color-text-primary'])
    expect(result.failures.find(f => f.rule === 'not-hex').fix).toContain("can't be in a contrast pair")
    expect(result.ok).toBe(false)
  })

  // A pair is checked only when both sides are a solid colour. Transparency
  // used to be read as solid (#00000030 text measured 20:1 on white), and a
  // value that wasn't hex skipped the pair and still passed.
  it('fails a pair whose colour has transparency, instead of reading it as solid', () => {
    const result = check({ 'color-text-primary': color('#00000030') }, { 'color-text-primary': color('#ffffff30') })
    const unreadable = result.failures.filter(f => f.rule === 'contrast-unreadable')
    expect(unreadable.length).toBeGreaterThan(0)
    expect(new Set(unreadable.map(f => f.token))).toEqual(new Set(['color-text-primary']))
    expect(new Set(unreadable.map(f => f.mode))).toEqual(new Set(['acme-light', 'acme-dark']))
    expect(result.failures.filter(f => f.rule === 'contrast')).toEqual([])
    expect(result.ok).toBe(false)
  })

  it('reads hex with a solid alpha as solid', () => {
    expect(check({ 'color-text-primary': color('#111111ff') }, { 'color-text-primary': color('#fafafaff') }).failures).toEqual([])
  })

  it('fails a pair that a non-hex colour reaches through a reference', () => {
    const viaMix = check({ 'color-text-primary': color('color-mix(in srgb, {color-accent-default} 20%, white)') }, { 'color-text-primary': color('#fafafa') })
    expect(rules(viaMix)).toContain('contrast-unreadable:color-text-primary')
    const viaUntyped = check({ 'acme-x': { $value: 'transparent' }, 'color-text-primary': color('{acme-x}') }, { 'color-text-primary': color('#fafafa') })
    expect(rules(viaUntyped)).toContain('contrast-unreadable:color-text-primary')
  })

  it("fails one of the brand's own pairs that names a token it doesn't have", () => {
    const pairs = [{ bg: 'color-surface-primary', fg: 'acme-sigal', role: 'signal-text', minRatio: 4.5 }]
    expect(rules(check({ 'acme-signal': color('#1a1a1a') }, undefined, { pairs }))).toEqual(['contrast-unreadable:acme-sigal', 'contrast-unreadable:acme-sigal'])
  })

  it('reports an unreadable pair from checkContrast as a failure without a ratio', () => {
    const pair = { bg: 'acme-bg', fg: 'acme-fg', role: 'probe', minRatio: 4.5 }
    const [result] = checkContrast({ probe: { 'acme-bg': color('#ffffff'), 'acme-fg': color('#00000080') } }, [pair], system.global)
    expect(result).toMatchObject({ pass: false, ratio: null, unreadable: 'acme-fg' })
  })

  it("refuses a non-hex colour among the brand's own tokens too, and allows hex with alpha", () => {
    expect(rules(check({ 'acme-signal': color('oklch(70% 0.1 80)') }))).toEqual(['not-hex:acme-signal'])
    expect(check({ 'acme-signal': color('#f5a62380') }).failures).toEqual([])
  })

  it('refuses a reference that loops back on itself', () => {
    expect(rules(check({ 'color-text-primary': color('{color-text-primary}') }))).toContain('reference-loop:color-text-primary')
    const loop = rules(check({ 'acme-a': color('{acme-b}'), 'acme-b': color('{acme-a}') }))
    expect(loop).toContain('reference-loop:acme-a')
    expect(loop).toContain('reference-loop:acme-b')
  })

  // A light value stays live in dark mode, where base's references differ.
  // Base dark has color-text-primary: {color-neutral-900}, so pointing
  // color-neutral-900 back at it loops only in dark.
  it('refuses a light reference that loops back only in dark mode', () => {
    const result = check({ 'color-neutral-900': color('{color-text-primary}') })
    const loops = result.failures.filter(f => f.rule === 'reference-loop')
    expect(loops.map(f => `${f.token}:${f.file}:${f.mode}`)).toEqual(['color-neutral-900:tokens.json:acme-dark'])
  })

  it("doesn't count a light reference as looping in dark when dark.json sets the token", () => {
    const result = check({ 'color-neutral-900': color('{color-text-primary}') }, { 'color-neutral-900': color('#fafafa') })
    expect(rules(result)).not.toContain('reference-loop:color-neutral-900')
  })

  it('lets a chain of references through when it ends in a value', () => {
    expect(check({ 'acme-a': color('{acme-b}'), 'acme-b': color('{color-text-primary}') }).failures).toEqual([])
  })

  it('lets a light value through when dark sets it too, or when it is a semantic reference', () => {
    expect(check({ 'color-text-primary': color('#111111') }, { 'color-text-primary': color('#fafafa') }).failures).toEqual([])
    expect(check({ 'color-border-focus': color('{color-text-primary}') }).failures).toEqual([])
  })

  it('keeps dark files to lighting', () => {
    expect(rules(check({}, { 'font-family-base': { $value: 'Georgia, serif', $type: 'fontFamily' } })))
      .toEqual(['dark-not-lighting:font-family-base'])
  })

  it('keeps heading sizes paired with a line-height on the 4px grid', () => {
    expect(rules(check({ 'font-size-h4': { $value: '28px', $type: 'dimension' } }))).toEqual(['heading-pair:font-size-h4'])
    expect(rules(check({ 'font-size-h4': { $value: '28px', $type: 'dimension' }, 'line-height-h4': { $value: '30px', $type: 'dimension' } })))
      .toEqual(['off-grid:line-height-h4'])
    expect(check({ 'font-size-h4': { $value: '28px', $type: 'dimension' }, 'line-height-h4': { $value: '{line-height.fixed-32}', $type: 'dimension' } }).failures)
      .toEqual([])
  })

  it('honours exceptions, and reports one the brand no longer needs', () => {
    expect(check({ 'color-legacy-glow': color('#15616D') }, undefined, { exceptions: { 'color-legacy-glow': 'TICKET-1' } }).failures).toEqual([])
    expect(rules(check({}, undefined, { exceptions: { 'color-legacy-glow': 'TICKET-1' } }))).toEqual(['unused-exception:color-legacy-glow'])
  })

  it('fails a contrast pair, in the mode where it fails', () => {
    const result = check({ 'color-accent-foreground': color('#777777'), 'color-accent-default': color('#888888') },
      { 'color-accent-foreground': color('{color-neutral-50}'), 'color-accent-default': color('{color-neutral-800}') })
    const contrast = result.failures.filter(f => f.rule === 'contrast')
    expect(contrast.length).toBeGreaterThan(0)
    expect(contrast.every(f => f.mode === 'acme-light')).toBe(true)
  })

  it("checks the brand's own pairs", () => {
    const pairs = [{ bg: 'color-surface-primary', fg: 'acme-signal', role: 'signal-text', minRatio: 4.5 }]
    const result = check({ 'acme-signal': color('#e0a640') }, { 'acme-signal': color('#f0b95f') }, { pairs })
    expect(result.failures.map(f => `${f.rule}:${f.mode}`)).toEqual(['contrast:acme-light'])
  })

  it('fails without tokens.json', () => {
    dir = mkdtempSync(join(tmpdir(), 'brand-'))
    expect(rules(checkBrand(dir, { system }))).toEqual(['missing-file:null'])
  })

  it.each(listBrands())('passes %s, in tokens/brands', name => {
    expect(checkBrand(`tokens/brands/${name}`, { name, system, exceptions: EXCEPTIONS[name] }).failures).toEqual([])
  })
})

describe('amezquita-brand', () => {
  const run = (...args) => spawnSync(process.execPath, ['brand/cli.mjs', ...args], { encoding: 'utf8' })

  it('exits 0 on a passing brand', () => {
    const result = run('check', 'tokens/brands/demo-cool')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('✓ demo-cool')
  })

  it('exits 1 on a failing brand, with the fix', () => {
    const result = run('check', brand({ 'space-component-gap': { $value: '48px', $type: 'dimension' } }), '--name', 'acme')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('fix: If the project needs its own value, name it `acme-space-component-gap`')
  })

  it('exits 2 when used wrong', () => {
    expect(run().status).toBe(2)
    expect(run('lint', 'x').status).toBe(2)
    expect(run('check').status).toBe(2)
    expect(run('check', 'a', '--name').status).toBe(2)
  })

  it('prints the result as JSON with --json', () => {
    const result = run('check', 'tokens/brands/demo-warm', '--json')
    expect(JSON.parse(result.stdout)).toMatchObject({ ok: true, brand: 'demo-warm' })
  })
})

describe('docs/brand-contract.md', () => {
  const reference = { tokens: [] }

  it('lists every settable token and nothing else', () => {
    const doc = renderBrandContract(system, reference)
    const listed = [...doc.matchAll(/^\| `([^`]+)` \|/gm)].map(m => m[1]).sort()
    expect(listed).toEqual([...system.settable.keys()].sort())
    expect(listed).not.toContain('space-component-gap')
  })

  // It used to say #rrggbbaa let the contrast check read every colour. It can't
  // measure a colour you can see through.
  it("says a colour with transparency can't be in a contrast pair", () => {
    const doc = renderBrandContract(system, reference)
    expect(doc).not.toMatch(/can read every one/)
    expect(doc).toMatch(/can't be in a contrast pair/)
  })

  // A backslash before a pipe used to come out as `\\|`: an escaped backslash,
  // then a real cell break, so the row grew a column.
  it('keeps a row whole when a value or description holds a backslash', () => {
    const settable = new Map([['color-text-primary', { type: 'color', description: 'a \\| b, and a lone \\' }]])
    const withBackslash = { tokens: [{ name: 'color-text-primary', resolved: { 'base-light': 'x\\|y', 'base-dark': 'z\\' } }] }
    const doc = renderBrandContract({ ...system, settable }, withBackslash)
    const row = doc.split('\n').find(line => line.startsWith('| `color-text-primary`'))
    const cellBreaks = row => {
      let count = 0
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '\\') i++
        else if (row[i] === '|') count++
      }
      return count
    }
    expect(cellBreaks(row)).toBe(6)
    expect(row).toContain('`x\\\\\\|y`')
    expect(row).toContain('`z\\\\`')
    expect(row).toContain('a \\\\\\| b, and a lone \\\\')
  })
})
