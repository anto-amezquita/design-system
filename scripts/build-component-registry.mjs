/**
 * Generates tokens/component-registry.json.
 *
 * Sources of truth:
 *   - docs/components.md        → name, purpose, storybook path
 *   - components/{tier}/{Name}/ → determines tier
 *   - {Name}.stories.tsx        → story export names
 *   - tokens/components/*.json  → component token count
 *
 * Called automatically from sd.config.mjs after buildTokenReference().
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { toKebab } from '../lib/case.mjs'

const TIERS = [
  { name: 'primitives',  dir: 'components/primitives'  },
  { name: 'composition', dir: 'components/composition' },
  { name: 'patterns',    dir: 'components/patterns'    },
]

function toStorybookTitleId(storybookPath) {
  return storybookPath.toLowerCase().replace(/[/\s]/g, '-')
}

// ── Parse docs/components.md ─────────────────────────────────

function parseComponentsMd() {
  const md = readFileSync('docs/components.md', 'utf8')

  // Strip fenced code blocks first — the "Component template" section above
  // the real entries contains a literal "### [ComponentName]" example that
  // would otherwise be parsed as a spurious component entry.
  const withoutFences = md.replace(/```[\s\S]*?```/g, '')

  // Split on ### headings (each component section starts with "### Name")
  const parts = withoutFences.split(/^### /m).slice(1)
  const entries = []

  for (const part of parts) {
    const lines = part.split('\n')
    const name = lines[0].trim()
    if (!name) continue

    // Extract Purpose from table: | **Purpose** | text |
    const purposeMatch = part.match(/\*\*Purpose\*\*\s*\|\s*(.+?)(?:\s*\|?\s*$)/m)
    const purpose = purposeMatch?.[1]?.replace(/\|.*$/, '').trim() ?? ''

    // Extract Storybook path from table: | **Storybook path** | `Components/Name` |
    const sbMatch = part.match(/\*\*Storybook path\*\*\s*\|\s*`?([^`|\n]+)`?/)
    const storybookPath = sbMatch?.[1]?.trim() ?? `Components/${name}`

    entries.push({ name, purpose, storybookPath })
  }

  return entries
}

// ── Find tier for a component name ───────────────────────────

function findTier(name) {
  for (const { name: tierName, dir } of TIERS) {
    const componentDir = join(dir, name)
    if (existsSync(componentDir) && statSync(componentDir).isDirectory()) {
      return tierName
    }
  }
  return null
}

// ── Extract story export names from .stories.tsx ─────────────

function getStories(tier, name) {
  const storyFile = join('components', tier, name, `${name}.stories.tsx`)
  if (!existsSync(storyFile)) return []

  const content = readFileSync(storyFile, 'utf8')
  const matches = [...content.matchAll(/^export const (\w+):\s*Story/gm)]
  return matches.map(m => m[1])
}

// ── Resolve token file + prefix for a component name ─────────
// Token files use name.toLowerCase() (e.g. "datatable.json"), not kebab
// (e.g. "data-table.json"). We try lowercase first, then kebab as fallback.

function resolveTokenFile(name) {
  const candidates = [name.toLowerCase(), toKebab(name)]
  for (const stem of candidates) {
    const path = join('tokens', 'components', `${stem}.json`)
    if (existsSync(path)) return { path, prefix: stem }
  }
  return { path: null, prefix: name.toLowerCase() }
}

function countTokens(node) {
  let count = 0
  for (const value of Object.values(node)) {
    if (!value || typeof value !== 'object') continue
    count += '$value' in value ? 1 : countTokens(value)
  }
  return count
}

function collectTopLevelKeys(node, keys = []) {
  for (const [key, value] of Object.entries(node)) {
    if (!value || typeof value !== 'object') continue
    if ('$value' in value) keys.push(key)
    else collectTopLevelKeys(value, keys)
  }
  return keys
}

// Derives the shared token-name prefix from the file's own keys rather than
// guessing from the filename — some components use an abbreviated prefix.
function derivePrefix(keys) {
  if (keys.length === 0) return null
  const segments = keys[0].split('-')
  for (let len = segments.length - 1; len >= 1; len--) {
    const candidate = segments.slice(0, len).join('-')
    if (keys.every(k => k.startsWith(`${candidate}-`))) return candidate
  }
  return null
}

function getTokenInfo(name) {
  const { path, prefix: fallbackPrefix } = resolveTokenFile(name)
  if (!path) return { count: 0, prefix: fallbackPrefix }
  try {
    const json = JSON.parse(readFileSync(path, 'utf8'))
    const keys = collectTopLevelKeys(json)
    const prefix = derivePrefix(keys) ?? fallbackPrefix
    return { count: keys.length, prefix }
  } catch {
    return { count: 0, prefix: fallbackPrefix }
  }
}

// Guards against a silent cross-contamination bug: a token filter like
// `t.name.startsWith(`${tokenPrefix}-`)` would match both components' tokens
// if one component's derived prefix is a hyphen-boundary prefix of another's
// (e.g. "tag" and "tag-group").
function assertNoPrefixCollisions(components) {
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i].tokenPrefix
      const b = components[j].tokenPrefix
      if (!a || !b) continue
      if (a === b || b.startsWith(`${a}-`) || a.startsWith(`${b}-`)) {
        throw new Error(
          `Token prefix collision: "${components[i].name}" ("${a}-*") and "${components[j].name}" ("${b}-*") — ` +
          `one prefix is a hyphen-boundary prefix of the other. Rename a token key so the derived prefixes diverge.`
        )
      }
    }
  }
}

// Lists every component directory under components/{tier}/ regardless of
// whether docs/components.md documents it — used to warn about components
// that would otherwise be silently excluded from the registry.
function listComponentDirs() {
  const dirs = []
  for (const { name: tierName, dir } of TIERS) {
    if (!existsSync(dir)) continue
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) dirs.push({ tier: tierName, name: entry.name })
    }
  }
  return dirs
}

// ── Main build ────────────────────────────────────────────────

export function buildComponentRegistry() {
  const parsed = parseComponentsMd()
  const documentedNames = new Set(parsed.map(p => p.name))
  const components = []

  for (const { tier, name } of listComponentDirs()) {
    if (!documentedNames.has(name)) {
      console.warn(`⚠ components/${tier}/${name} has no matching "### ${name}" section in docs/components.md — it will not appear in the component registry.`)
    }
  }

  for (const { name, purpose, storybookPath } of parsed) {
    const tier = findTier(name)
    if (!tier) continue // skip non-system components

    const slug = toKebab(name)
    const stories = getStories(tier, name)
    const { count: tokenCount, prefix: tokenPrefix } = getTokenInfo(name)
    const storybookTitleId = toStorybookTitleId(storybookPath)

    components.push({
      name,
      slug,
      tier,
      purpose,
      storybookPath,
      storybookTitleId,
      tokenPrefix,
      stories,
      tokenCount,
    })
  }

  assertNoPrefixCollisions(components)

  // Sort: primitives first, then composition, then patterns; alphabetical within tier
  const TIER_ORDER = { primitives: 0, composition: 1, patterns: 2 }
  components.sort((a, b) =>
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name)
  )

  const registry = {
    meta: {
      componentCount: components.length,
    },
    components,
  }

  writeFileSync('tokens/component-registry.json', JSON.stringify(registry, null, 2))
  console.log(`✓ Built component-registry.json (${components.length} components)`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildComponentRegistry()
}
