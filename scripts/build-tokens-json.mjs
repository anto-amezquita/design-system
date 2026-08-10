/**
 * Publishes tokens/token-reference.json at the repo root as tokens.json.
 *
 * token-reference.json already *is* "the DTCG source, resolved": it reads
 * tokens/global.json plus every brand's tokens.json and resolves every
 * semantic and component token to a concrete value across all four theme
 * axes (light/default, light/bold, dark/default, dark/bold) — see
 * build-token-reference.mjs. Task 1.3 doesn't need a second resolver with a
 * different shape; it needs that same data reachable at a stable, top-level
 * path, because that's what llms.txt already links to
 * (`${rootUrl}/tokens.json`) and what an agent fetches without knowing this
 * repo's internal `tokens/` layout.
 *
 * Deliberately a straight copy, not a reshape: keeping one source of truth
 * for "what does a token resolve to" means Task 1.3a's fix (token-reference.json
 * currently omits everything but color.* primitives) lands here for free the
 * next time this runs, instead of needing two builders kept in sync by hand.
 *
 * Called after buildTokenReference() in sd.config.mjs.
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

export function buildTokensJson() {
  const source = readFileSync('tokens/token-reference.json', 'utf8')
  writeFileSync('tokens.json', source)

  const { meta } = JSON.parse(source)
  console.log(`✓ Built tokens.json (${meta.tokenCount} tokens)`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildTokensJson()
}
