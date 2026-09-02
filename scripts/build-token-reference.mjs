/**
 * Token reference builder — generates tokens/token-reference.json.
 *
 * Resolves every semantic + component token to its concrete value across all
 * four theme axes: base-light, base-dark, portfolio-light, portfolio-dark.
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

// Walks a global.json group to its leaf tokens. Most groups are flat
// ({ key: { $value, $type } }), but `feedback` mixes flat keys (error-50)
// with one level of nesting (success.500) — CSS var names join every path
// segment with a hyphen either way (--feedback-success-500), so the same
// recursion produces the right name for both shapes without special-casing.
export function flattenPrimitives(node, groupName, pathSegments = []) {
  const entries = [];
  for (const [key, value] of Object.entries(node)) {
    if (!value || typeof value !== 'object') continue;
    if ('$value' in value || 'value' in value) {
      const name = [groupName, ...pathSegments, key].join('-');
      const rawValue = String(value.$value ?? value.value ?? '');
      entries.push({
        name,
        cssVar: `--${name}`,
        type: value.$type ?? 'unknown',
        category: 'primitive',
        rawValue,
        resolved: {
          'base-light': rawValue,
          'base-dark': rawValue,
          'portfolio-light': rawValue,
          'portfolio-dark': rawValue,
        },
        axisAware: false,
        usedBy: [],
      });
    } else {
      entries.push(...flattenPrimitives(value, groupName, [...pathSegments, key]));
    }
  }
  return entries;
}

export function buildTokenReference() {
  const globalTokens  = loadJson('tokens/global.json');
  const baseLightTokens = loadJson('tokens/brands/base/light.json');
  const baseDarkOverrides = loadJson('tokens/brands/base/dark.json');
  const portfolioLightOverrides = loadJson('tokens/brands/portfolio/tokens.json');
  const portfolioDarkOverrides = loadJson('tokens/brands/portfolio/dark.json');
  // Every semantic token that can appear as a source key on any layer —
  // used only for the component-token collision check below.
  const semanticNamespace = { ...baseLightTokens, ...portfolioLightOverrides };

  // Load all component tokens into a single flat map
  const componentFiles = readdirSync('tokens/components').filter(f => f.endsWith('.json'));
  const componentTokens = {};
  for (const file of componentFiles) {
    const fileTokens = loadJson(`tokens/components/${file}`);
    for (const key of Object.keys(fileTokens)) {
      if (key in componentTokens) {
        throw new Error(`Duplicate token key "${key}" in tokens/components/${file} — already defined by another component token file.`);
      }
      if (key in semanticNamespace) {
        throw new Error(`Token key "${key}" in tokens/components/${file} collides with an existing semantic token in tokens/brands/base/light.json or tokens/brands/portfolio/tokens.json.`);
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

  // The four theme axes.
  // Load order mirrors the CSS cascade: base-light < base-dark < portfolio-light
  // < portfolio-dark, so portfolio's overrides win over base for conflicting
  // tokens (palette, accent, typography).
  const AXES = {
    'base-light':      { ...baseLightTokens, ...componentTokens },
    'base-dark':       { ...baseLightTokens, ...componentTokens, ...baseDarkOverrides },
    'portfolio-light': { ...baseLightTokens, ...componentTokens, ...portfolioLightOverrides },
    'portfolio-dark':  { ...baseLightTokens, ...componentTokens, ...baseDarkOverrides, ...portfolioLightOverrides, ...portfolioDarkOverrides },
  };

  const resolvers = Object.fromEntries(
    Object.entries(AXES).map(([axis, tokens]) => [axis, makeResolver(tokens, globalTokens)])
  );

  // ── Global primitives ─────────────────────────────────────────────────────
  // Every group in global.json (color, space, font-size, radii, motion,
  // shadows, sizes, feedback colors, …) — not just color, which is the only
  // group this used to cover. These never change across axes.
  const primitiveEntries = [];
  for (const [groupName, groupTokens] of Object.entries(globalTokens)) {
    primitiveEntries.push(...flattenPrimitives(groupTokens, groupName));
  }

  // ── Semantic + component tokens ──────────────────────────────────────────
  // Light-layer definitions only (base + portfolio's overrides on top) — dark
  // overrides never introduce a token name that doesn't already exist here,
  // they only change what it resolves to on the dark axes above.
  const sourceTokens = { ...baseLightTokens, ...portfolioLightOverrides, ...componentTokens };
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

  // category is 'primitive' for global primitives, 'component' for
  // component-tier tokens (getCategory()'s fallback), and a value-kind
  // (color/spacing/typography/…) for everything else — semantic tokens.
  const meta = {
    primitiveCount: tokens.filter(t => t.category === 'primitive').length,
    semanticCount: tokens.filter(t => t.category !== 'primitive' && t.category !== 'component').length,
    componentCount: tokens.filter(t => t.category === 'component').length,
    total: tokens.length,
  };

  writeFileSync(
    'tokens/token-reference.json',
    JSON.stringify({ meta, tokens }, null, 2)
  );

  console.log(`✓ Built token-reference.json (${meta.total} tokens: ${meta.primitiveCount} primitive, ${meta.semanticCount} semantic, ${meta.componentCount} component)`);
}

// Run as main script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildTokenReference();
}
