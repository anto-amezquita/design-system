/**
 * This repo's brand check (decisions/0028): base's own contrast, then every
 * brand in tokens/brands through the same checkBrand() a project runs on its
 * brand. Replaces scripts/check-contrast.mjs in npm run validate and CI.
 *
 * Exit codes: 0 = everything passes, 1 = a brand has problems.
 * On a contrast failure, writes contrast-failures.json (gitignored), the shape
 * the /pr-review flow reads (docs/autonomous-design-system.md).
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { checkBrand, checkContrast } from '../brand/check.mjs'
import { loadSystem } from '../brand/contract.mjs'
import { formatResult } from '../brand/report.mjs'
import { listBrands } from './brands.mjs'

// Unprefixed tokens a brand here may set until its ticket removes them.
// portfolio's four are read only by the portfolio site's CSS; AME-72 renames
// them to portfolio-* when the brand moves to the portfolio repo.
export const EXCEPTIONS = {
  portfolio: {
    'color-accent-glow': 'AME-72',
    'color-surface-spotlight': 'AME-72',
    'color-text-frozen-primary': 'AME-72',
    'color-text-frozen-secondary': 'AME-72',
  },
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()

function main() {
const system = loadSystem()

const systemLight = { ...system.components, ...system.baseLight }
const baseResults = checkContrast({
  'base-light': systemLight,
  'base-dark': { ...systemLight, ...system.baseDark },
}, system.pairs, system.global)

const brandResults = listBrands().map(name =>
  checkBrand(`tokens/brands/${name}`, { name, system, exceptions: EXCEPTIONS[name] }),
)

const contrastResults = [...baseResults, ...brandResults.flatMap(r => r.contrast.results)]
const modes = [...new Set(contrastResults.map(r => r.mode))]
const baseFailures = baseResults.filter(r => !r.pass)
const failing = brandResults.filter(r => !r.ok)

if (baseFailures.length === 0 && failing.length === 0) {
  console.log(`✓ Brand check passed — ${brandResults.length} brands against the brand contract, ${contrastResults.length} contrast pairs across ${modes.length} modes (${modes.join(', ')})`)
  process.exit(0)
}

for (const r of baseFailures) {
  console.error(`✗ [${r.mode}] ${r.role}: ${r.fg} (${r.fgHex}) on ${r.bg} (${r.bgHex}) is ${r.ratio}:1, needs ${r.required}:1`)
  console.error('    fix: darken or lighten one of the two in tokens/brands/base/\n')
}
for (const r of failing) for (const line of formatResult(r)) console.error(line)

const contrastFailures = contrastResults.filter(r => !r.pass)
if (contrastFailures.length) {
  try {
    writeFileSync('contrast-failures.json', JSON.stringify(contrastFailures, null, 2))
    console.error('  Contrast failures written to contrast-failures.json')
  } catch (err) {
    console.error(`  Could not write contrast-failures.json: ${err.message}`)
  }
}
process.exit(1)
}
