/**
 * Generates the agent skill served from /.well-known/skills/:
 *   skills/amezquita-design-system/SKILL.md
 *   skills/index.json
 *
 * Format verified against a real, live example before writing anything —
 * fetched https://nordhealth.design/.well-known/skills/index.json and
 * .../nord/SKILL.md (2026-08-10) rather than guessing at a convention that
 * has no formal spec the way shadcn's registry does. Confirmed shape:
 *   index.json:  { skills: [{ name, description, files: [...] }] }
 *   SKILL.md:    YAML frontmatter (name, description, metadata.author) +
 *                a short intro, then tables of topic → one-line description
 *                → link to a references/*.md file, gating all real detail
 *                behind those links rather than inlining it.
 *
 * This system is small enough (27 components) that it doesn't need Nord's
 * references/ tier of local files — the component detail already exists as
 * a stable public URL (docs/components/<slug>.md, served at
 * <docs site>/components/<slug>.md since 1.3.0), so the skill links straight there
 * instead of duplicating that content into a second local copy that could
 * drift from the first.
 *
 * Sources of truth:
 *   - tokens/component-registry.json → component list, tier, slug, purpose
 *   - tokens/token-reference.json    → semantic token categories, for the
 *                                       "what doesn't exist" prohibition list
 *   - package.json, README.md        → package name, site root, docs base URL
 *
 * NOT LIVE UNTIL PUBLISHED to the docs site, same as every other artifact in
 * this plan — see docs/ai-readiness-plan.md Task 4.3.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

import { getSiteUrls } from './site-urls.mjs'

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

const SKILL_NAME = 'amezquita-design-system'
const OUTPUT_DIR = 'skills'
const SKILL_DIR = `${OUTPUT_DIR}/${SKILL_NAME}`

const TIER_ORDER = ['primitives', 'composition', 'patterns']
const TIER_LABELS = { primitives: 'Primitives', composition: 'Composition', patterns: 'Patterns' }

function groupByTier(components) {
  const groups = { primitives: [], composition: [], patterns: [] }
  for (const c of components) {
    // Same exclusion build-llms-txt.mjs and list_components use — a compound
    // sub-component isn't a top-level component an agent reaches for on its
    // own, it rides along inside its parent's own usage example.
    if (c.internal || c.parent) continue
    groups[c.tier]?.push(c)
  }
  return groups
}

// The token's `category` field (color, spacing, typography, …) is an
// internal grouping label, not a real prefix — "typography" tokens are
// actually named font-size-*/font-weight-*/line-height-*/etc. Deriving the
// real two-segment prefix per token, grouped by category, is what actually
// belongs in a file whose job is stopping an agent from inventing one.
function realPrefixesByCategory(tokens) {
  const byCategory = {}
  for (const t of tokens) {
    if (t.category === 'primitive' || t.category === 'component') continue
    const segments = t.name.split('-')
    const prefix = segments.length > 1 ? segments.slice(0, 2).join('-') : segments[0]
    const set = byCategory[t.category] ?? (byCategory[t.category] = { prefixes: new Set(), count: 0 })
    set.prefixes.add(prefix)
    set.count++
  }
  return byCategory
}

