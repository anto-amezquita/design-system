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
 *     so base needs only its mono font; portfolio is a skin on base, so it
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

// Families this system loads from Google Fonts. Adding a font to a brand means
// adding it here, which is the moment to check Google Fonts actually has it.
const GOOGLE_FONTS = new Set(['JetBrains Mono', 'Schibsted Grotesk'])

// The light axis of each brand. Fonts don't change with the mode.
const BRANDS = { base: 'base-light', portfolio: 'portfolio-light' }

const PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

// "'JetBrains Mono', monospace" → "JetBrains Mono". A stack that opens with a
// system font (-apple-system, system-ui) or a generic family has no web font
// to load, so it returns null.
export function webFontFamily(stack) {
  const first = stack.split(',')[0].trim()
  const quoted = first.match(/^(['"])(.+)\1$/)
  return quoted ? quoted[2] : null
}

export function googleFontsHref(families) {
  if (families.length === 0) return null
  const params = families
    .map(({ family, weights }) => `family=${family.replaceAll(' ', '+')}:wght@${weights.join(';')}`)
    .join('&')
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

  const families = [...byFamily].map(([family, names]) => ({ family, tokens: names, weights }))
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
