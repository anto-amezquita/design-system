/**
 * Generates one .md twin per public component in docs/components/<slug>.md.
 *
 * Sources of truth (see the Task 1.2 design note in docs/ai-readiness-plan.md —
 * docs/components.md is NOT the props source; only 8 of 28 components document
 * props there, and an empty prop table would tell an agent a component takes
 * none):
 *
 *   - tokens/component-registry.json  → name, slug, tier, purpose, storybook path
 *   - components/{tier}/{name}/{name}.tsx        → props, parsed from the type alias
 *   - tokens/components/<file>.json + token-reference.json → token list + resolved values
 *   - components/{tier}/{name}/{name}.stories.tsx → usage example, from the Default story
 *   - docs/components.md              → Accessibility bullets, where present
 *
 * Components flagged `internal` in the registry get no twin (no twin for BaseSheet) —
 * same rule Task 1.1 applies to llms.txt/llms-full.txt.
 *
 * Every field is optional at the source level and every section is optional in the
 * output: a component with no props type, no Default story, no component-token file
 * (EmptyState — styles come straight off the semantic layer, it never had one), or no
 * Accessibility entry just gets a shorter file, never a crash and never an empty
 * section. An empty table would tell an agent "this has none"; omitting says "not
 * documented," and only one of those is ever true.
 *
 * The prop parser is a lightweight TS-lite reader, not a type checker: it resolves
 * local literal-union aliases (type ButtonVariant = 'primary' | …) inline into the
 * prop that uses them, resolves plain local object-alias unions (Dialog's controlled/
 * uncontrolled split, Badge's dot/other split, Accordion's single/multiple split) by
 * merging their members, and falls back to a plain "Also accepts all props of: X" note
 * for anything it can't structurally resolve (Omit<...>, React.ComponentPropsWithoutRef
 * <...>, generics). It does not resolve prop names against the actually-exported
 * symbol when they differ from the registry name (Radio's component is RadioGroup) —
 * it follows exported function components back to their own `<Fn>Props` alias when the
 * registry name has none.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { toKebab } from '../lib/case.mjs'

const OUTPUT_DIR = 'docs/components'

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

// ── Low-level TS-lite scanning ───────────────────────────────────
//
// These treat `{`, `(`, `[`, `<` as depth-opening and `}`, `)`, `]`, `>` as
// depth-closing (skipping `=>` so arrow functions don't miscount), which is
// enough to walk this codebase's type aliases without a real TS parser.

// Comments are prose: they may contain stray apostrophes ("axe's landmark
// rule") that would otherwise be misread as opening a string literal, and
// stray commas/pipes ("resets on reference, callers should...") that would
// otherwise be misread as structural separators. `inComment[i]` lets every
// consumer of `depths` ignore comment content when it isn't hunting for
// prose to attach as a description.
function annotateDepths(text) {
  const depths = new Array(text.length).fill(0)
  const inComment = new Array(text.length).fill(false)
  let depth = 0
  let inString = null
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inString) {
      depths[i] = depth
      if (ch === '\\') { depths[i + 1] = depth; i += 2; continue }
      if (ch === inString) inString = null
      i++
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') { depths[i] = depth; inComment[i] = true; i++ }
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      depths[i] = depth; inComment[i] = true
      depths[i + 1] = depth; inComment[i + 1] = true
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) { depths[i] = depth; inComment[i] = true; i++ }
      if (i < text.length) { depths[i] = depth; inComment[i] = true; depths[i + 1] = depth; inComment[i + 1] = true; i += 2 }
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; depths[i] = depth; i++; continue }
    if (ch === '=' && text[i + 1] === '>') { depths[i] = depth; depths[i + 1] = depth; i += 2; continue }
    if ('{(['.includes(ch) || ch === '<') { depth++; depths[i] = depth; i++; continue }
    if (')]}'.includes(ch) || ch === '>') { depth = Math.max(0, depth - 1); depths[i] = depth; i++; continue }
    depths[i] = depth
    i++
  }
  return { depths, inComment }
}

function findMatchingClose(text, openIdx, openCh, closeCh) {
  let depth = 0
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === openCh) depth++
    else if (text[i] === closeCh) { depth--; if (depth === 0) return i }
  }
  return text.length - 1
}

// Reads forward from just after a type alias's `=` until the statement
// naturally ends: brackets balanced back to 0, then a newline whose next
// non-space content doesn't continue the type with `&` or `|`. A newline
// still inside a block comment doesn't count — it isn't a statement end.
function scanBalancedType(text) {
  const { depths, inComment } = annotateDepths(text)
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '\n') continue
    if (inComment[i]) continue
    const depthHere = i > 0 ? depths[i - 1] : 0
    if (depthHere !== 0) continue
    const rest = text.slice(i + 1)
    const trimmedStart = rest.replace(/^\s*/, '')
    if (trimmedStart.startsWith('&') || trimmedStart.startsWith('|')) continue
    return text.slice(0, i)
  }
  return text
}

