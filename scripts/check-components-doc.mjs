/**
 * Component registry check — every directory under components/{primitives,composition,patterns}/
 * must have a matching `### ComponentName` entry in docs/components.md.
 *
 * Catches the most common drift: a component ships without a registry entry.
 *
 * Exit codes: 0 = all components documented, 1 = missing entries found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const TIERS = ['components/primitives', 'components/composition', 'components/patterns']
const REGISTRY = 'docs/components.md'

function getComponentDirs(tier) {
  try {
    return readdirSync(tier).filter(name => {
      const full = join(tier, name)
      return statSync(full).isDirectory()
    })
  } catch {
    return []
  }
}

const registry = readFileSync(REGISTRY, 'utf8')
const documentedHeadings = new Set(
  [...registry.matchAll(/^### (.+)$/gm)].map(m => m[1].trim())
)

// Count headings whose entry table has an `**Internal** | `yes`` row, so the
// summary line can distinguish "documented" (all directories) from "public"
// (what AGENTS.md / architecture.md / the token registry quote) instead of
// printing one raw number that reads as contradicting the others.
const entryBlocks = registry.split(/^### /m).slice(1)
const internalHeadings = new Set(
  entryBlocks
    .filter(block => /\*\*Internal\*\*\s*\|\s*`yes`/.test(block))
    .map(block => block.split('\n')[0].trim())
)

const missing = []

for (const tier of TIERS) {
  const components = getComponentDirs(tier)
  for (const name of components) {
    if (!documentedHeadings.has(name)) {
      missing.push({ tier, name })
    }
  }
}

// The Storybook path in each entry must match the `title` in the component's
// story file, which is where Storybook actually files the stories. The
// registry takes the title from the story file (1.3.1); this keeps the entry
// from saying something else, as 8 entries did (Accordion listed as
// `Components/Accordion`, filed under `Patterns/Accordion`).
const pathMismatches = []
for (const tier of TIERS) {
  for (const name of getComponentDirs(tier)) {
    const storyFile = join(tier, name, `${name}.stories.tsx`)
    if (!existsSync(storyFile)) continue
    const title = readFileSync(storyFile, 'utf8').match(/^\s*title:\s*['"]([^'"]+)['"]/m)?.[1]
    const section = registry.split(/^### /m).find(block => block.split('\n')[0].trim() === name)
    const documented = section?.match(/\*\*Storybook path\*\*\s*\|\s*`?([^`|\n]+)`?/)?.[1]?.trim()
    if (title && documented && title !== documented) pathMismatches.push({ name, documented, title })
  }
}
if (pathMismatches.length > 0) {
  console.error(`\n✗ Component registry: ${pathMismatches.length} Storybook path(s) in ${REGISTRY} don't match the story file's title\n`)
  for (const { name, documented, title } of pathMismatches) {
    console.error(`  ${name}: ${REGISTRY} says \`${documented}\`, ${name}.stories.tsx says \`${title}\``)
  }
  console.error(`\n  Storybook files stories under the story file's title. Change the entry to match.\n`)
  process.exit(1)
}

if (missing.length === 0) {
  const allDirs = TIERS.flatMap(getComponentDirs)
  const totalChecked = allDirs.length
  const internalCount = allDirs.filter(name => internalHeadings.has(name)).length
  const publicCount = totalChecked - internalCount
  const breakdown = internalCount > 0
    ? ` (${publicCount} public + ${internalCount} internal)`
    : ''
  console.log(`✓ Component registry check passed — ${totalChecked} directories documented${breakdown}`)
  process.exit(0)
}

console.error(`\n✗ Component registry: ${missing.length} component(s) missing from ${REGISTRY}\n`)
for (const { tier, name } of missing) {
  console.error(`  ${tier}/${name}  →  add ### ${name} to ${REGISTRY}`)
}
console.error(`\n  Copy the template from the top of ${REGISTRY} and fill in every field.\n`)
process.exit(1)
