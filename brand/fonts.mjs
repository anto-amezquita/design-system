/**
 * The Google Fonts link a brand needs (decisions/0020): which families its
 * font-family tokens name, at which weights. Shared by this package's
 * tokens/fonts.json (scripts/build-fonts.mjs) and `amezquita-brand build`.
 */

import { makeResolver } from '../lib/resolve-token.mjs'

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

export const PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

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

/**
 * The families and link for one axis of resolved token entries
 * ({ name, type, category, resolved: { [axis]: value } }, as in
 * tokens/token-reference.json). A web font GOOGLE_FONTS doesn't know goes
 * to onUnknown(family, tokenName); by default that throws, because a brand in
 * this package can't ship a font nobody has decided how to load.
 */
export function fontsForAxis(tokens, axis, { onUnknown } = {}) {
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
      if (onUnknown) {
        onUnknown(family, token.name)
        continue
      }
      throw new Error(
        `${token.name} on ${axis} names "${family}", which scripts/build-fonts.mjs doesn't know how to load. Add it to GOOGLE_FONTS in brand/fonts.mjs if Google Fonts serves it, or record how it's loaded instead (decisions/0020).`,
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

/**
 * The same, for a project brand: tokens is the merged light map (components,
 * base light, the brand's tokens.json). Fonts don't change with the mode. A
 * font GOOGLE_FONTS doesn't know is listed in `unknown` for the project to
 * load itself, since a project can't add to this package's table.
 */
export function fontsForTokens(tokens, globalTokens) {
  const resolve = makeResolver(tokens, globalTokens)
  const entries = Object.entries(tokens)
    .filter(([name, def]) => name.startsWith('font-family-') || def?.$type === 'fontWeight')
    .map(([name, def]) => ({ name, type: def.$type, category: 'semantic', resolved: { light: resolve(name) } }))
  const unknown = []
  const result = fontsForAxis(entries, 'light', { onUnknown: (family, token) => unknown.push({ family, token }) })
  return { ...result, unknown }
}
