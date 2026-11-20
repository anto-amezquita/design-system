import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { MODE_PREFIXES } from './brand/contract.mjs';
import { buildBrandCss, computeChangedTokens, registerBrandFormats, scopedSelectors, writeExceptScoped } from './brand/build.mjs';

// Dark files set lighting only, so a mode override can't smuggle in type,
// spacing or radii that belong on the light layer. The prefix list is the
// brand contract's (brand/contract.mjs, decisions/0028); the brand check
// applies it to every brand, and this keeps base's own dark file to it too.
function validateTokenContract(filePath) {
  const tokens = JSON.parse(readFileSync(filePath, 'utf8'));
  const violations = Object.keys(tokens).filter(
    key => !MODE_PREFIXES.some(prefix => key.startsWith(prefix))
  );
  if (violations.length > 0) {
    throw new Error(
      `[token contract] ${filePath} sets tokens that aren't lighting: ${violations.join(', ')}\n` +
      `A dark file may only set tokens starting with ${MODE_PREFIXES.join(', ')}.`
    );
  }
}

// The size/rem transform and css/brand-variables format every brand file is
// built with, shared with `amezquita-brand build` (brand/build.mjs).
registerBrandFormats(StyleDictionary);

// Reads and JSON.parses a token file, throwing a message that names the
// file — without this, a malformed tokens/components/*.json surfaces as a
// bare "Unexpected token" with no indication of which file it came from.
function loadTokenJson(path) {
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch (err) {
    throw new Error(`[computeChangedTokens] Could not read ${path}: ${err.message}`)
  }
  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`[computeChangedTokens] ${path} is not valid JSON: ${err.message}`)
  }
}

const globalJsonForDiff = loadTokenJson('tokens/global.json')
const componentJsonForDiff = Object.assign(
  {},
  ...readdirSync('tokens/components')
    .filter(f => f.endsWith('.json'))
    .map(f => loadTokenJson(`tokens/components/${f}`))
)
const baseLightJson = loadTokenJson('tokens/brands/base/light.json')
const baseDarkJson = loadTokenJson('tokens/brands/base/dark.json')

// Every folder in tokens/brands other than base is a brand skin: a thin set of
// overrides on base (decisions/0001), with tokens.json for light and dark.json
// for dark. Sorted, so the build order (and so the output) doesn't depend on
// the file system.
const BRANDS = readdirSync('tokens/brands', { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'base')
  .map(d => d.name)
  .sort()

const baseLightMap = { ...componentJsonForDiff, ...baseLightJson }
const baseDarkChanged = computeChangedTokens(baseLightMap, baseDarkJson, globalJsonForDiff)

validateTokenContract('tokens/brands/base/dark.json')
for (const brand of BRANDS) validateTokenContract(`tokens/brands/${brand}/dark.json`)

// ── base-light: the brand-agnostic foundation. Standalone-usable on its own —
// every semantic token resolves to a real neutral-gray value with no brand
// layered on top. ───────────────────────────────────────────────────────────
const baseLight = new StyleDictionary({
  usesDtcg: true,
  source: [
    'tokens/global.json',
    'tokens/components/*.json',
    'tokens/brands/base/light.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: '',
      buildPath: 'styles/brands/',
      files: [{
        destination: 'base-light.css',
        format: 'css/brand-variables',
        options: {
          brand: 'base',
          selector: ':root, [data-mode="light"]',
          // Late-bind semantic references: color-surface-primary: {color-neutral-50}
          // emits as var(--color-neutral-50) so it resolves against whichever layer
          // (base alone, or a brand overriding just the neutral primitives) is
          // active in the cascade, instead of baking in base's own gray value.
          preserveSemanticRefs: true,
        }
      }]
    }
  }
});

await baseLight.buildAllPlatforms();
console.log('✓ Built base-light.css');

// ── base-dark: brand-agnostic dark mode. ────────────────────────────────────
const baseDark = new StyleDictionary({
  usesDtcg: true,
  include: [
    'tokens/global.json',
    'tokens/components/*.json',
    'tokens/brands/base/light.json',
  ],
  source: [
    'tokens/brands/base/dark.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: '',
      buildPath: 'styles/brands/',
      files: [{
        destination: 'base-dark.css',
        format: 'css/brand-variables',
        filter: (token) => token.isSource || baseDarkChanged.has(token.name),
        options: { brand: 'base', selector: '[data-mode="dark"]', colorScheme: 'dark', preserveSemanticRefs: true }
      }]
    }
  }
});

await baseDark.buildAllPlatforms();
console.log('✓ Built base-dark.css');