function extractTypeAliasRhs(source, typeName) {
  const declRe = new RegExp(`(?:export\\s+)?type\\s+${typeName}\\b[^=\\n]*=\\s*`)
  const m = declRe.exec(source)
  if (!m) return null
  const start = m.index + m[0].length
  return scanBalancedType(source.slice(start)).trim()
}

// A generic component's own type-parameter clause (e.g. `<T extends Record<string,
// unknown>>` on DataTable) lives on the exported function declaration, not the Props
// type alias buildPropsSection reads — so it's otherwise invisible to the compiled
// docs even though a prop whose type references T (DataTable's `render`) silently
// resolves to `unknown` for a caller whose own type argument doesn't already satisfy
// it. `[^=\n]*` in extractTypeAliasRhs's own declRe already discards the identical
// clause on the Props alias itself for the same reason — this reads it from the
// function declaration instead, where every generic component actually declares it.
function findGenericConstraint(source, componentName) {
  const declRe = new RegExp(`export\\s+function\\s+${componentName}\\s*<`)
  const m = declRe.exec(source)
  if (!m) return null
  const openIdx = m.index + m[0].length - 1
  const closeIdx = findMatchingClose(source, openIdx, '<', '>')
  if (closeIdx <= openIdx) return null
  return collapseWhitespace(source.slice(openIdx + 1, closeIdx).trim())
}

// Splits `text` at top-level (depth 0) occurrences of any char in `ops`,
// ignoring occurrences inside comments.
function splitTopLevel(text, ops) {
  const { depths, inComment } = annotateDepths(text)
  const parts = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (depths[i] === 0 && !inComment[i] && ops.includes(text[i])) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(p => p.trim()).filter(Boolean)
}

// Splits an object type's inner body into member chunks at top-level
// newlines/commas — this codebase doesn't use trailing commas between type
// members, so a newline at depth 0 is the normal separator. A comma inside a
// `//` comment (a stray "Pass a, b" in prose) doesn't split; the comment's
// own terminating newline does, same as any other member.
function splitEntries(text) {
  const { depths, inComment } = annotateDepths(text)
  const entries = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    // A newline inside a /** ... */ block comment doesn't split — only the
    // comment's own terminating newline (after `*/`, never marked inComment)
    // ends its chunk, so a multi-line JSDoc block stays one entry.
    const isSplitChar = (text[i] === '\n' && !inComment[i]) || (text[i] === ',' && !inComment[i])
    if (depths[i] === 0 && isSplitChar) {
      const chunk = text.slice(start, i)
      if (chunk.trim()) entries.push(chunk)
      start = i + 1
    }
  }
  const last = text.slice(start)
  if (last.trim()) entries.push(last)
  return entries
}

function collapseWhitespace(s) {
  return s
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('; ')
    .replace(/\{\s*;\s*/g, '{ ')
    .replace(/\s*;\s*\}/g, ' }')
    .replace(/;\s*;/g, ';')
}

// Markdown tables use `|` as the column delimiter — a union type like
// `'a' | 'b'` would otherwise fracture into extra columns.
function escapeCell(text) {
  return text.replace(/\|/g, '\\|')
}

// For plain-text cells (descriptions), not code spans: a stray `<a>` in prose
// ("Defaults to a plain <a>") would otherwise be read as a raw, unclosed HTML
// tag by a strict Markdown renderer. Code-span cells (`` `Type` ``) don't
// need this — backticks already suppress HTML parsing of their contents.
function escapeProse(text) {
  return escapeCell(text).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function collapseExtra(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/<\s+/g, '<')
    .replace(/\s+>/g, '>')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
}

// ── Collecting local type aliases (for literal-union + object-union resolution) ──

