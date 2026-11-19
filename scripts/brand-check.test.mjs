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

import { checkBrand } from '../brand/check.mjs'
import { loadSystem } from '../brand/contract.mjs'
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
    expect(rules(result)).toEqual(['unresolved-reference:color-accent-default', 'unresolved-reference:color-accent-hover'])
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
})
