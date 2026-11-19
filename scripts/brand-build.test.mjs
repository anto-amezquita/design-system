/**
 * Tests for `amezquita-brand build` (brand/build.mjs, decisions/0028): a
 * project brand gets exactly the CSS a brand in this package gets, nothing is
 * built from a brand that fails the check, and the font link covers what it can.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import StyleDictionary from 'style-dictionary'
import { afterEach, describe, expect, it } from 'vitest'

import { buildBrand, buildBrandCss } from '../brand/build.mjs'
import { listBrands } from './brands.mjs'
import { EXCEPTIONS } from './check-brands.mjs'

const color = $value => ({ $value, $type: 'color' })
const dirs = []
function temp() {
  const dir = mkdtempSync(join(tmpdir(), 'brand-build-'))
  dirs.push(dir)
  return dir
}
function brand(light, dark) {
  const dir = temp()
  writeFileSync(join(dir, 'tokens.json'), JSON.stringify(light))
  if (dark) writeFileSync(join(dir, 'dark.json'), JSON.stringify(dark))
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

const acme = () => brand(
  {
    'color-accent-default': color('#117555'),
    'color-accent-foreground': color('#FDFEFE'),
    'acme-signal': color('#a8691f'),
    'font-family-heading': { $value: "'Archivo', sans-serif", $type: 'fontFamily' },
    'font-family-base': { $value: "'Some Private Sans', sans-serif", $type: 'fontFamily' },
  },
  { 'color-accent-default': color('#5BC99E'), 'color-accent-foreground': color('#0A110F'), 'acme-signal': color('#f0b95f') },
)

describe('buildBrandCss', () => {
  it.each(listBrands())('rebuilds %s exactly as styles/brands has it', async name => {
    const out = temp()
    await buildBrandCss({ StyleDictionary, name, lightPath: `tokens/brands/${name}/tokens.json`, darkPath: `tokens/brands/${name}/dark.json`, outDir: out })
    for (const kind of ['light', 'dark', 'scoped']) {
      expect(readFileSync(join(out, `${name}-${kind}.css`), 'utf8')).toBe(readFileSync(`styles/brands/${name}-${kind}.css`, 'utf8'))
    }
  })
})

describe('buildBrand', () => {
  it('writes the three CSS files and the font link for a project brand', async () => {
    const out = temp()
    const result = await buildBrand(acme(), { name: 'acme', out, StyleDictionary })
    expect(result.ok).toBe(true)
    expect(readdirSync(out).sort()).toEqual(['acme-dark.css', 'acme-fonts.json', 'acme-light.css', 'acme-scoped.css'])

    const light = readFileSync(join(out, 'acme-light.css'), 'utf8')
    expect(light).toContain(':root, [data-mode="light"] {')
    expect(light).toContain('--color-accent-default: #117555;')
    expect(light).toContain('--acme-signal: #a8691f;')
    expect(readFileSync(join(out, 'acme-dark.css'), 'utf8')).toContain('--acme-signal: #f0b95f;')
    expect(readFileSync(join(out, 'acme-scoped.css'), 'utf8')).toContain('[data-mode="dark"] [data-brand="acme"]')

    expect(result.fonts.families.map(f => f.family)).toEqual(['Archivo', 'JetBrains Mono'])
    expect(result.fonts.href).toContain('family=Archivo:')
    expect(result.fonts.unknown).toEqual([{ family: 'Some Private Sans', token: 'font-family-base' }])
  })

  it('builds nothing from a brand that fails the check', async () => {
    const out = join(temp(), 'out')
    const result = await buildBrand(brand({ 'space-component-gap': { $value: '48px', $type: 'dimension' } }), { name: 'acme', out, StyleDictionary })
    expect(result.ok).toBe(false)
    expect(result.check.failures.map(f => f.rule)).toEqual(['not-settable'])
    expect(existsSync(out)).toBe(false)
  })

  it('builds a brand with no dark.json', async () => {
    const out = temp()
    const result = await buildBrand(brand({ 'border-radius-component': { $value: '12px', $type: 'dimension' } }), { name: 'acme', out, StyleDictionary })
    expect(result.ok).toBe(true)
    expect(readFileSync(join(out, 'acme-light.css'), 'utf8')).toContain('--border-radius-component: 12px;')
    expect(existsSync(join(out, 'acme-dark.css'))).toBe(true)
  })

  it('refuses a name that would break a selector or a file name', async () => {
    const result = await buildBrand(brand({}), { name: 'Acme Brand', out: temp(), StyleDictionary })
    expect(result.ok).toBe(false)
    expect(result.error).toContain('lowercase letters, digits and hyphens')
  })

  it.each(listBrands())('builds %s through the command path too', async name => {
    const result = await buildBrand(`tokens/brands/${name}`, { name, out: temp(), exceptions: EXCEPTIONS[name], StyleDictionary })
    expect(result.ok).toBe(true)
  })
})

describe('amezquita-brand build', () => {
  const run = (...args) => spawnSync(process.execPath, ['brand/cli.mjs', ...args], { encoding: 'utf8' })

  it('builds, and says where the files went', () => {
    const out = temp()
    const result = run('build', acme(), '--name', 'acme', '--out', out)
    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`✓ Wrote ${join(out, 'acme-light.css')}`)
    expect(result.stderr).toContain('"Some Private Sans", which the font link doesn\'t cover')
  })

  it('exits 2 without --out, and check refuses --out', () => {
    expect(run('build', 'tokens/brands/demo-cool').status).toBe(2)
    expect(run('check', 'tokens/brands/demo-cool', '--out', 'x').status).toBe(2)
  })

  it('exits 1 when the check fails, and builds nothing', () => {
    const out = join(temp(), 'out')
    const result = run('build', brand({ 'space-component-gap': { $value: '48px', $type: 'dimension' } }), '--name', 'acme', '--out', out)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Nothing was built.')
    expect(existsSync(out)).toBe(false)
  })
})
