/**
 * Figma sync-state checker — detects drift between the token source files and
 * the state last pushed to Figma, recorded in figma/sync-state.json.
 *
 * Why a manifest instead of reading Figma: the Component collection mixes
 * alias-bound variables (which cascade from Semantic automatically and can
 * never go stale) with concrete values (dark/bold mode overrides and
 * non-reference fallbacks, which silently go stale whenever the tokens they
 * were resolved from change). Comparing the current resolved state against a
 * committed snapshot of what was pushed makes staleness detectable offline,
 * deterministically, and reviewable in a git diff.
 *
 * Usage:
 *   node scripts/figma-status.mjs                    report drift; exit 1 if any
 *   node scripts/figma-status.mjs Button Tag         limit component report
 *   node scripts/figma-status.mjs --json             machine-readable report
 *   node scripts/figma-status.mjs --overrides        print dark/bold override classification
 *   node scripts/figma-status.mjs --baseline         snapshot collections + all components
 *   node scripts/figma-status.mjs --baseline Button  snapshot collections + one component
 *
 * Baseline after every push: /figma-push runs `--baseline [Component]`,
 * /brand-sync runs `--baseline --collections-only`.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { makeResolver } from '../lib/resolve-token.mjs';

const MANIFEST_PATH = 'figma/sync-state.json';
const FIGMA_FILE_KEY = ''; // set this to your Figma file key once connected
const TIERS = ['components/primitives', 'components/composition', 'components/patterns'];
const AXIS_NAMES = ['light-default', 'light-bold', 'dark-default', 'dark-bold'];

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ── Load sources ────────────────────────────────────────────────────────────

const globalTokens = loadJson('tokens/global.json');
const portfolioTokens = loadJson('tokens/brands/portfolio/tokens.json');
const darkOverrides = loadJson('tokens/brands/dark/tokens.json');
const boldOverrides = loadJson('tokens/brands/bold/tokens.json');

const componentFiles = readdirSync('tokens/components').filter(f => f.endsWith('.json')).sort();
const componentTokensByFile = {};
const allComponentTokens = {};
for (const file of componentFiles) {
  const name = file.replace(/\.json$/, '');
  componentTokensByFile[name] = loadJson(`tokens/components/${file}`);
  Object.assign(allComponentTokens, componentTokensByFile[name]);
}

// ── Override classification (replaces the old hardcoded prefix list) ────────
// A dark/bold token is component-level iff its exact name is defined in a
// component token file. Everything else must be a semantic token — anything
// unmatched is a contract violation.

function classifyOverrides(overrides, sourceName) {
  const component = {};
  const semantic = {};
  const unknown = [];
  for (const [key, token] of Object.entries(overrides)) {
    if (key in allComponentTokens) component[key] = token;
    else if (key in portfolioTokens) semantic[key] = token;
    else unknown.push(key);
  }
  if (unknown.length) {
    throw new Error(
      `tokens/brands/${sourceName}/tokens.json contains keys that are neither semantic nor component tokens: ${unknown.join(', ')}`
    );
  }
  return { component, semantic };
}

const darkClass = classifyOverrides(darkOverrides, 'dark');
const boldClass = classifyOverrides(boldOverrides, 'bold');

// Modes each override source applies to (bold wins over dark in dark-bold
// because it is spread last in AXES)
const OVERRIDE_MODES = { dark: ['dark-default', 'dark-bold'], bold: ['light-bold', 'dark-bold'] };

// ── Axis resolvers (same construction as build-token-reference.mjs) ─────────

const AXES = {
  'light-default': { ...portfolioTokens, ...allComponentTokens },
  'light-bold':    { ...portfolioTokens, ...allComponentTokens, ...boldOverrides },
  'dark-default':  { ...portfolioTokens, ...allComponentTokens, ...darkOverrides },
  'dark-bold':     { ...portfolioTokens, ...allComponentTokens, ...darkOverrides, ...boldOverrides },
};
const resolvers = Object.fromEntries(
  Object.entries(AXES).map(([axis, tokens]) => [axis, makeResolver(tokens, globalTokens)])
);

// ── Current-state snapshots ─────────────────────────────────────────────────

function flattenPrimitives(node, path = []) {
  if (node && typeof node === 'object' && !('$value' in node) && !('value' in node)) {
    return Object.entries(node).flatMap(([key, child]) => flattenPrimitives(child, [...path, key]));
  }
  const value = node?.$value ?? node?.value;
  return value === undefined ? [] : [[path.join('/'), String(value)]];
}

function snapshotPrimitives() {
  return Object.fromEntries(flattenPrimitives(globalTokens).sort((a, b) => a[0].localeCompare(b[0])));
}

function snapshotSemantic() {
  const out = {};
  for (const name of Object.keys(portfolioTokens).sort()) {
    out[name] = Object.fromEntries(AXIS_NAMES.map(axis => [axis, resolvers[axis](name)]));
  }
  return out;
}

// Map a token file basename to its component directory (or null if not in a
// pushable tier)
function findComponentDir(baseName) {
  const flat = baseName.replace(/-/g, '');
  for (const tier of TIERS) {
    for (const dir of readdirSync(tier)) {
      if (dir.toLowerCase() === flat) return `${tier}/${dir}`;
    }
  }
  return null;
}

function hashComponentFiles(dirPath) {
  const name = dirPath.split('/').pop();
  const hash = createHash('sha1');
  for (const ext of ['tsx', 'css']) {
    const file = `${dirPath}/${name}.${ext}`;
    if (existsSync(file)) hash.update(readFileSync(file));
  }
  return hash.digest('hex').slice(0, 12);
}

function snapshotComponent(baseName) {
  const dirPath = findComponentDir(baseName);
  const tokens = {};
  for (const [name, token] of Object.entries(componentTokensByFile[baseName])) {
    const raw = String(token.$value ?? token.value ?? '');
    const refMatch = raw.match(/^\{([^}]+)\}$/);
    const entry = {};

    if (refMatch) entry.alias = refMatch[1];
    else entry.concrete = resolvers['light-default'](name);

    const overrideModes = new Set();
    if (name in darkClass.component) OVERRIDE_MODES.dark.forEach(m => overrideModes.add(m));
    if (name in boldClass.component) OVERRIDE_MODES.bold.forEach(m => overrideModes.add(m));
    if (overrideModes.size) {
      entry.overrides = Object.fromEntries(
        [...overrideModes].sort().map(mode => [mode, resolvers[mode](name)])
      );
    }
    tokens[name] = entry;
  }
  return {
    dir: dirPath,
    pushable: dirPath !== null,
    files: dirPath ? hashComponentFiles(dirPath) : null,
    tokens,
  };
}

// ── Comparison ──────────────────────────────────────────────────────────────

function diffFlatMap(current, previous) {
  const changes = [];
  for (const key of Object.keys(current)) {
    if (!(key in previous)) changes.push({ key, kind: 'added' });
    else if (JSON.stringify(previous[key]) !== JSON.stringify(current[key]))
      changes.push({ key, kind: 'changed', from: previous[key], to: current[key] });
  }
  for (const key of Object.keys(previous)) {
    if (!(key in current)) changes.push({ key, kind: 'removed' });
  }
  return changes;
}

function diffComponent(current, previous) {
  const issues = [];
  for (const [name, entry] of Object.entries(current.tokens)) {
    const prev = previous.tokens[name];
    if (!prev) { issues.push({ token: name, kind: 'token-added' }); continue; }
    if ((prev.alias ?? null) !== (entry.alias ?? null))
      issues.push({ token: name, kind: 'alias-changed', from: prev.alias ?? null, to: entry.alias ?? null });
    if (JSON.stringify(prev.overrides ?? null) !== JSON.stringify(entry.overrides ?? null))
      issues.push({ token: name, kind: 'override-changed', from: prev.overrides ?? null, to: entry.overrides ?? null });
    if ((prev.concrete ?? null) !== (entry.concrete ?? null))
      issues.push({ token: name, kind: 'concrete-changed', from: prev.concrete ?? null, to: entry.concrete ?? null });
  }
  for (const name of Object.keys(previous.tokens)) {
    if (!(name in current.tokens)) issues.push({ token: name, kind: 'token-removed' });
  }
  const filesChanged = previous.files !== undefined && previous.files !== current.files;
  return { issues, filesChanged };
}

// ── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const nameArgs = args.filter(a => !a.startsWith('--')).map(a => a.toLowerCase().replace(/-/g, ''));

const selected = componentFiles
  .map(f => f.replace(/\.json$/, ''))
  .filter(base => !nameArgs.length || nameArgs.includes(base.replace(/-/g, '')));

if (nameArgs.length && !selected.length) {
  console.error(`No component token file matches: ${args.filter(a => !a.startsWith('--')).join(', ')}`);
  process.exit(2);
}

if (flags.has('--overrides')) {
  console.log(JSON.stringify({
    dark: { component: Object.keys(darkClass.component), semantic: Object.keys(darkClass.semantic) },
    bold: { component: Object.keys(boldClass.component), semantic: Object.keys(boldClass.semantic) },
  }, null, 2));
  process.exit(0);
}

if (flags.has('--baseline')) {
  const today = new Date().toISOString().slice(0, 10);
  let manifest = { meta: {}, primitives: {}, semantic: {}, components: {} };
  if (existsSync(MANIFEST_PATH)) manifest = loadJson(MANIFEST_PATH);

  manifest.meta = { figmaFileKey: FIGMA_FILE_KEY, baselinedAt: today };
  if (!flags.has('--components-only')) {
    manifest.primitives = snapshotPrimitives();
    manifest.semantic = snapshotSemantic();
  }
  if (!flags.has('--collections-only')) {
    for (const base of selected) {
      const snap = snapshotComponent(base);
      if (!snap.pushable) continue;
      manifest.components[base] = { pushedAt: today, ...snap };
    }
  }
  mkdirSync('figma', { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  const scope = nameArgs.length ? selected.join(', ') : 'all components';
  console.log(`✓ Baselined ${flags.has('--collections-only') ? 'collections only' : `collections + ${scope}`} → ${MANIFEST_PATH}`);
  process.exit(0);
}

// ── Status report ───────────────────────────────────────────────────────────

if (!existsSync(MANIFEST_PATH)) {
  console.error(`✗ No ${MANIFEST_PATH} found. Create one with: node scripts/figma-status.mjs --baseline`);
  console.error('  (Baseline assumes Figma currently matches the token sources — verify before trusting.)');
  process.exit(2);
}

const manifest = loadJson(MANIFEST_PATH);
const primitiveChanges = diffFlatMap(snapshotPrimitives(), manifest.primitives ?? {});
const semanticChanges = diffFlatMap(snapshotSemantic(), manifest.semantic ?? {});

const componentReports = [];
for (const base of selected) {
  const snap = snapshotComponent(base);
  if (!snap.pushable) {
    componentReports.push({ name: base, status: 'not-pushable' });
    continue;
  }
  const prev = manifest.components?.[base];
  if (!prev) {
    componentReports.push({ name: base, status: 'never-baselined' });
    continue;
  }
  const { issues, filesChanged } = diffComponent(snap, prev);
  componentReports.push({
    name: base,
    status: issues.length ? 'stale' : 'in-sync',
    issues,
    filesChanged,
    pushedAt: prev.pushedAt,
  });
}

const collectionsDrifted = primitiveChanges.length > 0 || semanticChanges.length > 0;
const staleComponents = componentReports.filter(r => r.status === 'stale');
const neverBaselined = componentReports.filter(r => r.status === 'never-baselined');
const filesOnly = componentReports.filter(r => r.status === 'in-sync' && r.filesChanged);
const hasDrift = collectionsDrifted || staleComponents.length > 0 || neverBaselined.length > 0;

if (flags.has('--json')) {
  console.log(JSON.stringify({ primitiveChanges, semanticChanges, components: componentReports }, null, 2));
  process.exit(hasDrift ? 1 : 0);
}

const fmt = v => (v === null || v === undefined) ? '(none)' : (typeof v === 'object' ? JSON.stringify(v) : v);

console.log('── Figma sync status ──────────────────────────────\n');
console.log('Collections');
for (const [label, changes, total] of [
  ['Primitives', primitiveChanges, Object.keys(snapshotPrimitives()).length],
  ['Semantic', semanticChanges, Object.keys(snapshotSemantic()).length],
]) {
  if (!changes.length) {
    console.log(`  ✓ ${label} — in sync (${total} values)`);
  } else {
    console.log(`  ✗ ${label} — ${changes.length} drifted → run /brand-sync`);
    for (const c of changes.slice(0, 10)) {
      if (c.kind === 'changed') console.log(`      ${c.key}: ${fmt(c.from)} → ${fmt(c.to)}`);
      else console.log(`      ${c.key}: ${c.kind}`);
    }
    if (changes.length > 10) console.log(`      … and ${changes.length - 10} more`);
  }
}

console.log(`\nComponents (${componentReports.length} checked)`);
for (const r of componentReports) {
  if (r.status === 'not-pushable') { console.log(`  ○ ${r.name} — portfolio tier, not pushable`); continue; }
  if (r.status === 'never-baselined') { console.log(`  ✗ ${r.name} — no baseline → run /figma-push then --baseline`); continue; }
  if (r.status === 'stale') {
    console.log(`  ✗ ${r.name} — ${r.issues.length} stale token${r.issues.length > 1 ? 's' : ''} → run /figma-push ${r.name}`);
    for (const i of r.issues.slice(0, 6)) {
      if (i.kind === 'alias-changed') console.log(`      ${i.token}: alias ${fmt(i.from)} → ${fmt(i.to)}`);
      else if (i.kind === 'override-changed') console.log(`      ${i.token}: overrides ${fmt(i.from)} → ${fmt(i.to)}`);
      else if (i.kind === 'concrete-changed') console.log(`      ${i.token}: ${fmt(i.from)} → ${fmt(i.to)}`);
      else console.log(`      ${i.token}: ${i.kind}`);
    }
    if (r.issues.length > 6) console.log(`      … and ${r.issues.length - 6} more`);
    continue;
  }
  const suffix = r.filesChanged ? ' — ⚠ component files changed since last push (variants may differ)' : '';
  console.log(`  ✓ ${r.name} — in sync (pushed ${r.pushedAt})${suffix}`);
}

console.log('');
if (hasDrift) {
  console.log('✗ Drift found — see above for the /brand-sync and /figma-push commands to run.');
} else if (filesOnly.length) {
  console.log('✓ Token state in sync. Component file changes noted above — re-push only if variants/structure changed.');
} else {
  console.log('✓ Everything in sync with the last Figma push.');
}
process.exit(hasDrift ? 1 : 0);
