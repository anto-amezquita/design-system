/**
 * Figma drift issue formatter — turns `figma-status.mjs --json` output into a
 * GitHub issue body naming the exact reconciliation commands.
 *
 * Deterministic by design: no LLM, no API key. The weekly figma-drift.yml
 * workflow pipes the status JSON through this script and files/updates a
 * single issue labeled `figma-drift`.
 *
 * Usage: node scripts/figma-drift-issue.mjs <drift.json>  (or JSON on stdin)
 * Output: markdown issue body on stdout. Exit 0 always — the workflow decides
 * whether to file an issue based on figma-status's own exit code.
 */

import { readFileSync } from 'fs'

const input = process.argv[2]
  ? readFileSync(process.argv[2], 'utf8')
  : readFileSync(0, 'utf8')

const drift = JSON.parse(input)
const primitives = drift.primitiveChanges ?? []
const semantics = drift.semanticChanges ?? []
const staleComponents = (drift.components ?? []).filter(
  c => c.status !== 'in-sync' && c.status !== 'not-pushable'
)

const lines = []

lines.push('## Figma ↔ code drift detected')
lines.push('')
lines.push(
  `Weekly check against \`figma/sync-state.json\` found ` +
  `${primitives.length} primitive, ${semantics.length} semantic, and ` +
  `${staleComponents.length} component change(s) since the last push.`
)
lines.push('')

function changeRow(change) {
  if (change.kind !== 'changed' || !change.from || !change.to) {
    return `| \`${change.key}\` | ${change.kind} | — |`
  }
  const diffs = Object.keys(change.to)
    .filter(mode => change.from[mode]?.toLowerCase() !== change.to[mode]?.toLowerCase())
    .map(mode => `${mode}: \`${change.from[mode]}\` → \`${change.to[mode]}\``)
  return `| \`${change.key}\` | changed | ${diffs.join('<br>')} |`
}

if (primitives.length) {
  lines.push('### Primitive changes (`tokens/global.json` vs Figma `Primitives` collection)')
  lines.push('')
  lines.push('| Token | Kind | Delta |')
  lines.push('|---|---|---|')
  for (const c of primitives) lines.push(changeRow(c))
  lines.push('')
}

if (semantics.length) {
  lines.push('### Semantic changes (`tokens/brands/*` vs Figma `Semantic` collection)')
  lines.push('')
  lines.push('| Token | Kind | Delta |')
  lines.push('|---|---|---|')
  for (const c of semantics) lines.push(changeRow(c))
  lines.push('')
}

if (staleComponents.length) {
  lines.push('### Components needing a push')
  lines.push('')
  for (const c of staleComponents) {
    const issues = c.issues?.length ? ` — ${c.issues.join('; ')}` : ''
    lines.push(`- \`${c.name}\` (${c.status})${issues}`)
  }
  lines.push('')
}

lines.push('### How to reconcile')
lines.push('')
lines.push('Pushes run from a local machine — Figma MCP auth lives there, not in CI.')
lines.push('')
if (primitives.length || semantics.length) {
  lines.push('1. Run `/brand-sync` in Claude Code — syncs Primitives + Semantic collections and updates `figma/sync-state.json`.')
}
for (const c of staleComponents) {
  lines.push(`1. Run \`/figma-push ${c.name}\` — regenerates the component set and its Component variables.`)
}
lines.push('1. Or, if Figma is intentionally behind (code moved ahead and Figma should follow later), re-baseline instead: run `/figma-status --baseline` to accept the current token state.')
lines.push('')
lines.push('Verify with `npm run figma:status` — exit 0 means reconciled. This issue updates in place on the next weekly run and can be closed once the check passes.')
lines.push('')
lines.push('---')
lines.push('*Filed automatically by `.github/workflows/figma-drift.yml`. Detection is deterministic (`scripts/figma-status.mjs` vs the committed sync manifest) — no AI involved in this report.*')

process.stdout.write(lines.join('\n') + '\n')
