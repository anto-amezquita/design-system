/**
 * Token linter — enforces design system token usage in CSS source.
 *
 * Scope: components/primitives, components/composition, components/patterns
 * — the whole exported surface of this package, so all four rules apply
 * uniformly. (The portfolio's copy of this script also lints site-level CSS
 * with a reduced rule set; that scope doesn't exist in this standalone
 * package, so it's been dropped here.)
 *
 * Rules:
 *   no-raw-hex                — no hex colour literals; use semantic tokens
 *   no-primitive-tokens       — no --color-warm-*, --color-black, etc., no raw --space-N, no raw
 *                               --font-size-{2xs..3xl}, no raw --line-height-{tighter,tight,normal,loose,fixed-*};
 *                               use a semantic token, or a Tier-3 component token that itself binds to the primitive
 *   no-hardcoded-motion       — no bare ms timing values; use --duration-* tokens
 *   no-hardcoded-spacing      — no px values in spacing properties; use --space-* tokens
 *   no-deep-bem-nesting       — no element-inside-element selectors (.block__el__el)
 *   no-missing-reduced-motion — file-level: any file declaring a transition or
 *                               animation must contain a prefers-reduced-motion block
 *   no-fabricated-token       — var(--x) where --x doesn't resolve to a real token — not
 *                               in tokens/global.json, any brand's tokens.json under
 *                               tokens/brands, or a file under tokens/components; isn't
 *                               declared elsewhere in the same file (a component-private
 *                               custom property); and isn't a --radix-* variable set at
 *                               runtime by Radix Primitives. Reads source files directly
 *                               rather than the built token-reference.json, so it can't
 *                               pass on stale data if a real token was added but
 *                               `npm run tokens` wasn't re-run before linting.
 *   no-token-fallback          — var(--token, fallback) two-argument form. Fallbacks mask a
 *                               missing token silently instead of failing loud — this is how
 *                               27 fabricated tokens shipped undetected in the field study this
 *                               plan is measured against. A token either exists or it doesn't;
 *                               a component-private customization hook belongs to
 *                               no-fabricated-token's allow-list, not a fallback value.
 *
 * To suppress a known legitimate exception on a single line:
 *   padding: 6px;  [lint-ignore: no-hardcoded-spacing]
 *   gap: 6px;      [lint-ignore: no-hardcoded-spacing, no-raw-hex]
 *   color: red;    [lint-ignore: all]
 * (Use CSS comment syntax in actual files: slash-star lint-ignore: rule-id star-slash)
 *
 * Exit codes: 0 = clean, 1 = violations found.
 * Also writes token-violations.json for downstream automated processing.
 */

import { glob } from 'glob'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { flattenPrimitives } from './build-token-reference.mjs'

// CSS properties that must reference spacing tokens (excludes geometry: width, height, inset, etc.)
const SPACING_PROPERTIES = new Set([
  'padding',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',
  'margin',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'gap', 'column-gap', 'row-gap',
])

// Primitive token patterns — these should never appear in system component CSS
const PRIMITIVE_PATTERNS = [
  /var\(--color-warm-[\w-]*\)/g,
  /var\(--color-black\)/g,
  /var\(--color-white\)/g,
  /var\(--color-teal-[\w-]*\)/g,
  /var\(--space-\d+\)/g,
  /var\(--font-size-(2xs|xs|sm|base|md|emphasis|lg|xl|2xl|3xl)\)/g,
  /var\(--line-height-(tighter|tight|normal|loose|fixed-\d+)\)/g,
]

// Radix Primitives sets these on the DOM at runtime (e.g. for animating open/close
// to a measured size); they're real, just not tokens this system defines.
export const RADIX_VAR_RE = /^--radix-/

