/**
 * Generates llms.txt and llms-full.txt at the repo root.
 *
 * Sources of truth:
 *   - package.json                    → name, description, install command
 *   - README.md                       → docs site root + component-docs base URL
 *   - tokens/component-registry.json  → component list, tiers, purpose, tokenPrefix, tokenCount, stories
 *   - tokens/token-reference.json     → token counts by category, for the inlined summary in llms-full.txt
 *   - scripts/mcp-server.mjs          → the MCP tool list, from the server's own registrations (TOOLS)
 *   - tokens/fonts.json               → the Google Fonts link each brand needs
 *
 * llms.txt is the lean index: what the system is, how to install it, and links out to
 * every public component's markdown twin (shipped by Task 1.2) and the token reference (Task 1.3).
 * It deliberately does not inline token-reference.json — 227 kB is a payload, not an index.
 *
 * Components flagged `internal` in the registry are excluded from both files. They ship in
 * the package because something else imports them, but an agent should never see them as
 * a component it may reach for.
 *
 * LIVE as of Task 1.5 (2026-08-10): the portfolio repo (the docs site) serves llms.txt,
 * llms-full.txt, tokens.json, and every component's .md twin at the URLs this file
 * generates, confirmed with real `curl` checks against the production domain, not just
 * locally. It's a static snapshot of this repo's generated output, not an automated
 * pipeline — re-copy there when these files change.
 *
 * llms-full.txt inlines everything currently compiled about each component (purpose, import
 * path, token prefix + count, storybook path, story names) for a single-fetch agent that
 * can't follow links. It does not inline the fuller per-component detail (prop tables, token
 * values, usage examples) that build-component-docs.mjs writes into each .md twin — that
 * stays link-only, same reasoning as not inlining token-reference.json.
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { TOOLS } from './mcp-server.mjs'

import { getSiteUrls } from './site-urls.mjs'

const TIER_ORDER = ['primitives', 'composition', 'patterns']
const TIER_LABELS = {
  primitives: 'Primitives',
  composition: 'Composition',
  patterns: 'Patterns',
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function groupByTier(components) {
  const groups = { primitives: [], composition: [], patterns: [] }
  for (const component of components) {
    // Compound sub-components (CardHeader, TableCell, ...) ride along with
    // their parent's own usage example and aren't independently reachable
    // components in their own right — same exclusion as `internal`, so this
    // stays the real, top-level component list (matches list_components).
    if (component.internal || component.parent) continue
    groups[component.tier]?.push(component)
  }
  return groups
}

function summarizeTokensByCategory(tokens) {
  const counts = {}
  for (const { category } of tokens) {
    counts[category] = (counts[category] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

// "git+https://github.com/x/y.git" → "https://github.com/x/y". The MCP server
// isn't in the npm package, so the agent files point at the repo to get it.
function repoUrl(pkg) {
  return pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
}

// The first sentence of a tool description, for the lean index. Skips the
// period in "e.g." so a parenthetical example doesn't end the sentence early.
export function firstSentence(text) {
  const m = text.match(/^(.+?(?<!\be\.g)\.)(?=\s|$)/)
  return m ? m[1] : text
}

// The package ships no font files (decisions/0020), so both files say which
// link each brand needs, straight from tokens/fonts.json.
function fontLines(fonts) {
  const lines = [
    '## Fonts',
    '',
    'The package ships no font files. Load the fonts a brand names from Google Fonts; `tokens/fonts.json` has the same links, machine-readable.',
    '',
  ]
  for (const [brand, { families, href }] of Object.entries(fonts.brands)) {
    if (!href) continue
    const names = families.map(f => f.family).join(' and ')
    lines.push(`- ${brand}: ${names}. \`<link rel="stylesheet" href="${href}">\``)
  }
  return lines
}

function mcpIntro(pkg) {
  return `Read-only tools over the same files this package ships, read live instead of from a snapshot. The server isn't in the npm package: clone [the repo](${repoUrl(pkg)}) and run \`node scripts/mcp-server.mjs\` (stdio).`
}

// Falls back to the full count for registries built before publicComponentCount existed,
// so a stale registry produces a wrong-by-one number rather than "undefined components".
function publicCount(registry) {
  return registry.meta.publicComponentCount ?? registry.meta.componentCount
}

// ── llms.txt — lean index ────────────────────────────────────────

function buildIndex({ pkg, registry, siteUrls, fonts }) {
  const { siteUrl, portfolioUrl, twinUrl } = siteUrls
  const groups = groupByTier(registry.components)

  const lines = [
    `# ${pkg.name}`,
    '',
    `> ${pkg.description}`,
    '',
    `Extracted from and still powering [amezquita.dk](${portfolioUrl}). ${publicCount(registry)} components across primitives, composition, and pattern tiers.`,
    '',
    '## Install',
    '',
    '```bash',
    `npm install ${pkg.name}`,
    '```',
    '',
    ...fontLines(fonts),
    '',
    '## Reference',
    '',
    `- [Token reference](${siteUrl}/tokens.json): every token name and resolved value, across all four theme axes`,
    `- [Full docs, single fetch](${siteUrl}/llms-full.txt): this index with every component inlined`,
    `- [Live component docs](${siteUrl}): human-facing docs site`,
  ]

  for (const tier of TIER_ORDER) {
    const components = groups[tier]
    if (components.length === 0) continue
    lines.push('', `## ${TIER_LABELS[tier]}`, '')
    for (const component of components) {
      lines.push(`- [${component.name}](${twinUrl(component.slug)}): ${component.purpose}`)
    }
  }

  lines.push('', '## MCP server', '', mcpIntro(pkg), '')
  for (const tool of TOOLS) {
    lines.push(`- \`${tool.name}\`: ${firstSentence(tool.description)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ── llms-full.txt — everything currently compiled, inlined ───────

function buildFull({ pkg, registry, tokenReference, siteUrls, fonts }) {
  const { siteUrl } = siteUrls
  const groups = groupByTier(registry.components)
  const tokenCounts = summarizeTokensByCategory(tokenReference.tokens)

  const lines = [
    `# ${pkg.name} — full reference`,
    '',
    `> ${pkg.description}`,
    '',
    '## Install',
    '',
    '```bash',
    `npm install ${pkg.name}`,
    '```',
    '',
    ...fontLines(fonts),
    '',
    '## Tokens',
    '',
    `${tokenReference.meta.total} tokens total, resolved across base/portfolio × light/dark. Full values: ${siteUrl}/tokens.json`,
    '',
  ]

  for (const [category, count] of tokenCounts) {
    lines.push(`- ${category}: ${count}`)
  }

  for (const tier of TIER_ORDER) {
    const components = groups[tier]
    if (components.length === 0) continue
    lines.push('', `## ${TIER_LABELS[tier]}`)

    for (const component of components) {
      const importPath = `${pkg.name}/components/${component.tier}/${component.name}`
      lines.push(
        '',
        `### ${component.name}`,
        '',
        component.purpose,
        '',
        `- Import: \`import { ${component.name} } from '${importPath}'\``,
        `- Token prefix: \`${component.tokenPrefix}-*\` (${component.tokenCount} tokens)`,
        `- Storybook: ${component.storybookPath}`,
      )
      if (component.stories.length > 0) {
        lines.push(`- Stories: ${component.stories.join(', ')}`)
      }
    }
  }

  lines.push('', '## MCP server', '', mcpIntro(pkg))
  for (const tool of TOOLS) {
    lines.push('', `### ${tool.name}`, '', tool.description)
  }

  lines.push('')
  return lines.join('\n')
}

// ── Main build ─────────────────────────────────────────────────

export function buildLlmsTxt() {
  const pkg = loadJson('package.json')
  const registry = loadJson('tokens/component-registry.json')
  const tokenReference = loadJson('tokens/token-reference.json')
  const fonts = loadJson('tokens/fonts.json')
  const siteUrls = getSiteUrls()

  writeFileSync('llms.txt', buildIndex({ pkg, registry, siteUrls, fonts }))
  writeFileSync('llms-full.txt', buildFull({ pkg, registry, tokenReference, siteUrls, fonts }))

  console.log(`✓ Built llms.txt and llms-full.txt (${publicCount(registry)} public components)`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildLlmsTxt()
}
