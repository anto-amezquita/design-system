/**
 * Generates tokens/fonts.json: the Google Fonts link each brand needs.
 *
 * The package ships no font files (decisions/0020). The brands name web fonts
 * in their font-family tokens, so every consumer needs a <link> to load them.
 * This file says which one, generated from the tokens so it can't fall behind
 * a font change, and machine-readable so the docs site builds its Getting
 * started page from it.
 *
 * Reads tokens/token-reference.json, which already resolves every token per
 * theme axis, rather than resolving the token files a second way:
 *   - families: each `font-family-*` token's first family, when it's a named
 *     web font rather than a system stack. Base's text stacks are system fonts,
 *     so base needs only its mono font; a brand is a skin on base, so it
 *     needs its own font plus base's mono.
 *   - weights: every value the brand's font-weight tokens (semantic and
 *     component) resolve to. Both families are variable fonts on Google Fonts,
 *     so asking for more weights doesn't add downloads.
 *
 * A web font missing from GOOGLE_FONTS fails the build: a brand can't ship a
 * font nobody has decided how to load.
 *
 * Output shape:
 *   { brands: { [brand]: { families: Family[], href: string | null, preconnect: string[] } } }
 *   Family = { family, tokens: string[], weights: number[] }
 *
 * Called by sd.config.mjs after buildTokenReference().
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { listBrands } from './brands.mjs'

// Families this system loads from Google Fonts, with the ranges Google Fonts
// serves them in. Adding a font to a brand means adding it here, which is the
// moment to check Google Fonts actually has it, and at which weights.
//   wght  the weight range; requested weights outside it are dropped, since a
//         css2 request for a weight the family doesn't have fails outright
//   axes  extra variable axes a brand sets through font-variation-heading
//         ('wdth' 112.5). Requested as full ranges, so any value a brand picks
//         inside them loads.
export const GOOGLE_FONTS = new Map([
  ['Archivo', { wght: [100, 900], axes: { wdth: [62, 125] } }],
  ['Atkinson Hyperlegible Mono', { wght: [200, 800] }],
  ['Atkinson Hyperlegible Next', { wght: [200, 800] }],
  ['Bricolage Grotesque', { wght: [200, 800] }],
  ['Fraunces', { wght: [100, 900], axes: { SOFT: [0, 100], WONK: [0, 1] } }],
  ['Instrument Sans', { wght: [400, 700] }],
  ['JetBrains Mono', { wght: [100, 800] }],
  ['Nunito', { wght: [200, 1000] }],
  ['Schibsted Grotesk', { wght: [400, 900] }],
])

// The light axis of each brand. Fonts don't change with the mode.
const BRANDS = Object.fromEntries([['base', 'base-light'], ...listBrands().map(b => [b, `${b}-light`])])

const PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

// "'JetBrains Mono', monospace" → "JetBrains Mono". A stack that opens with a
// system font (-apple-system, system-ui) or a generic family has no web font
// to load, so it returns null.
export function webFontFamily(stack) {
  const first = stack.split(',')[0].trim()
  const quoted = first.match(/^(['"])(.+)\1$/)
  return quoted ? quoted[2] : null
}

// css2 wants axis tags lowercase first, then uppercase, each group alphabetical.
function axisOrder(a, b) {
  const aLower = a === a.toLowerCase()
  const bLower = b === b.toLowerCase()
  if (aLower !== bLower) return aLower ? -1 : 1
  return a < b ? -1 : a > b ? 1 : 0
}

function familyParam({ family, weights, axes }) {
  const name = family.replaceAll(' ', '+')
  if (!axes || Object.keys(axes).length === 0) return `family=${name}:wght@${weights.join(';')}`
  // With extra axes, css2 takes one range per axis instead of a weight list.
  const ranges = { ...axes, wght: [weights[0], weights[weights.length - 1]] }
  const tags = Object.keys(ranges).sort(axisOrder)
  return `family=${name}:${tags.join(',')}@${tags.map(tag => ranges[tag].join('..')).join(',')}`
}

export function googleFontsHref(families) {
  if (families.length === 0) return null
  const params = families.map(familyParam).join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

export function fontsForAxis(tokens, axis) {
  const weights = [
    ...new Set(
      tokens
        .filter(t => t.type === 'fontWeight' && t.category !== 'primitive')
        .map(t => Number(t.resolved[axis]))
        .filter(Number.isFinite),
    ),
  ].sort((a, b) => a - b)

  const byFamily = new Map()
  for (const token of tokens) {
    if (!token.name.startsWith('font-family-')) continue
    const stack = token.resolved[axis]
    if (!stack) continue
    const family = webFontFamily(stack)
    if (!family) continue
    if (!GOOGLE_FONTS.has(family)) {
      throw new Error(
        `${token.name} on ${axis} names "${family}", which scripts/build-fonts.mjs doesn't know how to load. Add it to GOOGLE_FONTS if Google Fonts serves it, or record how it's loaded instead (decisions/0020).`,
      )
    }
    if (!byFamily.has(family)) byFamily.set(family, [])
    byFamily.get(family).push(token.name)
  }

  const families = [...byFamily].map(([family, names]) => {
    const { wght: [min, max], axes } = GOOGLE_FONTS.get(family)
    const served = weights.filter(w => w >= min && w <= max)
    return { family, tokens: names, weights: served, ...(axes ? { axes } : {}) }
  })
  return { families, href: googleFontsHref(families), preconnect: families.length > 0 ? PRECONNECT : [] }
}

export function buildFonts() {
  const { tokens } = JSON.parse(readFileSync('tokens/token-reference.json', 'utf8'))
  const brands = Object.fromEntries(Object.entries(BRANDS).map(([brand, axis]) => [brand, fontsForAxis(tokens, axis)]))

  writeFileSync('tokens/fonts.json', JSON.stringify({ brands }, null, 2) + '\n')

  const summary = Object.entries(brands)
    .map(([brand, { families }]) => `${brand}: ${families.map(f => f.family).join(', ') || 'none'}`)
    .join('; ')
  console.log(`✓ Built fonts.json (${summary})`)
}

// Run as main
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildFonts()
}
