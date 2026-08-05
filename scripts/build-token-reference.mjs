/**
 * Token reference builder — generates tokens/token-reference.json.
 *
 * Resolves every semantic + component token to its concrete value across all
 * four axis combinations: light/default, light/bold, dark/default, dark/bold.
 *
 * The resolved values are pre-computed (not CSS-variable-at-runtime) so the
 * docs UI can show real color swatches for every axis without mounting four
 * DOM trees.
 *
 * Output shape:
 *   { meta: { generatedAt, tokenCount }, tokens: TokenEntry[] }
 *
 * Called by sd.config.mjs after Style Dictionary builds so tokens/token-reference.json
 * is always rebuilt when token sources change.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { makeResolver } from '../lib/resolve-token.mjs';
import { TOKEN_CATEGORIES } from '../lib/token-categories.mjs';

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const KNOWN_CATEGORIES = new Set(TOKEN_CATEGORIES.map(c => c.value));

function getCategory(name) {
  if (name.startsWith('color-')) return 'color';
  if (name.startsWith('space-')) return 'spacing';
  if (
    name.startsWith('font-') ||
    name.startsWith('line-height-') ||
    name.startsWith('letter-spacing-')
  ) return 'typography';
  if (name.startsWith('border-radius-')) return 'radius';
  if (name.startsWith('border-width-')) return 'border';
  if (name.startsWith('duration-') || name.startsWith('easing-')) return 'motion';
  if (name.startsWith('opacity-')) return 'opacity';
  if (name.startsWith('z-')) return 'elevation';
  if (name.startsWith('shadow-')) return 'shadow';
  if (name.startsWith('size-') || name.startsWith('focus-')) return 'size';
  // Everything else is a component token — named after the component (button-*, card-*, etc.)
  return 'component';
}

// Fails loudly if a future edit to getCategory() ever returns a value not
// registered in lib/token-categories.mjs — that would silently produce
// tokens with no matching filter pill in TokenTable.
function assertKnownCategory(category, tokenName) {
  if (!KNOWN_CATEGORIES.has(category)) {
    throw new Error(`getCategory("${tokenName}") returned unknown category "${category}" — add it to lib/token-categories.mjs.`);
  }
  return category;
}

export function buildTokenReference() {
  const globalTokens  = loadJson('tokens/global.json');
  const portfolioTokens = loadJson('tokens/brands/portfolio/tokens.json');
  const darkOverrides = loadJson('tokens/brands/dark/tokens.json');
  const boldOverrides = loadJson('tokens/brands/bold/tokens.json');

  // Load all component tokens into a single flat map
  const componentFiles = readdirSync('tokens/components').filter(f => f.endsWith('.json'));
  const componentTokens = {};
  for (const file of componentFiles) {
    const fileTokens = loadJson(`tokens/components/${file}`);
    for (const key of Object.keys(fileTokens)) {
      if (key in componentTokens) {
        throw new Error(`Duplicate token key "${key}" in tokens/components/${file} — already defined by another component token file.`);
      }
      if (key in portfolioTokens) {
        throw new Error(`Token key "${key}" in tokens/components/${file} collides with an existing semantic token in tokens/brands/portfolio/tokens.json.`);
      }
    }
    Object.assign(componentTokens, fileTokens);
  }

  // Load dependency graph for usedBy lookups (non-fatal if missing, but warn —
  // a silent miss here makes every token look unused with no signal to the docs UI)
  let depGraph = { byToken: {} };
  try {
    depGraph = loadJson('tokens/dependency-graph.json');
  } catch (err) {
    console.warn(`⚠ Could not load tokens/dependency-graph.json (${err.message}) — usedBy will be empty for every token. Run "npm run tokens:graph" first.`);
  }

  // The four axis combinations.
  // Load order mirrors app/layout.tsx: portfolio.css < dark.css < bold.css
  // so bold wins over dark for conflicting tokens (accent colours).
  const AXES = {
    'light-default': { ...portfolioTokens, ...componentTokens },
    'light-bold':    { ...portfolioTokens, ...componentTokens, ...boldOverrides },
    'dark-default':  { ...portfolioTokens, ...componentTokens, ...darkOverrides },
    'dark-bold':     { ...portfolioTokens, ...componentTokens, ...darkOverrides, ...boldOverrides },
  };

  const resolvers = Object.fromEntries(
    Object.entries(AXES).map(([axis, tokens]) => [axis, makeResolver(tokens, globalTokens)])
  );

  // ── Global colour primitives ─────────────────────────────────────────────
  // These never change across axes; included for completeness in the Primitives section.
  const primitiveEntries = [];
  const colorPrimitives = globalTokens.color ?? {};
  for (const [key, token] of Object.entries(colorPrimitives)) {
    const rawValue = String(token.$value ?? token.value ?? '');
    primitiveEntries.push({
      name:     `color-${key}`,
      cssVar:   `--color-${key}`,
      type:     token.$type ?? 'color',
      category: 'primitive',
      rawValue,
      resolved: {
        'light-default': rawValue,
        'light-bold':    rawValue,
        'dark-default':  rawValue,
        'dark-bold':     rawValue,
      },
      axisAware: false,
      usedBy: [],
    });
  }

  // ── Semantic + component tokens ──────────────────────────────────────────
  const sourceTokens = { ...portfolioTokens, ...componentTokens };
  const semanticEntries = Object.entries(sourceTokens).map(([name, token]) => {
    const raw = token.$value ?? token.value;

    const resolved = Object.fromEntries(
      Object.entries(resolvers).map(([axis, resolve]) => [axis, resolve(name)])
    );

    const values = Object.values(resolved).filter(v => v !== null);
    const axisAware = new Set(values).size > 1;

    const usedByFiles = depGraph.byToken[name] ?? [];
    const usedBy = [...new Set(
      usedByFiles
        .map(filePath => {
          const m = filePath.match(/^components\/[^/]+\/([^/]+)\//);
          return m?.[1] ?? null;
        })
        .filter(Boolean)
    )];

    return {
      name,
      cssVar:    `--${name}`,
      type:      token.$type ?? 'unknown',
      category:  assertKnownCategory(getCategory(name), name),
      rawValue:  typeof raw === 'string' ? raw : String(raw ?? ''),
      resolved,
      axisAware,
      usedBy,
    };
  });

  const tokens = [...primitiveEntries, ...semanticEntries];

  writeFileSync(
    'tokens/token-reference.json',
    JSON.stringify({ meta: { tokenCount: tokens.length }, tokens }, null, 2)
  );

  console.log(`✓ Built token-reference.json (${tokens.length} tokens)`);
}

// Run as main script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildTokenReference();
}
