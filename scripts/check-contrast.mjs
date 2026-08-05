/**
 * Contrast governance — validates WCAG AA contrast ratios for all token
 * pairs defined in tokens/contrast-pairs.json (semantic brand tokens and
 * component tokens from tokens/components/*.json alike).
 *
 * Checks four theme modes independently:
 *   light    — components + tokens/brands/portfolio/tokens.json (base)
 *   dark     — base + tokens/brands/dark/tokens.json overrides
 *   bold     — base + tokens/brands/bold/tokens.json overrides
 *   darkBold — base + dark + bold overrides (bold wins the cascade)
 *
 * Exit codes: 0 = all pairs pass, 1 = one or more failures.
 * On failure, writes contrast-failures.json for downstream processing.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'

// WCAG 2.1 relative luminance and contrast ratio formulae
function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function hexToLuminance(hex) {
  let h = hex.replace('#', '')
  // Expand 3-digit shorthand (#rgb → #rrggbb) and 4-digit (#rgba → #rrggbbaa)
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map(c => c + c).join('')
  }
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1)
  const l2 = hexToLuminance(hex2)
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

// Build a resolver for a given merged semantic token set.
// Follows {token-name} references one step at a time, with a visited-set cycle guard.
// Handles two reference formats:
//   {color-accent-default}  — semantic token (kebab-case, no dot) → recurse
//   {color.warm-900}        — global primitive (category.key with dot) → global.json lookup
function makeResolver(semanticTokens, globalTokens) {
  return function resolve(name, visited = new Set()) {
    if (visited.has(name)) return null
    visited.add(name)

    const token = semanticTokens[name]
    if (!token) return null

    const raw = token.$value ?? token.value
    if (!raw || typeof raw !== 'string') return null
    if (raw.startsWith('#')) return raw

    const ref = raw.match(/^\{([^}]+)\}$/)?.[1]
    if (!ref) return null // transparent, rgba(), etc.

    if (ref.includes('.')) {
      const dot = ref.indexOf('.')
      const category = ref.slice(0, dot)
      const key = ref.slice(dot + 1)
      const primitive = globalTokens[category]?.[key]
      const val = primitive?.$value ?? primitive?.value
      return typeof val === 'string' && val.startsWith('#') ? val : null
    }

    return resolve(ref, visited)
  }
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

// Component tokens (tokens/components/*.json) participate in contrast pairs
// too. Merged in as a base layer beneath the semantic brand tokens (disjoint
// key namespaces — component tokens are always prefixed with their
// component name, never a bare `color-*`/`space-*`).
function loadComponentTokens() {
  const merged = {}
  for (const file of readdirSync('tokens/components').filter(f => f.endsWith('.json'))) {
    Object.assign(merged, loadJson(`tokens/components/${file}`))
  }
  return merged
}

const globalTokens = loadJson('tokens/global.json')
const componentTokens = loadComponentTokens()
const lightTokens  = loadJson('tokens/brands/portfolio/tokens.json')
const darkOverrides = loadJson('tokens/brands/dark/tokens.json')
const boldOverrides = loadJson('tokens/brands/bold/tokens.json')
const pairs = loadJson('tokens/contrast-pairs.json')

const modes = {
  light: { ...componentTokens, ...lightTokens },
  dark:  { ...componentTokens, ...lightTokens, ...darkOverrides },
  bold:  { ...componentTokens, ...lightTokens, ...boldOverrides },
  // The combined axis state — bold wins the cascade over dark (loads last),
  // so its accent must also pass on dark surfaces.
  darkBold: { ...componentTokens, ...lightTokens, ...darkOverrides, ...boldOverrides },
}

const failures = []
const results  = []

for (const [modeName, semanticTokens] of Object.entries(modes)) {
  const resolve = makeResolver(semanticTokens, globalTokens)

  for (const pair of pairs) {
    const bgHex = resolve(pair.bg)
    const fgHex = resolve(pair.fg)

    // Skip pairs where either side resolves to a non-hex value (transparent, etc.)
    if (!bgHex || !fgHex) continue

    const ratio = contrastRatio(bgHex, fgHex)
    const passes = ratio >= pair.minRatio

    const result = {
      mode: modeName,
      bg: pair.bg,
      fg: pair.fg,
      role: pair.role,
      bgHex,
      fgHex,
      ratio: Math.round(ratio * 100) / 100,
      required: pair.minRatio,
      pass: passes,
    }

    results.push(result)
    if (!passes) failures.push(result)
  }
}

const totalPairs = results.length
const modeCount  = Object.keys(modes).length

if (failures.length === 0) {
  console.log(
    `✓ Contrast check passed — ${totalPairs} pairs checked across ${modeCount} modes (light, dark, bold, darkBold)`
  )
  process.exit(0)
}

console.error(`\n✗ Contrast check: ${failures.length} failure(s) — WCAG AA minimum not met\n`)

for (const f of failures) {
  console.error(`  [${f.mode}] ${f.role}`)
  console.error(`    bg: ${f.bg} → ${f.bgHex}`)
  console.error(`    fg: ${f.fg} → ${f.fgHex}`)
  console.error(`    ratio: ${f.ratio}:1  (required ≥ ${f.required}:1)`)
  console.error(`    fix: darken the fg token or lighten the bg token in tokens/brands/`)
  console.error('')
}

try {
  writeFileSync('contrast-failures.json', JSON.stringify(failures, null, 2))
  console.error(`  Full report written to contrast-failures.json`)
} catch (err) {
  console.error(`  Could not write contrast-failures.json: ${err.message}`)
}
process.exit(1)
