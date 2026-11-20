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
import { fontsForAxis } from '../brand/fonts.mjs'
import { listBrands } from './brands.mjs'

// The table and the link maths live in brand/fonts.mjs, shared with
// `amezquita-brand build` (decisions/0028). Re-exported for the tests.
export { GOOGLE_FONTS, fontsForAxis, googleFontsHref, webFontFamily } from '../brand/fonts.mjs'

// The light axis of each brand. Fonts don't change with the mode.
const BRANDS = Object.fromEntries([['base', 'base-light'], ...listBrands().map(b => [b, `${b}-light`])])

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
