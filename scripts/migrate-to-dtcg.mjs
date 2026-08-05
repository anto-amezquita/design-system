/**
 * One-time DTCG migration — renames `value` → `$value` and adds `$type`
 * to every token in the project, making all JSON files W3C DTCG-compliant.
 *
 * Kept in the repo as the authoritative record of how the migration was done.
 * Re-running this script on already-migrated files is idempotent (no-ops on
 * tokens that already have `$value`).
 *
 * Two file shapes are handled:
 *   Flat   — tokens/brands/ and tokens/components/ files
 *            Top-level keys are token names, each containing { value: "..." }
 *   Nested — tokens/global.json
 *            Top-level keys are categories (color, space, …); leaves are tokens
 *
 * Type inference priority:
 *   1. Name prefix/suffix patterns (unambiguous for most semantic tokens)
 *   2. Color/dimension/shadow keyword substrings (component token names)
 *   3. Raw value pattern (direct hex, px, ms, cubic-bezier, number)
 *   4. "other" fallback (layout tokens, unrecognised patterns)
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

// Category → $type map for global.json's top-level groups
const GLOBAL_CATEGORY_TYPES = {
  'color':         'color',
  'space':         'dimension',
  'font-size':     'dimension',
  'font-weight':   'fontWeight',
  'line-height':   'number',
  'letter-spacing':'dimension',
  'border-radius': 'dimension',
  'border-width':  'dimension',
  'duration':      'duration',
  'easing':        'cubicBezier',
  'opacity':       'number',
  'feedback':      'color',
  'shadow':        'shadow',
  'icon-size':     'dimension',
  'size':          'dimension',
  'z-index':       'number',
}

// Infer $type for a flat token (semantic, component, dark, bold files).
// name = the token's key, rawValue = the current string value (may be a {reference}).
function inferFlatType(name, rawValue) {
  // Explicit prefix rules — highest signal, no false positives
  if (name.startsWith('color-'))         return 'color'
  if (name.startsWith('font-family-'))   return 'fontFamily'
  if (name.startsWith('font-weight-'))   return 'fontWeight'
  if (name.startsWith('font-size-'))     return 'dimension'
  if (name.startsWith('line-height-'))   return 'number'
  if (name.startsWith('letter-spacing-'))return 'dimension'
  if (name.startsWith('border-radius-')) return 'dimension'
  if (name.startsWith('border-width'))   return 'dimension'
  if (name.startsWith('space-'))         return 'dimension'
  if (name.startsWith('size-'))          return 'dimension'
  if (name.startsWith('duration-'))      return 'duration'
  if (name.startsWith('easing-'))        return 'cubicBezier'
  if (name.startsWith('opacity-'))       return 'number'
  if (name.startsWith('shadow-'))        return 'shadow'
  if (name.startsWith('z-'))             return 'number'
  if (name.startsWith('focus-ring-'))    return 'dimension'

  // Suffix rules — component token names often carry type in their suffix
  if (name.endsWith('-font-family'))     return 'fontFamily'
  if (name.endsWith('-font-weight'))     return 'fontWeight'
  if (name.endsWith('-font-size'))       return 'dimension'
  if (name.endsWith('-line-height'))     return 'number'
  if (name.endsWith('-letter-spacing'))  return 'dimension'
  if (name.endsWith('-border-radius'))   return 'dimension'
  if (name.endsWith('-border-width'))    return 'dimension'
  if (name.endsWith('-duration'))        return 'duration'
  if (name.endsWith('-size'))            return 'dimension'
  if (name.endsWith('-shadow'))          return 'shadow'

  // Substring rules — component tokens with compound names
  // Color indicators — check before dimension to avoid misclassifying -color-surface etc.
  if (name.includes('-background')  ||
      name.includes('-foreground')  ||
      name.includes('-indicator')   ||
      name.includes('-curtain')     ||
      name.includes('-overlay-color')) return 'color'

  // More precise color suffixes (standalone at end of name)
  if (name.endsWith('-color')   ||
      name.endsWith('-border')  ||
      name.endsWith('-fill')    ||
      name.endsWith('-stroke')  ||
      name.endsWith('-ring'))          return 'color'

  // Color with state suffix: -border-hover, -border-focus, -border-error, -color-disabled, etc.
  if (name.includes('-border-')     ||
      name.includes('-color-'))        return 'color'

  // Shadow composite
  if (name.includes('-shadow'))        return 'shadow'

  // Dimension indicators
  if (name.includes('-padding')  ||
      name.includes('-gap')      ||
      name.includes('-width')    ||
      name.includes('-height')   ||
      name.includes('-offset')   ||
      name.includes('-spacing')  ||
      name.includes('-radius')   ||
      name.includes('-overlap')  ||
      name.includes('-indent')   ||
      name.includes('-max-')     ||
      name.includes('-min-'))          return 'dimension'

  // Value-based fallback — only fires for tokens with direct (non-reference) values
  if (typeof rawValue === 'string' && !rawValue.startsWith('{')) {
    if (rawValue.startsWith('#') ||
        rawValue === 'transparent' ||
        rawValue.startsWith('rgba') ||
        rawValue.startsWith('rgb'))               return 'color'
    if (/\d(px|rem|em|vh|vw|ch|vmin|vmax|%)/.test(rawValue)) return 'dimension'
    if (/^\d+(\.\d+)?ms$/.test(rawValue))         return 'duration'
    if (/^\d+(\.\d+)?$/.test(rawValue))           return 'number'
    if (rawValue.startsWith('cubic-bezier'))       return 'cubicBezier'
    if (rawValue.includes('rgba'))                 return 'color'
  }

  return 'other'
}

// Recursively transform a global.json group node.
// category = the top-level key (e.g. "color", "space") used for type inference.
function transformGlobalNode(node, category) {
  const type = GLOBAL_CATEGORY_TYPES[category] ?? 'other'
  const out = {}

  for (const [key, val] of Object.entries(node)) {
    if (val && typeof val === 'object' && ('value' in val || '$value' in val)) {
      // Leaf token
      if ('$value' in val) {
        // Already migrated — preserve as-is but ensure $type exists
        out[key] = { ...val, $type: val.$type ?? type }
      } else {
        const { value, ...rest } = val
        out[key] = { ...rest, $value: value, $type: type }
      }
    } else if (val && typeof val === 'object') {
      // Sub-group — recurse with the same category type
      out[key] = transformGlobalNode(val, category)
    } else {
      out[key] = val
    }
  }

  return out
}

// Transform a flat token file (semantic, component, dark/bold override).
function transformFlatFile(tokens) {
  const out = {}

  for (const [name, token] of Object.entries(tokens)) {
    if (!token || typeof token !== 'object') { out[name] = token; continue }

    if ('$value' in token) {
      // Already migrated — ensure $type exists
      out[name] = { ...token, $type: token.$type ?? inferFlatType(name, token.$value) }
    } else if ('value' in token) {
      const { value, ...rest } = token
      out[name] = { ...rest, $value: value, $type: inferFlatType(name, value) }
    } else {
      out[name] = token
    }
  }

  return out
}

function processFile(filePath, isGlobal) {
  const raw = readFileSync(filePath, 'utf8')
  const tokens = JSON.parse(raw)
  let migrated

  if (isGlobal) {
    migrated = {}
    for (const [category, group] of Object.entries(tokens)) {
      if (group && typeof group === 'object') {
        migrated[category] = transformGlobalNode(group, category)
      } else {
        migrated[category] = group
      }
    }
  } else {
    migrated = transformFlatFile(tokens)
  }

  const out = JSON.stringify(migrated, null, 2) + '\n'
  writeFileSync(filePath, out)
}

// Process global.json (nested structure)
processFile('tokens/global.json', true)
console.log('✓ Migrated tokens/global.json')

// Process all flat token files
const flatFiles = await glob([
  'tokens/brands/portfolio/tokens.json',
  'tokens/brands/dark/tokens.json',
  'tokens/brands/bold/tokens.json',
  'tokens/components/*.json',
])

for (const file of flatFiles.sort()) {
  processFile(file, false)
  console.log(`✓ Migrated ${file}`)
}

console.log(`\n✓ DTCG migration complete — ${flatFiles.length + 1} files migrated`)
console.log('  Next: set usesDtcg: true in sd.config.mjs, then run node sd.config.mjs')
console.log('  Verify: git diff styles/brands/ → should be empty')
