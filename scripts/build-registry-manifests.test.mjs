/**
 * Tests for scripts/build-registry-manifests.mjs: base values only, nulls
 * left out, and every committed manifest valid against shadcn's own schema.
 *
 * The schema check is the one that matters. From 1.1.1 to 1.2.0 the theme
 * item carried eight null cssVars (the portfolio-only tokens, which have no
 * base value), shadcn rejected it, and since every component depends on the
 * theme, no `npx shadcn add` worked. Nothing here noticed, because nothing
 * here ran the manifests through shadcn. Found by design-system-site, which
 * serves this registry.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { registryItemSchema, registrySchema } from 'shadcn/schema'
import { describe, expect, it } from 'vitest'

import { cssVarsFor } from './build-registry-manifests.mjs'

const token = (name, light, dark) => ({ name, resolved: { 'base-light': light, 'base-dark': dark } })

describe('cssVarsFor', () => {
  it('takes base light and dark values', () => {
    const tokens = new Map([['color-text-primary', token('color-text-primary', '#0A0A0A', '#FAFAFA')]])
    expect(cssVarsFor(['color-text-primary'], tokens)).toEqual({
      light: { 'color-text-primary': '#0A0A0A' },
      dark: { 'color-text-primary': '#FAFAFA' },
    })
  })

  it('leaves out a token in a mode where base has no value', () => {
    const tokens = new Map([
      ['color-accent-glow', token('color-accent-glow', null, null)],
      ['color-surface-primary', token('color-surface-primary', '#FAFAFA', '#171717')],
    ])
    const vars = cssVarsFor(['color-accent-glow', 'color-surface-primary'], tokens)
    expect(vars.light).not.toHaveProperty('color-accent-glow')
    expect(vars.dark).not.toHaveProperty('color-accent-glow')
    expect(vars.light['color-surface-primary']).toBe('#FAFAFA')
  })

  it('skips names the token reference doesn’t have', () => {
    expect(cssVarsFor(['nope'], new Map())).toEqual({ light: {}, dark: {} })
  })
})

describe('registry/ against shadcn’s schema', () => {
  const dir = join(process.cwd(), 'registry')
  const items = readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'registry.json')

  it('has the theme and a manifest per component', () => {
    expect(items).toContain('theme.json')
    expect(items.length).toBeGreaterThan(1)
  })

  it.each(items)('%s is a valid registry item', file => {
    const result = registryItemSchema.safeParse(JSON.parse(readFileSync(join(dir, file), 'utf8')))
    expect(result.success ? [] : result.error.issues).toEqual([])
  })

  it('registry.json is a valid registry', () => {
    const result = registrySchema.safeParse(JSON.parse(readFileSync(join(dir, 'registry.json'), 'utf8')))
    expect(result.success ? [] : result.error.issues).toEqual([])
  })
})