function collectTypeAliases(source) {
  const objectAliases = new Map()
  const rawAliases = new Map()
  const declRe = /(?:export\s+)?type\s+(\w+)\b(?:<[^=\n]*>)?\s*=\s*/g
  let m
  while ((m = declRe.exec(source))) {
    const name = m[1]
    if (rawAliases.has(name)) continue
    const start = m.index + m[0].length
    const rhs = scanBalancedType(source.slice(start)).trim()
    rawAliases.set(name, rhs)
    if (rhs.startsWith('{') && rhs.endsWith('}')) objectAliases.set(name, rhs)
  }
  return { objectAliases, rawAliases }
}

const LITERAL_UNION_RE =
  /^\s*(-?\d+(\.\d+)?|'[^']*'|"[^"]*"|true|false)(\s*\|\s*(-?\d+(\.\d+)?|'[^']*'|"[^"]*"|true|false))*\s*$/

function isLiteralUnion(text) {
  return LITERAL_UNION_RE.test(text)
}

function resolveRelativeModule(fromFile, relPath) {
  const base = join(dirname(fromFile), relPath)
  for (const ext of ['.tsx', '.ts']) {
    if (existsSync(base + ext)) return base + ext
  }
  if (existsSync(base) && statSync(base).isFile()) return base
  return null
}

// One level of cross-file resolution — covers `import { type FeedbackVariant }
// from '../../../lib/feedbackIcons'`, the only case in this codebase where a
// prop's literal union isn't defined in the same file.
function buildImportLiteralMap(source, filePath) {
  const map = new Map()
  const importRe = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"](\.[^'"]+)['"]/g
  let m
  while ((m = importRe.exec(source))) {
    const names = m[1].split(',').map(s => s.trim().replace(/^type\s+/, '')).filter(Boolean)
    for (const n of names) {
      const resolvedPath = resolveRelativeModule(filePath, m[2])
      if (!resolvedPath) continue
      const content = readFileSync(resolvedPath, 'utf8')
      const declRe = new RegExp(`export\\s+type\\s+${n}\\b[^=\\n]*=\\s*([^\\n{}]+)$`, 'm')
      const dm = declRe.exec(content)
      if (dm) map.set(n, dm[1].trim())
    }
  }
  return map
}

function buildLiteralAliasMap(source, filePath, rawAliases) {
  const importMap = buildImportLiteralMap(source, filePath)
  const resolved = new Map()
  const candidateNames = new Set([...rawAliases.keys(), ...importMap.keys()])
  for (const name of candidateNames) {
    let text = rawAliases.has(name) ? rawAliases.get(name) : importMap.get(name)
    text = text.replace(/\b[A-Z]\w*\b/g, tok => {
      if (tok === name) return tok
      if (rawAliases.has(tok)) return rawAliases.get(tok)
      if (importMap.has(tok)) return importMap.get(tok)
      return tok
    })
    if (isLiteralUnion(text)) resolved.set(name, text)
  }
  return resolved
}

function expandLiteralUnions(typeText, literalAliasMap) {
  let result = typeText
  for (const [name, literal] of literalAliasMap) {
    const re = new RegExp(`\\b${name}\\b`, 'g')
    if (re.test(result)) result = result.replace(re, literal)
  }
  return result
}

// A prop like `groups: SelectGroup[]` is useless to a reader if SelectGroup's
// own shape is never spelled out anywhere on the page — found by testing this
// exact gap against a real agent building with only the compiled docs: it had
// to go read the installed package's source to learn SelectGroup was really
// `{ label?: string; options: SelectOption[] }`. Inlines local object-alias
// shapes referenced inside a prop's type text, recursively (SelectOption
// inside SelectGroup) up to a small fixed depth — bounded so a
// self-referential type (rare, none in this codebase today) can't loop.
function expandObjectAliases(typeText, objectAliases, depth = 2) {
  let result = typeText
  for (let i = 0; i < depth; i++) {
    let changed = false
    for (const [name, shape] of objectAliases) {
      // A generic alias (`Column<T>`) needs its type argument consumed too —
      // leaving it gives `{...inlined shape...}<T>`, which reads as applying
      // generic args to an object literal, not what the source meant.
      const re = new RegExp(`\\b${name}\\b(<[^<>]*>)?`, 'g')
      if (re.test(result)) {
        result = result.replace(re, collapseWhitespace(shape))
        changed = true
      }
    }
    if (!changed) break
  }
  return result
}