// Every name a var(--x) reference is allowed to resolve to, read straight from the
// DTCG source files rather than tokens/token-reference.json — a built artifact can be
// stale relative to an uncommitted source edit, and a linter that trusted it could
// pass a genuinely fabricated token, or fail a real one added in the same change.
// rootDir defaults to process.cwd() (correct for this script's own CLI use, always
// invoked via `npm run` from repo root) but is overridable — a caller that imports
// this function without controlling its own cwd (e.g. scripts/mcp-server.mjs, which
// an MCP client can spawn from anywhere) must pass its own resolved repo root.
export function loadKnownTokenVars(rootDir = process.cwd()) {
  const names = new Set()

  const globalTokens = JSON.parse(readFileSync(join(rootDir, 'tokens/global.json'), 'utf8'))
  for (const [groupName, groupTokens] of Object.entries(globalTokens)) {
    for (const entry of flattenPrimitives(groupTokens, groupName)) names.add(entry.name)
  }

  const brandsDir = join(rootDir, 'tokens/brands')
  for (const brand of readdirSync(brandsDir)) {
    const brandDir = join(brandsDir, brand)
    for (const file of readdirSync(brandDir)) {
      if (!file.endsWith('.json')) continue
      for (const key of Object.keys(JSON.parse(readFileSync(join(brandDir, file), 'utf8')))) names.add(key)
    }
  }

  const componentsDir = join(rootDir, 'tokens/components')
  for (const file of readdirSync(componentsDir)) {
    if (!file.endsWith('.json')) continue
    for (const key of Object.keys(JSON.parse(readFileSync(join(componentsDir, file), 'utf8')))) names.add(key)
  }

  return new Set([...names].map(name => `--${name}`))
}

// Strips /* ... */ (including comments that span multiple lines) and //
// line comments from a whole file's content in one pass, preserving every
// newline so the stripped output's line numbers still match the original.
// A per-line stripper can't see a block comment opened on an earlier line —
// prose inside a multi-line doc comment (e.g. documenting a renamed BEM
// class, or a hex value replaced by a token) would otherwise read as real
// CSS to every rule below.
function stripAllComments(content) {
  let result = ''
  let i = 0
  let inBlockComment = false
  while (i < content.length) {
    if (inBlockComment) {
      const end = content.indexOf('*/', i)
      if (end === -1) {
        result += content.slice(i).replace(/[^\n]/g, '')
        break
      }
      result += content.slice(i, end + 2).replace(/[^\n]/g, '')
      i = end + 2
      inBlockComment = false
      continue
    }
    const nextBlock = content.indexOf('/*', i)
    const nextLine = content.indexOf('//', i)
    if (nextBlock === -1 && nextLine === -1) {
      result += content.slice(i)
      break
    }
    if (nextLine !== -1 && (nextBlock === -1 || nextLine < nextBlock)) {
      const eol = content.indexOf('\n', nextLine)
      result += content.slice(i, nextLine)
      if (eol === -1) {
        result += content.slice(nextLine).replace(/[^\n]/g, '')
        break
      }
      result += content.slice(nextLine, eol).replace(/[^\n]/g, '')
      i = eol
      continue
    }
    result += content.slice(i, nextBlock)
    inBlockComment = true
    i = nextBlock
  }
  return result
}

function parsePropertyValue(strippedLine) {
  const stripped = strippedLine.trim()
  // Skip empty lines, comment-only lines, selectors ({...}), at-rules
  if (
    !stripped ||
    stripped.startsWith('/*') ||
    stripped.startsWith('//') ||
    stripped.startsWith('@') ||
    stripped.endsWith('{') ||
    stripped === '}'
  ) return null

  const colonIdx = stripped.indexOf(':')
  if (colonIdx === -1) return null

  // Skip pseudo-selectors like :hover, :focus — they have colons but aren't declarations
  const beforeColon = stripped.slice(0, colonIdx).trim()
  if (beforeColon.includes(' ') || beforeColon.startsWith('&')) return null

  return {
    prop: beforeColon.toLowerCase(),
    value: stripped.slice(colonIdx + 1).replace(/;.*$/, '').trim(),
  }
}

function parseIgnoreDirective(rawLine) {
  const match = rawLine.match(/lint-ignore:\s*([a-z,\s-]+)/i)
  if (!match) return new Set()
  return new Set(match[1].split(',').map(s => s.trim()).filter(Boolean))
}

// Shared predicates — the linter's own RULES below call these, and
// scripts/mcp-server.mjs's validate_token tool imports them directly, so
// there is exactly one implementation of each check, not a second copy an
// MCP tool could drift from. See this file's header comment for what each
// rule means; these two functions are the reusable core of no-token-fallback
// and no-fabricated-token respectively.