function buildSkillMd({ pkg, registry, tokenReference, siteUrls }) {
  const { siteUrl, twinUrl } = siteUrls
  const groups = groupByTier(registry.components)
  const publicCount = registry.meta.publicComponentCount ?? registry.meta.componentCount

  const byCategory = realPrefixesByCategory(tokenReference.tokens)
  const categoryLines = Object.entries(byCategory)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([cat, { prefixes, count }]) => {
      const prefixList = [...prefixes].sort().map(p => `\`--${p}-*\``).join(', ')
      return `- **${cat}** (${count}): ${prefixList}`
    })

  const lines = [
    '---',
    `name: ${SKILL_NAME}`,
    `description: Build UI with ${pkg.name} — React 19 components, DTCG design tokens, and a shadcn-spec component registry. Use when writing or reviewing code that imports from \`${pkg.name}\`, references its CSS custom properties, or when a page needs a Button, Dialog, DataTable, or any of its ${publicCount - 3} other public components.`,
    'metadata:',
    '  author: Antonio Amezquita',
    `  homepage: ${siteUrl}`,
    '---',
    '',
    `${pkg.name} is a token-first, multi-brand React component library — ${publicCount} public components across primitives, composition, and pattern tiers, DTCG design tokens resolved across base/portfolio × light/dark, and a real npm package. Not copy-paste source: components are imported, not vendored.`,
    '',
    '## Install',
    '',
    '```bash',
    `npm install ${pkg.name}`,
    '```',
    '',
    'Or install a single component via the registry:',
    '',
    '```bash',
    `npx shadcn add ${siteUrl}/r/<component-slug>.json`,
    '```',
    '',
    '```tsx',
    `import { Button } from '${pkg.name}/components/primitives/Button'`,
    `import '${pkg.name}/styles/brands/base-light.css'`,
    `import '${pkg.name}/styles/brands/base-dark.css'`,
    '```',
    '',
    'Import the brand CSS once, in your root layout. `base` is the neutral default; for the portfolio brand, also import `portfolio-light.css` and `portfolio-dark.css` after these. Dark mode applies inside any element with `data-mode="dark"`. To show the portfolio brand in one part of a page only, import `portfolio-scoped.css` instead of those two and wrap that part in `<ThemeScope brand="portfolio">` (composition tier). `mode="dark"` or `mode="light"` on a ThemeScope sets that part\'s mode, and overlays opened inside it follow both.',
    '',
    `Next.js apps also need \`transpilePackages: ['${pkg.name}']\` in \`next.config.js\` — this package ships source \`.tsx\`/\`.css\`, not a pre-built bundle.`,
    '',
    '## Components',
    '',
    `Full prop tables, real tokens, and a usage example for every component: \`${twinUrl('<slug>')}\`. Don't guess a prop name or a token — read the twin.`,
  ]

  for (const tier of TIER_ORDER) {
    const components = groups[tier]
    if (components.length === 0) continue
    lines.push('', `### ${TIER_LABELS[tier]} (${components.length})`, '', '| Component | Reference |', '|---|---|')
    for (const c of components) {
      lines.push(`| ${c.name} | [${c.slug}](${twinUrl(c.slug)}) — ${c.purpose} |`)
    }
  }

  lines.push(
    '',
    '## Tokens',
    '',
    `Every token this system defines, resolved across all four theme axes: ${siteUrl}/tokens.json. If a token isn't in that file, it doesn't exist — don't invent one, even a plausible-sounding one.`,
    '',
    'Real semantic token families:',
    '',
    ...categoryLines,
    '',
    `Component-scoped tokens follow \`--<component-slug>-*\` (e.g. \`--button-padding-x\`) — each component's own reference page (above) lists its real ones.`,
    '',
    `Composing a page, not just a component — a wrapper's own padding/max-width/section gaps — has real tokens too, easy to miss because no single component page owns them: \`--space-layout-margin\`, \`--space-section-gap\`, \`--space-component-gap\`, and the max-width scale \`--size-container-text\` / \`-media\` / \`-wide\` / \`-page\` / \`-site\` (wrap each in \`min(…, 100%)\`; \`--space-layout-max-width\` is deprecated). Use these instead of a guessed pixel value or an invented T-shirt-sized token.`,
    '',
    '## What doesn\'t exist',
    '',
    `Anything not in the Components table above or ${siteUrl}/tokens.json is invented. Specifically, common near-misses that do NOT exist in this system:`,
    '',
    '- `--color-primary`, `--color-secondary`, `--color-brand` — the real accent token is `--color-accent-default`; text uses `--color-text-*`, surfaces use `--color-surface-*`',
    '- `--color-error`, `--color-success`, `--color-warning` on their own — feedback colors are namespaced `--color-feedback-error-*` / `-success-*` / `-warning-*` / `-info-*`',
    '- T-shirt-sized spacing tokens (`--space-sm`, `--space-md`, `--space-lg`) — this system\'s numeric primitives (`--space-1` … `--space-10`) sit behind named semantic tokens like `--space-tight-gap` and `--space-component-gap`, never referenced directly by component CSS',
    '- Any component not in the tables above — a "Card Header" or "Toast Container" is only real if it matches what that component\'s own reference page documents (e.g. `CardHeader`, `ToastProvider`)',
    '- `BaseSheet` as something you import — it ships in the package (Drawer\'s internal overlay primitive) but was never meant to be used directly',
    '',
    `Still unsure? ${siteUrl}/llms-full.txt is a single-fetch index across every public component (purpose, import path, token count, Storybook stories) — useful for a fast overview, but it does not carry prop tables or token names; for those, the component's own reference page above is the real source. If a prop's type references another local type that isn't spelled out on that page (rare, but it happens), the installed package's own \`.tsx\` source in \`node_modules/${pkg.name}\` is ground truth — better than guessing.`,
  )

  return lines.join('\n') + '\n'
}

export function buildSkill() {
  const pkg = loadJson('package.json')
  const registry = loadJson('tokens/component-registry.json')
  const tokenReference = loadJson('tokens/token-reference.json')
  const siteUrls = getSiteUrls()

  if (!existsSync(SKILL_DIR)) mkdirSync(SKILL_DIR, { recursive: true })

  writeFileSync(`${SKILL_DIR}/SKILL.md`, buildSkillMd({ pkg, registry, tokenReference, siteUrls }))

  const index = {
    skills: [
      {
        name: SKILL_NAME,
        description: `Build UI with ${pkg.name} — React components, DTCG design tokens, and a shadcn-spec component registry.`,
        files: ['SKILL.md'],
      },
    ],
  }
  writeFileSync(`${OUTPUT_DIR}/index.json`, JSON.stringify(index, null, 2))

  console.log(`✓ Built skill "${SKILL_NAME}" (SKILL.md + index.json) in ${OUTPUT_DIR}/`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildSkill()
}