// ── Props type → entries ──────────────────────────────────────────

// `strict` skips the fallback scan below — needed for a sub-component read out
// of its parent's shared file (CardHeader out of Card.tsx), where the file
// has several `<Fn>Props` types and the fallback's "first one that matches
// any exported function" would silently grab a sibling's props (e.g. Card's
// own CardProps) instead of reporting that this one genuinely has none.
function findPropsTypeName(source, componentName, { strict = false } = {}) {
  if (new RegExp(`\\btype\\s+${componentName}Props\\b`).test(source)) return `${componentName}Props`
  if (strict) return null
  const fnRe = /export\s+function\s+([A-Z]\w*)\s*\(/g
  let m
  while ((m = fnRe.exec(source))) {
    const propsName = `${m[1]}Props`
    if (new RegExp(`\\btype\\s+${propsName}\\b`).test(source)) return propsName
  }
  return null
}

// Splits the props type's RHS into object-literal blocks to merge (resolving
// bare references to local plain-object aliases, e.g. DialogControlledProps)
// plus a list of parts it couldn't resolve structurally (Omit<...>, native
// ComponentPropsWithoutRef<...>, etc.) to surface as a plain extends-note.
function decomposeProps(rhs, objectAliases) {
  const trimmed = rhs.trim()
  if (trimmed.startsWith('{')) return { blocks: [trimmed], extras: [] }

  const blocks = []
  const extras = []
  for (const part of splitTopLevel(trimmed, ['&'])) {
    let p = part.trim()
    if (p.startsWith('(') && p.endsWith(')')) p = p.slice(1, -1).trim()
    if (p.startsWith('{')) { blocks.push(p); continue }

    const orParts = splitTopLevel(p, ['|'])
    const isBareIdentifier = s => /^[A-Za-z_]\w*$/.test(s)
    if (orParts.every(isBareIdentifier) && orParts.some(op => objectAliases.has(op))) {
      let allResolved = true
      for (const op of orParts) {
        const resolved = objectAliases.get(op)
        if (resolved) blocks.push(resolved)
        else allResolved = false
      }
      if (!allResolved) extras.push(collapseExtra(p))
      continue
    }
    extras.push(collapseExtra(p))
  }
  return { blocks, extras }
}

function parseObjectBody(blockText, literalAliasMap, objectAliases) {
  const inner = blockText.trim().replace(/^\{/, '').replace(/\}$/, '')
  const entries = []
  let pendingComment = null

  for (const rawChunk of splitEntries(inner)) {
    const chunk = rawChunk.trim()
    if (!chunk) continue

    if (/^\/\/.*$/.test(chunk) && !chunk.includes('\n')) {
      const text = chunk.replace(/^\/\/\s*/, '')
      pendingComment = pendingComment ? `${pendingComment} ${text}` : text
      continue
    }
    if (/^\/\*\*[\s\S]*\*\/$/.test(chunk)) {
      const text = chunk
        .replace(/^\/\*\*/, '')
        .replace(/\*\/$/, '')
        .split('\n')
        .map(l => l.trim().replace(/^\*\s?/, ''))
        .filter(Boolean)
        .join(' ')
        .trim()
      pendingComment = pendingComment ? `${pendingComment} ${text}` : text
      continue
    }

    const m = chunk.match(/^(\[?)(['"]?)([\w$-]+)\2(\]?)(\?)?:\s*([\s\S]+)$/)
    if (!m) { pendingComment = null; continue }

    const name = m[3]
    const optional = !!m[5]
    let typeText = m[6].replace(/\/\/.*$/, '').trim()
    typeText = collapseWhitespace(typeText)
    typeText = expandObjectAliases(typeText, objectAliases)
    typeText = expandLiteralUnions(typeText, literalAliasMap)

    entries.push({ name, optional, type: typeText, description: pendingComment || '' })
    pendingComment = null
  }
  return entries
}

function mergeEntries(blockEntryLists) {
  const map = new Map()
  for (const list of blockEntryLists) {
    for (const e of list) {
      if (!map.has(e.name)) {
        map.set(e.name, { name: e.name, optional: e.optional, types: [e.type], description: e.description })
      } else {
        const existing = map.get(e.name)
        if (!existing.types.includes(e.type)) existing.types.push(e.type)
        existing.optional = existing.optional || e.optional
        if (!existing.description && e.description) existing.description = e.description
      }
    }
  }
  return [...map.values()].map(e => ({ ...e, type: e.types.join(' | ') }))
}

function buildPropsSection(source, filePath, propsTypeName) {
  const rhs = extractTypeAliasRhs(source, propsTypeName)
  if (!rhs) return null

  const { objectAliases, rawAliases } = collectTypeAliases(source)
  const literalAliasMap = buildLiteralAliasMap(source, filePath, rawAliases)
  const { blocks, extras } = decomposeProps(rhs, objectAliases)
  const entries = blocks.length > 0
    ? mergeEntries(blocks.map(b => parseObjectBody(b, literalAliasMap, objectAliases)))
    : []
  // A pure passthrough alias (`type TableHeadProps = React.ComponentPropsWithoutRef<'thead'>`)
  // resolves to zero own entries but a real extras note — that note is the
  // whole content worth telling an agent, so it must survive even with no table.
  if (entries.length === 0 && extras.length === 0) return null
  return { entries, extras }
}

// ── Usage example, from the Default story ─────────────────────────

function extractBalancedBraces(text, openIdx) {
  const end = findMatchingClose(text, openIdx, '{', '}')
  return text.slice(openIdx, end + 1)
}

function extractRenderJsx(objectInner) {
  const re = /(^|[\n,])\s*render\s*:\s*/
  const m = re.exec(objectInner)
  if (!m) return null
  let i = m.index + m[0].length

  const arrowMatch = /^\(([^)]*)\)\s*=>\s*/.exec(objectInner.slice(i))
  const arrowHeader = arrowMatch ? arrowMatch[0] : ''
  if (arrowMatch) i += arrowMatch[0].length

  if (objectInner[i] === '(') {
    const end = findMatchingClose(objectInner, i, '(', ')')
    return dedent(objectInner.slice(i + 1, end).trim())
  }

  // A block-bodied render (`() => { const [x] = useState(...); return (...) }`,
  // needed whenever the story sets up local state before returning JSX) isn't
  // meaningful on its own without the arrow header — unlike a bare JSX
  // expression, `{ ...statements... }` alone doesn't read as a function body.
  // Keeping the header is what makes AlertDialog/Pagination/Toast's real,
  // stateful Default stories (see docs/compound-component-docs-spec.md
  // Problem 2) copy-pasteable rather than a floating, headerless block.
  if (objectInner[i] === '{' && arrowHeader) {
    const end = findMatchingClose(objectInner, i, '{', '}')
    return dedent(arrowHeader + objectInner.slice(i, end + 1))
  }

  // A `render:` value always starts at depth 0 in objectInner's own
  // coordinate system (its key was matched at the object's top level) — even
  // when the value's own first char is itself an opener like JSX's `<`.
  const { depths } = annotateDepths(objectInner)
  let j = i
  while (j < objectInner.length) {
    if (objectInner[j] === ',' && (depths[j] ?? 0) === 0) break
    j++
  }
  return dedent(objectInner.slice(i, j).trim())
}

// Re-indents a JSX block copied verbatim out of a story file: the first line
// keeps whatever indent it already has (none, since it starts right after the
// stripped-off render-arrow paren), every other line loses the block's common
// leading whitespace so the snippet doesn't carry its original file nesting.
function dedent(text) {
  const lines = text.split('\n')
  if (lines.length <= 1) return text
  const rest = lines.slice(1)
  const indents = rest.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return [lines[0], ...rest.map(l => (l.trim() ? l.slice(min) : l))].join('\n')
}

function extractArgsObject(objectInner) {
  const re = /(^|[\n,])\s*args\s*:\s*/
  const m = re.exec(objectInner)
  if (!m) return null
  const i = m.index + m[0].length
  if (objectInner[i] !== '{') return null
  return extractBalancedBraces(objectInner, i)
}

function argsToJsx(componentName, objContent) {
  const inner = objContent.slice(1, -1)
  const attrs = []
  let children = null
  for (const raw of splitEntries(inner)) {
    const chunk = raw.trim()
    if (!chunk) continue
    const m = chunk.match(/^(\[?)(['"]?)([\w$-]+)\2(\]?)\s*:\s*([\s\S]+)$/)
    if (!m) continue
    const key = m[3]
    const val = m[5].trim().replace(/,$/, '')
    // `children` renders as element content, not a JSX attribute — React
    // accepts it as a prop, but nobody writes `<Badge children="Label" />`.
    if (key === 'children' && (/^'.*'$/.test(val) || /^".*"$/.test(val))) {
      children = val.slice(1, -1)
      continue
    }
    if (/^'.*'$/.test(val) || /^".*"$/.test(val)) {
      attrs.push(`${key}="${val.slice(1, -1)}"`)
    } else {
      attrs.push(`${key}={${collapseWhitespace(val)}}`)
    }
  }
  const openTag = attrs.length === 0
    ? `<${componentName}>`
    : `<${componentName}\n  ${attrs.join('\n  ')}\n>`
  if (children !== null) return `${openTag}${children}</${componentName}>`
  if (attrs.length === 0) return `<${componentName} />`
  return `<${componentName}\n  ${attrs.join('\n  ')}\n/>`
}

function buildUsageExample(storyFilePath, usageComponentName) {
  if (!existsSync(storyFilePath)) return null
  const source = readFileSync(storyFilePath, 'utf8')
  const idx = source.indexOf('export const Default')
  if (idx === -1) return null
  const eqIdx = source.indexOf('=', idx)
  const braceIdx = source.indexOf('{', eqIdx)
  if (braceIdx === -1) return null
  const objText = extractBalancedBraces(source, braceIdx)
  const inner = objText.slice(1, -1)

  const renderJsx = extractRenderJsx(inner)
  if (renderJsx) return renderJsx

  const argsObj = extractArgsObject(inner)
  if (argsObj) return argsToJsx(usageComponentName, argsObj)

  return null
}

// ── Tokens ──────────────────────────────────────────────────────

function collectTopLevelKeys(node, keys = []) {
  for (const [key, value] of Object.entries(node)) {
    if (!value || typeof value !== 'object') continue
    if ('$value' in value) keys.push(key)
    else collectTopLevelKeys(value, keys)
  }
  return keys
}

function resolveComponentTokenFile(name) {
  for (const stem of [name.toLowerCase(), toKebab(name)]) {
    const path = join('tokens', 'components', `${stem}.json`)
    if (existsSync(path)) return path
  }
  return null
}

// ── Accessibility, from docs/components.md ─────────────────────────

function parseAccessibilitySections() {
  const md = readFileSync('docs/components.md', 'utf8')
  const withoutFences = md.replace(/```[\s\S]*?```/g, '')
  const parts = withoutFences.split(/^### /m).slice(1)
  const map = new Map()
  for (const part of parts) {
    const name = part.split('\n')[0].trim()
    if (!name) continue
    const m = part.match(/\*\*Accessibility\*\*\n([\s\S]*?)(?:\n\*\*|\n---|$)/)
    if (!m) continue
    const bullets = m[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('-'))
    if (bullets.length > 0) map.set(name, bullets)
  }
  return map
}

// ── Assembling one component's .md twin ────────────────────────────

function buildComponentMd(component, ctx) {
  const { pkg, tokenByName, a11ySections, componentsBySlug } = ctx
  const { name, tier, purpose, storybookPath, parent } = component

  // A sub-component (CardHeader) lives inside its parent's file and directory
  // (Card.tsx) — everything file-path-shaped reads off the parent, but props/
  // token/usage lookups still key on this entry's own name. Falls back to
  // treating it as its own file if the parent slug doesn't resolve (shouldn't
  // happen — degrade instead of crashing on a bad registry entry).
  const owner = parent ? componentsBySlug.get(parent) : null
  const ownerName = owner ? owner.name : name
  const filePath = `components/${tier}/${ownerName}/${ownerName}.tsx`
  const source = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''

  let usageComponentName = name
  let propsSection = null
  if (source) {
    // Strict for sub-components: a shared file has several `<Fn>Props` types,
    // and the top-level fallback scan (for a name/export mismatch like Radio/
    // RadioGroup) would otherwise grab a sibling sub-component's props first.
    const propsTypeName = findPropsTypeName(source, name, { strict: !!parent })
    if (propsTypeName) {
      usageComponentName = propsTypeName.replace(/Props$/, '')
      propsSection = buildPropsSection(source, filePath, propsTypeName)
    }
  }

  const importPath = `${pkg.name}/components/${tier}/${ownerName}`
  const lines = [`# ${name}`, '']
  if (purpose) lines.push(`> ${purpose}`, '')
  lines.push(
    `- Tier: ${tier}`,
    `- Storybook: \`${storybookPath}\``,
    `- Import: \`import { ${usageComponentName} } from '${importPath}'\``,
  )

  // Only the top-level component itself is ever generic in this codebase today — a
  // sub-component's own name won't match the export-function regex inside its
  // parent's file, so this degrades to null (no line added) rather than a false hit.
  const genericConstraint = source ? findGenericConstraint(source, name) : null
  if (genericConstraint) {
    lines.push(
      `- Generic parameter: \`<${genericConstraint}>\` — the type argument you supply must satisfy this constraint, or prop types that reference it resolve to \`unknown\` instead of your real shape.`,
    )
  }

  if (propsSection && (propsSection.entries.length > 0 || propsSection.extras.length > 0)) {
    if (propsSection.entries.length > 0) {
      lines.push('', '## Props', '', '| Prop | Type | Description |', '|---|---|---|')
      for (const e of propsSection.entries) {
        const propCol = `\`${e.name}${e.optional ? '?' : ''}\``
        const typeCol = `\`${escapeCell(e.type)}\``
        lines.push(`| ${propCol} | ${typeCol} | ${escapeProse(e.description)} |`)
      }
    }
    if (propsSection.extras.length > 0) {
      lines.push('', `Also accepts all props of: ${propsSection.extras.map(x => `\`${x}\``).join(', ')}`)
    }
  }

  const tokenFile = resolveComponentTokenFile(name)
  if (tokenFile) {
    const keys = collectTopLevelKeys(loadJson(tokenFile)).sort()
    const rows = keys
      .map(key => tokenByName.get(key))
      .filter(Boolean)
    if (rows.length > 0) {
      lines.push('', '## Tokens', '', '| Token | Type | Value |', '|---|---|---|')
      let anyAxisAware = false
      for (const entry of rows) {
        const value = entry.resolved?.['portfolio-light'] ?? entry.rawValue
        const note = entry.axisAware ? ' †' : ''
        if (entry.axisAware) anyAxisAware = true
        lines.push(`| \`--${entry.name}\` | ${entry.type} | \`${value}\`${note} |`)
      }
      if (anyAxisAware) {
        lines.push('', '† resolves differently across base/portfolio and light/dark themes — see `tokens.json` for all four values.')
      }
    }
  }

  // Sub-components have no Default story of their own — they appear inside
  // the parent's. Pointing agents there (rather than guessing at a usage
  // example) is more honest than inventing one.
  if (parent) {
    lines.push('', '## Usage example', '', `See \`${owner ? owner.name : ownerName}\`'s own usage example — ${name} is one of its sub-components, not used standalone.`)
  } else {
    const storyPath = `components/${tier}/${name}/${name}.stories.tsx`
    const usage = buildUsageExample(storyPath, usageComponentName)
    if (usage) {
      lines.push('', '## Usage example', '', '```tsx', usage, '```')
    }
  }

  const a11y = a11ySections.get(name)
  if (a11y && a11y.length > 0) {
    lines.push('', '## Accessibility', '', ...a11y)
  }

  return lines.join('\n').trimEnd() + '\n'
}

// ── Main build ─────────────────────────────────────────────────

export function buildComponentDocs() {
  const pkg = loadJson('package.json')
  const registry = loadJson('tokens/component-registry.json')
  const tokenReference = loadJson('tokens/token-reference.json')
  const tokenByName = new Map(tokenReference.tokens.map(t => [t.name, t]))
  const a11ySections = parseAccessibilitySections()
  const componentsBySlug = new Map(registry.components.map(c => [c.slug, c]))

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  const expectedFiles = new Set()
  let written = 0
  for (const component of registry.components) {
    if (component.internal) continue
    const md = buildComponentMd(component, { pkg, tokenByName, a11ySections, componentsBySlug })
    const fileName = `${component.slug}.md`
    writeFileSync(join(OUTPUT_DIR, fileName), md)
    expectedFiles.add(fileName)
    written++
  }

  // Removes twins for components that no longer exist or went internal, so
  // deleting a component and rebuilding removes it here too, not just from
  // llms.txt/llms-full.txt.
  for (const f of readdirSync(OUTPUT_DIR)) {
    if (f.endsWith('.md') && !expectedFiles.has(f)) unlinkSync(join(OUTPUT_DIR, f))
  }

  console.log(`✓ Built ${written} component doc twins in ${OUTPUT_DIR}/`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildComponentDocs()
}
