/**
 * Generates a shadcn-spec registry: one registry-item.json per public
 * component, a shared "theme" item carrying the semantic token layer, and a
 * top-level registry.json index — written to registry/ at the repo root.
 *
 * Sources of truth:
 *   - tokens/component-registry.json  → component list, tier, slug, purpose, tokenPrefix
 *   - tokens/token-reference.json     → resolved token values (light-default / dark-default)
 *   - components/{tier}/{name}/{name}.tsx → sibling component imports, for registryDependencies
 *   - tokens/components/<file>.json   → exact per-component token key list (same source
 *                                        Task 1.2's build-component-docs.mjs uses)
 *   - package.json                    → the npm package every item depends on
 *   - README.md                       → site root, for the registry's `homepage`
 *
 * This package already ships as a real npm dependency (@amezquita/design-system), with
 * Radix packages as its own `dependencies` (not peerDependencies — confirmed in
 * package.json) — so a registry item's job here isn't shadcn's usual copy-paste-source
 * model. It's three things: (a) declare the npm dependency, (b) declare which other
 * registry items it's meaningfully composed from (registryDependencies), and (c) inject
 * the CSS custom properties the component actually needs to render correctly themed
 * (cssVars) — `npm install` alone doesn't give a consumer the token layer.
 *
 * Every component depends on the shared "theme" item (all resolved semantic tokens)
 * plus its own component-scoped tokens, where it has any (EmptyState doesn't — same
 * gap Task 1.2 found, styles come straight off the semantic layer). Extra
 * registryDependencies are derived from real sibling imports in the component's own
 * .tsx — e.g. DataTable imports Table, Pagination, EmptyState, and Checkbox — verified
 * against source, not guessed.
 *
 * Schema confirmed against https://ui.shadcn.com/schema/registry-item.json and
 * registry.json directly (2026-08-10): cssVars keys carry no leading `--`; `files` is
 * optional and correctly omitted here; a root registry.json needs `name`, `homepage`,
 * and `items` (full registry-item objects, not references).
 *
 * registryDependencies MUST be full URLs, not bare names, for a same-registry
 * reference — confirmed by actually running `npx shadcn add` against a locally-served
 * copy of these manifests in a scratch Next.js app (portfolio's dev server + a fresh
 * `create-next-app`), not assumed from the schema. A bare "theme" resolves against the
 * *default* shadcn registry (ui.shadcn.com) every time, never the registry the item
 * itself came from — it failed with "item ... was not found" until fixed.
 *
 * LIVE as of Task 3.2 (2026-08-10): the portfolio repo (the docs site) serves these at
 * `https://amezquita.dk/r/<slug>.json`, verified with a real `npx shadcn add` against
 * that exact URL, not just locally. It's a static snapshot of this repo's `registry/`
 * output, not an automated pipeline — re-copy there when these manifests change.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

// Same derivation build-llms-txt.mjs uses — one edit to the README fixes both.
function getSiteRoot() {
  const readme = readFileSync('README.md', 'utf8')
  const m = readme.match(/\[amezquita\.dk\]\((https?:\/\/[^)]+)\)/)
  if (!m) {
    throw new Error('Could not find the "[amezquita.dk](...)" link in README.md — build-registry-manifests.mjs derives the site root URL from it.')
  }
  return m[1]
}

// Which other known components (public or internal) a component's own .tsx
// actually imports — e.g. `from '../Spinner'` or
// `from '../../primitives/Checkbox'`. Read from source, not asserted, so
// this can't drift from what's really composed.
function findSiblingImports(source, componentName, knownNames) {
  const deps = new Set()
  const re = /from\s+'(?:\.\.\/)+(?:primitives\/|composition\/|patterns\/)?([A-Za-z]+)'/g
  let m
  while ((m = re.exec(source))) {
    const target = m[1]
    if (target !== componentName && knownNames.has(target)) deps.add(target)
  }
  return deps
}

// A public component's registryDependencies, following imports *through*
// internal siblings only. A public component's own .tsx sometimes composes
// another public component only through an internal one — Dialog/Drawer
// import BaseSheet, and it's BaseSheet.tsx, not Dialog.tsx/Drawer.tsx, that
// imports Heading. There's no separate registry item for an internal
// component (no base-sheet.json) — its source ships bundled inside
// whichever public item uses it — so its own public dependencies have to
// surface on the public item's registryDependencies, or a registry-CLI
// install silently omits them.
//
// Stops at the first PUBLIC dependency found on each path rather than
// flattening the whole transitive closure — a public component (e.g.
// Button) has its own registry item with its own registryDependencies
// (e.g. Spinner), which the shadcn CLI already resolves recursively on
// install. Re-declaring those here would just be redundant, and would
// silently change this generator's documented one-hop behavior for every
// existing component, not only the internal-sibling case this fixes.
function collectTransitivePublicDeps(startName, componentByName, publicNames) {
  const knownNames = new Set(componentByName.keys())
  const publicDeps = new Set()
  const visited = new Set([startName])
  const queue = [startName]

  while (queue.length) {
    const current = queue.shift()
    const component = componentByName.get(current)
    if (!component) continue
    const filePath = `components/${component.tier}/${component.name}/${component.name}.tsx`
    const source = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
    const directDeps = findSiblingImports(source, current, knownNames)

    for (const dep of directDeps) {
      if (publicNames.has(dep)) {
        publicDeps.add(dep)
        continue // public dep's own manifest covers its further deps
      }
      if (!visited.has(dep)) {
        visited.add(dep)
        queue.push(dep) // internal dep — keep walking through it
      }
    }
  }

  return publicDeps
}

function resolveComponentTokenFile(name, toKebab) {
  for (const stem of [name.toLowerCase(), toKebab(name)]) {
    const path = `tokens/components/${stem}.json`
    if (existsSync(path)) return path
  }
  return null
}

function toKebab(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function cssVarsFor(tokenNames, tokenByName) {
  const light = {}
  const dark = {}
  for (const name of tokenNames) {
    const entry = tokenByName.get(name)
    if (!entry) continue
    light[entry.name] = entry.resolved['portfolio-light']
    dark[entry.name] = entry.resolved['portfolio-dark']
  }
  return { light, dark }
}

export function buildRegistryManifests() {
  const pkg = loadJson('package.json')
  const registry = loadJson('tokens/component-registry.json')
  const tokenReference = loadJson('tokens/token-reference.json')
  const tokenByName = new Map(tokenReference.tokens.map(t => [t.name, t]))
  const siteRoot = getSiteRoot()

  // Compound sub-components (CardHeader, TableCell, ...) aren't independently
  // installable — they only ever ship alongside their parent — so they get no
  // registry-item.json of their own; get_registry_item points callers at the
  // parent slug instead. Excluding them here keeps this generator's output
  // exactly the real, installable component set, same as before this field existed.
  const publicComponents = registry.components.filter(c => !c.internal && !c.parent)
  const publicNames = new Set(publicComponents.map(c => c.name))
  // Includes internal components (e.g. BaseSheet) so the transitive-import
  // walk can traverse through them — see collectTransitivePublicDeps.
  const componentByName = new Map(registry.components.map(c => [c.name, c]))

  const OUTPUT_DIR = 'registry'
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  // ── Shared theme item: every semantic token, resolved ──────────────────
  const semanticTokenNames = tokenReference.tokens
    .filter(t => t.category !== 'primitive' && t.category !== 'component')
    .map(t => t.name)
  const themeCssVars = cssVarsFor(semanticTokenNames, tokenByName)

  const themeItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: 'theme',
    type: 'registry:theme',
    title: 'Design tokens',
    description: `${semanticTokenNames.length} resolved semantic tokens (color, spacing, typography, motion, and more) every component in this registry depends on for theming.`,
    cssVars: themeCssVars,
  }

  // ── One item per public component ───────────────────────────────────────
  const componentItems = []
  for (const component of publicComponents) {
    const { name, slug, purpose } = component

    const siblingDeps = collectTransitivePublicDeps(name, componentByName, publicNames)
    const siblingSlugs = [...siblingDeps]
      .map(depName => publicComponents.find(c => c.name === depName)?.slug)
      .filter(Boolean)
      .sort()

    const tokenFile = resolveComponentTokenFile(name, toKebab)
    const ownTokenNames = tokenFile ? Object.keys(loadJson(tokenFile)) : []
    const ownCssVars = cssVarsFor(ownTokenNames, tokenByName)

    // Bare names in registryDependencies always resolve against the default
    // shadcn registry (ui.shadcn.com), never the same custom registry an
    // item came from — confirmed by testing against a real scratch app, not
    // assumed from the schema alone. A same-registry reference needs a full
    // URL.
    const registryDependencies = ['theme', ...siblingSlugs].map(dep => `${siteRoot}/r/${dep}.json`)

    const item = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: slug,
      type: 'registry:component',
      title: name,
      description: purpose,
      dependencies: [pkg.name],
      registryDependencies,
      cssVars: ownCssVars,
    }

    componentItems.push(item)
    writeFileSync(`${OUTPUT_DIR}/${slug}.json`, JSON.stringify(item, null, 2))
  }

  writeFileSync(`${OUTPUT_DIR}/theme.json`, JSON.stringify(themeItem, null, 2))

  // ── Top-level index ───────────────────────────────────────────────────
  const index = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: pkg.name,
    homepage: siteRoot,
    items: [themeItem, ...componentItems],
  }
  writeFileSync(`${OUTPUT_DIR}/registry.json`, JSON.stringify(index, null, 2))

  console.log(`✓ Built ${componentItems.length + 1} registry manifests + registry.json index in ${OUTPUT_DIR}/`)
}

// Run as main
const file = fileURLToPath(import.meta.url)
if (process.argv[1] === file) {
  buildRegistryManifests()
}
