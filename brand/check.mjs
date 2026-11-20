/**
 * checkBrand(dir, options): checks one brand against the brand contract and
 * the contrast pairs (decisions/0028). Node only.
 *
 * A brand is a folder with tokens.json (light) and, optionally, dark.json:
 * flat token names as keys, DTCG $value/$type, like tokens/brands/demo-cool/.
 *
 * Returns { ok, brand, failures, contrast }. Each failure is
 *   { rule, token, file, mode, message, fix }
 * with token/file/mode null where they don't apply. It never throws on a bad
 * brand; a missing or unreadable file is a failure like any other.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { makeResolver } from '../lib/resolve-token.mjs'
import { MODE_PREFIXES, loadSystem } from './contract.mjs'

const SEMANTIC_REF = /^\{[^.}]+\}$/
const ANY_REF = /\{([^}]+)\}/g

// ── Contrast ──────────────────────────────────────────────────────────────

function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const isHex = v => typeof v === 'string' && /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)

/**
 * Every pair in every mode. modes is { name: mergedTokenMap }. A pair whose
 * side doesn't resolve to hex (transparent, rgba(), a missing token) is
 * skipped, as it always has been, so brand colours are written as hex.
 */
export function checkContrast(modes, pairs, global) {
  const results = []
  for (const [mode, tokens] of Object.entries(modes)) {
    const resolve = makeResolver(tokens, global)
    for (const pair of pairs) {
      const bgHex = resolve(pair.bg)
      const fgHex = resolve(pair.fg)
      if (!isHex(bgHex) || !isHex(fgHex)) continue
      const ratio = Math.round(contrastRatio(bgHex, fgHex) * 100) / 100
      results.push({ mode, role: pair.role, bg: pair.bg, fg: pair.fg, bgHex, fgHex, ratio, required: pair.minRatio, pass: ratio >= pair.minRatio })
    }
  }
  return results
}

// ── Helpers ───────────────────────────────────────────────────────────────

function readBrandFile(file, label, failures) {
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    failures.push(fail('unreadable-file', null, label, null, `${label} isn't valid JSON: ${err.message}`, `Fix the JSON in ${label}.`))
    return null
  }
}

function fail(rule, token, file, mode, message, fix) {
  return { rule, token, file, mode, message, fix }
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = cur
    }
  }
  return row[b.length]
}

function closest(name, candidates) {
  let best = null
  let bestDistance = 3
  for (const c of candidates) {
    const d = distance(name, c)
    if (d < bestDistance) [best, bestDistance] = [c, d]
  }
  return best
}

function globalPathExists(ref, global) {
  let node = global
  for (const seg of ref.split('.')) {
    if (node == null || typeof node !== 'object') return false
    node = node[seg]
  }
  return node != null && typeof node === 'object' && '$value' in node
}

// The kebab references in a token's value, wherever they sit in it.
function semanticRefs(def) {
  const text = typeof def?.$value === 'string' ? def.$value : JSON.stringify(def?.$value ?? '')
  return [...text.matchAll(ANY_REF)].map(([, ref]) => ref).filter(ref => !ref.includes('.'))
}

// Whether following token's references leads back to it. In CSS that's a
// var() loop: the property becomes invalid and the element falls back to
// what it inherits.
function loopsBack(token, tokens) {
  const seen = new Set()
  const next = [token]
  while (next.length) {
    for (const ref of semanticRefs(tokens[next.pop()])) {
      if (ref === token) return true
      if (!seen.has(ref)) {
        seen.add(ref)
        next.push(ref)
      }
    }
  }
  return false
}

function toPx(value) {
  const m = String(value).match(/^(-?\d*\.?\d+)(px|rem)$/)
  if (!m) return null
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1])
}

// ── The check ─────────────────────────────────────────────────────────────

/**
 * @param {string} dir  the brand folder
 * @param {object} [options]
 * @param {string} [options.name]  the brand's name and token prefix; defaults to the folder name
 * @param {string|object[]} [options.pairs]  extra contrast pairs, a file path or an array, same format as tokens/contrast-pairs.json
 * @param {Record<string,string>} [options.exceptions]  unprefixed names allowed anyway, each with the reason (portfolio until AME-72)
 * @param {object} [options.system]  loadSystem()'s result, to share one load across several brands
 */