// ── Brand skins: <brand>-light.css, <brand>-dark.css and <brand>-scoped.css
// for every brand, built by the same buildBrandCss() a project's brand gets
// from `amezquita-brand build` (brand/build.mjs, decisions/0028).
async function buildBrand(brand) {
  await buildBrandCss({
    StyleDictionary,
    name: brand,
    lightPath: `tokens/brands/${brand}/tokens.json`,
    darkPath: `tokens/brands/${brand}/dark.json`,
    outDir: 'styles/brands',
  });
  console.log(`✓ Built ${brand}-light.css, ${brand}-dark.css, ${brand}-scoped.css`);
}

for (const brand of BRANDS) await buildBrand(brand);

// ── base-scoped: base under [data-brand="base"], so a part of a page that
// wears another brand can show base (a ThemeScope with brand="base"), e.g.
// a docs site that wears a brand but compares against base. Unlike a brand
// skin, base isn't a set of overrides on anything: inside another brand's
// scope every token could hold that brand's value, so both blocks declare
// every token. Same selectors and block order as the brands' scoped files.
async function buildBaseScoped() {
  const selectors = scopedSelectors('base')
  const all = () => true
  // A brand can add tokens base doesn't have (portfolio's color-accent-glow,
  // say). Inside a base panel those would inherit the page's brand value, so
  // both blocks reset them to `initial`: undefined, as on a base page.
  const inBase = new Set(
    [...readFileSync('styles/brands/base-light.css', 'utf8').matchAll(/^\s+--([\w-]+):/gm)].map(([, name]) => name),
  )
  const brandOnly = new Set(
    BRANDS.flatMap(brand => [
      ...Object.keys(loadTokenJson(`tokens/brands/${brand}/tokens.json`)),
      ...Object.keys(loadTokenJson(`tokens/brands/${brand}/dark.json`)),
    ]).filter(name => !name.startsWith('$') && !inBase.has(name)),
  )
  const light = new StyleDictionary({
    usesDtcg: true,
    source: ['tokens/global.json', 'tokens/components/*.json', 'tokens/brands/base/light.json'],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: '',
        buildPath: 'styles/brands/',
        files: [{
          destination: 'base-scoped.css',
          format: 'css/brand-variables',
          filter: all,
          options: { brand: 'base', selector: selectors.light, colorScheme: 'light', preserveSemanticRefs: true, bare: true, initialUnless: brandOnly },
        }],
      },
    },
  });
  const dark = new StyleDictionary({
    usesDtcg: true,
    include: ['tokens/global.json', 'tokens/components/*.json', 'tokens/brands/base/light.json'],
    source: ['tokens/brands/base/dark.json'],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: '',
        buildPath: 'styles/brands/',
        files: [{
          destination: 'base-scoped.css',
          format: 'css/brand-variables',
          filter: all,
          options: { brand: 'base', selector: selectors.dark, colorScheme: 'dark', preserveSemanticRefs: true, bare: true, initialUnless: brandOnly },
        }],
      },
    },
  });
  const lightScoped = await writeExceptScoped(light, 'base');
  const darkScoped = await writeExceptScoped(dark, 'base');
  // Dark first, for the same reason as buildBrand's scoped file.
  writeFileSync(
    'styles/brands/base-scoped.css',
    `/* Auto-generated by Style Dictionary — do not edit directly */\n/* Brand: base, scoped to [data-brand="base"] (decisions/0001, 2026-10-01 amendment; decisions/0023) */\n\n${darkScoped}\n${lightScoped}`
  );
  console.log('✓ Built base-scoped.css');
}

await buildBaseScoped();

// ThemeScope's `brand` type: one entry per *-scoped.css, written above.
const { buildThemeBrands } = await import('./scripts/build-theme-brands.mjs');
buildThemeBrands();

const { buildTokenReference } = await import('./scripts/build-token-reference.mjs');
buildTokenReference();

// Reads token-reference.json for each settable token's base values.
const { buildBrandContract } = await import('./scripts/build-brand-contract.mjs');
buildBrandContract();

const { buildTokensJson } = await import('./scripts/build-tokens-json.mjs');
buildTokensJson();

// Reads token-reference.json, rebuilt above.
const { buildFonts } = await import('./scripts/build-fonts.mjs');
buildFonts();

const { buildComponentRegistry } = await import('./scripts/build-component-registry.mjs');
buildComponentRegistry();

// Depends on component-registry.json and token-reference.json, both already
// rebuilt above.
const { buildComponentDocs } = await import('./scripts/build-component-docs.mjs');
buildComponentDocs();

// Also depends on component-registry.json and token-reference.json.
const { buildRegistryManifests } = await import('./scripts/build-registry-manifests.mjs');
buildRegistryManifests();

// Also depends on component-registry.json and token-reference.json.
const { buildSkill } = await import('./scripts/build-skill.mjs');
buildSkill();

const { buildChangelog } = await import('./scripts/build-changelog.mjs');
buildChangelog();

// Must run last: llms.txt compiles from component-registry.json and
// token-reference.json, so both have to exist in their rebuilt form first.
const { buildLlmsTxt } = await import('./scripts/build-llms-txt.mjs');
buildLlmsTxt();