// Matches a var(--x, ...) two-argument (fallback) form. Only needs to find
// the comma after the property name, not parse the fallback expression
// itself, which may contain its own nested function calls and commas
// (var(--x, rgba(0,0,0,0.5))).
export function findTokenFallbacks(text) {
  const matches = [...text.matchAll(/var\(\s*--[\w-]+\s*,/g)]
  return matches.length ? matches.map(m => m[0].replace(/,$/, ')')) : null
}

// Whether a `--x` custom-property name resolves to a real token: present in
// knownTokenVars (see loadKnownTokenVars), or a --radix-* runtime variable.
// Deliberately excludes the linter's file-local "declared elsewhere in this
// same CSS file" exception (component-private custom properties) — that's a
// CSS-authoring escape hatch with no meaning outside a specific file, and
// isn't part of what this predicate can decide from a bare token name alone.
export function isKnownTokenVar(name, knownTokenVars) {
  return knownTokenVars.has(name) || RADIX_VAR_RE.test(name)
}

const RULES = [
  {
    id: 'no-raw-hex',
    description: 'Raw hex value — replace with a semantic token (e.g. var(--color-text-primary))',
    // Every check() below receives the line already stripped of comment text
    // (including multi-line block comments) by stripAllComments — see lintFile.
    check(strippedLine) {
      // All three branches exclude CSS ID selector context via (?!\s*\{) — a hex value
      // in a declaration is never followed by whitespace+{, but a selector would be.
      const matches = [...strippedLine.matchAll(/#[0-9A-Fa-f]{8}(?!\s*\{)\b|#[0-9A-Fa-f]{6}(?!\s*\{)\b|#[0-9A-Fa-f]{4}(?!\s*\{)(?![0-9A-Fa-f])\b|#[0-9A-Fa-f]{3}(?!\s*\{)(?![0-9A-Fa-f])\b/g)]
      return matches.length ? matches.map(m => m[0]) : null
    },
  },
  {
    id: 'no-primitive-tokens',
    description: 'Primitive token reference — replace with a semantic token (color: --color-text-*/--color-surface-*/--color-accent-*; spacing: --space-inline-gap/--space-element-gap/etc.; typography: --font-size-body/--font-size-small/etc., --line-height-heading/--line-height-body/etc.) or, for a genuinely component-specific value, a Tier-3 component token that itself binds to the primitive',
    check(strippedLine) {
      const matches = PRIMITIVE_PATTERNS.flatMap(pattern => [...strippedLine.matchAll(pattern)].map(m => m[0]))
      return matches.length ? matches : null
    },
  },
  {
    id: 'no-hardcoded-motion',
    description: 'Hardcoded timing value — replace with a duration token (--duration-interaction, --duration-entrance, etc.)',
    check(strippedLine) {
      const pv = parsePropertyValue(strippedLine)
      if (!pv) return null
      // Match any non-zero ms value (0ms is valid — used to disable animations)
      const matches = [...pv.value.matchAll(/\b([1-9]\d*)ms\b/g)]
      return matches.length ? matches.map(m => m[0]) : null
    },
  },
  {
    id: 'no-deep-bem-nesting',
    description: 'BEM element nested inside an element — flatten to a single element (.card__body__text → .card__text)',
    check(strippedLine) {
      // Only flag selector context: the pattern must appear before any colon-declaration.
      const matches = [...strippedLine.matchAll(/\.[a-z0-9-]+__[a-z0-9-]+__[a-z0-9-]+/g)]
      return matches.length ? matches.map(m => m[0]) : null
    },
  },
  {
    id: 'no-hardcoded-spacing',
    description: 'Hardcoded spacing value — replace with a space token (--space-component-gap, --space-tight-gap, etc.)',
    check(strippedLine) {
      const pv = parsePropertyValue(strippedLine)
      if (!pv || !SPACING_PROPERTIES.has(pv.prop)) return null
      // Flag integer px values ≥ 3px — values below this are micro-adjustments not in the spacing scale.
      // Negative lookbehind (?<![.\d]) prevents matching the suffix of fractional values like 1.5px.
      const matches = [...pv.value.matchAll(/(?<![.\d])([3-9]\d*|[1-9]\d{1,})px\b/g)]
      return matches.length ? matches.map(m => m[0]) : null
    },
  },
  {
    id: 'no-token-fallback',
    description: 'var(--token, fallback) two-argument form — a token either exists or it doesn\'t; a fallback masks the difference. Use no-fabricated-token\'s allow-list for a genuine component-private customization hook.',
    check(strippedLine) {
      return findTokenFallbacks(strippedLine)
    },
  },
  {
    id: 'no-fabricated-token',
    description: 'var(--x) where --x isn\'t a real token (global.json, any brand\'s tokens.json, or tokens/components/*.json), a --radix-* runtime variable, or declared elsewhere in this same file as a private custom property.',
    check(strippedLine, fileContext) {
      const found = []
      for (const m of strippedLine.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1]
        if (isKnownTokenVar(name, fileContext.knownTokenVars)) continue
        if (fileContext.locallyDeclaredVars.has(name)) continue
        found.push(name)
      }
      return found.length ? found : null
    },
  },
]

function lintFile(filePath, rules, knownTokenVars) {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  // Comment-free view, computed once for the whole file so a multi-line block
  // comment (unclosed on the current line) can't leak prose into any rule
  // below as if it were live CSS.
  const strippedLines = stripAllComments(content).split('\n')
  const violations = []

  // File-level rule: a file that declares any transition or animation must
  // also contain a prefers-reduced-motion block somewhere. Checked inline
  // below so its /* lint-ignore: no-missing-reduced-motion */ suppression is
  // scoped to the violating line's own ignore directive, like every other
  // rule — a lint-ignore elsewhere in the file for an unrelated rule must
  // not silence this one.
  const hasReducedMotionBlock = /prefers-reduced-motion/.test(content)
  let motionViolation = null

  // Custom properties this file declares itself (e.g. `--button-glow-color:
  // rgba(...)`) — a component-private value, not a design token, and
  // no-fabricated-token shouldn't flag the file referencing its own
  // declaration. Collected in a first pass so declaration order relative to
  // usage doesn't matter.
  const locallyDeclaredVars = new Set()
  for (const strippedLine of strippedLines) {
    const pv = parsePropertyValue(strippedLine)
    if (pv && pv.prop.startsWith('--')) locallyDeclaredVars.add(pv.prop)
  }
  const fileContext = { locallyDeclaredVars, knownTokenVars }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const strippedLine = strippedLines[i]
    const lineNum = i + 1
    const ignored = parseIgnoreDirective(rawLine)

    for (const rule of rules) {
      if (ignored.has(rule.id) || ignored.has('all')) continue
      const found = rule.check(strippedLine, fileContext)
      if (found) {
        violations.push({ file: filePath, line: lineNum, rule: rule.id, description: rule.description, found })
      }
    }

    if (
      !hasReducedMotionBlock &&
      !motionViolation &&
      !ignored.has('no-missing-reduced-motion') &&
      !ignored.has('all')
    ) {
      const pv = parsePropertyValue(strippedLine)
      if (
        pv &&
        /^(transition|animation)(-duration|-name|-timing-function|-delay|-iteration-count|-direction|-fill-mode)?$/.test(pv.prop) &&
        !/^none\b/.test(pv.value)
      ) {
        motionViolation = {
          file: filePath,
          line: lineNum,
          rule: 'no-missing-reduced-motion',
          description: 'File declares motion but has no @media (prefers-reduced-motion: reduce) block',
          found: [`${pv.prop}: ${pv.value.slice(0, 40)}`],
        }
      }
    }
  }

  if (motionViolation) violations.push(motionViolation)

  return violations
}

async function runLinter() {
  const knownTokenVars = loadKnownTokenVars()

  const systemFiles = (await glob([
    'components/primitives/**/*.css',
    'components/composition/**/*.css',
    'components/patterns/**/*.css',
  ], { cwd: process.cwd() })).sort()

  const allViolations = []
  for (const file of systemFiles) {
    allViolations.push(...lintFile(file, RULES, knownTokenVars))
  }

  if (allViolations.length === 0) {
    console.log(`✓ Token linter passed — ${systemFiles.length} files checked, 0 violations`)
    process.exit(0)
  }

  // Group by file for readable output (Object.groupBy requires Node ≥ 21 — use explicit loop for compatibility)
  const byFile = {}
  for (const v of allViolations) {
    if (!byFile[v.file]) byFile[v.file] = []
    byFile[v.file].push(v)
  }

  console.error(`\n✗ Token linter: ${allViolations.length} violation(s) across ${Object.keys(byFile).length} file(s)\n`)
  for (const [file, violations] of Object.entries(byFile)) {
    console.error(`  ${file}`)
    for (const v of violations) {
      console.error(`    ${String(v.line).padStart(4)}  [${v.rule}]  ${v.found.join(', ')}`)
      console.error(`         ${v.description}`)
      console.error(`         Suppress: /* lint-ignore: ${v.rule} */`)
    }
    console.error('')
  }

  writeFileSync('token-violations.json', JSON.stringify(allViolations, null, 2))
  console.error(`  Full report written to token-violations.json`)
  process.exit(1)
}

// Run as main script — guarded so scripts/mcp-server.mjs (and anything else)
// can import loadKnownTokenVars/findTokenFallbacks/isKnownTokenVar from this
// file without triggering a full lint run and its process.exit() calls.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runLinter()
}