export function checkBrand(dir, options = {}) {
  const system = options.system ?? loadSystem()
  const name = options.name ?? path.basename(path.resolve(dir))
  const prefix = `${name}-`
  const exceptions = options.exceptions ?? {}
  const failures = []

  const lightFile = path.join(dir, 'tokens.json')
  const darkFile = path.join(dir, 'dark.json')
  if (!existsSync(lightFile)) {
    failures.push(fail('missing-file', null, 'tokens.json', null, `${lightFile} doesn't exist.`, 'A brand folder holds tokens.json (light) and, if the brand changes anything in dark mode, dark.json.'))
    return { ok: false, brand: name, failures, contrast: { checked: 0, modes: [], results: [] } }
  }
  const light = readBrandFile(lightFile, 'tokens.json', failures) ?? {}
  const dark = readBrandFile(darkFile, 'dark.json', failures) ?? {}

  let extraPairs = []
  if (typeof options.pairs === 'string') {
    try {
      extraPairs = JSON.parse(readFileSync(options.pairs, 'utf8'))
    } catch (err) {
      failures.push(fail('unreadable-file', null, options.pairs, null, `Couldn't read the pairs file: ${err.message}`, 'Pass a JSON array in the format of tokens/contrast-pairs.json.'))
    }
  } else if (Array.isArray(options.pairs)) {
    extraPairs = options.pairs
  }
  for (const p of extraPairs) {
    if (!p || typeof p.bg !== 'string' || typeof p.fg !== 'string' || typeof p.minRatio !== 'number') {
      failures.push(fail('bad-pair', null, 'pairs', null, `A contrast pair needs bg, fg and minRatio: ${JSON.stringify(p)}`, 'Write each pair as { "bg": "<token>", "fg": "<token>", "role": "<what it is>", "minRatio": 4.5 }.'))
    }
  }

  const systemLight = { ...system.components, ...system.baseLight }
  const modes = {
    [`${name}-light`]: { ...systemLight, ...light },
    [`${name}-dark`]: { ...systemLight, ...system.baseDark, ...light, ...dark },
  }
  const usedExceptions = new Set()

  for (const [file, tokens, mode] of [['tokens.json', light, `${name}-light`], ['dark.json', dark, `${name}-dark`]]) {
    for (const [token, def] of Object.entries(tokens)) {
      if (token.startsWith('$')) continue

      // Flat files only: one token per key.
      if (!def || typeof def !== 'object' || !('$value' in def)) {
        const group = def && typeof def === 'object'
        failures.push(fail(group ? 'not-flat' : 'missing-value', token, file, null,
          group ? `\`${token}\` is a group, not a token.` : `\`${token}\` has no $value.`,
          group ? 'Brand files are flat: one token name per key, like "color-neutral-50": { "$value": "#f7f4ee", "$type": "color" }.' : 'Give it a $value.'))
        continue
      }

      const own = token.startsWith(prefix)
      const settable = system.settable.get(token)
      if (!own && !settable) {
        if (token in exceptions) {
          usedExceptions.add(token)
        } else if (system.names.has(token)) {
          failures.push(fail('not-settable', token, file, null,
            `\`${token}\` is the system's own token, so a brand can't set it.`,
            `If the project needs its own value, name it \`${prefix}${token}\` and use that in the project's CSS. docs/brand-contract.md lists what a brand can set.`))
        } else {
          const guess = closest(token, system.settable.keys())
          failures.push(fail('unknown-token', token, file, null,
            `\`${token}\` isn't a token in this system${guess ? `. Did you mean \`${guess}\`?` : '.'}`,
            guess ? `Rename it to \`${guess}\`, or prefix it \`${prefix}\` if it's the project's own.` : `Prefix it \`${prefix}\` if it's the project's own token. docs/brand-contract.md lists what a brand can set.`))
        }
      }

      if (settable) {
        if (!def.$type) {
          failures.push(fail('missing-type', token, file, null, `\`${token}\` has no $type.`, `Add "$type": "${settable.type}".`))
        } else if (settable.type && def.$type !== settable.type) {
          failures.push(fail('wrong-type', token, file, null, `\`${token}\` is a ${settable.type} in the system, but this brand gives it $type "${def.$type}".`, `Set "$type": "${settable.type}" and a ${settable.type} value.`))
        }
      }

      // Every reference resolves, in this file's mode.
      const text = typeof def.$value === 'string' ? def.$value : JSON.stringify(def.$value)
      for (const [, ref] of text.matchAll(ANY_REF)) {
        const ok = ref.includes('.') ? globalPathExists(ref, system.global) : ref in modes[mode]
        if (!ok) {
          failures.push(fail('unresolved-reference', token, file, mode, `\`${token}\` refers to \`{${ref}}\`, which doesn't exist.`,
            ref.includes('.') ? 'A dotted reference names a primitive in tokens/global.json, like {color.warm-500}.' : 'A plain reference names a semantic or component token, like {color-accent-default}, or one of the brand\'s own.'))
        }
      }
      if (loopsBack(token, modes[mode])) {
        failures.push(fail('reference-loop', token, file, mode, `\`${token}\` refers back to itself through its references, so in CSS it has no value at all.`,
          'Point it at a token that ends in a value, or give it a value of its own.'))
      }

      // Colours are hex, so the contrast check can read them (decisions/0028 §2).
      // Anything else would make it skip every pair the colour is in.
      const type = def.$type ?? settable?.type
      if (type === 'color' && !(typeof def.$value === 'string' && def.$value.includes('{')) && !isHex(def.$value)) {
        failures.push(fail('not-hex', token, file, mode, `\`${token}\` is ${JSON.stringify(def.$value)}, not a hex colour, so the contrast check can't read it and would skip its pairs.`,
          'Write it as hex: #rrggbb, or #rrggbbaa for a colour with transparency (#0000 for transparent).'))
      }

      // Dark files set lighting only.
      if (file === 'dark.json' && !own && !MODE_PREFIXES.some(p => token.startsWith(p))) {
        failures.push(fail('dark-not-lighting', token, file, null, `dark.json sets \`${token}\`, which isn't a lighting token.`, `Move it to tokens.json. dark.json may only set tokens starting with ${MODE_PREFIXES.join(', ')}.`))
      }
    }
  }

  // A literal set in light leaks into dark when base changes that token per
  // mode, either in base/dark.json or through a reference dark changes
  // (color-skeleton-base is {color-neutral-200} in both files' terms).
  // Compared resolved; a value the resolver can't follow (a composite shadow)
  // falls back to comparing base's two raw values.
  const resolveBaseLight = makeResolver(systemLight, system.global)
  const resolveBaseDark = makeResolver({ ...systemLight, ...system.baseDark }, system.global)
  const baseChangesWithMode = token => {
    const [inLight, inDark] = [resolveBaseLight(token), resolveBaseDark(token)]
    if (inLight !== null && inDark !== null) return inLight !== inDark
    return token in system.baseDark && JSON.stringify(systemLight[token]?.$value) !== JSON.stringify(system.baseDark[token].$value)
  }
  for (const [token, def] of Object.entries(light)) {
    if (!def || typeof def !== 'object' || !('$value' in def)) continue
    if (typeof def.$value === 'string' && SEMANTIC_REF.test(def.$value)) continue
    if (token in dark || !baseChangesWithMode(token)) continue
    failures.push(fail('light-leaks-into-dark', token, 'tokens.json', `${name}-dark`,
      `\`${token}\` is set in tokens.json, so its light value also wins in dark mode, where base gives it a different value.`,
      `Set \`${token}\` in dark.json too, or point it at a semantic token (like {color-text-primary}) that follows the mode.`))
  }

  // Heading sizes and line-heights travel together, on the 4px grid (decisions/0012).
  const resolveLight = makeResolver(modes[`${name}-light`], system.global)
  for (let n = 1; n <= 5; n++) {
    const size = `font-size-h${n}`
    const lh = `line-height-h${n}`
    if (size in light && !(lh in light)) {
      failures.push(fail('heading-pair', size, 'tokens.json', null, `tokens.json sets \`${size}\` without \`${lh}\`.`, `Set \`${lh}\` too, to a multiple of 4px that fits the new size.`))
    }
    if (size in light || lh in light) {
      const px = toPx(resolveLight(lh))
      if (px === null || px % 4 !== 0) {
        failures.push(fail('off-grid', lh, 'tokens.json', `${name}-light`, `\`${lh}\` resolves to ${resolveLight(lh) ?? 'nothing'}, not a multiple of 4px.`, 'Use a fixed line-height on the 4px grid, like {line-height.fixed-32} or 28px.'))
      }
    }
  }

  for (const token of Object.keys(exceptions)) {
    if (!usedExceptions.has(token)) {
      failures.push(fail('unused-exception', token, null, null, `\`${token}\` is listed as an exception, but the brand doesn't set it any more.`, 'Remove it from the exceptions.'))
    }
  }

  const results = checkContrast(modes, [...system.pairs, ...extraPairs.filter(p => p && typeof p.minRatio === 'number')], system.global)
  for (const r of results.filter(r => !r.pass)) {
    failures.push(fail('contrast', r.fg, null, r.mode,
      `${r.role}: ${r.fg} (${r.fgHex}) on ${r.bg} (${r.bgHex}) is ${r.ratio}:1, needs ${r.required}:1.`,
      `Darken or lighten one of the two in ${r.mode.endsWith('-dark') ? 'dark.json' : 'tokens.json'} until the pair reaches ${r.required}:1.`))
  }

  return { ok: failures.length === 0, brand: name, failures, contrast: { checked: results.length, modes: Object.keys(modes), results } }
}
