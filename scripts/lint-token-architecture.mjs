/**
 * Token architecture linter — gates new component tokens that do no work.
 *
 * Companion to `npm run tokens:audit` (report-only, never exits non-zero).
 * This is the enforcement half: a component token must be either
 *   - literal (no {reference}), or
 *   - a reference that resolves DIFFERENTLY from its referent in at least
 *     one theme mode (base-light / base-dark / portfolio-light / portfolio-dark)
 * Anything else — an alias that resolves identically everywhere — is a
 * rename with extra steps and fails the lint.
 *
 * Classes (same definitions as audit-tokens.mjs):
 *   literal      no reference. Always passes.
 *   variance     resolves differently from its referent somewhere. Passes.
 *   passthrough  aliases a semantic token, identical in all modes. FAILS.
 *   chain-skip   aliases a primitive directly, identical in all modes,
 *                skipping the semantic tier. FAILS.
 *   unresolved   the reference doesn't resolve to anything. FAILS — this is
 *                always a bug, not a style choice.
 *
 * Reads token sources directly (tokens/global.json, tokens/brands/**,
 * tokens/components/*.json) rather than the built tokens/token-reference.json,
 * for the same reason lint-tokens.mjs's no-fabricated-token rule does: a
 * built artifact can be stale relative to an uncommitted source edit, and a
 * gate that trusted it could pass a genuine violation added in the same change.
 *
 * To allow a specific token that looks collapsible but is deliberately kept
 * (matches audit-tokens.mjs's own "literal — component-specific geometry"
 * carve-out, or a documented future-variance placeholder), add a
 * $extensions entry directly on that token:
 *
 *   "button-glow-color": {
 *     "$value": "{color-accent-default}",
 *     "$type": "color",
 *     "$extensions": { "amezquita.lint-ignore": ["no-collapsible-token"] }
 *   }
 *
 * No file-level or blanket suppression — every exception is named on the
 * token it applies to, so grep 'amezquita.lint-ignore' finds the whole list.
 *
 * Exit codes: 0 = clean, 1 = violations found.
 * Also writes token-architecture-violations.json for downstream tooling.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { makeResolver } from '../lib/resolve-token.mjs'

const IGNORE_KEY = 'amezquita.lint-ignore'
const RULE_ID = 'no-collapsible-token'

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function isIgnored(token) {
  const list = token.$extensions?.[IGNORE_KEY]
  return Array.isArray(list) && (list.includes(RULE_ID) || list.includes('all'))
}

// Resolves a global.json dotted path ({space.5}, {feedback.success.50}) to
// its raw primitive value, following the chain if the target primitive is
// itself a reference to another primitive (mirrors lib/resolve-token.mjs's
// resolveRef, kept separate here since that function is scoped to semantic-
// token resolution, not raw global.json path lookups). Primitives don't vary
// by axis, so one value covers all four modes. visited guards against a
// circular reference chain.
function resolveGlobalPath(ref, globalTokens, visited = new Set()) {
  if (visited.has(ref)) return undefined
  visited.add(ref)

  const segments = ref.split('.')
  let node = globalTokens
  for (const seg of segments) {
    if (node == null) return undefined
    node = node[seg]
  }
  if (node == null) return undefined
  const val = node.$value ?? node.value
  if (val === undefined || val === null) return undefined

  const str = typeof val === 'string' ? val : String(val)
  const nested = str.match(/^\{([^}]+)\}$/)
  return nested ? resolveGlobalPath(nested[1], globalTokens, visited) : val
}

function runLinter() {
  const globalTokens = loadJson('tokens/global.json')
  const baseLightTokens = loadJson('tokens/brands/base/light.json')
  const baseDarkOverrides = loadJson('tokens/brands/base/dark.json')
  const portfolioLightOverrides = loadJson('tokens/brands/portfolio/tokens.json')
  const portfolioDarkOverrides = loadJson('tokens/brands/portfolio/dark.json')

  // { fileName: { tokenName: tokenDef } } — kept per-file so violations can
  // be reported against the file the token actually lives in.
  const componentFiles = readdirSync('tokens/components').filter(f => f.endsWith('.json'))
  const componentTokensByFile = {}
  const componentTokens = {}
  for (const file of componentFiles) {
    const fileTokens = loadJson(`tokens/components/${file}`)
    componentTokensByFile[file] = fileTokens
    Object.assign(componentTokens, fileTokens)
  }

  // Same axis construction as build-token-reference.mjs — cascade order
  // matters (portfolio overrides win over base for shared token names).
  const AXES = {
    'base-light':      { ...baseLightTokens, ...componentTokens },
    'base-dark':       { ...baseLightTokens, ...componentTokens, ...baseDarkOverrides },
    'portfolio-light': { ...baseLightTokens, ...componentTokens, ...portfolioLightOverrides },
    'portfolio-dark':  { ...baseLightTokens, ...componentTokens, ...baseDarkOverrides, ...portfolioLightOverrides, ...portfolioDarkOverrides },
  }
  const AXIS_NAMES = Object.keys(AXES)
  const resolvers = Object.fromEntries(
    AXIS_NAMES.map(axis => [axis, makeResolver(AXES[axis], globalTokens)])
  )

  const violations = []

  for (const [file, fileTokens] of Object.entries(componentTokensByFile)) {
    for (const [name, token] of Object.entries(fileTokens)) {
      if (isIgnored(token)) continue

      const raw = token.$value ?? token.value
      const refMatch = typeof raw === 'string' ? raw.match(/^\{([^}]+)\}$/) : null

      // Literal value (no reference) — always fine, this is the
      // component-specific-geometry-or-motion case audit-tokens.mjs calls "keep".
      if (!refMatch) continue

      const refInner = refMatch[1]
      const isPrimitiveRef = refInner.includes('.')

      const tokenResolved = Object.fromEntries(
        AXIS_NAMES.map(axis => [axis, resolvers[axis](name)])
      )

      let targetResolved
      if (isPrimitiveRef) {
        const val = resolveGlobalPath(refInner, globalTokens)
        if (val === undefined) {
          violations.push({ file, token: name, rule: 'unresolved-reference', detail: `{${refInner}}` })
          continue
        }
        const str = String(val)
        targetResolved = Object.fromEntries(AXIS_NAMES.map(axis => [axis, str]))
      } else {
        targetResolved = Object.fromEntries(
          AXIS_NAMES.map(axis => [axis, resolvers[axis](refInner)])
        )
        if (AXIS_NAMES.every(axis => targetResolved[axis] === null)) {
          violations.push({ file, token: name, rule: 'unresolved-reference', detail: `{${refInner}}` })
          continue
        }
      }

      const differs = AXIS_NAMES.some(axis => tokenResolved[axis] !== targetResolved[axis])
      if (differs) continue // variance — keep

      violations.push({
        file,
        token: name,
        rule: isPrimitiveRef ? 'chain-skip' : 'passthrough',
        detail: `→ {${refInner}}, identical in all ${AXIS_NAMES.length} modes`,
      })
    }
  }

  if (violations.length === 0) {
    console.log(`✓ Token architecture linter passed — ${Object.keys(componentTokens).length} component tokens checked, 0 violations`)
    process.exit(0)
  }

  const byFile = {}
  for (const v of violations) {
    (byFile[v.file] ??= []).push(v)
  }

  console.error(`\n✗ Token architecture linter: ${violations.length} violation(s) across ${Object.keys(byFile).length} file(s)\n`)
  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.error(`  tokens/components/${file}`)
    for (const v of fileViolations) {
      console.error(`    [${v.rule}]  ${v.token}  ${v.detail}`)
    }
    console.error('')
  }
  console.error('  A component token must be literal, or resolve differently from its')
  console.error('  referent in at least one mode. To keep an exception, add on that token:')
  console.error('    "$extensions": { "amezquita.lint-ignore": ["no-collapsible-token"] }')
  console.error('')

  writeFileSync('token-architecture-violations.json', JSON.stringify(violations, null, 2))
  console.error(`  Full report written to token-architecture-violations.json`)
  process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runLinter()
}
