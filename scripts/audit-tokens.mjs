/**
 * Token architecture audit.
 *
 * Answers one question: how many component tokens actually do something?
 *
 * A component token earns its place if it is a literal value with no semantic
 * equivalent (avatar-group-overlap: -8px), or if it resolves DIFFERENTLY from
 * the token it references in at least one theme mode. Anything else is a rename
 * with extra steps — an alias that adds a hop to every debugging session and a
 * line to every mental model, and buys nothing.
 *
 * Source of truth: tokens/token-reference.json (generated). Never hand-counted.
 *
 * Classes reported:
 *   literal      no reference — component-specific geometry or motion. Keep.
 *   variance     resolves differently from its referent somewhere. Keep.
 *   passthrough  aliases a SEMANTIC token, identical in all modes. Collapse candidate.
 *   chain-skip   aliases a PRIMITIVE directly, identical in all modes. Two problems:
 *                the redundant hop, and bypassing the semantic tier entirely.
 *
 * Also flags "suspicious variance": a token that differs from its referent in
 * exactly one mode. That is the shape of a MISSING override far more often than
 * a deliberate one — worth an eyeball in Chromatic before assuming intent.
 *
 * Usage:  npm run audit:tokens        human-readable report
 *         npm run audit:tokens -- --json   machine-readable, for diffing over time
 *
 * Reports only. Never exits non-zero — this is a thinking tool, not a gate.
 */

import { readFileSync } from 'node:fs'

const REFERENCE_PATH = 'tokens/token-reference.json'
const asJson = process.argv.includes('--json')

// ── Load and index ───────────────────────────────────────────────────────────

const { meta, tokens } = JSON.parse(readFileSync(REFERENCE_PATH, 'utf8'))

// Token names appear as both kebab and dot notation in rawValue references
// ({color-border-default} vs {border-width.thin}), so index both spellings.
const byName = new Map()
for (const token of tokens) {
  byName.set(token.name, token)
  byName.set(token.name.replace(/-/g, '.'), token)
}

function resolveReference(rawValue) {
  const inner = rawValue.slice(1, -1)
  return (
    byName.get(inner) ??
    byName.get(inner.replace(/\./g, '-')) ??
    byName.get(inner.replace(/-/g, '.')) ??
    null
  )
}

const isReference = value => typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
const tierOf = token => (token.category === 'component' ? 'component' : token.category === 'primitive' ? 'primitive' : 'semantic')

// ── Classify ─────────────────────────────────────────────────────────────────

const literal = []
const variance = []
const passthrough = []
const chainSkip = []
const unresolved = []

for (const token of tokens.filter(t => t.category === 'component')) {
  if (!isReference(token.rawValue)) {
    literal.push({ name: token.name, value: token.rawValue })
    continue
  }

  const target = resolveReference(token.rawValue)
  if (!target) {
    unresolved.push({ name: token.name, ref: token.rawValue })
    continue
  }

  const modes = Object.keys(token.resolved)
  const differing = modes.filter(mode => token.resolved[mode] !== target.resolved[mode])
  const record = {
    name: token.name,
    ref: target.name,
    tier: tierOf(target),
    type: token.type,
  }

  if (differing.length > 0) {
    variance.push({
      ...record,
      differingModes: differing,
      // One differing mode is usually an override someone forgot to add,
      // not one they chose to leave out.
      suspicious: differing.length === 1,
      resolved: token.resolved,
      targetResolved: target.resolved,
    })
  } else if (record.tier === 'primitive') {
    chainSkip.push(record)
  } else {
    passthrough.push(record)
  }
}

const collapsible = passthrough.length + chainSkip.length
const keep = literal.length + variance.length

// ── Report ───────────────────────────────────────────────────────────────────

function tally(records, key) {
  const counts = new Map()
  for (const record of records) counts.set(record[key], (counts.get(record[key]) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])
}

if (asJson) {
  console.log(JSON.stringify(
    { meta, summary: { literal: literal.length, variance: variance.length, passthrough: passthrough.length, chainSkip: chainSkip.length, unresolved: unresolved.length, collapsible, keep }, literal, variance, passthrough, chainSkip, unresolved },
    null, 2,
  ))
  process.exit(0)
}

const pct = n => `${Math.round((n / meta.componentCount) * 100)}%`

console.log('')
console.log('Token architecture audit')
console.log('─'.repeat(64))
console.log(`  ${meta.total} tokens: ${meta.primitiveCount} primitive · ${meta.semanticCount} semantic · ${meta.componentCount} component`)
console.log('')
console.log('  Component tokens by class')
console.log(`    literal      ${String(literal.length).padStart(4)}  ${pct(literal.length).padStart(4)}  keep — no semantic equivalent`)
console.log(`    variance     ${String(variance.length).padStart(4)}  ${pct(variance.length).padStart(4)}  keep — resolves differently somewhere`)
console.log(`    passthrough  ${String(passthrough.length).padStart(4)}  ${pct(passthrough.length).padStart(4)}  collapse — alias of a semantic token`)
console.log(`    chain-skip   ${String(chainSkip.length).padStart(4)}  ${pct(chainSkip.length).padStart(4)}  collapse — alias of a primitive, skips the semantic tier`)
if (unresolved.length) {
  console.log(`    unresolved   ${String(unresolved.length).padStart(4)}        reference did not resolve — investigate`)
}
console.log('')
console.log(`  ${keep} of ${meta.componentCount} component tokens do work. Collapsing the rest would land the system at ${meta.total - collapsible} tokens.`)

if (variance.length) {
  console.log('')
  console.log('  Tokens that resolve differently from their referent')
  for (const token of variance) {
    const flag = token.suspicious ? '  ⚠ one mode only' : ''
    console.log(`    ${token.name}  →  ${token.ref}   [${token.differingModes.join(', ')}]${flag}`)
  }
  const suspicious = variance.filter(t => t.suspicious)
  if (suspicious.length) {
    console.log('')
    console.log(`  ⚠ ${suspicious.length} differ in exactly one mode. That is the shape of a missing override.`)
    console.log('    Check these in Chromatic before assuming the divergence is intentional.')
  }
}

if (passthrough.length) {
  console.log('')
  console.log(`  Semantic tokens absorbing the most pass-throughs (${new Set(passthrough.map(t => t.ref)).size} distinct targets)`)
  for (const [name, count] of tally(passthrough, 'ref').slice(0, 8)) {
    console.log(`    ${String(count).padStart(3)}×  ${name}`)
  }
}

if (chainSkip.length) {
  console.log('')
  console.log(`  Primitives absorbing the most chain-skips (${new Set(chainSkip.map(t => t.ref)).size} distinct targets)`)
  for (const [name, count] of tally(chainSkip, 'ref').slice(0, 8)) {
    console.log(`    ${String(count).padStart(3)}×  ${name}`)
  }
  console.log('')
  console.log('    A primitive absorbing many component tokens is a semantic role that')
  console.log('    was never named. Either name it, or let components use the primitive')
  console.log('    directly — but the component token in between earns nothing.')
}

console.log('')
