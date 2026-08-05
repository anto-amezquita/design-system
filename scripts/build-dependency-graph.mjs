/**
 * Dependency graph builder — produces tokens/dependency-graph.json.
 *
 * Maps every CSS custom property token name back to the component files
 * that reference it, including one level of alias resolution through
 * component token files.
 *
 * Why two layers?
 *   Direct:   Button.css uses var(--button-primary-background)
 *   Resolved: button-primary-background aliases {color-accent-default},
 *             so color-accent-default also maps to Button.css
 *
 * This makes it possible to ask "which component files will be affected
 * if I change color-accent-default?" without scanning component CSS directly.
 *
 * Output shape:
 *   {
 *     meta: { filesScanned, tokenCount },
 *     byToken: {
 *       "color-accent-default": ["components/primitives/Button/Button.css", ...],
 *       "button-primary-background": ["components/primitives/Button/Button.css"],
 *       ...
 *     }
 *   }
 */

import { glob } from 'glob'
import { readFileSync, writeFileSync } from 'fs'

// Build alias map from all component token files.
// Resolves only one level: component-token → semantic-token.
// Skips: global primitive aliases ({space.5}, {color.warm-900}) — they have a dot.
// Skips: literal values (transparent, 750ms, -8px, rgba(...)).
async function buildAliasMap() {
  const files = (await glob('tokens/components/*.json')).sort()
  const aliases = {}

  for (const file of files) {
    const tokens = JSON.parse(readFileSync(file, 'utf8'))
    for (const [name, token] of Object.entries(tokens)) {
      const raw = token.$value ?? token.value
      if (typeof raw !== 'string') continue
      // Semantic alias: {color-accent-default} — kebab-case, no dot, no spaces
      const match = raw.match(/^\{([a-z][a-z0-9-]+)\}$/)
      if (match) aliases[name] = match[1]
    }
  }

  return aliases
}

// Extract all --token-name references from a CSS file, deduplicated.
function extractTokenRefs(cssContent) {
  const seen = new Set()
  for (const [, name] of cssContent.matchAll(/var\(--([a-z][a-z0-9-]*)\)/g)) {
    seen.add(name)
  }
  return seen
}

function addEntry(map, token, file) {
  const list = map[token] ?? (map[token] = [])
  if (!list.includes(file)) list.push(file)
}

const aliasMap = await buildAliasMap()
const cssFiles = (await glob('components/**/*.css')).sort()
const byToken = {}

for (const file of cssFiles) {
  const content = readFileSync(file, 'utf8')
  for (const token of extractTokenRefs(content)) {
    // Direct reference: CSS file uses this token
    addEntry(byToken, token, file)

    // Resolved reference: this component token aliases a semantic token —
    // the CSS file is indirectly coupled to that semantic token too
    const resolved = aliasMap[token]
    if (resolved) addEntry(byToken, resolved, file)
  }
}

// Sort each file list for deterministic, diffable output
for (const list of Object.values(byToken)) list.sort()

// Sort tokens alphabetically
const sorted = Object.fromEntries(
  Object.entries(byToken).sort(([a], [b]) => a.localeCompare(b))
)

const output = {
  meta: {
    filesScanned: cssFiles.length,
    tokenCount: Object.keys(sorted).length,
  },
  byToken: sorted,
}

try {
  writeFileSync('tokens/dependency-graph.json', JSON.stringify(output, null, 2))
} catch (err) {
  console.error(`✗ Could not write tokens/dependency-graph.json: ${err.message}`)
  process.exit(1)
}
console.log(
  `✓ Built dependency-graph.json — ${cssFiles.length} files scanned, ${Object.keys(sorted).length} tokens mapped`
)
