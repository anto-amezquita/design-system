/**
 * The brand contract (decisions/0028): which tokens a brand may set, read from
 * this package's own token files. Node only. Nothing in components/ imports it.
 *
 * A token is settable when its definition carries
 *   "$extensions": { "amezquita.brand": "settable" }
 * in tokens/brands/base/light.json or tokens/components/*.json. Everything
 * else is the system's own.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const BRAND_KEY = 'amezquita.brand'

// What a dark file may set: lighting only. The same rule sd.config.mjs has
// always applied to dark files, changed by 0028: checkbox-, radio-, switch-
// and textarea- went, because no brand sets them and they aren't settable;
// color-skeleton- and card-border-color came in, because base changes them
// per mode (scripts/brand-check.test.mjs fails on a token that's missing).
export const MODE_PREFIXES = [
  'color-surface-',
  'color-curtain',
  'color-text-',
  'color-border-',
  'color-feedback-',
  // Chart series colours are stepped per mode (a lighter step on a dark
  // surface), so they're lighting too (decisions/0026).
  'color-chart-',
  'color-neutral-',
  'color-accent-',
  // Base changes these per mode through a reference, so a brand that sets
  // one in light has to be able to set it in dark too (the leak rule's fix).
  'color-skeleton-',
  'button-secondary-',
  'card-border-color',
]

export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

export function isSettable(token) {
  return token?.$extensions?.[BRAND_KEY] === 'settable'
}

/**
 * Everything the check needs from this package, loaded once.
 *
 *   global      tokens/global.json (primitives)
 *   components  every tokens/components/*.json, merged
 *   baseLight   tokens/brands/base/light.json
 *   baseDark    tokens/brands/base/dark.json
 *   settable    Map of name → { type, description, source }
 *   names       every semantic and component token name
 *   pairs       tokens/contrast-pairs.json
 */
export function loadSystem(root = PACKAGE_ROOT) {
  const tokens = path.join(root, 'tokens')
  const global = loadJson(path.join(tokens, 'global.json'))
  const baseLight = loadJson(path.join(tokens, 'brands/base/light.json'))
  const baseDark = loadJson(path.join(tokens, 'brands/base/dark.json'))
  const pairs = loadJson(path.join(tokens, 'contrast-pairs.json'))

  const components = {}
  const settable = new Map()
  for (const file of readdirSync(path.join(tokens, 'components')).filter(f => f.endsWith('.json')).sort()) {
    const defs = loadJson(path.join(tokens, 'components', file))
    Object.assign(components, defs)
    for (const [name, token] of Object.entries(defs)) {
      if (isSettable(token)) settable.set(name, { type: token.$type, description: token.$description ?? null, source: `tokens/components/${file}` })
    }
  }
  for (const [name, token] of Object.entries(baseLight)) {
    if (isSettable(token)) settable.set(name, { type: token.$type, description: token.$description ?? null, source: 'tokens/brands/base/light.json' })
  }

  const names = new Set([...Object.keys(components), ...Object.keys(baseLight)])
  return { global, components, baseLight, baseDark, settable, names, pairs }
}
